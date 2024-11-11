import dbscan from '@cdxoo/dbscan';
import { nanohash } from '@eatonfyi/ids';
import {
  AverageGroupLinkage,
  Dendrogram,
  HierarchicalClustering,
} from 'dbvis-hc';
import { and, eq, inArray } from 'drizzle-orm';
import { distance } from 'ml-distance';
import { kmeans } from 'ml-kmeans';
import type { Embedding, Label, PostLabel } from '../db/index.js';
import * as database from '../db/index.js';
import { getPosts } from '../util/get-posts.js';

type Options = {
  rebuild: boolean;
  kGroups: number;
  kIterations: number;
  dEpsilon: number;
  aCutoff: number;
  distance: (p: number[], q: number[]) => number;
  algorithm: 'agnes' | 'dbscan' | 'kmeans';
};

const defaults: Options = {
  rebuild: true,
  distance: distance.squaredEuclidean,
  kGroups: 7,
  kIterations: 100,
  dEpsilon: 1,
  aCutoff: 5,
  algorithm: 'kmeans',
};

/**
 * For each embedding model, use a clustering algorithm to find semantically
 * distinct sets of posts that could become tags/categories.
 * 1. Load embeddings, separating posts and labels
 * 2. Execute clustering algorithm
 * 3. Give each cluster a model+sequence placeholder name
 * 4. Output post-tag data for comparison
 */
export async function labelByCluster(
  model: string,
  options: Partial<Options> = {},
) {
  const opt = { ...defaults, ...options };
  const db = database.db;

  if (opt.rebuild) {
    const labelsToDelete = await db
      .select({ id: database.labels.id })
      .from(database.labels)
      .where(
        and(
          eq(database.labels.model, model),
          eq(database.labels.variant, opt.algorithm),
        ),
      );

    await db.delete(database.postLabels).where(
      inArray(
        database.postLabels.label,
        labelsToDelete.map(l => l.id),
      ),
    );
    await db.delete(database.embeddings).where(
      inArray(
        database.embeddings.id,
        labelsToDelete.map(l => l.id),
      ),
    );
    await db.delete(database.labels).where(
      inArray(
        database.labels.id,
        labelsToDelete.map(l => l.id),
      ),
    );
  }

  const posts = await getPosts();

  const embeddings = await db
    .select()
    .from(database.embeddings)
    .where(
      and(
        eq(database.embeddings.model, model),
        inArray(
          database.embeddings.id,
          posts.map(p => p.id),
        ),
      ),
    );

  if (embeddings.length === 0) return [];

  const clusterLabels: Label[] = [];
  const clusterEmbeddings: Embedding[] = [];
  let clusterPostLabels: PostLabel[] = [];

  const start = Date.now();

  if (opt.algorithm === 'kmeans') {
    // Do the actual clustering work
    const ans = kmeans(
      embeddings.map(e => e.vector),
      opt.kGroups,
      {
        distanceFunction: opt.distance,
        initialization: 'kmeans++',
        maxIterations: opt.kIterations,
      },
    );
    const duration = Date.now() - start;

    // We want to keep the clusters keyed by cluster-number, for
    // easier lookup when we build the postLabel relation records.
    ans.centroids.forEach((vector, index) => {
      const label = {
        id: nanohash(`${model}-cluster-${opt.algorithm}-${index}`),
        model,
        text: null,
        variant: opt.algorithm,
        title: `Cluster ${index}`,
        mod: false,
      };
      const embedding = {
        id: label.id,
        model,
        vector,
        duration: Math.ceil(duration / ans.centroids.length),
      };
      clusterLabels.push(label);
      clusterEmbeddings.push(embedding);
    });

    // This is slightly goofy; we pass in the list of post embeddings
    // and get back a list of cluster numbers, in the same order. We
    // iterate the embeddings and the cluster numbers in order to
    // create a PostLabel record. Meh.
    const postLabelIds = ans.nearest(embeddings.map(e => e.vector));
    for (const i in embeddings) {
      const labelNumber = postLabelIds[i];
      const label = nanohash(`${model}-cluster-${opt.algorithm}-${labelNumber}`);
      const post = embeddings[i].id;
      clusterPostLabels.push({
        label,
        post,
        model,
        variant: opt.algorithm,
        technique: 'cluster',
        duration: Math.ceil(duration / embeddings.length),
        raw: null,
      });
    }
  } else if (opt.algorithm === 'agnes') {
    const hc = new HierarchicalClustering<number[]>(
      embeddings.map(e => e.vector),
      new AverageGroupLinkage<number[]>(opt.distance),
    );
    const rootCluster = hc.cluster();
    const dendrogram = new Dendrogram<number[]>(rootCluster, opt.aCutoff);
    const clusters = dendrogram.extractClustersAsIds();
    const duration = Date.now() - start;

    // We get an array of clusters, each containing an array of cluster-item IDs.
    clusters.forEach((clusterItems, index) => {
      const label = {
        id: nanohash(`${model}-cluster-${opt.algorithm}-${index}`),
        model,
        text: null,
        variant: opt.algorithm,
        title: `Cluster ${index}`,
        mod: false,
      };
      clusterLabels.push(label);

      clusterPostLabels = clusterItems.map(idx => ({
        label: label.id,
        post: embeddings[idx].id,
        model,
        variant: opt.algorithm,
        technique: 'cluster',
        duration: Math.ceil(duration / embeddings.length),
        raw: null,
      }));
    });
  } else if (opt.algorithm === 'dbscan') {
    const results = dbscan({
      dataset: embeddings.map(e => e.vector),
      distanceFunction: opt.distance,
      epsilon: opt.dEpsilon,
      minimumPoints: 10,
    });
    const duration = Date.now() - start;

    results.clusters.forEach((clusterItems, index) => {
      const label = {
        id: nanohash(`${model}-cluster-${opt.algorithm}-${index}`),
        model,
        text: null,
        variant: opt.algorithm,
        title: `Cluster ${index}`,
        mod: false,
      };
      clusterLabels.push(label);

      clusterPostLabels = clusterItems.map(idx => ({
        label: label.id,
        post: embeddings[idx].id,
        model,
        variant: opt.algorithm,
        technique: 'cluster',
        duration: Math.ceil(duration / embeddings.length),
        raw: null,
      }));
    });

    results.noise.forEach(idx =>
      clusterPostLabels.push({
        label: null,
        post: embeddings[idx].id,
        model,
        variant: opt.algorithm,
        technique: 'cluster',
        duration: Math.ceil(duration / embeddings.length),
        raw: 'Noise',
      }),
    );
  }

  await db.insert(database.labels).values(clusterLabels);
  await db.insert(database.postLabels).values(clusterPostLabels);

  if (clusterEmbeddings.length) {
    await db.insert(database.embeddings).values(clusterEmbeddings);
  }

  await database.log(`Generated cluster labels for ${model}`);

  const buckets = Object.entries(
    Object.groupBy(clusterPostLabels, cpl => cpl.label ?? 'NONE'),
  ).map(e => e[1]?.length ?? 0);
  return buckets;
}
