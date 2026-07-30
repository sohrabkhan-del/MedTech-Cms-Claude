import { Outlet, useParams } from 'react-router-dom'
import { Alert, Box, CircularProgress, Stack } from '@mui/material'
import { useResolveInviteTokenQuery } from '@/features/partnerInvite/services/partnerInviteApi'
import { PartnerInviteProvider } from '@/features/partnerInvite/PartnerInviteContext'

export function PartnerInviteGate() {
  const { token } = useParams<{ token: string }>()
  const { data, isLoading, isError } = useResolveInviteTokenQuery(token)

  const status: 'loading' | 'ready' | 'invalid' = isLoading ? 'loading' : isError ? 'invalid' : 'ready'
  const inviteType = data?.inviteType ?? 'Dealer'
  const invitee = data?.invitee ?? null

  if (status === 'loading') {
    return (
      <Stack sx={{ alignItems: 'center', justifyContent: 'center', minHeight: 240 }}>
        <CircularProgress size={28} />
      </Stack>
    )
  }

  if (status === 'invalid') {
    return (
      <Box sx={{ maxWidth: 480, mx: 'auto' }}>
        <Alert severity="error">This invite link is invalid or has expired. Please contact your regional MR for a new invite.</Alert>
      </Box>
    )
  }

  return (
    <PartnerInviteProvider token={token!} inviteType={inviteType} invitee={invitee}>
      <Outlet />
    </PartnerInviteProvider>
  )
}
