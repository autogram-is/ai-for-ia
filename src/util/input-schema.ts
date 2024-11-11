import { nanohash } from '@eatonfyi/ids';
import { z } from 'zod';

export const optionalBool = z.coerce
  .boolean()
  .transform(b => (b ? b : undefined));

export const optionalNumber = z.coerce
  .number()
  .transform(b => (b ? b : undefined));

export const optionalString = z
  .string()
  .default('')
  .transform(s => (s.trim().length ? s : undefined));

export const postSchema = z
  .object({
    id: z.string().default(''),
    subreddit: z.string(),
    created: z.string(),
    title: z.string(),
    url: z.string(),
    selftext: optionalString,
    author: z.coerce.string(),
    author_flair_text: optionalString,
    link_flair_text: optionalString,
    num_comments: z.coerce.number().default(0),
    score: z.coerce.number().default(0),
  })
  .transform(p => {
    p.id ||= nanohash(p.title + (p.selftext ?? p.url));
    return p;
  });

export const modelSchema = z.object({
  id: z.string(),
  label: z.string(),
  tier: z.string(),
  provider: z.string(),
  model: z.string(),
  variant: optionalString,
  embed: optionalBool,
  generate: optionalBool,
  function: optionalBool,
  image: optionalBool,
  specialty: optionalBool,
  epsilon: optionalNumber,
  prefix: optionalString,
  notes: optionalString,
});

export const labelSchema = z
  .object({
    id: z.string().default(''),
    title: z.string(),
    text: z.string().default(''),
    mod: z.coerce.boolean().default(false),
  })
  .transform(p => {
    p.id ||= nanohash(p.title + p.text);
    return p;
  });
