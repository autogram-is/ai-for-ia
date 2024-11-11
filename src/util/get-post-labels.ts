import { and, eq, inArray } from 'drizzle-orm';
import pMemoize from 'p-memoize';
import * as database from '../db/index.js';

interface Options {
  ids: string[];
  labels: string[];
  posts: string[];
  model: string;
  variant: string;
  technique: string;
}

const _getPostLabels = async (options: Partial<Options> = {}) => {
  return database.db
    .select({
      post: database.postLabels.post,
      label: database.postLabels.label,
      variant: database.postLabels.variant,
      model: database.postLabels.model,
      technique: database.postLabels.technique,
      raw: database.postLabels.raw,
      duration: database.postLabels.duration,
    })
    .from(database.postLabels)
    .where(
      and(
        options.labels
          ? inArray(database.postLabels.label, options.labels)
          : undefined,
        options.posts
          ? inArray(database.postLabels.post, options.posts)
          : undefined,
        options.model
          ? eq(database.postLabels.model, options.model)
          : undefined,
        options.variant
          ? eq(database.postLabels.variant, options.variant)
          : undefined,
        options.technique
          ? eq(database.postLabels.technique, options.technique)
          : undefined,
      ),
    );
};

export const getPostLabels = pMemoize(_getPostLabels);
