export * from './get-label-set.js';
export * from './get-labels.js';
export * from './get-models.js';
export * from './get-posts.js';
export * from './get-prompt.js';
export * from './has-been-described.js';
export * from './has-been-embedded.js';
export * from './has-been-labeled.js';
export * from './input-schema.js';
export * from './progress-bar.js';
export * from './progress-emitter.js';
export * from './serializers.js';
export * from './key-by.js';

import { similarity } from 'ml-distance';
export const cosineDistance = (a: number[], b: number[]) =>
  1 - similarity.cosine(a, b);
