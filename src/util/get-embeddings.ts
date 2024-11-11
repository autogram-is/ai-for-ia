import { and, inArray } from 'drizzle-orm';
import { db } from '../db/client.js';
import * as schema from '../db/schema.js';

type Options = {
  model?: string | string[];
  id?: string | string[];
};

export async function getEmbeddings(options: Options = {}) {
  const opt = {
    models: options.model
      ? Array.isArray(options.model)
        ? options.model
        : [options.model]
      : undefined,
    ids: options.id
      ? Array.isArray(options.id)
        ? options.id
        : [options.id]
      : undefined,
  };

  return await db
    .select()
    .from(schema.embeddings)
    .where(
      and(
        opt.models ? inArray(schema.embeddings.model, opt.models) : undefined,
        opt.ids ? inArray(schema.embeddings.id, opt.ids) : undefined,
      ),
    );
}
