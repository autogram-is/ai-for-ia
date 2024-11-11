import 'dotenv/config';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { drizzle as drizzlePgLite } from 'drizzle-orm/pglite';
import { logs } from './schema.js';

// If a file path is provided, we use PGLite, a sqlite-like build
// of postgres that dumps stuff in the local filesystem or keeps
// it in memory.
// If it's a proper postgres connection URL, though, we do the
// right and proper thing.
const url = process.env.POSTGRES_URL ?? './database/';

export const db = url.startsWith('postgresql:')
  ? drizzlePg(url)
  : drizzlePgLite(url);

export function getConnection() {
  return db;
}

export async function log(message: string, event = 'info') {
  await db.insert(logs).values({ message, event });
  if (log.display) console.log(message);
}

log.display = false;
