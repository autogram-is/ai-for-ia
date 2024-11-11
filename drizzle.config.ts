import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const url = process.env.POSTGRES_URL ?? './database/';
const config = {
  dialect: 'postgresql' as const,
  schema: './src/db/schema.ts',
  dbCredentials: { url },
  schemaFilter: 'public',
  tablesFilter: '*',
  out: './drizzle',
};
const extras = !url.startsWith('postgresql:')
  ? { driver: 'pglite' as const }
  : {};

export default defineConfig({ ...config, ...extras });
