import type { Allocation, Position } from '@/types';

export function getAllocationEffectiveEndDate(
  allocation: Allocation,
  position?: Position | null,
): string | null {
  return allocation.endDate ?? position?.endDate ?? null;
}

/**
 * Considers an allocation active if its effective end date (allocation.endDate OR position.endDate)
 * is today or in the future.
 */
export function isAllocationActive(
  allocation: Allocation,
  options?: { position?: Position | null; at?: Date },
): boolean {
  const at = options?.at ?? new Date();
  const endDate = getAllocationEffectiveEndDate(allocation, options?.position);
  if (!endDate) return false;
  return new Date(endDate) >= at;
}
