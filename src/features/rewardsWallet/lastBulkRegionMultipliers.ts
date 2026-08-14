/**
 * Tracks the most recently saved global region multiplier per region/partner
 * type, from POST /region-multipliers/bulk. There is no GET endpoint that
 * returns "the current global multiplier" directly, so the Reset action on a
 * product's region-multiplier override uses whatever was last saved here
 * (falling back to 1x if nothing has been saved this session).
 */

type PartnerType = 'dealer' | 'chemist'

const lastSaved = new Map<string, number>()

function key(regionId: string, partnerType: PartnerType): string {
  return `${regionId}:${partnerType}`
}

export function recordBulkRegionMultiplier(
  regionId: string,
  partnerType: PartnerType,
  multiplier: number,
): void {
  lastSaved.set(key(regionId, partnerType), multiplier)
}

export function getLastGlobalRegionMultiplier(
  regionId: string,
  partnerType: PartnerType,
): number {
  return lastSaved.get(key(regionId, partnerType)) ?? 1
}
