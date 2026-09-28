import { useMemo, useState } from 'react';
import './playground.css';

/**
 * Reprice: win back a lost card surcharge without touching the prices regulars remember.
 * Runs entirely on a sample menu. No model, no server.
 */

interface Item {
  name: string;
  cat: 'Coffee' | 'Food' | 'Beer' | 'Wine' | 'Cocktails';
  price: number;
  perWeek: number;
  anchor?: boolean; // the prices regulars remember
}

const MENU: Item[] = [
  { name: 'Flat white', cat: 'Coffee', price: 5.5, perWeek: 1400, anchor: true },
  { name: 'Batch brew', cat: 'Coffee', price: 5.0, perWeek: 260 },
  { name: 'Chai latte', cat: 'Coffee', price: 6.0, perWeek: 210 },
  { name: 'Smashed avo', cat: 'Food', price: 24.0, perWeek: 190 },
  { name: 'Bacon and egg roll', cat: 'Food', price: 14.0, perWeek: 420, anchor: true },
  { name: 'Chicken parmi', cat: 'Food', price: 29.0, perWeek: 310, anchor: true },
  { name: 'Fish and chips', cat: 'Food', price: 31.0, perWeek: 150 },
  { name: 'Kids burger', cat: 'Food', price: 16.0, perWeek: 90 },
  { name: 'Pint, house lager', cat: 'Beer', price: 13.0, perWeek: 900, anchor: true },
  { name: 'Pint, pale ale', cat: 'Beer', price: 14.5, perWeek: 380 },
  { name: 'Glass, house white', cat: 'Wine', price: 12.0, perWeek: 300 },
  { name: 'Glass, pinot noir', cat: 'Wine', price: 15.0, perWeek: 120 },
  { name: 'Spritz', cat: 'Cocktails', price: 19.0, perWeek: 160 },
  { name: 'Espresso martini', cat: 'Cocktails', price: 22.0, perWeek: 140 },
];

const money = (n: number) => n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 2 });
const whole = (n: number) => n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 });

type Step = 0.1 | 0.5 | 1;

const MAX_RISE = 0.12; // no single item rises more than 12%

/**
 * The smallest set of price moves that wins the margin back.
 * Greedy: bump one item by one rounding step at a time, always choosing the move
 * a regular is least likely to notice, until the weekly target is covered.
 * Anchors never move when protected. Nothing rises more than 12%.
 */
function plan(opts: { cardShare: number; surcharge: number; protect: boolean; step: Step; lean: boolean }) {
  const revenue = MENU.reduce((a, i) => a + i.price * i.perWeek, 0);
  const target = revenue * (opts.cardShare / 100) * (opts.surcharge / 100);
  const next = MENU.map((i) => i.price);
  const locked = MENU.map((i) => opts.protect && !!i.anchor);
  let recovered = 0;

  // "Noticeability" of the next bump. Evenly: the rise in percent. Leaning on the quiet
  // items: percent rise weighted by how many people see it, per dollar it recovers.
  const cost = (idx: number) => {
    const i = MENU[idx]!;
    const pct = (next[idx]! + opts.step - i.price) / i.price;
    if (pct > MAX_RISE + 1e-9) return Infinity;
    return opts.lean ? (pct * Math.sqrt(i.perWeek)) / (opts.step * i.perWeek) : pct;
  };

  for (let guard = 0; recovered < target && guard < 2000; guard++) {
    let best = -1;
    let bestCost = Infinity;
    for (let idx = 0; idx < MENU.length; idx++) {
      if (locked[idx]) continue;
      const c = cost(idx);
      if (c < bestCost) { bestCost = c; best = idx; }
    }
    if (best === -1) break;
    next[best] = Math.round((next[best]! + opts.step) * 100) / 100;
    recovered += opts.step * MENU[best]!.perWeek;
  }

  const rows = MENU.map((i, idx) => ({ ...i, locked: locked[idx]!, next: next[idx]!, delta: next[idx]! - i.price }));
  const moved = rows.filter((r) => r.delta > 0.001);
  const avgPct = moved.length ? (moved.reduce((a, r) => a + r.delta / r.price, 0) / moved.length) * 100 : 0;
  const maxPct = moved.length ? Math.max(...moved.map((r) => (r.delta / r.price) * 100)) : 0;
  return { revenue, target, recovered, rows, avgPct, maxPct, moved: moved.length };
}

