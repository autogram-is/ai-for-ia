import { and, desc, eq } from 'drizzle-orm';
import * as database from '../db/index.js';
import { getProvider } from '../providers/get-provider.js';
import Emittery from 'emittery';

// Load any 'undescribed' cluster labels and generate descriptions
// for them by pulling in the most popular 2-5 posts in the category
// and asking Llama32 to write a summary of the common elements across
// each post.

export async function nameCluster(
  model: database.Model,
  labels: database.Label[],
  prompt: string,
  rebuild = false,
) {
  const output: Record<string, string> = {};

  const sortBy = database.posts.score;
  const limit = 5;

  const provider = getProvider(model);
  provider.maxTokens = 200;
  provider.system = prompt;

  let completed = 0;

  if (rebuild) {
    await database.db
      .update(database.labels)
      .set({ text: null })
      .where(eq(database.labels.variant, 'kmeans'));
  }

  let unnamed = 0;
  for (const label of labels) {
    if (!rebuild && label.text !== null) {
      continue;
    }
    const posts = await database.db
      .select({
        title: database.posts.title,
        text: database.posts.text,
      })
      .from(database.posts)
      .leftJoin(
        database.postLabels,
        eq(database.posts.id, database.postLabels.post),
      )
      .where(eq(database.postLabels.label, label.id))
      .orderBy(desc(sortBy))
      .limit(limit);

    const postText = posts
      .map(p => `${p.title}\n${p.text.replaceAll('\n', ' ')}`)
      .join('\n\n');

    const result = await provider.generate(postText);
    if (result.success) {
      const stripped = (scrubOutput(result.value));
      try {
        const parsed = JSON.parse(stripped);
        if ('label' in parsed && 'description' in parsed) {
          output[label.id] = parsed;
          await database.db
            .update(database.labels)
            .set({
              title: parsed.label,
              text: parsed.description,
            })
            .where(eq(database.labels.id, label.id));
          nameCluster.progress.emit('progress', { completed: ++completed, total: labels.length, title: parsed.label });
        } else {
          nameCluster.progress.emit('failure', { completed: ++completed, total: labels.length });
          await database.db
            .update(database.labels)
            .set({
              title: `Cluster ${unnamed++}`,
              text: null,
            })
            .where(eq(database.labels.id, label.id));
        }
      } catch(err: unknown) {
        //console.log(stripped);
        //console.log((err as Error).message);
        nameCluster.progress.emit('failure', { completed: ++completed, total: labels.length });
      }
    }
  }
  nameCluster.progress.emit('done', { completed, total: labels.length });
  return;
}

function scrubOutput(input: string) {
  return input
  .replaceAll('"""', '')
  .replaceAll('```json', '')
  .replaceAll('```', '')
  .replaceAll(/,\n}/g, '\n}')
  .trim();
}

nameCluster.progress = new Emittery();
