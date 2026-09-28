import { z } from 'zod';

export const Stance = z.enum(['pass', 'conditional', 'fail']);
export type Stance = z.infer<typeof Stance>;

/** pack.yaml */
export const PackManifest = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  title: z.string(),
  version: z.string(),
  description: z.string(),
  seats: z.number().int().min(2).max(6),
  default_members: z.array(z.string()).min(2),
  scenario: z.string(),
  rules: z.array(z.string()).min(1),
  verdicts: z.array(Stance),
});
export type PackManifest = z.infer<typeof PackManifest>;

/** members/*.md frontmatter */
export const MemberMeta = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  role: z.string(),
  venue: z.string(),
  initial: z.string().length(1),
  cares_about: z.array(z.string()).min(1),
  blind_spot: z.string(),
  voice: z.string(),
});
export type Member = z.infer<typeof MemberMeta> & { brief: string };

/** What one member returns. Also the shape of a take in a recorded run. */
export const Take = z.object({
  stance: Stance,
  confidence: z.number().int().min(0).max(100),
  headline: z.string(),
  take: z.string(),
  breaks_at: z.string(),
  would_need: z.string(),
});
export type Take = z.infer<typeof Take>;

/** What the chair returns. */
export const ChairRecord = z.object({
  verdict: Stance,
  confidence: z.number().int().min(0).max(100),
  summary: z.string(),
  dissent: z.string(),
  kill_signals: z.array(z.string()).length(3),
  assumptions: z.array(z.string()).length(3),
  questions: z.array(z.string()).length(3),
});
export type ChairRecord = z.infer<typeof ChairRecord>;

/** runs/*.yaml — a recorded run, explorable without a model. */
export const RecordedRun = z.object({
  id: z.string(),
  title: z.string(),
  short: z.string(),
  decision: z.string(),
  recorded: z.union([z.string(), z.date()]).transform((d) => (d instanceof Date ? d.toISOString().slice(0, 10) : d)),
  kind: z.enum(['illustrative', 'live']),
  takes: z.record(z.string(), Take),
  chair: z.object({
    summaries: z.object({ pass: z.string(), conditional: z.string(), fail: z.string() }),
    kill_signals: z.array(z.string()).length(3),
    assumptions: z.array(z.string()).length(3),
    questions: z.array(z.string()).length(3),
  }),
});
export type RecordedRun = z.infer<typeof RecordedRun>;

export interface Pack {
  manifest: PackManifest;
  members: Member[];
  chair: string;
  runs: RecordedRun[];
}
