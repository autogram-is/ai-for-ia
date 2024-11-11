import { eq } from 'drizzle-orm';
import Emittery from 'emittery';
import * as database from '../db/index.js';
import { getProvider } from '../providers/get-provider.js';

export type EmbeddingProgress = {
  model: string;
  current: number;
  total: number;
  errors: number;
};

export async function generateEmbeddings(
  model: database.Model,
  input: Record<string, string>,
  rebuild = false,
) {
  const provider = getProvider(model);

  if (rebuild) {
    await database.db
      .delete(database.embeddings)
      .where(eq(database.embeddings.model, model.id));
  }

  const existingEmbeddings = await database.db
    .select({ id: database.embeddings.id })
    .from(database.embeddings)
    .where(eq(database.embeddings.model, model.id));

  const docsToEmbed = Object.entries(input).filter(
    ([id]) => !existingEmbeddings.find(e => e.id === id),
  );

  let p = 0;
  for (const [id, text] of docsToEmbed) {
    const e = await provider.embed(text);
    if (e.success) {
      await database.db.insert(database.embeddings).values({
        id,
        model: model.id,
        vector: e.value,
        duration: e.duration,
      });
    } else {
      await database.log(
        `Embedding ${id} with ${model.id} (${[e.error.name, e.error.message].join(': ')})`,
        'error',
      );
    }

    generateEmbeddings.progress.emit('progress', {
      model,
      current: ++p + existingEmbeddings.length,
      total: Object.entries(input).length,
    });
  }
  await database.log(
    `Wrote ${Object.values(input).length} embeddings from ${model.model}${model.variant ? ':' : ''}${model.variant}`,
  );

  generateEmbeddings.progress.emit('done');
  return;
}

generateEmbeddings.progress = new Emittery();
