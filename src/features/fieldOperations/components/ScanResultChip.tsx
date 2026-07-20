import { Chip } from '@mui/material'
import { SCAN_RESULT_CONFIG } from '@/features/fieldOperations/scanResultConfig'
import type { ScanResult } from '@/features/fieldOperations/types/fieldOperations.types'

export function ScanResultChip({ result }: { result: ScanResult }) {
  const config = SCAN_RESULT_CONFIG[result]
  return <Chip label={config.label} size="small" color={config.color} variant="filled" />
}
