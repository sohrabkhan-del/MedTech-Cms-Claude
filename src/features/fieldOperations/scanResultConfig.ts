import type { ScanStatus } from '@/types/scanFeed'

export const SCAN_RESULT_CONFIG: Record<ScanStatus, { label: string; color: 'success' | 'error' }> = {
  success: { label: 'Success', color: 'success' },
  failed: { label: 'Failed', color: 'error' },
}
