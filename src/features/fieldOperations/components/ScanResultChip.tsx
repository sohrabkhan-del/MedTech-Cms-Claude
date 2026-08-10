import { Chip } from '@mui/material'
import { SCAN_RESULT_CONFIG } from '@/features/fieldOperations/scanResultConfig'
import type { ScanStatus } from '@/types/scanFeed'

export function ScanResultChip({ status, label }: { status: ScanStatus; label: string }) {
  const config = SCAN_RESULT_CONFIG[status]
  return <Chip label={label || config.label} size="small" color={config.color} variant="filled" />
}
