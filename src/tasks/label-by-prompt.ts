import { and, eq } from 'drizzle-orm';
import Emittery from 'emittery';
import * as database from '../db/index.js';
import { getProvider } from '../providers';
import { getLabelfromPromptResponse } from '../util/get-label-from-prompt-response.js';
import { getLabels } from '../util/get-labels.js';
import { getModel } from '../util/get-models.js';
import { getPosts } from '../util/get-posts.js';
import { getPrompt } from '../util/get-prompt.js';
import { buildSystemPrompt } from './build-system-prompt.js';

type Options = {
  prompt: string;
  temperature?: number;
  rebuild: boolean;
  posts?: database.Post[];
  labels?: 'existing' | 'proposed';
};

const defaults: Options = {
  prompt: 'label-post',
  rebuild: false,
  temperature: 0,
  labels: 'proposed',
};

/**
 * For each chat model, use a prompt with detailed instructions to find the
 * "recommended" tag/category for each post.
 */
export async function labelByPrompt(
  modelId: string,
  options: Partial<Options> = {},
) {
  const opt = { ...defaults, ...options };

  const labels = await getLabels({ model: 'human', variant: opt.labels });
  const documents = opt.posts ?? (await getPosts());
  const rawPrompt = (await getPrompt(opt.prompt))?.text ?? opt.prompt;
  const systemPrompt = buildSystemPrompt(rawPrompt, labels);
  const model = await getModel(modelId);

  if (!model) {
    await database.log(`Model ${modelId} not found`, 'error');
    labelByPrompt.progress.emit('done', { model, total: 0 });
    return;
  }

  const provider = getProvider(model);
  provider.system = systemPrompt;
  provider.maxTokens = 24;
  provider.temperature = opt.temperature;

  if (opt.rebuild) {
    await database.db
      .delete(database.postLabels)
      .where(
        and(
          eq(database.postLabels.model, model.id),
          eq(database.postLabels.technique, 'prompt'),
          opt.labels ? eq(database.postLabels.variant, opt.labels) : undefined,
        ),
      );
  }

  const existing = await database.db
    .select({ post: database.postLabels.post })
    .from(database.postLabels)
    .where(
      and(
        eq(database.postLabels.model, model.id),
        eq(database.postLabels.technique, 'prompt'),
        opt.labels ? eq(database.postLabels.variant, opt.labels) : undefined,
      ),
    );

  const docsToEmbed = documents.filter(
    d => !existing.find(e => e.post === d.id),
  );

  const counter: Record<string, number> = {};

  let ct = 0;
  for (const p of docsToEmbed) {
    const start = Date.now();
    const result = await provider.generate(`${p.title}\n${p.text || p.url}`);
    const duration = Date.now() - start;

    if (result.success) {
      const label = getLabelfromPromptResponse(result.value.trim(), labels);
      const raw = result.value.trim();
      counter[label?.id ?? 'NONE'] ??= 0;
      counter[label?.id ?? 'NONE']++;

      await database.db.insert(database.postLabels).values({
        post: p.id,
        label: label?.id || null,
        raw,
        model: model.id,
        variant: opt.labels!,
        technique: 'prompt',
        duration,
      });
    } else {
      counter['NONE'] ??= 0;
      counter['NONE']++;

      await database.db.insert(database.postLabels).values({
        post: p.id,
        raw: `ERROR: ${[result.error.name, result.error.message].join(': ')}`,
        model: model.id,
        variant: opt.labels!,
        technique: 'prompt',
        duration,
      });
    }

    labelByPrompt.progress.emit('progress', {
      model,
      current: ++ct + existing.length,
      total: documents.length,
    });
  }

  labelByPrompt.progress.emit('done', {
    model,
    total: documents.length,
  });

  const output = Object.values(counter);
  return output;
}

labelByPrompt.progress = new Emittery();
