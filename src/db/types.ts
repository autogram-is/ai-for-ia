import * as schema from './schema.js';

export type Model = typeof schema.models.$inferSelect;
export type Label = typeof schema.labels.$inferSelect;
export type Post = typeof schema.posts.$inferSelect;
export type Embedding = typeof schema.embeddings.$inferSelect;
export type Position = typeof schema.positions.$inferSelect;
export type PostLabel = typeof schema.postLabels.$inferSelect;
export type LogEntry = typeof schema.logs.$inferSelect;
export type Prompt = typeof schema.prompts.$inferSelect;
