import { Chip } from '@mui/material'

export function UserStatusChip({ status }: { status: 'active' | 'inactive' }) {
  return <Chip label={status === 'active' ? 'Active' : 'Inactive'} size="small" color={status === 'active' ? 'success' : 'error'} variant="filled" />
}
