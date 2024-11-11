import jetpack from 'fs-jetpack';
import task from 'tasuku';
import { z } from 'zod';
import { db, log } from '../db/client.js';
import * as schema from '../db/schema.js';
import { getLabels } from '../util/get-labels.js';
import { labelSchema, modelSchema, postSchema } from '../util/input-schema.js';
import { tsv } from '../util/serializers.js';

const rebuild = true;

await task('Initializing', async ({ task }) => {
  const input = jetpack.dir('input');

  await task('Flush existing data', async ({ setStatus }) => {
    if (rebuild) {
      await db.delete(schema.models);
      await db.delete(schema.prompts);
      await db.delete(schema.postLabels);
      await db.delete(schema.embeddings);
      await db.delete(schema.positions);
      await db.delete(schema.labels);
      await db.delete(schema.posts);
      await db.delete(schema.logs);
    } else {
      setStatus('skipped');
    }
    return;
  });

  await task('Load model metadata', async ({ setOutput }) => {
    const rawModels = tsv.parse(input.read('models.tsv', 'utf8') ?? '');
    const parsedModels = z.array(modelSchema).parse(rawModels);
    await db.insert(schema.models).values(parsedModels).onConflictDoNothing();
    setOutput(`${parsedModels.length} models added`);
    return;
  });

  await task('Load label variants', async ({ setOutput }) => {
    const labelVariants = input.dir('labels').find({ matching: '*.tsv' });
    for (const file of labelVariants) {
      const variant = file.split('.')[0];
      const raw = tsv.parse(input.dir('labels').read(file, 'utf8') ?? '');
      const parsed = z.array(labelSchema).parse(raw);

      await db
        .insert(schema.labels)
        .values(
          parsed.map(l => ({
            ...l,
            model: 'human',
            variant,
          })),
        )
        .onConflictDoNothing();
      setOutput(`${raw.length} ${variant} labels saved`);
    }
    return;
  });

  await task('Load posts', async ({ setOutput }) => {
    const rawPosts = tsv.parse(input.read('posts.tsv', 'utf8') ?? '');
    const parsedPosts = z.array(postSchema).parse(rawPosts);
    const validFlare = await getLabels({
      model: 'human',
      variant: 'existing',
      allowModLabels: false,
    });

    let totalValidPosts = 0;
    for (const p of parsedPosts) {
      const label = validFlare.find(
        l => l.title.trim() === p.link_flair_text?.trim() && !l.mod,
      );
      if (label) {
        totalValidPosts++;
        await db
          .insert(schema.posts)
          .values({
            id: p.id,
            created: p.created,
            author: p.author,
            title: p.title,
            url: p.url,
            text: p.selftext ?? p.url,
            score: p.score,
            comments: p.num_comments,
          })
          .onConflictDoNothing();
        await db
          .insert(schema.postLabels)
          .values({
            label: label.id,
            post: p.id,
            model: 'human',
            technique: 'human',
            variant: 'existing',
          })
          .onConflictDoNothing();
      }
    }
    await log(`${totalValidPosts} posts labeled and saved`);
    setOutput(`${totalValidPosts} posts labeled and saved`);
    return;
  });

  await task('Load prompts', async ({ setOutput }) => {
    const promptList = input.dir('prompts').find({ matching: '*.txt' });
    for (const file of promptList) {
      const id = file.split('.')[0];
      const text = input.dir('prompts').read(file, 'utf8');
      if (text) {
        await db
          .insert(schema.prompts)
          .values({ id, text })
          .onConflictDoNothing();
      }
    }
    await log(`${promptList.length} prompts defined`);
    setOutput(`${promptList.length} prompts defined`);
    return;
  });
  return;
});
