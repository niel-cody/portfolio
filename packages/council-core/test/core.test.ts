import { describe, expect, it } from 'vitest';
import { resolve } from 'node:path';
import { loadPack } from '../src/pack.ts';
import { decide } from '../src/verdict.ts';
import { redact } from '../src/run.ts';
import { toMarkdown } from '../src/record.ts';
import type { Take } from '../src/schema.ts';

const packDir = resolve(__dirname, '../../../content/council-packs/hospitality');
const t = (stance: Take['stance'], confidence: number): Take => ({
  stance, confidence, headline: 'h', take: 't', breaks_at: 'b', would_need: 'w',
});

describe('the hospitality pack', () => {
  const pack = loadPack(packDir);

  it('validates and has six members and three runs', () => {
    expect(pack.members).toHaveLength(6);
    expect(pack.runs).toHaveLength(3);
    expect(pack.manifest.default_members).toHaveLength(pack.manifest.seats);
  });

  it('has a take from every member in every run', () => {
    for (const run of pack.runs) {
      for (const m of pack.members) expect(run.takes[m.id]).toBeDefined();
    }
  });

  it('keeps every take short enough to read on a phone', () => {
    for (const run of pack.runs) {
      for (const take of Object.values(run.takes)) expect(take.take.split(/\s+/).length).toBeLessThanOrEqual(80);
    }
  });

  it('lets the verdict move when the visitor changes the panel', () => {
    const ids = pack.members.map((m) => m.id);
    const panels: string[][] = [];
    const pick = (start: number, acc: string[]) => {
      if (acc.length === pack.manifest.seats) return void panels.push(acc);
      for (let i = start; i < ids.length; i++) pick(i + 1, [...acc, ids[i]!]);
    };
    pick(0, []);
    for (const run of pack.runs) {
      const verdicts = new Set(panels.map((p) => decide(p.map((id) => run.takes[id]!)).verdict));
      expect(verdicts.size, run.id).toBeGreaterThan(1);
    }
  });
});

describe('decide', () => {
  it('fails on a majority of fails', () => {
    expect(decide([t('fail', 60), t('fail', 60), t('fail', 50), t('pass', 90)]).verdict).toBe('fail');
  });
  it('fails when half the panel fails it and one objection is strong', () => {
    expect(decide([t('fail', 76), t('fail', 50), t('conditional', 60), t('pass', 60)]).verdict).toBe('fail');
    expect(decide([t('fail', 60), t('fail', 50), t('conditional', 60), t('pass', 60)]).verdict).toBe('conditional');
  });
  it('passes only with a majority of passes and no fails', () => {
    expect(decide([t('pass', 80), t('pass', 70), t('pass', 60), t('conditional', 50)]).verdict).toBe('pass');
    expect(decide([t('pass', 80), t('pass', 70), t('pass', 60), t('fail', 40)]).verdict).toBe('conditional');
  });
  it('never lets a strong objection be averaged away', () => {
    const r = decide([t('pass', 90), t('pass', 90), t('pass', 90), t('fail', 75)]);
    expect(r.verdict).toBe('conditional');
    expect(r.dissenters).toHaveLength(4);
  });
  it('lowers confidence for every dissenter', () => {
    const unanimous = decide([t('conditional', 60), t('conditional', 60)]);
    const split = decide([t('conditional', 60), t('fail', 60), t('pass', 60), t('conditional', 60)]);
    expect(split.confidence).toBeLessThan(unanimous.confidence);
  });
});

describe('redact', () => {
  it('masks emails, card numbers and phone numbers', () => {
    const out = redact('Call 0412 345 678 or jo@venue.com.au, card 4111 1111 1111 1111');
    expect(out).not.toMatch(/0412|jo@|4111/);
  });
});

describe('toMarkdown', () => {
  it('writes a record with a verdict and kill signals', () => {
    const md = toMarkdown({
      title: 'X', decision: 'D', verdict: 'conditional', confidence: 55, summary: 'S', dissent: 'None',
      panel: [], kill_signals: ['k1', 'k2', 'k3'], assumptions: ['a'], questions: ['q'], date: '2026-09-28',
    });
    expect(md).toContain('CONDITIONAL');
    expect(md).toContain('## Kill signals');
  });
});
