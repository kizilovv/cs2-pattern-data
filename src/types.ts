export interface SideCoverage {
  /** Blue colour % on this side of the skin. */
  blue: number | null;
  /** Purple colour %. */
  purple: number | null;
  /** Gold colour %. */
  gold: number | null;
  /** Contour blue count in pixels. */
  contourBlue: number | null;
  /** Contour purple count in pixels. */
  contourPurple: number | null;
}

export interface PatternCoverage {
  playside: SideCoverage;
  backside: SideCoverage;
}

export interface CaseHardenedLookup {
  defIndex: number;
  paintIndex: number;
  paintSeed: number;
}

export type DopplerFamily = 'doppler' | 'gamma-doppler';

export interface DopplerPhaseInfo {
  phase: string;
  family: DopplerFamily;
  isGamma: boolean;
}

export interface WeaponInfo {
  name: string;
  category: 'pistol' | 'rifle' | 'smg' | 'knife' | 'gloves' | 'other';
}

export interface PaintInfo {
  name: string;
  family: 'case-hardened' | 'doppler' | 'gamma-doppler' | 'other';
}

/**
 * A rough, coverage-based tier for Case Hardened blue-gem hunting.
 * Not an official authority — trading communities disagree on exact tiers.
 * This gives you a quick bucket that you can override per skin.
 */
export type BlueGemTier = 'S' | 'A' | 'B' | 'C' | 'D';

export interface BlueGemScore {
  tier: BlueGemTier;
  /** Average blue % across playside + backside. */
  averageBlue: number;
  /** Whether the skin has high blue on BOTH sides (the key tier-up criterion). */
  doubleSided: boolean;
}
