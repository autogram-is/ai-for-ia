import task from 'tasuku';
import { labelByProximity } from '../tasks/label-by-proximity.js';
import { getPosts } from '../util/get-posts.js';
import { getEmbeddings } from '../util/get-embeddings.js';
import { getLabels } from '../util/get-labels.js';
import { dist } from './global-distance.js';
import * as database from '../db/index.js';
import { and, eq, inArray } from 'drizzle-orm';

const db = database.db;

await task('Special handling for novelty models', async () => {
  const labels = await getLabels({ variant: 'existing' });
  const posts = await getPosts();

  // Nomic
  const nLabelVec = await getEmbeddings({ model: 'nomic-query', id: labels.map(l => l.id)});
  const nPostVec = await getEmbeddings({ model: 'nomic-doc', id: posts.map(l => l.id)});

  // Mxbai
  const mLabelVec = await getEmbeddings({ model: 'mxbai-query', id: labels.map(l => l.id)});
  const mPostVec = await getEmbeddings({ model: 'mxbai-doc', id: posts.map(l => l.id)});
  
  await labelByProximity('nomic-query', { labels: nLabelVec, posts: nPostVec, rebuild: true, variant: 'existing', distance: dist })
  await labelByProximity('mxbai-query', { labels: nLabelVec, posts: nPostVec, rebuild: true, variant: 'existing', distance: dist })
});