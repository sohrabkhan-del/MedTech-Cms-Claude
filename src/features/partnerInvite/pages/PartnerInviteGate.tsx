import { useEffect, useState } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import { Alert, Box, CircularProgress, Stack } from '@mui/material'
import { partnerInviteService } from '@/features/partnerInvite/services/partnerInviteService'
import { PartnerInviteProvider } from '@/features/partnerInvite/PartnerInviteContext'
import type { PartnerInviteBasicDetails, PartnerInviteType } from '@/types/partnerInvite'

export function PartnerInviteGate() {
  const { token } = useParams<{ token: string }>()
  const [status, setStatus] = useState<'loading' | 'ready' | 'invalid'>('loading')
  const [inviteType, setInviteType] = useState<PartnerInviteType>('Dealer')
  const [invitee, setInvitee] = useState<PartnerInviteBasicDetails | null>(null)

  useEffect(() => {
    let cancelled = false
    partnerInviteService
      .resolveInviteToken(token)
      .then((info) => {
        if (cancelled) return
        setInviteType(info.inviteType)
        setInvitee(info.invitee)
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('invalid')
      })
    return () => {
      cancelled = true
    }
  }, [token])

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
