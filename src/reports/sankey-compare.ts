import * as schema from '../db/schema.js';
import { getConnection } from '../db/client.js';
import { aliasedTable, and, eq, count, not } from 'drizzle-orm';
import { LabelKey } from '../util/get-label-set.js';

const human: LabelKey = {
  model: 'human',
  technique: 'human',
  variant: 'existing',
}

export async function visualizeMovement(target: LabelKey, source: LabelKey = human) {
  const db = getConnection();

  const oldLabel = aliasedTable(schema.labels, "oldLabel")
  const oldPostLabel = aliasedTable(schema.postLabels, "oldPostLabel")
  const newLabel = aliasedTable(schema.labels, "newLabel")
  const newPostLabel = aliasedTable(schema.postLabels, "newPostLabel")

  const output = await db
  .select({
    source: oldLabel.title,
    target: newLabel.title,
    value: count(),
  })
  .from(schema.posts)
  .innerJoin(oldPostLabel, and(
    eq(oldPostLabel.post, schema.posts.id),
    eq(oldPostLabel.technique, source.technique),
    eq(oldPostLabel.variant, source.variant),
    eq(oldPostLabel.model, source.model),
  ))
  .innerJoin(newPostLabel, and(
    eq(newPostLabel.post, schema.posts.id),
    eq(newPostLabel.technique, target.technique),
    eq(newPostLabel.variant, target.variant),
    eq(newPostLabel.model, target.model),
  ))
  .innerJoin(oldLabel, eq(oldLabel.id, oldPostLabel.label))
  .innerJoin(newLabel, eq(newLabel.id, newPostLabel.label))
  .groupBy(oldLabel.title, newLabel.title)
  .having(not(eq(count(), 0)))

  // Avoid looping issues with sankey viz
  return output.map(o => ({ source: o.source + ':', target: o.target, value: o.value }));
}

