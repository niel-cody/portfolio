import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const work = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    kicker: z.string(),
    summary: z.string(),
    period: z.string(),
    seat: z.string(),
    team: z.string(),
    status: z.enum(['Shipped', 'In production', 'In flight', 'Adopted']),
    order: z.number(),
    headline: z.object({ value: z.string(), label: z.string() }),
    spec: z.array(z.tuple([z.string(), z.string()])),
  }),
});

const writing = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    dek: z.string(),
    date: z.coerce.date(),
    kind: z.enum(['Essay', 'Field note', 'Build log', 'Post-mortem']),
    status: z.enum(['Published', 'Evergreen', 'Working draft']),
    minutes: z.number(),
    order: z.number().optional(),
  }),
});

export const collections = { work, writing };
