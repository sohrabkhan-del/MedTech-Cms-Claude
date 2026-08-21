import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip,
  Button,
  Box,
  Typography,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material'
import { Laptop, Smartphone, Globe, Trash2, Eye } from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { Modal } from '@/components/common/Modal/Modal'
import {
  useGetUserSessionsQuery,
  useRevokeUserSessionMutation,
  useRevokeAllUserSessionsMutation,
} from '@/features/systemUsers/services/sessionsApi'
import { useToast } from '@/contexts/ToastContext'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

function formatReason(reason: string) {
  if (!reason) return 'Inactive'
  return reason
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function getStatusStyles(status: string) {
  const normalized = (status || '').toUpperCase()
  switch (normalized) {
    case 'ACTIVE':
      return {
        color: 'success' as const,
        bgcolor: 'success.light',
        textColor: 'success.dark',
      }
    case 'REVOKED':
      return {
        color: 'error' as const,
        bgcolor: 'error.light',
        textColor: 'error.dark',
      }
    case 'LOGGED_OUT':
      return {
        color: 'info' as const,
        bgcolor: 'info.light',
        textColor: 'info.dark',
      }
    default:
      return {
        color: 'default' as const,
        bgcolor: 'action.hover',
        textColor: 'text.secondary',
      }
  }
}

interface ActiveSessionsCardProps {
  userId: string
}

interface ConfirmState {
  open: boolean
  type: 'single' | 'all'
  sessionId?: string
}

export function ActiveSessionsCard({ userId }: ActiveSessionsCardProps) {
  const toast = useToast()
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    open: false,
    type: 'single',
  })
  const [detailsSession, setDetailsSession] = useState<UserSession | null>(null)

  const { data: sessions = [], isLoading: isSessionsLoading } =
    useGetUserSessionsQuery(userId || '')
  const [revokeSession, { isLoading: isRevokingSession }] =
    useRevokeUserSessionMutation()
  const [revokeAllSessions, { isLoading: isRevokingAll }] =
    useRevokeAllUserSessionsMutation()

  const activeSessions = sessions.filter((s) => s.status === 'ACTIVE')

  async function handleConfirmAction() {
    try {
      if (confirmState.type === 'single' && confirmState.sessionId) {
        await revokeSession({ userId, sessionId: confirmState.sessionId }).unwrap()
        toast.success('Session revoked successfully.')
      } else if (confirmState.type === 'all') {
        await revokeAllSessions(userId).unwrap()
        toast.success('All sessions revoked successfully.')
      }
      setConfirmState({ open: false, type: 'single' })
    } catch (err) {
      toast.error(
        getApiErrorMessage(
          err,
          confirmState.type === 'single'
            ? 'Failed to revoke session.'
            : 'Failed to revoke all sessions.',
        ),
      )
    }
  }

  function handleCloseConfirm() {
    if (isRevokingSession || isRevokingAll) return
    setConfirmState({ open: false, type: 'single' })
  }

  return (
    <>
      <SectionCard
        title="Active Sessions"
        action={
          activeSessions.length > 0 ? (
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<Trash2 size={14} />}
              onClick={() => setConfirmState({ open: true, type: 'all' })}
              sx={{ fontSize: '0.75rem', py: 0.5 }}
            >
              Revoke All Sessions
            </Button>
          ) : undefined
        }
      >
        {isSessionsLoading ? (
          <Stack sx={{ py: 3, alignItems: 'center' }}>
            <CircularProgress size={24} />
          </Stack>
        ) : sessions.length === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No active sessions found for this user.
          </Typography>
        ) : (
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <Table size="small">
              <TableHead sx={{ bgcolor: 'background.default' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Device / Client</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>IP Address</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Login Time</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Last Seen</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.map((session) => {
                  const isSessionActive = session.status === 'ACTIVE'
                  const platformLower = (session.platform || '').toLowerCase()
                  const isMobile =
                    platformLower.includes('ios') ||
                    platformLower.includes('android') ||
                    platformLower.includes('mobile')
                  const DeviceIcon = isMobile
                    ? Smartphone
                    : platformLower.includes('mac') ||
                      platformLower.includes('windows') ||
                      platformLower.includes('linux')
                      ? Laptop
                      : Globe

                  return (
                    <TableRow key={session.id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                          <Box
                            sx={{
                              color: isSessionActive ? 'primary.main' : 'text.secondary',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <DeviceIcon size={18} />
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              sx={{
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                display: 'flex',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: 1,
                              }}
                            >
                              {session.platform || 'Unknown Device'}
                              {session.isCurrent && (
                                <Chip
                                  label="Current"
                                  color="primary"
                                  size="small"
                                  sx={{ height: 16, fontSize: '0.625rem', fontWeight: 700 }}
                                />
                              )}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'text.secondary',
                                display: 'block',
                                maxWidth: 220,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {session.userAgent || 'Unknown User Agent'}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.875rem' }}>
                        {session.ipAddress || '-'}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const statusStyles = getStatusStyles(session.status)
                          return (
                            <Chip
                              label={formatReason(session.status)}
                              size="small"
                              color={statusStyles.color}
                              sx={{
                                height: 20,
                                fontSize: '0.6875rem',
                                fontWeight: 600,
                                bgcolor: statusStyles.bgcolor,
                                color: statusStyles.textColor,
                                border: 'none',
                              }}
                            />
                          )
                        })()}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
                        {session.issuedAt
                          ? new Date(session.issuedAt).toLocaleString('en-IN')
                          : '-'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
                        {session.lastSeenAt
                          ? new Date(session.lastSeenAt).toLocaleString('en-IN')
                          : '-'}
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end', alignItems: 'center' }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => setDetailsSession(session)}
                              color="primary"
                            >
                              <Eye size={16} />
                            </IconButton>
                          </Tooltip>
                          {isSessionActive && (
                            <Tooltip title="Delete (Revoke)">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  setConfirmState({
                                    open: true,
                                    type: 'single',
                                    sessionId: session.sessionId,
                                  })
                                }
                                color="error"
                              >
                                <Trash2 size={16} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </SectionCard>

      <Modal
        open={confirmState.open}
        onClose={handleCloseConfirm}
        title={confirmState.type === 'single' ? 'Revoke Active Session' : 'Revoke All Sessions'}
        primaryActionLabel="Revoke"
        primaryActionColor="error"
        onPrimaryAction={handleConfirmAction}
        loading={isRevokingSession || isRevokingAll}
      >
        <Typography variant="body1">
          {confirmState.type === 'single'
            ? 'Are you sure you want to revoke this active session? The user will be instantly logged out of this device.'
            : 'Are you sure you want to revoke all active sessions for this user? This will instantly terminate all active sessions and log them out of all devices.'}
        </Typography>
      </Modal>

      <Modal
        open={Boolean(detailsSession)}
        onClose={() => setDetailsSession(null)}
        title="Session Details"
        secondaryActionLabel="Close"
      >
        {detailsSession && (
          <Stack spacing={1} sx={{ pt: 1 }}>
            {[
              { label: 'Session ID', value: detailsSession.sessionId },
              { label: 'User ID', value: detailsSession.userId },
              { label: 'User Type', value: formatReason(detailsSession.userType) },
              { label: 'Platform / OS', value: detailsSession.platform || 'Unknown' },
              { label: 'App Version', value: detailsSession.appVersion || '-' },
              { label: 'IP Address', value: detailsSession.ipAddress || '-' },
              {
                label: 'Status',
                value: (
                  <Chip
                    label={formatReason(detailsSession.status)}
                    size="small"
                    color={getStatusStyles(detailsSession.status).color}
                    sx={{
                      height: 20,
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      bgcolor: getStatusStyles(detailsSession.status).bgcolor,
                      color: getStatusStyles(detailsSession.status).textColor,
                      border: 'none',
                    }}
                  />
                ),
              },
              { label: 'Current Session', value: detailsSession.isCurrent ? 'Yes' : 'No' },
              { label: 'Login Time', value: detailsSession.issuedAt ? new Date(detailsSession.issuedAt).toLocaleString('en-IN') : '-' },
              { label: 'Last Active', value: detailsSession.lastSeenAt ? new Date(detailsSession.lastSeenAt).toLocaleString('en-IN') : '-' },
              { label: 'Expires At', value: detailsSession.expiresAt ? new Date(detailsSession.expiresAt).toLocaleString('en-IN') : '-' },
              ...(detailsSession.revokedAt
                ? [
                    { label: 'Revoked At', value: new Date(detailsSession.revokedAt).toLocaleString('en-IN') },
                    { label: 'Revoked Reason', value: formatReason(detailsSession.revokedReason) },
                  ]
                : []),
              { label: 'User Agent', value: detailsSession.userAgent || '-' },
            ].map((row, idx) => (
              <Stack
                key={idx}
                direction="row"
                sx={{
                  justifyContent: 'space-between',
                  py: 1,
                  borderBottom: idx === 11 ? 'none' : '1px solid',
                  borderColor: 'divider',
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'text.secondary' }}>
                  {row.label}
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    textAlign: 'right',
                    wordBreak: 'break-all',
                    maxWidth: { xs: '100%', sm: '65%' },
                  }}
                >
                  {row.value}
                </Typography>
              </Stack>
            ))}
          </Stack>
        )}
      </Modal>
    </>
  )
}
