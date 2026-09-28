import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { MemberMeta, PackManifest, RecordedRun, type Member, type Pack } from './schema.ts';

/** Split a markdown file into YAML frontmatter and body. */
export function splitFrontmatter(src: string): { data: unknown; body: string } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(src);
  if (!m) return { data: {}, body: src.trim() };
  return { data: parse(m[1]!), body: m[2]!.trim() };
}

function fail(file: string, err: unknown): never {
  throw new Error(`Invalid pack file ${file}: ${err instanceof Error ? err.message : String(err)}`);
}

/**
 * Load and validate a pack directory. Every file is checked against its schema,
 * and cross-references (default members, run takes) must resolve. A pack that
 * loads here is a pack a stranger can edit safely.
 */
export function loadPack(dir: string): Pack {
  const manifestFile = join(dir, 'pack.yaml');
  const manifest = (() => {
    try {
      return PackManifest.parse(parse(readFileSync(manifestFile, 'utf8')));
    } catch (e) {
      fail(manifestFile, e);
    }
  })();

  const membersDir = join(dir, 'members');
  const members: Member[] = readdirSync(membersDir)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map((f) => {
      const file = join(membersDir, f);
      const { data, body } = splitFrontmatter(readFileSync(file, 'utf8'));
      try {
        const meta = MemberMeta.parse(data);
        if (`${meta.id}.md` !== f) throw new Error(`id "${meta.id}" does not match file name`);
        return { ...meta, brief: body };
      } catch (e) {
        fail(file, e);
      }
    });
  const ids = new Set(members.map((m) => m.id));

  for (const id of manifest.default_members) {
    if (!ids.has(id)) fail(manifestFile, new Error(`default member "${id}" has no file`));
  }
  if (manifest.default_members.length !== manifest.seats) {
    fail(manifestFile, new Error(`default_members must fill exactly ${manifest.seats} seats`));
  }

  const chairFile = join(dir, 'chair.md');
  const chair = splitFrontmatter(readFileSync(chairFile, 'utf8')).body;

  const runsDir = join(dir, 'runs');
  const runs = existsSync(runsDir)
    ? readdirSync(runsDir)
        .filter((f) => f.endsWith('.yaml'))
        .sort()
        .map((f) => {
          const file = join(runsDir, f);
          try {
            const run = RecordedRun.parse(parse(readFileSync(file, 'utf8')));
            for (const id of Object.keys(run.takes)) {
              if (!ids.has(id)) throw new Error(`take from unknown member "${id}"`);
            }
            for (const id of ids) {
              if (!run.takes[id]) throw new Error(`missing take for member "${id}"`);
            }
            return run;
          } catch (e) {
            fail(file, e);
          }
        })
    : [];

  return { manifest, members, chair, runs };
}
