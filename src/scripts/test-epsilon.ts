import dbscan from '@cdxoo/dbscan';
import { distance, similarity } from 'ml-distance';
import sparkly from 'sparkly';
import task from 'tasuku';
import { getEmbeddings } from '../util/get-embeddings.js';
import { getModels } from '../util/get-models.js';

// For each embedding model, run several DBSCAN clustering
// tests to determine the optimal epsilon value. Ideally, we
// want 6-10 clusters.

const models = await getModels({
  tier: ['normal'],
  provider: ['openai', 'google'],
  embed: true,
});

const maxIterations = 10;
const minClusters = 5;
const maxClusters = 9;

await task('Optimizing clustering epsilons', async ({ task }) => {
  for (const model of models.filter(m => !m.epsilon)) {
    const embeddings = await getEmbeddings({ model: model.id });
    if (embeddings.length < 100) {
      continue;
    }
    const vectors = embeddings.map(e => e.vector);

    await task(model.label, async ({ setStatus, setOutput }) => {
      let iterations = 0;
      let epsilon = 0.5;
      let results = getResults(vectors, epsilon);
      setStatus(
        `${epsilon}: ${results.clusters} clusters, ${results.noise} outliers. `,
      );

      while (
        iterations < maxIterations &&
        epsilon !== getNewEpsilon(epsilon, results.clusters)
      ) {
        iterations++;
        epsilon = getNewEpsilon(epsilon, results.clusters);
        results = getResults(vectors, epsilon);
        setStatus(`${iterations} iterations`);
      }

      setOutput(
        `${epsilon}: ${results.clusters} clusters, ${results.noise} outliers. ` +
          sparkly(results.histogram),
      );

      return;
    });
  }
  return;
});

// The epsilon value is used to determine how distant points must be
// from each other to be considered neighbors; it varies from model
function getNewEpsilon(cur: number, clusterCount: number) {
  if (clusterCount < minClusters) {
    return cur * 0.75;
  } else if (clusterCount > maxClusters) {
    return cur * 1.25;
  } else {
    return cur;
  }
}

function getResults(dataset: number[][], epsilon: number) {
  const raw = dbscan({
    dataset,
    distanceFunction: distance.dice,
    epsilon,
  });

  return {
    clusters: raw.clusters.length,
    noise: raw.noise.length,
    histogram: [
      ...raw.clusters.map(c => c.length),
      '' as const,
      raw.noise.length,
    ],
  };
}
