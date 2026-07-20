import { useNavigate, useParams } from 'react-router-dom'
import { Avatar, Box, Button, Chip, Grid, Stack, Typography } from '@mui/material'
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
import { ActivityTimeline } from '@/components/common/ActivityTimeline/ActivityTimeline'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { useAdminDetail } from '@/features/systemUsers/hooks/useAdminDetail'

const infoItemSx = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 1.25,
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
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
        <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', wordBreak: 'break-word' }}>{value}</Typography>
      </Box>
    </Stack>
  )
}

export function AdminDetailsPage() {
  const { adminId } = useParams<{ adminId: string }>()
  const navigate = useNavigate()
  const { admin, setStatus } = useAdminDetail(adminId)

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
        sx={{ alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}
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
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant="h1">{admin.name}</Typography>
              <StatusBadge status={admin.status} />
            </Stack>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {admin.id} · {admin.role}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          {!isActive ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<CircleCheck size={18} />}
              onClick={() => setStatus('active')}
              sx={{ fontSize: '0.8125rem' }}
            >
              Activate Admin
            </Button>
          ) : (
            <Button
              variant="contained"
              color="error"
              startIcon={<Ban size={18} />}
              onClick={() => setStatus('inactive')}
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
            <StatCard label="Region Access" value={admin.regionAccess} icon={<MapPin size={20} />} iconColor="primary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Assigned Role" value={admin.role} icon={<ShieldCheck size={20} />} iconColor="secondary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Total Actions Logged"
              value={admin.totalActionsLogged.toLocaleString('en-IN')}
              icon={<ListChecks size={20} />}
              iconColor="info"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Current Status"
              value={admin.status.charAt(0).toUpperCase() + admin.status.slice(1)}
              icon={isActive ? <CircleCheck size={20} /> : <Ban size={20} />}
              iconColor={isActive ? 'success' : 'error'}
            />
          </Grid>
        </Grid>

        <SectionCard
          title="Profile Summary"
          action={
            <Chip
              size="small"
              label={`Admin ID: ${admin.id}`}
              variant="outlined"
              sx={{ fontWeight: 600, fontSize: '0.75rem' }}
            />
          }
        >
          <Stack direction="row" spacing={2.5} sx={{ mb: 3, alignItems: 'center' }}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: '1.25rem', fontWeight: 700 }}>
              {admin.name.slice(0, 1)}
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1.0625rem' }}>{admin.name}</Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Created {admin.createdDate}
              </Typography>
            </Box>
          </Stack>

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <InfoItem icon={<Mail size={16} />} label="Email Address" value={admin.email} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <InfoItem icon={<Phone size={16} />} label="Phone Number" value={admin.phone} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <InfoItem icon={<ShieldCheck size={16} />} label="Assigned Role" value={admin.role} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <InfoItem icon={<MapPin size={16} />} label="Region Access" value={admin.regionAccess} />
            </Grid>
          </Grid>
        </SectionCard>

        <SectionCard title="Recent Activity">
          <ActivityTimeline
            entries={admin.recentActivity.map((entry) => ({
              id: entry.id,
              activity: `${entry.actionPerformed} — ${entry.targetRecord}`,
              dateTime: `${entry.timestamp} · IP: ${entry.ipAddress}`,
            }))}
            emptyTitle="No recent activity logged"
          />
        </SectionCard>
      </Stack>
    </>
  )
}
