import { and, asc, eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import * as schema from '../db/schema.js';

interface Options {
  model?: string;
  variant?: string;
  allowModLabels?: boolean;
}

export async function getLabel(id: string) {
  const result = await db
    .select()
    .from(schema.labels)
    .where(eq(schema.labels.id, id))
    .limit(1);

  return result.pop();
}

export async function getLabels(options: Options = {}) {
  return await db
    .select()
    .from(schema.labels)
    .where(
      and(
        eq(schema.labels.mod, options?.allowModLabels ?? false),
        options?.model ? eq(schema.labels.model, options.model) : undefined,
        options?.variant
          ? eq(schema.labels.variant, options.variant)
          : undefined,
      ),
    )
    .orderBy(asc(schema.labels.model), asc(schema.labels.title))
}
