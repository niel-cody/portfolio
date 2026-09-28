import type { Stance, Take } from './schema.ts';

/**
 * The chair's rules, made deterministic. The live chair is instructed to follow
 * the same rules; recorded runs use this function so a visitor can change the
 * panel and see the verdict move.
 *
 *  - A strong objection (fail at 70+ confidence) caps the verdict at conditional,
 *    and it cannot be averaged away.
 *  - A majority of fails is a fail. So is half the panel failing it, when one
 *    of those fails is a strong objection.
 *  - A pass needs a majority of passes and no fails.
 *  - Everything else is conditional.
 *  - Confidence is the mean member confidence, reduced by 6 points for every
 *    member who disagrees with the verdict. A split panel is a less certain one.
 */
export function decide(takes: Take[]): { verdict: Stance; confidence: number; dissenters: number[] } {
  if (takes.length === 0) throw new Error('A verdict needs at least one member');
  const count = (s: Stance) => takes.filter((t) => t.stance === s).length;
  const half = takes.length / 2;
  const strongFail = takes.some((t) => t.stance === 'fail' && t.confidence >= 70);

  let verdict: Stance;
  if (count('fail') > half || (count('fail') >= half && strongFail)) verdict = 'fail';
  else if (count('pass') > half && count('fail') === 0) verdict = 'pass';
  else verdict = 'conditional';
  if (verdict === 'pass' && strongFail) verdict = 'conditional';

  const dissenters = takes.flatMap((t, i) => (t.stance === verdict ? [] : [i]));
  const mean = takes.reduce((a, t) => a + t.confidence, 0) / takes.length;
  const confidence = Math.max(5, Math.min(95, Math.round(mean - dissenters.length * 6)));
  return { verdict, confidence, dissenters };
}
