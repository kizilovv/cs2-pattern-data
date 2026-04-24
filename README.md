# cs2-pattern-data

Offline, zero-dep pattern data for CS2 skins — **25,004 paint seeds** of Case Hardened & Heat Treated coverage plus full Doppler / Gamma Doppler phase lookup. TypeScript-first, works anywhere Node runs.

```
Dataset coverage
├── Case Hardened (paintIndex 44)   → AK-47, knives, MP9, Dual Berettas …
├── Heat Treated  (paintIndex 831)  → Desert Eagle Heat Treated
├── Heat Treated  (paintIndex 1054) → Desert Eagle Heat Treated (variant)
└── Doppler phases                  → 24 paintIndexes across knives + gloves
```

Every seed has playside / backside **blue / purple / gold %** and **contour blue / contour purple** pixel counts — the numbers community tier lists are built on.

## Why this exists

CS2 trading tools constantly need to answer:

- "Is this AK Case Hardened seed a blue gem?"
- "Is this Karambit Doppler Phase 2 or Phase 3?"
- "Give me the top 20 Karambit CH seeds sorted by blue coverage."

Blue gem data has existed inside [CSFloat's MIT-licensed browser extension](https://github.com/csfloat/extension) for years. This repo **normalises** that dataset into a clean, camelCased, zero-dep library plus ships the Doppler phase mapping and weapon-name lookups as companions. No HTTP calls, no API keys, no rate limits — just `import` and go.

See [NOTICE.md](./NOTICE.md) for upstream attribution.

---

## Install

```bash
npm install cs2-pattern-data
```

## Usage

```ts
import {
  lookupCaseHardened,
  scoreCaseHardened,
  findHighBlueSeeds,
  lookupDopplerPhase,
  weaponName,
} from 'cs2-pattern-data';

// AK-47 Case Hardened seed 661 — famous "Scar"
const coverage = lookupCaseHardened({ defIndex: 7, paintIndex: 44, paintSeed: 661 });
// {
//   playside: { blue, purple, gold, contourBlue, contourPurple },
//   backside: { blue, purple, gold, contourBlue, contourPurple }
// }

const score = scoreCaseHardened(coverage!);
// { tier: 'S' | 'A' | 'B' | 'C' | 'D', averageBlue: 27.3, doubleSided: true }

// Top 5 Karambit CH seeds with blue on both sides
const top = findHighBlueSeeds(506, 44, { minAverageBlue: 20, requireDoubleSided: true }).slice(0, 5);

// Doppler phase → 'Ruby' / 'Phase 2' / 'Emerald' / …
const phase = lookupDopplerPhase(415); // { phase: 'Ruby', family: 'doppler', isGamma: false }

weaponName(7);   // { name: 'AK-47', category: 'rifle' }
weaponName(506); // { name: 'Karambit', category: 'knife' }
```

## API

| Function | Returns |
|---|---|
| `lookupCaseHardened({ defIndex, paintIndex, paintSeed })` | `PatternCoverage \| null` — per-side blue/purple/gold stats |
| `scoreCaseHardened(coverage)` | `{ tier, averageBlue, doubleSided }` — rough S/A/B/C/D bucket |
| `findHighBlueSeeds(defIndex, paintIndex, opts)` | Seeds above a blue-% threshold, sorted |
| `listCaseHardenedSkins()` | All covered `(defIndex, paintIndex)` pairs + seed counts |
| `lookupDopplerPhase(paintIndex)` | `{ phase, family, isGamma } \| null` |
| `isDoppler(paintIndex)` | `boolean` |
| `listDopplerPhases()` | Every Doppler paintIndex with its phase |
| `weaponName(defIndex)` | `{ name, category } \| null` |
| `paintName(paintIndex)` | `{ name, family } \| null` |
| `isCaseHardened(paintIndex)` | `boolean` (Case Hardened 44, Heat Treated 831 / 1054) |

Types are exported — import `BlueGemTier`, `PatternCoverage`, `DopplerPhaseInfo`, etc.

## Raw data access

You don't need the library at all — each JSON file is a published subpath:

```ts
import caseHardened from 'cs2-pattern-data/data/case-hardened.json';
import doppler from 'cs2-pattern-data/data/doppler-phases.json';
import weapons from 'cs2-pattern-data/data/weapons.json';
```

Or download the file directly from the repo if you're not in Node. Licensed for any use under MIT — no attribution required in code, though preserving NOTICE.md for redistribution is appreciated.

## Scoring disclaimer

`scoreCaseHardened` returns a rough 5-tier bucket based on combined blue coverage. **Trading communities disagree** on exact tiers per skin — Buff, Broskins, and CSFloat each publish different tier lists. Treat the score as a fast starting point, not an authority. Override per skin if you want your own tiers.

## What this is NOT

- Not a full CS2 item database — only skins with Case Hardened / Heat Treated / Doppler finishes are covered.
- Not Crimson Web / Acid Fade / Marble Fade data — those weren't in the upstream source. PRs welcome.
- Not Fade % data for Bayonet / Karambit / Talon Fades — same reason as above.
- Not image generation — coverage numbers only. Render your own.

## License

Code: MIT. Data: see [NOTICE.md](./NOTICE.md).
