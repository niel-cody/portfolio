import type { Flash } from '../layouts/Base.astro';

export interface Playground {
  slug: string;
  number: string;
  title: string;
  glyph: string;
  era: string;
  colour: Flash;
  line: string;
  status: string;
  kind: 'Recorded runs' | 'Fixture data' | 'Live';
  spec: [string, string][];
}

export const playgrounds: Playground[] = [
  {
    slug: 'council',
    number: '01',
    title: 'The Council',
    glyph: 'C',
    era: 'Era 01 — Acid',
    colour: 'acid',
    line: 'Put a decision in front of four hospitality operators and a chair. Get a verdict you can forward.',
    status: 'Recorded runs',
    kind: 'Recorded runs',
    spec: [
      ['What it does', 'Independent answers from a panel, then a chair writes the decision record'],
      ['Borrowed from', 'STORM, Karpathy’s LLM Council, and a decade of decision records'],
      ['Adds', 'A verdict, a confidence, kill signals and a human sign-off'],
      ['Stack', 'Astro, React, Claude Haiku 4.5 members, Claude Sonnet 5 chair'],
      ['Shipped', 'September 2026'],
    ],
  },
  {
    slug: 'reprice',
    number: '02',
    title: 'Reprice',
    glyph: 'R',
    era: 'Era 02 — Bubblegum',
    colour: 'bubblegum',
    line: 'Card surcharges come off the bill. Win the margin back without touching the prices regulars remember.',
    status: 'Fixture data',
    kind: 'Fixture data',
    spec: [
      ['What it does', 'Reprices a sample menu to recover a margin target'],
      ['The rule', 'Anchor prices stay put. Everything else rounds like a real menu'],
      ['Output', 'A price file you could load into any point of sale'],
      ['Stack', 'One React island, no model calls, no server'],
      ['Shipped', 'September 2026'],
    ],
  },
  {
    slug: 'readout',
    number: '03',
    title: 'Readout',
    glyph: 'R/',
    era: 'Era 03 — Cobalt',
    colour: 'cobalt',
    line: 'A feature is not done when it ships. It is done when someone says whether it worked.',
    status: 'Fixture data',
    kind: 'Fixture data',
    spec: [
      ['What it does', 'Checks a product bet for a metric, a target, a date and a kill signal'],
      ['Then', 'Keeps the ledger: kept, killed or inconclusive'],
      ['Why', 'Almost nobody checks whether the feature worked'],
      ['Stack', 'One React island, rules not a model, runs in the browser'],
      ['Shipped', 'September 2026'],
    ],
  },
];
