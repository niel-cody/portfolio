import { useMemo, useState } from 'react';
import './playground.css';

/**
 * Readout: check a product bet before you build it, then keep the ledger.
 * Rules, not a model: the point is that a checkable bet has a checkable shape.
 */

interface Bet {
  belief: string;
  metric: string;
  target: string;
  check: string;
  kill: string;
}

const PRESETS: Record<string, Bet> = {
  vague: {
    belief: 'The new loyalty screen will improve engagement and make guests happier.',
    metric: 'Engagement',
    target: 'Up',
    check: 'After launch',
    kill: 'If adoption is low we will revisit.',
  },
  good: {
    belief: 'Showing points on the receipt will bring lapsed members back sooner, because they see what they are leaving on the table.',
    metric: 'Share of members who return within 30 days',
    target: 'From 22% to 28% of members',
    check: 'Six weeks after launch, across 12 venues',
    kill: 'If the return rate rises by less than 2 points in six weeks, stop the rollout and remove it from the receipt.',
  },
};

const VAGUE = /\b(improve|improved|increase|enhance|optimi[sz]e|better|boost|drive|engagement|delight|happier|seamless|streamline|leverage)\b/i;
const VANITY = /\b(page ?views?|downloads?|sign[- ]?ups?|registrations?|likes?|impressions?|followers?|installs?|time on (site|page)|clicks?)\b/i;
const NUMBER = /\d/;
const WHEN = /\b((\d+|one|two|three|four|five|six|seven|eight|nine|ten|twelve)\s*(day|days|week|weeks|month|months|quarters?)|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|q[1-4]|\d{1,2}\/\d{1,2})\b/i;
const ACTION = /\b(stop|kill|roll ?back|remove|revert|pause|redesign|switch off|turn off|pull)\b/i;
const BECAUSE = /\b(because|so that|since|as)\b/i;

interface Check {
  ok: boolean;
  label: string;
  why: string;
}

function lint(b: Bet): Check[] {
  return [
    {
      ok: b.belief.trim().length > 20 && BECAUSE.test(b.belief) && !(VAGUE.test(b.belief) && !NUMBER.test(b.belief)),
      label: 'The belief names a behaviour and a reason',
      why: VAGUE.test(b.belief) ? 'Words like "improve" or "engagement" cannot be proven wrong. Say what people will do differently, and why.' : 'Add the reason: "because…". A bet without a mechanism cannot teach you anything when it fails.',
    },
    {
      ok: b.metric.trim().length > 6 && !VAGUE.test(b.metric) && !VANITY.test(b.metric),
      label: 'The metric measures the behaviour, not attention',
      why: VANITY.test(b.metric) ? 'That is a vanity metric. It goes up when you shout louder, not when the feature works.' : 'Name a measurable behaviour, like a rate, a share or a repeat visit.',
    },
    {
      ok: NUMBER.test(b.target) && /\b(to|from|%|\d+\s*(points|pts|x))\b/i.test(b.target),
      label: 'The target is a number, with a baseline',
      why: '"Up" is a direction, not a target. Write "from 22% to 28%".',
    },
    {
      ok: WHEN.test(b.check),
      label: 'There is a date someone owns',
      why: '"After launch" never arrives. Put a length of time or a date on it.',
    },
    {
      ok: NUMBER.test(b.kill) && ACTION.test(b.kill),
      label: 'The kill signal has a number and an action',
      why: '"We will revisit" was written to be forgotten. Say what number stops it, and what you will do.',
    },
  ];
}

const LEDGER: { t: string; m: string; v: 'kept' | 'killed' | 'inconclusive' }[] = [
  { t: 'Points on the receipt bring lapsed members back', m: '30-day return rate, 22% → 26%. Target was 28%, the kill line was +2 points.', v: 'kept' },
  { t: 'A reorder button lifts second-round sales', m: 'Second-round share flat after six weeks. Stopped, and removed from the menu screen.', v: 'killed' },
  { t: 'Allergen filters cut wrong orders to the kitchen', m: 'Remakes down from 3.1% to 1.9% of tickets across eight venues.', v: 'kept' },
  { t: 'Weekday happy-hour pricing fills the 3pm lull', m: 'Covers up, spend per head down. Net effect within noise. Rerun with a tighter window.', v: 'inconclusive' },
  { t: 'A menu tour for new managers speeds up setup', m: 'Setup time unchanged. Nobody finished the tour. Killed after four weeks.', v: 'killed' },
];

