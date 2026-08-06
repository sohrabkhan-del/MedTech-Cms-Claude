import { Chip } from '@mui/material'

export type BadgeStatus =
  | 'active'
  | 'pending'
  | 'inactive'
  | 'suspended'
  | 'approved'
  | 'rejected'
  | 're_rejected'
  | 'pending_approval'
  | 'expired'
  | 'upcoming'

const statusConfig: Record<BadgeStatus, { label: string; color: 'success' | 'warning' | 'error' | 'info' | 'default' }> = {
  active: { label: 'Active', color: 'success' },
  approved: { label: 'Approved', color: 'success' },
  pending: { label: 'Pending', color: 'warning' },
  pending_approval: { label: 'Pending Approval', color: 'warning' },
  upcoming: { label: 'Upcoming', color: 'info' },
  inactive: { label: 'Inactive', color: 'error' },
  suspended: { label: 'Suspended', color: 'default' },
  rejected: { label: 'Rejected', color: 'error' },
  re_rejected: { label: 'Re-Rejected', color: 'error' },
  expired: { label: 'Expired', color: 'error' },
}

interface StatusBadgeProps {
  status: BadgeStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <Chip
      label={config.label}
      color={config.color}
      variant="filled"
      size="small"
      icon={
        <svg width="6" height="6" viewBox="0 0 6 6" style={{ marginLeft: 8 }}>
          <circle cx="3" cy="3" r="3" fill="currentColor" />
        </svg>
      }
    />
  )
}
