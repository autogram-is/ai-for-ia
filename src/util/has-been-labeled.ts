import { and, eq } from 'drizzle-orm';
import * as database from '../db/index.js';

export async function hasBeenLabeled(
  post: string,
  model: string,
  technique: string,
) {
  const label = await database.db
    .select({ id: database.postLabels.label })
    .from(database.postLabels)
    .where(
      and(
        eq(database.postLabels.post, post),
        eq(database.postLabels.model, model),
        eq(database.postLabels.technique, technique),
      ),
    );

  return label.pop()?.id ?? false;
}
