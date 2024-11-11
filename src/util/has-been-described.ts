import * as database from '../db/index.js';
import { getLabel } from './get-labels.js';

export async function hasBeenDescribed(input: string | database.Label) {
  let label: database.Label | undefined;
  if (typeof input === 'string') {
    label = await getLabel(input);
  } else {
    label = input;
  }

  if (label) {
    return !!label.text;
  }
  return false;
}
