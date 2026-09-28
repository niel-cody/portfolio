import { useEffect, useMemo, useRef, useState } from 'react';
import { decide } from 'council-core/verdict';
import { toMarkdown } from 'council-core/record';
import type { RecordedRun, Stance } from 'council-core/schema';
import './council.css';

export interface SeatMember {
  id: string;
  name: string;
  role: string;
  venue: string;
  initial: string;
  cares_about: string[];
}

interface Props {
  packName: string;
  packVersion: string;
  seats: number;
  defaults: string[];
  members: SeatMember[];
  runs: RecordedRun[];
}

type Phase = 'idle' | 'running' | 'chairing' | 'done';

const STANCE_LABEL: Record<Stance, string> = { pass: 'Pass', conditional: 'Conditional', fail: 'Fail' };
const MEMBER_GAP = 1100;
const CHAIR_PAUSE = 1300;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

/** Streams text in like a live answer. Instant when asked, or when motion is reduced. */
function Typed({ text, instant, onDone }: { text: string; instant: boolean; onDone?: () => void }) {
  const [n, setN] = useState(instant ? text.length : 0);
  const done = useRef(false);
  useEffect(() => {
    if (instant) {
      setN(text.length);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const cps = 190; // characters per second, roughly a fast model stream
    const tick = (t: number) => {
      const next = Math.min(text.length, Math.floor(((t - start) / 1000) * cps));
      setN(next);
      if (next < text.length) raf = requestAnimationFrame(tick);
      else if (!done.current) {
        done.current = true;
        onDone?.();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, instant]);
  return (
    <>
      <span aria-hidden="true">{text.slice(0, n)}</span>
      {n < text.length && <span className="cn-caret" aria-hidden="true" />}
      <span className="sr-only">{text}</span>
    </>
  );
}

function Meter({ value, lit }: { value: number; lit: boolean }) {
  const segs = 12;
  const on = lit ? Math.round((value / 100) * segs) : 0;
  return (
    <div className="cn-meter" aria-hidden="true">
      {Array.from({ length: segs }, (_, i) => (
        <span key={i} className={segs - i <= on ? 'on' : ''} style={{ transitionDelay: `${(segs - i) * 35}ms` }} />
      ))}
    </div>
  );
}

export default function Council({ packName, packVersion, seats, defaults, members, runs }: Props) {
  const reduced = usePrefersReducedMotion();
  const [runId, setRunId] = useState(runs[0]!.id);
  const [seated, setSeated] = useState<string[]>(defaults);
  const [phase, setPhase] = useState<Phase>('idle');
  const [revealed, setRevealed] = useState(0);
  const [instant, setInstant] = useState(false);
  const [signed, setSigned] = useState<null | 'agree' | 'disagree'>(null);
  const [why, setWhy] = useState('');
  const [disagreeOpen, setDisagreeOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const timers = useRef<number[]>([]);
  const outRef = useRef<HTMLDivElement>(null);
  const recordRef = useRef<HTMLDivElement>(null);

  const run = runs.find((r) => r.id === runId)!;
  const panel = useMemo(
    () => members.filter((m) => seated.includes(m.id)).map((m) => ({ member: m, take: run.takes[m.id]! })),
    [members, seated, run],
  );
  const result = useMemo(() => decide(panel.map((p) => p.take)), [panel]);
  const full = seated.length === seats;
  const fast = instant || reduced;

  const clear = () => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => clear, []);

  const reset = () => {
    clear();
    setPhase('idle');
    setRevealed(0);
    setSigned(null);
    setWhy('');
    setDisagreeOpen(false);
    setCopied(false);
  };

  const pickRun = (id: string) => {
    if (id === runId) return;
    reset();
    setRunId(id);
  };

  const toggleSeat = (id: string) => {
    reset();
    setSeated((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < seats ? [...s, id] : s));
  };

  const convene = () => {
    if (!full) return;
    reset();
    setPhase('running');
    requestAnimationFrame(() => outRef.current?.scrollIntoView({ behavior: fast ? 'auto' : 'smooth', block: 'start' }));
    if (fast) {
      setRevealed(seats);
      setPhase('done');
      return;
    }
    for (let i = 1; i <= seats; i++) {
      timers.current.push(window.setTimeout(() => setRevealed(i), (i - 1) * MEMBER_GAP + 250));
    }
    const chairAt = (seats - 1) * MEMBER_GAP + 250 + 2600;
    timers.current.push(window.setTimeout(() => setPhase('chairing'), chairAt));
    timers.current.push(
      window.setTimeout(() => {
        setPhase('done');
        requestAnimationFrame(() => recordRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      }, chairAt + CHAIR_PAUSE),
    );
  };

  const dissent =
    result.dissenters.length === 0
      ? 'None. The panel agreed.'
      : result.dissenters
          .map((i) => {
            const p = panel[i]!;
            return `${p.member.name} (${p.member.role}) says ${STANCE_LABEL[p.take.stance].toLowerCase()}: “${p.take.headline}”`;
          })
          .join(' ');

  const markdown = () =>
    toMarkdown({
      title: run.title,
      decision: run.decision,
      verdict: result.verdict,
      confidence: result.confidence,
      summary: run.chair.summaries[result.verdict],
      dissent,
      panel: panel.map((p) => ({
        name: p.member.name,
        role: p.member.role,
        stance: p.take.stance,
        confidence: p.take.confidence,
        headline: p.take.headline,
      })),
      kill_signals: run.chair.kill_signals,
      assumptions: run.chair.assumptions,
      questions: run.chair.questions,
      date: new Date().toISOString().slice(0, 10),
    });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(markdown());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(false);
    }
  };

  const status =
    phase === 'idle'
      ? full
        ? 'Ready'
        : `Seat ${seats - seated.length} more`
      : phase === 'running'
        ? `In session ${Math.min(revealed, seats)}/${seats}`
        : phase === 'chairing'
          ? 'Chair writing'
          : 'Verdict in';

  return (
    <div className="cn" data-phase={phase}>
      {/* Faceplate */}
      <div className="cn-face">
        <div className="cn-plate">
          <span className="cn-brand">The Council</span>
          <span className="label">
            {packName} pack · v{packVersion}
          </span>
          <span className="cn-leds" aria-live="polite">
            <span className={`cn-led ${phase !== 'idle' ? 'is-on' : ''}`} aria-hidden="true" />
            <span className="label label-ink">{status}</span>
          </span>
        </div>

        {/* 01 Decision */}
        <fieldset className="cn-sect">
          <legend className="cn-legend">
            <span className="label label-ink">01</span>
            <span className="label label-ink">The decision</span>
          </legend>
          <div
            className="cn-decisions"
            role="radiogroup"
            aria-label="Choose a decision"
            onKeyDown={(e) => {
              const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
              if (!dir) return;
              e.preventDefault();
              const i = runs.findIndex((r) => r.id === runId);
              const next = runs[(i + dir + runs.length) % runs.length]!;
              pickRun(next.id);
              (e.currentTarget.querySelector(`[data-run="${next.id}"]`) as HTMLButtonElement | null)?.focus();
            }}
          >
            {runs.map((r, i) => (
              <button
                key={r.id}
                type="button"
                role="radio"
                aria-checked={r.id === runId}
                tabIndex={r.id === runId ? 0 : -1}
                data-run={r.id}
                className="cn-dec"
                onClick={() => pickRun(r.id)}
              >
                <span className="label">No. {String(i + 1).padStart(2, '0')}</span>
                <span className="cn-dec-t">{r.title}</span>
                <span className="cn-dec-s">{r.short}</span>
              </button>
            ))}
            <div className="cn-dec is-locked" aria-disabled="true">
              <span className="label">No. 04</span>
              <span className="cn-dec-t">Your own decision</span>
              <span className="cn-dec-s">Live runs, capped and free, come next. Or run it today with your own key.</span>
              <a className="cn-locklink" href="#build-your-own">
                Run it locally →
              </a>
            </div>
          </div>
          <blockquote className="cn-slip">
            <span className="label">On the table</span>
            <p>{run.decision}</p>
          </blockquote>
        </fieldset>

        {/* 02 Panel */}
        <fieldset className="cn-sect">
          <legend className="cn-legend">
            <span className="label label-ink">02</span>
            <span className="label label-ink">The panel</span>
            <span className="label">
              Seat {seats} of {members.length} · {seated.length}/{seats}
            </span>
          </legend>
          <div className="cn-desk">
            {members.map((m) => {
              const on = seated.includes(m.id);
              const idx = panel.findIndex((p) => p.member.id === m.id);
              const spoken = on && phase !== 'idle' && idx > -1 && idx < revealed;
              const take = run.takes[m.id]!;
              return (
                <div key={m.id} className={`cn-strip ${on ? 'is-on' : ''} ${spoken ? 'is-spoken' : ''}`}>
                  <div className="cn-strip-top">
                    <span className="cn-av" aria-hidden="true">
                      {m.initial}
                    </span>
                    <span className="cn-name">{m.name}</span>
                    <span className="cn-role">{m.role}</span>
                  </div>
                  <p className="cn-venue">{m.venue}</p>
                  <div className="cn-strip-mid">
                    <Meter value={take.confidence} lit={spoken} />
                    <span className={`cn-stamp s-${take.stance} ${spoken ? 'is-in' : ''}`} aria-hidden={!spoken}>
                      {STANCE_LABEL[take.stance]}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="cn-switch"
                    aria-pressed={on}
                    aria-label={`${on ? 'Unseat' : 'Seat'} ${m.name}, ${m.role}`}
                    disabled={!on && full}
                    onClick={() => toggleSeat(m.id)}
                  >
                    <span className="cn-switch-track" aria-hidden="true">
                      <span className="cn-switch-knob" />
                    </span>
                    <span className="label">{on ? 'Seated' : 'Seat'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </fieldset>

        {/* 03 Controls */}
        <div className="cn-controls">
          <button type="button" className="key is-flash cn-go" onClick={convene} disabled={!full}>
            {phase === 'done' ? 'Convene again' : 'Convene the Council'} <span className="arrow" aria-hidden="true">→</span>
          </button>
          <label className="cn-check">
            <input type="checkbox" checked={instant} onChange={(e) => setInstant(e.target.checked)} />
            <span className="label label-ink">Show the verdict at once, no streaming</span>
          </label>
          <span className="pill is-ghost cn-kind">
            <span className="dot" aria-hidden="true" />
            Illustrative run
          </span>
        </div>
      </div>

      {/* Answers */}
      <div ref={outRef} className="cn-out" aria-live="polite">
        {phase !== 'idle' && (
          <>
            <div className="cn-out-head">
              <span className="label label-ink">03</span>
              <span className="label label-ink">Independent answers</span>
              <span className="label">Nobody saw anyone else's</span>
            </div>
            <ol className="cn-answers">
              {panel.slice(0, revealed).map(({ member, take }) => (
                <li key={member.id} className="cn-answer">
                  <div className="cn-answer-top">
                    <span className="cn-av" aria-hidden="true">
                      {member.initial}
                    </span>
                    <span>
                      <span className="cn-name">{member.name}</span>
                      <span className="label"> {member.role}</span>
                    </span>
                    <span className={`cn-verdict-chip s-${take.stance}`}>
                      {STANCE_LABEL[take.stance]} · {take.confidence}%
                    </span>
                  </div>
                  <p className="cn-headline">
                    <Typed text={take.headline} instant={fast} />
                  </p>
                  <p className="cn-take">
                    <Typed text={take.take} instant={fast} />
                  </p>
                  <dl className="cn-facts">
                    <div>
                      <dt className="label">Breaks at</dt>
                      <dd>{take.breaks_at}</dd>
                    </div>
                    <div>
                      <dt className="label">Would need</dt>
                      <dd>{take.would_need}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ol>
          </>
        )}

        {phase === 'chairing' && (
          <div className="cn-chairing" role="status">
            <span className="cn-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="label label-ink">The chair is writing the decision record</span>
          </div>
        )}

        {phase === 'done' && (
          <div ref={recordRef} className="cn-record">
            <div className="cn-record-band">
              <div>
                <span className="label label-ink">04 · Decision record</span>
                <p className="cn-big">{STANCE_LABEL[result.verdict]}</p>
              </div>
              <div className="cn-conf">
                <span className="num">{result.confidence}%</span>
                <span className="label label-ink">Confidence</span>
                <span className="cn-conf-bar" aria-hidden="true">
                  <span style={{ width: `${result.confidence}%` }} />
                </span>
              </div>
            </div>
            <div className="cn-record-body">
              <section>
                <h3 className="label label-ink">Summary</h3>
                <p className="cn-summary">{run.chair.summaries[result.verdict]}</p>
              </section>
              <section>
                <h3 className="label label-ink">Dissent</h3>
                <p>{dissent}</p>
              </section>
              <div className="cn-cols">
                <section>
                  <h3 className="label label-ink">Kill signals</h3>
                  <ol>
                    {run.chair.kill_signals.map((k) => (
                      <li key={k}>{k}</li>
                    ))}
                  </ol>
                </section>
                <section>
                  <h3 className="label label-ink">Riskiest assumptions</h3>
                  <ol>
                    {run.chair.assumptions.map((k) => (
                      <li key={k}>{k}</li>
                    ))}
                  </ol>
                </section>
                <section>
                  <h3 className="label label-ink">Ask real operators</h3>
                  <ol>
                    {run.chair.questions.map((k) => (
                      <li key={k}>{k}</li>
                    ))}
                  </ol>
                </section>
              </div>
            </div>
            <div className="cn-sign">
              <p className="label label-ink">The panel advises. A person decides.</p>
              {signed ? (
                <p className="cn-signed" role="status">
                  <span className="cn-led is-on" aria-hidden="true" />
                  Signed: you {signed === 'agree' ? 'agree' : 'disagree'}
                  {signed === 'disagree' && why ? `, because ${why.trim().replace(/\.$/, '')}.` : '.'} That click is the
                  whole point.
                </p>
              ) : (
                <div className="cn-sign-row">
                  <button type="button" className="key is-ink" onClick={() => setSigned('agree')}>
                    I agree
                  </button>
                  <button
                    type="button"
                    className="key"
                    aria-expanded={disagreeOpen}
                    onClick={() => setDisagreeOpen((o) => !o)}
                  >
                    I disagree, because…
                  </button>
                  <button type="button" className="key cn-copy" onClick={copy}>
                    {copied ? 'Copied as Markdown ✓' : 'Copy the record'}
                  </button>
                </div>
              )}
              {!signed && disagreeOpen && (
                <form
                  className="cn-why"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSigned('disagree');
                  }}
                >
                  <label className="label label-ink" htmlFor="cn-why">
                    Because
                  </label>
                  <textarea
                    id="cn-why"
                    rows={2}
                    maxLength={280}
                    value={why}
                    onChange={(e) => setWhy(e.target.value)}
                    placeholder="the panel missed…"
                  />
                  <button type="submit" className="key is-ink">
                    Sign it
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
