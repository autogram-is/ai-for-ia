import { TSNE } from '@keckelt/tsne';
import { eq } from 'drizzle-orm';
import Emittery from 'emittery';
import { PCA } from 'ml-pca';
import * as database from '../db/index.js';

export type MappingProgress = {
  model: string;
  total: number;
  value: number;
};

/**
 * Given a model id, load the existing raw embedding data from a model
 * perform PCA analysis to map them to 2- and 3-dimensional space for
 * data visualization purposes.
 */
export async function mapToSpace(
  model: string,
  rebuild = false,
  method: 'pca' | 'tsne' = 'pca',
  maxIterations = 200,
) {
  const db = database.db;

  if (rebuild) {
    await db
      .delete(database.positions)
      .where(eq(database.positions.model, model));
  }
  const positions = await db
    .select()
    .from(database.positions)
    .where(eq(database.positions.model, model));

  if (positions.length > 0) {
    // We want to bail out here; this spatial projection
    // requires a total view of the data, and can't be done
    // one record at a time.
    return;
  }

  const embeddings = await db
    .select()
    .from(database.embeddings)
    .where(eq(database.embeddings.model, model));

  if (embeddings.length === 0) return;

  const raw = embeddings.filter(e => e.vector !== null).map(e => e.vector);
  const ids = embeddings.filter(e => e.vector !== null).map(e => e.id);

  let plane: Record<string, number[]> = {};
  let space: Record<string, number[]> = {};

  if (method === 'pca') {
    const pca = new PCA(raw);
    plane = Object.fromEntries(
      reKey(pca.predict(raw, { nComponents: 2 }).to2DArray(), ids),
    );
    mapToSpace.progress.emit('progress', { model, current: 2, total: 1 });

    space = Object.fromEntries(
      reKey(pca.predict(raw, { nComponents: 3 }).to2DArray(), ids),
    );
    mapToSpace.progress.emit('progress', { model, current: 2, total: 2 });
  } else if (method === 'tsne') {
    const tsne2d = new TSNE({
      epsilon: 10,
      perplexity: raw.length ** 0.5,
      dim: 2,
    });
    tsne2d.initDataRaw(raw);
    for (let i = 0; i < maxIterations; i++) {
      tsne2d.step();
      mapToSpace.progress.emit('progress', {
        model,
        total: raw.length * 2,
        current: i + 1,
      });
    }
    plane = Object.fromEntries(reKey(tsne2d.getSolution() as number[][], ids));

    const tsne3d = new TSNE({
      epsilon: 10,
      perplexity: raw.length ** 0.5,
      dim: 3,
    });
    tsne3d.initDataRaw(raw);
    for (let i = 0; i < maxIterations; i++) {
      tsne3d.step();
      mapToSpace.progress.emit('progress', {
        total: raw.length * 2,
        current: raw.length + i + 1,
      });
    }
    space = Object.fromEntries(reKey(tsne3d.getSolution() as number[][], ids));
  }

  const output = ids.map(id => ({
    id,
    model,
    plane: plane[id],
    space: space[id],
  }));

  await db.insert(database.positions).values(output);
  mapToSpace.progress.emit('done', {
    total: raw.length * 2,
    current: raw.length * 2,
  });

  return;
}

function reKey(vectors: number[][], ids: string[]): [string, number[]][] {
  return vectors.map((v, i) => [ids[i], v]);
}

mapToSpace.progress = new Emittery();
