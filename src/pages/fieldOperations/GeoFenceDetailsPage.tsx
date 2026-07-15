import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Card, Grid, Stack, Typography } from '@mui/material'
import EditOutlined from '@mui/icons-material/EditOutlined'
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined'
import BlockOutlined from '@mui/icons-material/BlockOutlined'
import DeleteOutlined from '@mui/icons-material/DeleteOutlined'
import FenceIcon from '@mui/icons-material/Fence'
import PendingActionsOutlined from '@mui/icons-material/PendingActionsOutlined'
import TrackChangesIcon from '@mui/icons-material/TrackChanges'
import EventAvailableOutlined from '@mui/icons-material/EventAvailableOutlined'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { SimpleTable } from '@/components/common/SimpleTable/SimpleTable'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { getGeoFenceById, geoFenceKpis } from '@/features/fieldOperations/mockGeoFences'

const sectionTitleSx = {
  fontWeight: 700,
  fontSize: '0.75rem',
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  color: 'primary.main',
  mb: 2,
}

export function GeoFenceDetailsPage() {
  const navigate = useNavigate()
  const { fenceId } = useParams<{ fenceId: string }>()
  const fence = fenceId ? getGeoFenceById(fenceId) : undefined

  if (!fence) {
    return (
      <EmptyState
        title="Geo fence not found"
        description="This geo fence may have been removed."
        actionLabel="Back to Geo Fence Management"
        onAction={() => navigate('/field-operations/geo-fence-management')}
      />
    )
  }

  return (
    <>
      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
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
            }}
          >
            <FenceIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="h1">{fence.userName}</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {fence.id} · {fence.userType}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<EditOutlined fontSize="small" />}
            onClick={() => navigate(`/field-operations/geo-fence-management/${fence.id}/edit`)}
            sx={{ fontSize: '0.75rem' }}
          >
            Edit Geo Fence
          </Button>
          {fence.status === 'active' ? (
            <Button variant="outlined" color="error" startIcon={<BlockOutlined fontSize="small" />} onClick={() => {}} sx={{ fontSize: '0.75rem' }}>
              Deactivate
            </Button>
          ) : (
            <Button variant="outlined" color="success" startIcon={<CheckCircleOutlined fontSize="small" />} onClick={() => {}} sx={{ fontSize: '0.75rem' }}>
              Activate
            </Button>
          )}
          <Button variant="outlined" color="error" startIcon={<DeleteOutlined fontSize="small" />} onClick={() => {}} sx={{ fontSize: '0.75rem' }}>
            Delete
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <Card sx={{ p: 3 }}>
          <Typography sx={sectionTitleSx}>Summary</Typography>
          <Grid container spacing={2.5}>
            {[
              ['ID', fence.id],
              ['User Name', fence.userName],
              ['User Type', fence.userType],
              ['Region', fence.region],
            ].map(([label, value]) => (
              <Grid key={label} size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {label}
                </Typography>
                <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem', mt: 0.25 }}>{value}</Typography>
              </Grid>
            ))}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Radius
              </Typography>
              <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem', mt: 0.25 }}>{fence.radiusMeters} m</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Status
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <StatusBadge status={fence.status} />
              </Box>
            </Grid>
          </Grid>
        </Card>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Active Geo Fences" value={geoFenceKpis.activeFences} icon={<CheckCircleOutlined fontSize="small" />} iconColor="success" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Pending Verification" value={geoFenceKpis.pendingVerification} icon={<PendingActionsOutlined fontSize="small" />} iconColor="warning" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Average Radius" value={`${geoFenceKpis.averageRadius} m`} icon={<TrackChangesIcon fontSize="small" />} iconColor="primary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Verified This Week" value={geoFenceKpis.verifiedThisWeek} icon={<EventAvailableOutlined fontSize="small" />} iconColor="secondary" />
          </Grid>
        </Grid>

        <Card sx={{ p: 3 }}>
          <Typography sx={sectionTitleSx}>Location Information</Typography>
          <Grid container spacing={2.5}>
            {[
              ['User Name', fence.userName],
              ['User Type', fence.userType],
              ['Region', fence.region],
              ['Zone', fence.zone],
              ['Latitude', fence.latitude.toFixed(4)],
              ['Longitude', fence.longitude.toFixed(4)],
              ['Radius', `${fence.radiusMeters} m`],
              ['Buffer Distance', `${fence.bufferDistanceMeters} m`],
              ['Last Verified', fence.lastVerified],
            ].map(([label, value]) => (
              <Grid key={label} size={{ xs: 12, sm: 6, md: 3 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {label}
                </Typography>
                <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem', mt: 0.25 }}>{value}</Typography>
              </Grid>
            ))}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Status
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <StatusBadge status={fence.status} />
              </Box>
            </Grid>
          </Grid>
        </Card>

        <Card sx={{ p: 3 }}>
          <Typography sx={sectionTitleSx}>Verification History</Typography>
          <SimpleTable
            columns={[
              { key: 'date', header: 'Date', render: (row) => row.date },
              { key: 'verifiedBy', header: 'Verified By', render: (row) => row.verifiedBy },
              { key: 'previousRadiusMeters', header: 'Previous Radius', render: (row) => `${row.previousRadiusMeters} m` },
              { key: 'newRadiusMeters', header: 'New Radius', render: (row) => `${row.newRadiusMeters} m` },
              { key: 'remarks', header: 'Remarks', render: (row) => row.remarks },
            ]}
            rows={fence.verificationHistory}
            getRowId={(row) => row.id}
            emptyTitle="No verification records yet"
          />
        </Card>

        <Card sx={{ p: 3 }}>
          <Typography sx={sectionTitleSx}>Scan History</Typography>
          <SimpleTable
            columns={[
              { key: 'scanDate', header: 'Scan Date', render: (row) => row.scanDate },
              { key: 'user', header: 'User', render: (row) => row.user },
              { key: 'location', header: 'Location', render: (row) => row.location },
              { key: 'distanceMeters', header: 'Distance', render: (row) => `${row.distanceMeters} m` },
              { key: 'result', header: 'Result', render: (row) => (row.result === 'valid' ? 'Valid' : 'Invalid') },
              { key: 'status', header: 'Status', render: (row) => (row.status === 'within_fence' ? 'Within Fence' : 'Outside Fence') },
            ]}
            rows={fence.scanHistory}
            getRowId={(row) => row.id}
            emptyTitle="No scans recorded"
          />
        </Card>

        <Card sx={{ p: 3 }}>
          <Typography sx={sectionTitleSx}>Timeline</Typography>
          <Stack spacing={0}>
            {fence.timeline.map((entry, index) => (
              <Stack key={entry.id} direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
                <Stack sx={{ alignItems: 'center' }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'primary.main', mt: 0.75 }} />
                  {index < fence.timeline.length - 1 && <Box sx={{ width: '1px', flexGrow: 1, minHeight: 24, backgroundColor: 'divider' }} />}
                </Stack>
                <Box sx={{ pb: 2.5 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>{entry.activity}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {entry.dateTime}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Card>

        <Card sx={{ p: 3 }}>
          <Typography sx={sectionTitleSx}>Audit History</Typography>
          <SimpleTable
            columns={[
              { key: 'date', header: 'Date', render: (row) => row.date },
              { key: 'action', header: 'Action', render: (row) => row.action },
              { key: 'performedBy', header: 'Performed By', render: (row) => row.performedBy },
              { key: 'remarks', header: 'Remarks', render: (row) => row.remarks },
            ]}
            rows={fence.auditHistory}
            getRowId={(row) => row.id}
            emptyTitle="No audit records yet"
          />
        </Card>
      </Stack>
    </>
  )
}
