#!/usr/bin/env -S npx tsx
/**
 * Run the Council from the command line with your own key.
 *
 *   npx tsx src/cli.ts "Your decision here"
 *   npx tsx src/cli.ts --members mara,priya,keith,sam "Your decision"
 *   npx tsx src/cli.ts --pack ../../content/council-packs/hospitality --json "..."
 */
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPack } from './pack.ts';
import { runCouncil } from './run.ts';
import { toMarkdown } from './record.ts';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = (name: string) => {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return undefined;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
};
const json = args.includes('--json') && (args.splice(args.indexOf('--json'), 1), true);
const packDir = resolve(flag('pack') ?? resolve(here, '../../../content/council-packs/hospitality'));
const memberIds = flag('members')?.split(',').map((s) => s.trim());
const decision = args.join(' ');

if (!decision) {
  console.error('Usage: council [--pack dir] [--members a,b,c,d] [--json] "the decision"');
  process.exit(1);
}

const pack = loadPack(packDir);
const controller = new AbortController();
process.on('SIGINT', () => controller.abort());

const t0 = Date.now();
const result = await runCouncil(pack, decision, {
  memberIds,
  signal: controller.signal,
  onMember: (r) =>
    console.error(
      r.take
        ? `  ${r.member.name.padEnd(6)} ${r.take.stance.padEnd(11)} ${String(r.take.confidence).padStart(3)}%  ${r.take.headline}`
        : `  ${r.member.name.padEnd(6)} absent       ${r.error}`,
    ),
});
console.error(`  chair  ${result.record.verdict}  (${((Date.now() - t0) / 1000).toFixed(1)}s)\n`);

if (json) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(
    toMarkdown({
      title: decision.slice(0, 60),
      decision: result.decision,
      verdict: result.record.verdict,
      confidence: result.record.confidence,
      summary: result.record.summary,
      dissent: result.record.dissent,
      panel: result.members.flatMap((m) =>
        m.take ? [{ name: m.member.name, role: m.member.role, stance: m.take.stance, confidence: m.take.confidence, headline: m.take.headline }] : [],
      ),
      kill_signals: result.record.kill_signals,
      assumptions: result.record.assumptions,
      questions: result.record.questions,
      date: new Date().toISOString().slice(0, 10),
    }),
  );
}
