import { Label } from '../db/index.js';

/**
 * Generates a formatted system prompt for labeling.
 *
 * This is a little jank, but it's usable across all of our human
 * and model-generated labels, so it'll have to do.
 */
export function buildSystemPrompt(prompt: string, labels: Label[]) {
  const jsonLabelText = JSON.stringify(
    labels.map(l => ({
      id: l.id,
      name: l.title,
    })),
  );

  const jsonLabelDescriptions = JSON.stringify(
    labels.map(l => ({
      id: l.id,
      name: l.title,
      description: l.text,
    })),
  );

  const plainLabelText = labels
    .map(l => `* ${l.title}: ${l.text?.trim()})`)
    .join('\n');

  return prompt
    .replace('[[LABELS-JSON]]', jsonLabelText)
    .replace('[[LABELS-FULL-JSON]]', jsonLabelDescriptions)
    .replace('[[LABELS-PLAIN]]', plainLabelText);
}
