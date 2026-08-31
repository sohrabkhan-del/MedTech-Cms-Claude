import { useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { Avatar, Box, Button, Grid, Stack, Typography } from '@mui/material'
import {
  BadgeCheck as BadgeCheckIcon,
  CircleCheck,
  Ban,
  Pencil,
  ArrowLeft as ArrowLeftIcon,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  ListChecks,
} from 'lucide-react'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { StatCardSkeleton } from '@/components/common/StatCard/StatCardSkeleton'
import { ActivityTimeline } from '@/components/common/ActivityTimeline/ActivityTimeline'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { DetailsPageSkeleton } from '@/components/common/DetailsPageSkeleton/DetailsPageSkeleton'
import { useAdminDetail } from '@/features/systemUsers/hooks/useAdminDetail'
import { useGetAdminAuditQuery } from '@/features/systemUsers/services/adminsApi'
import { useGetAdminModulesQuery } from '@/features/systemUsers/services/adminsApi'
import { useToast } from '@/contexts/ToastContext'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { formatDateTime } from '@/utils/formatDate'

const infoItemSx = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 1.25,
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}) {
  return (
    <Stack direction="row" sx={infoItemSx}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'background.default',
          color: 'text.secondary',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" sx={{ display: 'block' }}>
          {label}
        </Typography>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '0.875rem',
            wordBreak: 'break-word',
          }}
        >
          {value}
        </Typography>
      </Box>
    </Stack>
  )
}

