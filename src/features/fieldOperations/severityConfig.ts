import type { AlertSeverity } from '@/features/fieldOperations/types/fieldOperations.types'

export const SEVERITY_CONFIG: Record<AlertSeverity, { label: string; color: 'error' | 'warning' | 'info' }> = {
  high: { label: 'High', color: 'error' },
  medium: { label: 'Medium', color: 'warning' },
  low: { label: 'Low', color: 'info' },
}
