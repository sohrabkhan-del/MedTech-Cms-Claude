import type { ScanResult } from '@/features/fieldOperations/types/fieldOperations.types'

export const SCAN_RESULT_CONFIG: Record<ScanResult, { label: string; color: 'success' | 'error' }> = {
  success: { label: 'Success', color: 'success' },
  failed_outside_geofence: { label: 'Outside Geo-fence', color: 'error' },
  failed_duplicate_barcode: { label: 'Duplicate Barcode', color: 'error' },
  failed_invalid_barcode: { label: 'Invalid Barcode', color: 'error' },
  failed_expired_package: { label: 'Expired Package', color: 'error' },
  failed_already_redeemed: { label: 'Already Redeemed', color: 'error' },
}