export default function Reprice() {
  const [cardShare, setCardShare] = useState(85);
  const [surcharge, setSurcharge] = useState(1.5);
  const [protect, setProtect] = useState(true);
  const [lean, setLean] = useState(true);
  const [step, setStep] = useState<Step>(0.5);
  const p = useMemo(() => plan({ cardShare, surcharge, protect, step, lean }), [cardShare, surcharge, protect, step, lean]);
  const covered = p.target > 0 ? Math.min(999, (p.recovered / p.target) * 100) : 0;

  const csv = () => {
    const lines = ['item,category,old_price,new_price,change', ...p.rows.map((r) => `"${r.name}",${r.cat},${r.price.toFixed(2)},${r.next.toFixed(2)},${r.delta.toFixed(2)}`)];
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: 'reprice-sample-menu.csv' });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pg">
      <div className="pg-face">
        <div className="pg-plate">
          <span className="pg-brand">Reprice</span>
          <span className="label">Sample menu · 14 items · a café by day, a pub by night</span>
        </div>
        <div className="pg-controls">
          <label className="pg-dial">
            <span className="label label-ink">Sales paid by card</span>
            <output className="num">{cardShare}%</output>
            <input type="range" min={40} max={100} step={1} value={cardShare} onChange={(e) => setCardShare(+e.target.value)} />
          </label>
          <label className="pg-dial">
            <span className="label label-ink">Surcharge you used to add</span>
            <output className="num">{surcharge.toFixed(1)}%</output>
            <input type="range" min={0.5} max={3} step={0.1} value={surcharge} onChange={(e) => setSurcharge(+e.target.value)} />
          </label>
          <div className="pg-toggles">
            <button type="button" className="pg-toggle" aria-pressed={protect} onClick={() => setProtect((v) => !v)}>
              <span className="pg-sw" aria-hidden="true"><i /></span>
              <span>
                <span className="pg-tt">Protect anchor prices</span>
                <span className="label">The flat white, the pint, the parmi</span>
              </span>
            </button>
            <button type="button" className="pg-toggle" aria-pressed={lean} onClick={() => setLean((v) => !v)}>
              <span className="pg-sw" aria-hidden="true"><i /></span>
              <span>
                <span className="pg-tt">Lean on the quiet items</span>
                <span className="label">Bigger moves where fewer people notice</span>
              </span>
            </button>
            <div className="pg-seg" role="radiogroup" aria-label="Round prices to">
              <span className="label label-ink">Round to</span>
              {([0.1, 0.5, 1] as Step[]).map((s) => (
                <button key={s} type="button" role="radio" aria-checked={step === s} onClick={() => setStep(s)}>
                  {s === 1 ? '$1' : s === 0.5 ? '50c' : '10c'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pg-readout" aria-live="polite">
          <div>
            <span className="label">To win back, weekly</span>
            <span className="num">{whole(p.target)}</span>
          </div>
          <div>
            <span className="label">Plan recovers</span>
            <span className="num">{whole(p.recovered)}</span>
          </div>
          <div className="is-flash">
            <span className="label label-ink">Covered</span>
            <span className="num">{Math.round(covered)}%</span>
          </div>
          <div>
            <span className="label">Average rise, {p.moved} items</span>
            <span className="num">{p.avgPct.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <div className="pg-table-wrap">
        <table className="pg-table">
          <caption className="sr-only">New prices for the sample menu</caption>
          <thead>
            <tr>
              <th scope="col">Item</th>
              <th scope="col" className="hide-s">Type</th>
              <th scope="col" className="r">Now</th>
              <th scope="col" className="r">New</th>
              <th scope="col" className="r">Change</th>
              <th scope="col" className="r hide-s">Sold a week</th>
            </tr>
          </thead>
          <tbody>
            {p.rows.map((r) => (
              <tr key={r.name} className={r.locked ? 'is-locked' : r.delta > 0 ? 'is-moved' : ''}>
                <td>
                  {r.name}
                  {r.locked && <span className="pg-anchor">Anchor</span>}
                </td>
                <td className="hide-s label">{r.cat}</td>
                <td className="r mono">{money(r.price)}</td>
                <td className="r mono strong">{money(r.next)}</td>
                <td className="r mono">{r.delta > 0.001 ? `+${money(r.delta)}` : '—'}</td>
                <td className="r mono hide-s">{r.perWeek.toLocaleString('en-AU')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pg-foot">
        <button type="button" className="key is-ink" onClick={csv}>
          Download the price file (CSV)
        </button>
        <p className="label">
          Sample menu and volumes, not advice. Prices move in whole rounding steps, so the plan lands just over the target. Largest single rise: {p.maxPct.toFixed(1)}%. No item rises more than 12%.
        </p>
      </div>
    </div>
  );
}
