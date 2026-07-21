import type { ScanResult } from '@/features/fieldOperations/types/fieldOperations.types'

export const SCAN_RESULT_CONFIG: Record<ScanResult, { label: string; color: 'success' | 'error' }> = {
  success: { label: 'Success', color: 'success' },
  failed_outside_geofence: { label: 'Outside Geo-fence', color: 'error' },
  failed_duplicate_scan: { label: 'Duplicate Scan', color: 'error' },
  failed_invalid_code: { label: 'Invalid Code', color: 'error' },
}
