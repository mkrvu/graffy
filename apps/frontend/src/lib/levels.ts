// Накопительный XP по уровням (источник: таблица уровней).
// Прирост между уровнями растёт на 195, начиная с 3-го уровня.
export const LEVEL_THRESHOLDS = [
  0,      // Level 0
  100,    // Level 1
  150,    // Level 2
  395,    // Level 3
  835,    // Level 4
  1470,   // Level 5
  2300,   // Level 6
  3325,   // Level 7
  4545,   // Level 8
  5960,   // Level 9
  7570,   // Level 10
  9375,   // Level 11
  11375,  // Level 12
  13570,  // Level 13
  15960,  // Level 14
  18545,  // Level 15
  21325,  // Level 16
  24300,  // Level 17
  27470,  // Level 18
  30835,  // Level 19
  34395,  // Level 20
]

export function getLevelFromXP(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i
  }
  return 0
}

export function getXPForLevel(level: number): number {
  return LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
}

export function getLevelProgress(xp: number): {
  currentLevel: number
  currentLevelXP: number
  xpNeeded: number
  nextLevelXP: number
  progressPercent: number
} {
  const currentLevel = getLevelFromXP(xp)
  const currentLevelXP = LEVEL_THRESHOLDS[currentLevel] ?? 0
  const nextLevelXP = LEVEL_THRESHOLDS[currentLevel + 1] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
  const xpNeeded = nextLevelXP - currentLevelXP
  const xpInCurrentLevel = xp - currentLevelXP
  const progressPercent = currentLevel >= LEVEL_THRESHOLDS.length - 1 ? 100 : Math.min(100, Math.round((xpInCurrentLevel / xpNeeded) * 100))

  return { currentLevel, currentLevelXP, xpNeeded, nextLevelXP, progressPercent }
}

export const MAX_LEVEL = LEVEL_THRESHOLDS.length - 1
