// Build-time share cards, one per page, in the site's own type and era colours.
// Photocards for LinkedIn: paper, ink, and the page's one flash.
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import sharp from 'sharp';
import { parse } from 'yaml';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const out = join(root, 'public', 'cards');
mkdirSync(out, { recursive: true });

const font = (f) => readFileSync(join(here, 'fonts', f));
const fonts = [
  { name: 'Display', data: font('archivo-expanded-900.ttf'), weight: 900, style: 'normal' },
  { name: 'Text', data: font('archivo-500.ttf'), weight: 500, style: 'normal' },
  { name: 'Mono', data: font('dm-mono-400.ttf'), weight: 400, style: 'normal' },
];

const C = {
  paper: '#F1EFEA', ink: '#141414', grey: '#6A6964',
  orange: '#FF5B14', acid: '#C9F23A', cobalt: '#2340FF', bubblegum: '#FF7EC7', butter: '#FFD23F',
};

const h = (type, style, children) => ({ type, props: { style: { display: 'flex', ...style }, children } });

function card({ kicker, title, line, flash, mark }) {
  const fill = C[flash];
  const onFill = flash === 'cobalt' ? C.paper : C.ink;
  const size = title.length > 34 ? 70 : title.length > 20 ? 84 : 112;
  return h('div', { width: 1200, height: 630, display: 'flex', flexDirection: 'column', background: C.paper, padding: 56, fontFamily: 'Text', color: C.ink, position: 'relative' }, [
    h('div', { display: 'flex', justifyContent: 'space-between', fontFamily: 'Mono', fontSize: 20, letterSpacing: 2, textTransform: 'uppercase', paddingBottom: 18, borderBottom: `2px solid ${C.ink}` }, [
      h('div', { display: 'flex', alignItems: 'center' }, [
        h('div', { width: 18, height: 18, background: fill, border: `2px solid ${C.ink}`, marginRight: 14 }, []),
        'Niel Cody',
      ]),
      h('div', { display: 'flex', color: C.grey }, kicker),
    ]),
    h('div', { display: 'flex', flexGrow: 1, alignItems: 'center', paddingRight: 260 }, [
      h('div', { display: 'flex', fontFamily: 'Display', fontSize: size, lineHeight: 0.92, letterSpacing: -3 }, title),
    ]),
    h('div', { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }, [
      h('div', { display: 'flex', fontSize: 28, lineHeight: 1.3, maxWidth: 760, color: C.ink }, line),
      h('div', { display: 'flex', fontFamily: 'Mono', fontSize: 20, letterSpacing: 2, color: C.grey }, 'NIELCODY.COM'),
    ]),
    h('div', { position: 'absolute', right: 56, top: 130, width: 220, height: 220, borderRadius: 110, background: fill, color: onFill, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Display', fontSize: mark.length > 3 ? 44 : 64, letterSpacing: -2, transform: 'rotate(-12deg)' }, mark),
  ]);
}

function frontmatter(file) {
  const m = /^---\n([\s\S]*?)\n---/.exec(readFileSync(file, 'utf8'));
  return m ? parse(m[1]) : {};
}

const cards = [
  { slug: 'home', kicker: 'Product leader', title: 'Software that holds on a Friday night.', line: 'Eight years on the floor. Now AI, platforms and loyalty.', flash: 'orange', mark: '8pm' },
  { slug: 'work', kicker: 'Work', title: 'Work, written as decision records', line: 'The options, the bet, what happened, and what I will not claim.', flash: 'cobalt', mark: '01' },
  { slug: 'playground', kicker: 'Playground', title: 'Don’t read about it. Play with it.', line: 'The Council, Reprice and Readout.', flash: 'acid', mark: '02' },
  { slug: 'writing', kicker: 'Writing', title: 'What breaks when the room is full', line: 'Essays and field notes on hospitality software.', flash: 'bubblegum', mark: '03' },
  { slug: 'about', kicker: 'About', title: 'Operator first.', line: 'From behind the bar in 2004 to leading product for six POS brands.', flash: 'butter', mark: '04' },
  { slug: 'council', kicker: 'Playground No. 01', title: 'The Council', line: 'Four hospitality operators and a chair. A verdict you can forward.', flash: 'acid', mark: 'C' },
  { slug: 'reprice', kicker: 'Playground No. 02', title: 'Reprice', line: 'Win back the surcharge without touching the prices regulars remember.', flash: 'bubblegum', mark: 'R' },
  { slug: 'readout', kicker: 'Playground No. 03', title: 'Readout', line: 'A feature is done when someone says whether it worked.', flash: 'cobalt', mark: 'R/' },
];

for (const dir of ['work', 'writing']) {
  const base = join(root, 'src', 'content', dir);
  for (const f of readdirSync(base)) {
    const d = frontmatter(join(base, f));
    const slug = f.replace(/\.mdx?$/, '');
    cards.push({
      slug: `${dir}-${slug}`,
      kicker: dir === 'work' ? `Work · ${d.status}` : `Writing · ${d.kind}`,
      title: d.title,
      line: dir === 'work' ? d.kicker : d.dek,
      flash: dir === 'work' ? 'cobalt' : 'bubblegum',
      mark: dir === 'work' ? String(d.headline?.value ?? '') : `${d.minutes}′`,
    });
  }
}

for (const c of cards) {
  const svg = await satori(card(c), { width: 1200, height: 630, fonts });
  writeFileSync(join(out, `${c.slug}.png`), await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer());
}
console.log(`cards: ${cards.length} written to public/cards`);
