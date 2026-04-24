#!/usr/bin/env node
/**
 * Normalize raw bluegem.json into the cs2-pattern-data schema.
 *
 * Input:  --in  path to upstream bluegem.json
 *                { [defIndex]: { [paintIndex]: { [paintSeed]: { playside_blue, ..., backside_contour_purple } } } }
 *
 * Output: --out path to normalized case-hardened.json
 *                { data: { [defIndex]: { [paintIndex]: { [paintSeed]: { playside: {...}, backside: {...} } } } }, ... }
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: {
    in: { type: 'string' },
    out: { type: 'string' },
  },
});

if (!values.in || !values.out) {
  console.error('Usage: normalize.mjs --in <bluegem.json> --out <case-hardened.json>');
  process.exit(1);
}

const raw = JSON.parse(readFileSync(values.in, 'utf-8'));

const defCount = Object.keys(raw).length;
let paintCount = 0;
let seedCount = 0;

const out = {};
for (const [defIndex, paints] of Object.entries(raw)) {
  out[defIndex] = {};
  for (const [paintIndex, seeds] of Object.entries(paints)) {
    paintCount += 1;
    out[defIndex][paintIndex] = {};
    for (const [paintSeed, s] of Object.entries(seeds)) {
      seedCount += 1;
      out[defIndex][paintIndex][paintSeed] = {
        playside: {
          blue: s.playside_blue ?? null,
          purple: s.playside_purple ?? null,
          gold: s.playside_gold ?? null,
          contourBlue: s.playside_contour_blue ?? null,
          contourPurple: s.playside_contour_purple ?? null,
        },
        backside: {
          blue: s.backside_blue ?? null,
          purple: s.backside_purple ?? null,
          gold: s.backside_gold ?? null,
          contourBlue: s.backside_contour_blue ?? null,
          contourPurple: s.backside_contour_purple ?? null,
        },
      };
    }
  }
}

const payload = {
  $schema: 'https://github.com/kizilovv/cs2-pattern-data/blob/main/schema/case-hardened.schema.json',
  version: '1.0.0',
  description: 'Normalized per-paint-seed blue/purple/gold coverage for Case Hardened & Heat Treated CS2 skins.',
  stats: {
    defIndexCount: defCount,
    defPaintCombos: paintCount,
    totalSeeds: seedCount,
  },
  data: out,
};

writeFileSync(values.out, JSON.stringify(payload));
console.log(`Wrote ${values.out}: ${defCount} defs, ${paintCount} def/paint combos, ${seedCount} seeds`);
