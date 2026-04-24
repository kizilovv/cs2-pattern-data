import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import type {
  BlueGemScore,
  BlueGemTier,
  CaseHardenedLookup,
  DopplerPhaseInfo,
  PaintInfo,
  PatternCoverage,
  WeaponInfo,
} from './types.js';

export type {
  BlueGemScore,
  BlueGemTier,
  CaseHardenedLookup,
  DopplerFamily,
  DopplerPhaseInfo,
  PaintInfo,
  PatternCoverage,
  SideCoverage,
  WeaponInfo,
} from './types.js';

const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');

interface CaseHardenedFile {
  version: string;
  data: Record<string, Record<string, Record<string, PatternCoverage>>>;
}

interface DopplerFile {
  version: string;
  byPaintIndex: Record<string, DopplerPhaseInfo>;
}

interface WeaponsFile {
  version: string;
  byDefIndex: Record<string, WeaponInfo>;
  byPaintIndex: Record<string, PaintInfo>;
}

let _caseHardened: CaseHardenedFile | null = null;
let _dopplers: DopplerFile | null = null;
let _weapons: WeaponsFile | null = null;

function loadCaseHardened(): CaseHardenedFile {
  if (!_caseHardened) {
    _caseHardened = JSON.parse(readFileSync(join(DATA_DIR, 'case-hardened.json'), 'utf-8'));
  }
  return _caseHardened!;
}

function loadDopplers(): DopplerFile {
  if (!_dopplers) {
    _dopplers = JSON.parse(readFileSync(join(DATA_DIR, 'doppler-phases.json'), 'utf-8'));
  }
  return _dopplers!;
}

function loadWeapons(): WeaponsFile {
  if (!_weapons) {
    _weapons = JSON.parse(readFileSync(join(DATA_DIR, 'weapons.json'), 'utf-8'));
  }
  return _weapons!;
}

// ============================================================
// CASE HARDENED / BLUE GEM
// ============================================================

/**
 * Look up per-seed blue/purple/gold coverage for Case Hardened & Heat Treated skins.
 *
 * Returns `null` when the (defIndex, paintIndex, paintSeed) triple isn't
 * in the dataset — either the skin isn't a Case Hardened / Heat Treated
 * finish, or the seed is beyond the covered range.
 *
 * @example
 *   // AK-47 Case Hardened pattern 661 (well-known "Scar")
 *   const coverage = lookupCaseHardened({ defIndex: 7, paintIndex: 44, paintSeed: 661 });
 *   // → { playside: { blue: …, gold: …, … }, backside: { … } }
 */
export function lookupCaseHardened({ defIndex, paintIndex, paintSeed }: CaseHardenedLookup): PatternCoverage | null {
  const db = loadCaseHardened();
  return db.data[String(defIndex)]?.[String(paintIndex)]?.[String(paintSeed)] ?? null;
}

/**
 * Score a Case Hardened pattern on a rough 5-tier scale (S/A/B/C/D).
 *
 * Tiering is coverage-based: average blue % across both sides, with a bump
 * when the skin is double-sided (high blue on both playside and backside).
 * Communities disagree on exact tiers — treat this as a starting bucket.
 */
export function scoreCaseHardened(coverage: PatternCoverage): BlueGemScore {
  const psBlue = coverage.playside?.blue ?? 0;
  const bsBlue = coverage.backside?.blue ?? 0;
  const avg = (psBlue + bsBlue) / 2;
  const doubleSided = psBlue >= 15 && bsBlue >= 15;

  let tier: BlueGemTier;
  if (doubleSided && avg >= 20) tier = 'S';
  else if (avg >= 20) tier = 'A';
  else if (avg >= 15) tier = 'B';
  else if (avg >= 10) tier = 'C';
  else tier = 'D';

  return { tier, averageBlue: Number(avg.toFixed(2)), doubleSided };
}

/**
 * Returns every `paintSeed` whose average blue % on both sides meets the threshold.
 * Use to pre-build watchlists / alerts for specific skins.
 */
export function findHighBlueSeeds(
  defIndex: number,
  paintIndex: number,
  opts: { minAverageBlue?: number; requireDoubleSided?: boolean } = {},
): Array<{ paintSeed: number; averageBlue: number; doubleSided: boolean }> {
  const { minAverageBlue = 15, requireDoubleSided = false } = opts;
  const db = loadCaseHardened();
  const seeds = db.data[String(defIndex)]?.[String(paintIndex)];
  if (!seeds) return [];

  const out: Array<{ paintSeed: number; averageBlue: number; doubleSided: boolean }> = [];
  for (const [seed, coverage] of Object.entries(seeds)) {
    const { averageBlue, doubleSided } = scoreCaseHardened(coverage);
    if (averageBlue < minAverageBlue) continue;
    if (requireDoubleSided && !doubleSided) continue;
    out.push({ paintSeed: Number(seed), averageBlue, doubleSided });
  }
  out.sort((a, b) => b.averageBlue - a.averageBlue);
  return out;
}

/**
 * Returns the list of `(defIndex, paintIndex)` pairs covered by the dataset.
 */
export function listCaseHardenedSkins(): Array<{ defIndex: number; paintIndex: number; seedCount: number }> {
  const db = loadCaseHardened();
  const out: Array<{ defIndex: number; paintIndex: number; seedCount: number }> = [];
  for (const [defIndex, paints] of Object.entries(db.data)) {
    for (const [paintIndex, seeds] of Object.entries(paints)) {
      out.push({
        defIndex: Number(defIndex),
        paintIndex: Number(paintIndex),
        seedCount: Object.keys(seeds).length,
      });
    }
  }
  return out;
}

// ============================================================
// DOPPLER / GAMMA DOPPLER
// ============================================================

/**
 * Resolve a paintIndex into a Doppler / Gamma Doppler phase.
 * Returns `null` when the paintIndex is not a Doppler finish.
 */
export function lookupDopplerPhase(paintIndex: number): DopplerPhaseInfo | null {
  return loadDopplers().byPaintIndex[String(paintIndex)] ?? null;
}

export function isDoppler(paintIndex: number): boolean {
  return lookupDopplerPhase(paintIndex) !== null;
}

/**
 * All known Doppler paintIndexes in the dataset.
 */
export function listDopplerPhases(): Array<{ paintIndex: number } & DopplerPhaseInfo> {
  const db = loadDopplers();
  return Object.entries(db.byPaintIndex).map(([paintIndex, info]) => ({
    paintIndex: Number(paintIndex),
    ...info,
  }));
}

// ============================================================
// WEAPON / PAINT NAMES
// ============================================================

export function weaponName(defIndex: number): WeaponInfo | null {
  return loadWeapons().byDefIndex[String(defIndex)] ?? null;
}

export function paintName(paintIndex: number): PaintInfo | null {
  return loadWeapons().byPaintIndex[String(paintIndex)] ?? null;
}

/**
 * True for paintIndexes that are part of the Case Hardened family
 * (Case Hardened 44, Heat Treated 831 / 1054).
 */
export function isCaseHardened(paintIndex: number): boolean {
  return paintName(paintIndex)?.family === 'case-hardened';
}
