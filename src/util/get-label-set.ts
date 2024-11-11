import { and, desc, eq } from 'drizzle-orm';
import * as database from '../db/index.js';

export type LabelKey = {
  model: string;
  technique: string;
  variant: string;
};

export async function getLabelSet(key: LabelKey) {
  return await database.db
    .select({
      pid: database.postLabels.post,
      lid: database.postLabels.label,
      label: database.labels.title,
    })
    .from(database.postLabels)
    .leftJoin(
      database.labels,
      eq(database.postLabels.label, database.labels.id),
    )
    .where(
      and(
        eq(database.postLabels.model, key.model),
        eq(database.postLabels.technique, key.technique),
        eq(database.postLabels.variant, key.variant),
      ),
    ).orderBy(desc(database.postLabels.label));
}