export default function Readout() {
  const [bet, setBet] = useState<Bet>(PRESETS.vague!);
  const checks = useMemo(() => lint(bet), [bet]);
  const score = checks.filter((c) => c.ok).length;
  const set = (k: keyof Bet) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setBet({ ...bet, [k]: e.target.value });
  const tally = (v: string) => LEDGER.filter((l) => l.v === v).length;

  return (
    <div className="pg">
      <div className="pg-face">
        <div className="pg-plate">
          <span className="pg-brand">Readout</span>
          <span className="label">Bet checker · rules, not a model · runs in your browser</span>
        </div>
        <div className="ro-form">
          <div className="ro-fields">
            <div className="ro-presets">
              <button type="button" className="key" onClick={() => setBet(PRESETS.vague!)}>
                Load a vague bet
              </button>
              <button type="button" className="key" onClick={() => setBet(PRESETS.good!)}>
                Load a checkable one
              </button>
              <button type="button" className="key" onClick={() => setBet({ belief: '', metric: '', target: '', check: '', kill: '' })}>
                Write your own
              </button>
            </div>
            <label className="ro-field">
              <span className="label label-ink">We believe</span>
              <textarea value={bet.belief} onChange={set('belief')} rows={2} placeholder="Guests will… because…" />
            </label>
            <label className="ro-field">
              <span className="label label-ink">We will measure</span>
              <input value={bet.metric} onChange={set('metric')} placeholder="Share of members who…" />
            </label>
            <label className="ro-field">
              <span className="label label-ink">Target</span>
              <input value={bet.target} onChange={set('target')} placeholder="From 22% to 28%" />
            </label>
            <label className="ro-field">
              <span className="label label-ink">We will check</span>
              <input value={bet.check} onChange={set('check')} placeholder="Six weeks after launch" />
            </label>
            <label className="ro-field">
              <span className="label label-ink">Kill signal</span>
              <textarea value={bet.kill} onChange={set('kill')} rows={2} placeholder="If… by…, we stop…" />
            </label>
          </div>
          <div className="ro-score" aria-live="polite">
            <span className="label label-ink">Checkable</span>
            <div className="ro-grade">
              <span className="num">{score}</span>
              <span className="of">/ 5</span>
            </div>
            <p className={`ro-verdict ${score === 5 ? 'is-good' : ''}`}>
              {score === 5
                ? 'This bet can be proven wrong. Build it, and put the check date in someone’s calendar.'
                : score >= 3
                  ? 'Close. Fix the misses below before anyone writes code.'
                  : 'This bet cannot be proven wrong, so it cannot be proven right either.'}
            </p>
            <ul className="ro-checks">
              {checks.map((c) => (
                <li key={c.label} className={c.ok ? 'ok' : ''}>
                  <span className="ro-mark" aria-hidden="true">
                    {c.ok ? '✓' : '×'}
                  </span>
                  <span>
                    <span className="sr-only">{c.ok ? 'Passes: ' : 'Missing: '}</span>
                    {c.label}
                    {!c.ok && <span className="why">{c.why}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="ro-ledger">
        <div className="ro-board">
          <div>
            <span className="label">Bets called</span>
            <span className="num">{LEDGER.length}</span>
          </div>
          <div>
            <span className="label">Kept</span>
            <span className="num">{tally('kept')}</span>
          </div>
          <div>
            <span className="label">Killed</span>
            <span className="num">{tally('killed')}</span>
          </div>
          <div>
            <span className="label">Inconclusive</span>
            <span className="num">{tally('inconclusive')}</span>
          </div>
        </div>
        <ol className="ro-bets">
          {LEDGER.map((l) => (
            <li key={l.t} className="ro-bet">
              <span className="ro-bet-t">{l.t}</span>
              <span className="ro-bet-m">{l.m}</span>
              <span className="ro-bet-v">
                <span className={`ro-v ${l.v}`}>{l.v}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
      <p className="label" style={{ textTransform: 'none', letterSpacing: '0.01em', fontSize: '12.5px' }}>
        Sample ledger with invented figures, to show the shape. Every killed bet counts as a win: it stopped effort going
        into the wrong place.
      </p>
    </div>
  );
}