export function AdminDetailsPage() {
  const { adminId } = useParams<{ adminId: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const {
    admin,
    setStatus,
    isLoading,
    isFetching,
    isUninitialized,
    refetch,
    isStatusUpdating,
  } = useAdminDetail(adminId)
  const location = useLocation()
  const { data: modules = [] } = useGetAdminModulesQuery()

  async function handleSetStatus(status: 'active' | 'inactive') {
    try {
      await setStatus(status)
      toast.success(
        status === 'active'
          ? 'Admin activated successfully.'
          : 'Admin deactivated successfully.',
      )
    } catch (err) {
      toast.error(
        getApiErrorMessage(
          err,
          status === 'active'
            ? 'Failed to activate admin.'
            : 'Failed to deactivate admin.',
        ),
      )
    }
  }

  useEffect(() => {
    if (!location.state?.refreshed) return
    if (!isUninitialized) void refetch()
    navigate(location.pathname, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.refreshed, isUninitialized])

  if (isLoading || isFetching) {
    return <DetailsPageSkeleton sections={2} />
  }

  if (!admin) {
    return (
      <EmptyState
        title="Admin not found"
        description="This administrator account may have been removed."
        actionLabel="Back to Admin List"
        onAction={() => navigate('/system-users/admin')}
      />
    )
  }

  const isActive = admin.status === 'active'

  return (
    <>
      <Stack
        direction="row"
        sx={{
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'primary.light',
              color: 'primary.main',
              flexShrink: 0,
            }}
          >
            <BadgeCheckIcon size={18} />
          </Box>
          <Box>
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', flexWrap: 'wrap' }}
            >
              <Typography variant="h1">{admin.name}</Typography>
              <StatusBadge status={admin.status} />
            </Stack>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {admin.role}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          {!isActive ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<CircleCheck size={18} />}
              onClick={() => handleSetStatus('active')}
              loading={isStatusUpdating}
              sx={{ fontSize: '0.8125rem' }}
            >
              Activate Admin
            </Button>
          ) : (
            <Button
              variant="contained"
              color="error"
              startIcon={<Ban size={18} />}
              onClick={() => handleSetStatus('inactive')}
              loading={isStatusUpdating}
              sx={{ fontSize: '0.8125rem' }}
            >
              Deactivate Admin
            </Button>
          )}
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Pencil size={16} />}
            onClick={() => navigate(`/system-users/admin/${admin.id}/edit`)}
            sx={{ fontSize: '0.8125rem' }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ArrowLeftIcon size={18} />}
            onClick={() => navigate('/system-users/admin')}
            sx={{ fontSize: '0.8125rem' }}
          >
            Back
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            {isLoading ? (
              <StatCardSkeleton />
            ) : (
              <StatCard
                label="Region Access"
                value={admin.regionAccess}
                icon={<MapPin size={20} />}
                iconColor="primary"
              />
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            {isLoading ? (
              <StatCardSkeleton />
            ) : (
              <StatCard
                label="Assigned Role"
                value={admin.role}
                icon={<ShieldCheck size={20} />}
                iconColor="secondary"
              />
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            {isLoading ? (
              <StatCardSkeleton />
            ) : (
              <StatCard
                label="Total Actions Logged"
                value={admin.totalActionsLogged.toLocaleString('en-IN')}
                icon={<ListChecks size={20} />}
                iconColor="info"
              />
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            {isLoading ? (
              <StatCardSkeleton />
            ) : (
              <StatCard
                label="Current Status"
                value={
                  admin.status.charAt(0).toUpperCase() + admin.status.slice(1)
                }
                icon={isActive ? <CircleCheck size={20} /> : <Ban size={20} />}
                iconColor={isActive ? 'success' : 'error'}
              />
            )}
          </Grid>
        </Grid>

        <SectionCard title="Profile Summary">
          <Stack
            direction="row"
            spacing={2.5}
            sx={{ mb: 3, alignItems: 'center' }}
          >
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: 'primary.main',
                fontSize: '1.25rem',
                fontWeight: 700,
              }}
            >
              {admin.name.slice(0, 1)}
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1.0625rem' }}>
                {admin.name}
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Created {admin.createdDate}
              </Typography>
            </Box>
          </Stack>

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <InfoItem
                icon={<Mail size={16} />}
                label="Email Address"
                value={admin.email}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <InfoItem
                icon={<Phone size={16} />}
                label="Phone Number"
                value={admin.phone}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <InfoItem
                icon={<ShieldCheck size={16} />}
                label="Assigned Role"
                value={admin.role}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <InfoItem
                icon={<MapPin size={16} />}
                label="Region Access"
                value={admin.regionAccess}
              />
            </Grid>
          </Grid>
        </SectionCard>

        <SectionCard title="Module Access">
          <Grid container spacing={2}>
            {admin.modulePermissions.length > 0 ? (
              admin.modulePermissions.map((code) => {
                const module = modules.find((item) => item.code === code)
                return (
                  <Grid key={code} size={{ xs: 12, sm: 6, lg: 4 }}>
                    <Box
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: '8px',
                        p: 1.5,
                        height: '100%',
                      }}
                    >
                      <Typography
                        sx={{ fontWeight: 700, fontSize: '0.875rem' }}
                      >
                        {module?.name ?? code}
                      </Typography>
                      {module?.description ? (
                        <Typography
                          variant="body2"
                          sx={{ color: 'text.secondary', mt: 0.5 }}
                        >
                          {module.description}
                        </Typography>
                      ) : null}
                    </Box>
                  </Grid>
                )
              })
            ) : (
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  No module access assigned.
                </Typography>
              </Grid>
            )}
          </Grid>
        </SectionCard>

        <SectionCard title="Recent Activity">
          {
            // Fetch latest audit entries from the server (paged, searchable, sortable)
          }
          {admin && <ServerAuditTimeline adminId={admin.id} />}
        </SectionCard>
      </Stack>
    </>
  )
}

function ServerAuditTimeline({ adminId }: { adminId: string }) {
  const { data, isFetching } = useGetAdminAuditQuery({ adminId, limit: 2 })
  const entries = data?.items ?? []
  return (
    <ActivityTimeline
      entries={entries.map((it) => ({
        id: it.id,
        activity: `${it.action} — ${it.entity}`,
        dateTime: `${formatDateTime(it.createdAt)} · IP: ${it.ip ?? '-'}`,
      }))}
      loading={isFetching}
      emptyTitle="No recent activity logged"
    />
  )
}
