import { Label } from '../db/index.js';

/**
 * Returns a matching label given an LLM response string. We have to be … forgiving.
 */
export function getLabelfromPromptResponse(
  response: string,
  labels: Label[] = [],
) {
  let label = labels.find(l => response.includes(l.id));
  label ??= labels.find(l => response.includes(l.title));

  return label;
}
