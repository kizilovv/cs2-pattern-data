import {
  lookupCaseHardened,
  scoreCaseHardened,
  findHighBlueSeeds,
  lookupDopplerPhase,
  isDoppler,
  weaponName,
} from '../src/index.js';

// AK-47 Case Hardened seed 661 — the famous "Scar" pattern (#1 blue gem in the game)
const coverage = lookupCaseHardened({ defIndex: 7, paintIndex: 44, paintSeed: 661 });
if (coverage) {
  const score = scoreCaseHardened(coverage);
  console.log(`AK-47 CH #661 — tier ${score.tier} (avg blue ${score.averageBlue}%, double-sided: ${score.doubleSided})`);
  console.log('  playside:', coverage.playside);
  console.log('  backside:', coverage.backside);
}

// Top Karambit Case Hardened seeds
console.log('\nTop 5 Karambit Case Hardened seeds by blue %:');
const top = findHighBlueSeeds(506, 44, { minAverageBlue: 20, requireDoubleSided: true }).slice(0, 5);
for (const s of top) {
  console.log(`  seed ${s.paintSeed.toString().padStart(3)} — ${s.averageBlue}% (double-sided: ${s.doubleSided})`);
}

// Doppler phase lookup
const phase = lookupDopplerPhase(415);
console.log(`\npaintIndex 415 → ${phase?.phase} (${phase?.family})`); // Ruby (doppler)
console.log(`isDoppler(415): ${isDoppler(415)}, isDoppler(44): ${isDoppler(44)}`);

// Weapon metadata
console.log(`\ndefIndex 7: ${weaponName(7)?.name}`);
console.log(`defIndex 506: ${weaponName(506)?.name}`);
