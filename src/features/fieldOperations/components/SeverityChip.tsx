import { Chip } from '@mui/material'
import { SEVERITY_CONFIG } from '@/features/fieldOperations/severityConfig'
import type { AlertSeverity } from '@/features/fieldOperations/types/fieldOperations.types'

export function SeverityChip({ severity }: { severity: AlertSeverity }) {
  const config = SEVERITY_CONFIG[severity]
  return <Chip label={config.label} size="small" color={config.color} variant="filled" />
}
