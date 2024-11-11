import * as schema from '../db/schema.js';
import { getConnection } from '../db/client.js';
import { aliasedTable, and, eq } from 'drizzle-orm';

export async function visualizeEmbeddings(model: string) {
  const db = getConnection();

  const oldLabel = aliasedTable(schema.labels, "oldLabel")
  const oldPostLabel = aliasedTable(schema.postLabels, "oldPostLabel")
  const newLabel = aliasedTable(schema.labels, "newLabel")
  const newPostLabel = aliasedTable(schema.postLabels, "newPostLabel")

  const output = await db
  .select({
    id: schema.posts.id,
    title: schema.posts.title,
    score: schema.posts.score,
    comments: schema.posts.comments,
    old: {
      id: oldLabel.id,
      title: oldLabel.title,
    },
    new: {
      id: newLabel.id,
      title: newLabel.title,
    },
    pos: schema.positions.plane
  })
  .from(schema.posts)
  .innerJoin(oldPostLabel, and(
    eq(oldPostLabel.post, schema.posts.id),
    eq(oldPostLabel.technique, 'proximity'),
    eq(oldPostLabel.variant, 'existing'),
    eq(oldPostLabel.model, model),
  ))
  .innerJoin(newPostLabel, and(
    eq(newPostLabel.post, schema.posts.id),
    eq(newPostLabel.technique, 'proximity'),
    eq(newPostLabel.variant, 'proposed'),
    eq(newPostLabel.model, model),
  ))
  .innerJoin(oldLabel, eq(oldLabel.id, oldPostLabel.label))
  .innerJoin(newLabel, eq(newLabel.id, newPostLabel.label))
  .innerJoin(schema.positions, and(
    eq(schema.positions.id, schema.posts.id),
    eq(schema.positions.model, model),
  ));

  return output;
}