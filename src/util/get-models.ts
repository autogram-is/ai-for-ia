import { and, asc, eq, inArray } from 'drizzle-orm';
import { db } from '../db/client.js';
import * as schema from '../db/schema.js';

interface Options {
  ids?: string[];
  provider?: string | string[];
  tier?: string | string[];
  embed?: boolean;
  generate?: boolean;
}

export async function getModel(id: string) {
  const result = await db
    .select()
    .from(schema.models)
    .where(eq(schema.models.id, id))
    .limit(1);

  return result.pop();
}

export async function getModels(options: Options = {}) {
  if (options.ids) {
    return await db
    .select()
    .from(schema.models)
    .where(inArray(schema.models.id, options.ids))
    .orderBy(asc(schema.models.label));
  };

  const opt = {
    provider: options.provider
      ? Array.isArray(options.provider)
        ? options.provider
        : [options.provider]
      : undefined,
    tier: options.tier
      ? Array.isArray(options.tier)
        ? options.tier
        : [options.tier]
      : undefined,
    embed: options.embed,
    generate: options.generate,
  };
  return await db
    .select()
    .from(schema.models)
    .where(
      and(
        opt?.provider
          ? inArray(schema.models.provider, opt.provider)
          : undefined,
        opt?.tier ? inArray(schema.models.tier, opt.tier) : undefined,
        opt.embed !== undefined
          ? eq(schema.models.embed, opt.embed)
          : undefined,
        opt.generate !== undefined
          ? eq(schema.models.generate, opt.generate)
          : undefined,
      ),
    )
    .orderBy(asc(schema.models.label));
}
