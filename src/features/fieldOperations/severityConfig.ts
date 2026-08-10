import type { AlertSeverity, AlertStatus } from '@/features/fieldOperations/types/fieldOperations.types'

export const SEVERITY_CONFIG: Record<AlertSeverity, { label: string; color: 'error' | 'warning' | 'info' }> = {
  high: { label: 'High', color: 'error' },
  medium: { label: 'Medium', color: 'warning' },
  low: { label: 'Low', color: 'info' },
}

export const STATUS_CONFIG: Record<
  AlertStatus,
  { label: string; color: 'error' | 'warning' | 'success' | 'default' }
> = {
  open: { label: 'Open', color: 'error' },
  reviewing: { label: 'Reviewing', color: 'warning' },
  resolved: { label: 'Resolved', color: 'success' },
  dismissed: { label: 'Dismissed', color: 'default' },
}
