import { eq } from 'drizzle-orm';
import * as database from '../db/index.js';

export async function getPrompt(id: string) {
  const result = await database.db
    .select()
    .from(database.prompts)
    .where(eq(database.prompts.id, id))
    .limit(1);

  return result.pop();
}
