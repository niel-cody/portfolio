# nielcody.com

The portfolio of Niel Cody, product leader in hospitality software. Work written as decision records, playgrounds you can use, and writing on what breaks when the room is full.

**A Braun calculator that has just had its comeback.** Paper, ink, one grey, and exactly one flash of colour per page.

## Layout

```
apps/site                       Astro site. Static HTML, React islands only where something moves
packages/council-core           The Council engine: pack loader, verdict rules, live runner, CLI, eval
content/council-packs/          Domain packs: personas, chair brief, scenario and recorded runs
```

One repository on purpose. The Council splits out only when someone needs to install it on its own.

## Run the site

```bash
cd apps/site
npm install
npm run dev        # http://localhost:4321
npm run build      # share cards, then a static build in dist/
```

Press `G` on any page to see the 12-column grid.

## Run the Council locally, with your own key

```bash
cd packages/council-core
npm install
export ANTHROPIC_API_KEY=sk-ant-...
npx tsx src/cli.ts --members mara,priya,keith,sam "Launch a $15 bottomless brunch on Sundays"
```

- Four members answer in parallel on Claude Haiku 4.5 (600 output tokens each). A chair on Claude Sonnet 5 writes the decision record (1,200 output tokens).
- The decision is capped at about 1,000 words. Obvious emails, phone and card numbers are masked before anything is sent.
- One retry per member. A second failure drops that member and the chair is told.

Keep it honest before you trust a new pack:

```bash
npm test            # pack schema, verdict rules, redaction, record format
npx tsx src/eval.ts # 20 deliberately bad ideas. The panel must hold back at least 18
```

## Write a pack

A pack is a folder of plain files, validated against a schema at build time.

```
pack.yaml            id, name, seats, default members, the scenario, the rules
chair.md             how the chair writes the record
members/<id>.md      frontmatter (role, venue, cares_about, blind_spot, voice) and a short brief
runs/<nn-id>.yaml    optional recorded runs: one take per member, chair summaries per verdict
```

The hospitality pack is generic and written for this site. Its personas are composites, not real people, and nothing in it comes from any employer.

## Deploy

Vercel, with the project root set to `apps/site`. The site is fully static today. Live Council runs need an Astro server endpoint with the token, concurrency and daily-spend caps described in the build log. They are not switched on yet.

## Licence

MIT. See [LICENSE](LICENSE).
