export interface TierInfo {
  tier: string;
  min: number;
  max: number;
  next: string | null;
}

export const TIER_SEQUENCE: TierInfo[] = [
  { tier: 'Bronze', min: 0, max: 999, next: 'Silver' },
  { tier: 'Silver', min: 1000, max: 2999, next: 'Gold' },
  { tier: 'Gold', min: 3000, max: 9999, next: 'Platinum' },
  { tier: 'Platinum', min: 10000, max: Infinity, next: null },
];

export function getTier(points: number): string {
  for (const t of TIER_SEQUENCE) {
    if (points >= t.min && points <= t.max) return t.tier;
  }
  return 'Bronze';
}

export function getProgress(points: number) {
  const currentTier = getTier(points);
  const info = TIER_SEQUENCE.find(t => t.tier === currentTier)!;
  let nextTierPoints = 0;
  let pointsToNextTier = 0;
  if (info.next) {
    const next = TIER_SEQUENCE.find(t => t.tier === info.next)!;
    nextTierPoints = next.min;
    pointsToNextTier = Math.max(0, next.min - points);
  }
  return { currentTier, nextTier: info.next, nextTierPoints, pointsToNextTier };
}

export function evaluateTierChange(oldTier: string | undefined, newPoints: number) {
  const newTier = getTier(newPoints);
  const changed = oldTier !== newTier;
  return { newTier, changed };
}
