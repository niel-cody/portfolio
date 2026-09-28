import type { Stance } from './schema.ts';

export interface RecordView {
  title: string;
  decision: string;
  verdict: Stance;
  confidence: number;
  summary: string;
  dissent: string;
  panel: { name: string; role: string; stance: Stance; confidence: number; headline: string }[];
  kill_signals: string[];
  assumptions: string[];
  questions: string[];
  date: string;
}

/** A decision record you can paste into a doc, a ticket or an email. */
export function toMarkdown(r: RecordView): string {
  const list = (xs: string[]) => xs.map((x, i) => `${i + 1}. ${x}`).join('\n');
  return [
    `# Decision record: ${r.title}`,
    '',
    `**Verdict:** ${r.verdict.toUpperCase()} · **Confidence:** ${r.confidence}% · **Date:** ${r.date}`,
    '',
    `**Decision.** ${r.decision.trim()}`,
    '',
    `**Summary.** ${r.summary.trim()}`,
    '',
    `**Dissent.** ${r.dissent}`,
    '',
    '## The panel',
    ...r.panel.map((p) => `- **${p.name}, ${p.role}** — ${p.stance} (${p.confidence}%): ${p.headline}`),
    '',
    '## Kill signals',
    list(r.kill_signals),
    '',
    '## Riskiest assumptions',
    list(r.assumptions),
    '',
    '## Ask real operators',
    list(r.questions),
    '',
    '_The panel advises. A person decides. Convened on the Council, nielcody.com._',
  ].join('\n');
}
