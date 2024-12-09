import {
  boolean,
  date,
  doublePrecision,
  integer,
  pgTable,
  real,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const models = pgTable('models', {
  id: varchar().primaryKey(),
  label: varchar().notNull(),
  tier: varchar().notNull(),
  provider: varchar().notNull(),
  model: varchar().notNull(),
  family: varchar(),
  variant: varchar(),
  embed: boolean().notNull().default(false),
  generate: boolean().notNull().default(false),
  function: boolean().notNull().default(false),
  image: boolean().notNull().default(false),
  specialty: boolean().notNull().default(false),
  epsilon: real(),
  prefix: varchar(),
  notes: varchar(),
});

export const prompts = pgTable('prompts', {
  id: varchar().primaryKey(),
  text: varchar().notNull(),
});

export const posts = pgTable('posts', {
  id: varchar().primaryKey(),
  created: date().notNull(),
  title: varchar().notNull(),
  url: varchar().notNull(),
  text: text().notNull(),
  author: varchar().notNull(),
  comments: integer().notNull().default(0),
  score: integer().notNull().default(0),
});

export const labels = pgTable('labels', {
  id: varchar().primaryKey(),
  model: varchar().notNull(),
  variant: varchar().notNull(),
  title: varchar().notNull(),
  text: text(),
  mod: boolean().notNull().default(false),
});

export const postLabels = pgTable('post_labels', {
  post: varchar().references(() => posts.id),
  label: varchar().references(() => labels.id),
  model: varchar().notNull(),
  technique: varchar().notNull(),
  variant: varchar().notNull(),
  raw: varchar(),
  duration: integer().notNull().default(0),
});

export const embeddings = pgTable('embeddings', {
  id: varchar().notNull(),
  model: varchar().notNull(),
  vector: doublePrecision().notNull().array().notNull(),
  duration: integer().notNull().default(0),
});

export const positions = pgTable('positions', {
  id: varchar().notNull(),
  model: varchar().notNull(),
  plane: doublePrecision().notNull().array().notNull(),
  space: doublePrecision().notNull().array().notNull(),
});

export const logs = pgTable('logs', {
  time: timestamp().defaultNow(),
  event: varchar().default('info'),
  message: varchar().notNull(),
});
