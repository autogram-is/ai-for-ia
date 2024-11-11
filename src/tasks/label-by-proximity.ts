import { and, eq, inArray } from 'drizzle-orm';
import { distance } from 'ml-distance';
import * as database from '../db/index.js';
import { closest } from '../util/closest.js';
import { getLabels } from '../util/get-labels.js';
import { getPosts } from '../util/get-posts.js';
import { getEmbeddings } from '../util/get-embeddings.js';

type Options = {
  rebuild?: boolean;
  distance?: (p: number[], q: number[]) => number;
  labels?: database.Embedding[],
  posts?: database.Embedding[],
  variant: string,
};

const defaults: Options = {
  rebuild: true,
  variant: 'existing',
  distance: distance.manhattan,
};

/**
 * For each embedding model, use proximity search to find the "closest" category
 * for each post.
 * 1. Filter out posts in unwanted categories
 * 2. For each post, search for the closest tag in vector-space
 * 3. Output post-tag data for comparison with other tagging approaches
 */
export async function labelByProximity(
  model: string,
  options: Partial<Options> = {},
) {
  const opt = { ...defaults, ...options };
  const db = database.db;

  const labelNames = await getLabels({ model: 'human', variant: opt.variant });
  const labelData = opt.labels ?? await getEmbeddings({ 
    model,
    id: labelNames.map(ln => ln.id)
  });

  if (opt.rebuild) {
    // Kill any existing PostLabels, this is a remarkably fast operation.
    await db
      .delete(database.postLabels)
      .where(
        and(
          eq(database.postLabels.model, model),
          eq(database.postLabels.technique, 'proximity'),
          eq(database.postLabels.variant, opt.variant),
        ),
      );
  }

  const postData = opt.posts ?? await getEmbeddings({
    model,
    id: (await getPosts()).map(p => p.id)
  });

  if (postData.length === 0) {
    return [];
  };

  const postLabels = postData.map(p => ({
    label: closest(p, labelData, opt.distance, 'distance'),
    post: p.id,
    model,
    variant: opt.variant,
    technique: 'proximity',
  }));


  await db.insert(database.postLabels).values(postLabels);
  await database.log(`Generated proximity labels using ${model}.`);

  return Object.entries(
    Object.groupBy(postLabels, cpl => cpl.label ?? 'NONE'),
  ).map(e => e[1]?.length ?? 0);
}
