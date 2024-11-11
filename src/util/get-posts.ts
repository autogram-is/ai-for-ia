import { desc, eq, inArray } from 'drizzle-orm';
import { db } from '../db/client.js';
import * as schema from '../db/schema.js';

interface Options {
  sort?: 'score' | 'comments' | 'date';
}

export async function getPost(id: string) {
  const result = await db
    .select()
    .from(schema.posts)
    .where(eq(schema.posts.id, id))
    .limit(1);

  return result.pop();
}

export async function getLabeledPosts(label: string | string[]) {
  return await db
    .select()
    .from(schema.posts)
    .leftJoin(schema.postLabels, eq(schema.posts.id, schema.postLabels.post))
    .where(
      Array.isArray(label)
        ? inArray(schema.postLabels.label, label)
        : eq(schema.postLabels.label, label),
    );
}

export async function getPosts(options: Options = {}) {
  switch (options.sort) {
    case 'comments':
      return await db
        .select()
        .from(schema.posts)
        .orderBy(desc(schema.posts.comments));
    case 'score':
      return await db
        .select()
        .from(schema.posts)
        .orderBy(desc(schema.posts.comments));
    case 'date':
      return await db.select().from(schema.posts).orderBy(schema.posts.created);
    default:
      return await db.select().from(schema.posts);
  }
}
