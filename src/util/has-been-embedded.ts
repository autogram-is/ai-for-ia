import { and, eq } from 'drizzle-orm';
import * as database from '../db/index.js';

export async function hasBeenEmbedded(id: string, model: string) {
  const exists = await database.db
    .select({ id: database.embeddings.id })
    .from(database.embeddings)
    .where(
      and(eq(database.embeddings.id, id), eq(database.embeddings.model, model)),
    );
  return exists.length > 0;
}
