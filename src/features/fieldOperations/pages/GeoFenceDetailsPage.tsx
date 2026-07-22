import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Grid, Stack, Typography } from '@mui/material'
import { Pencil as EditOutlined, CircleCheck as CheckCircleOutlined, Ban as BlockOutlined, Trash2 as DeleteOutlined, Fence as FenceIcon, ClipboardClock as PendingActionsOutlined, Target as TrackChangesIcon, CalendarCheck as EventAvailableOutlined } from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { ActivityTimeline } from '@/components/common/ActivityTimeline/ActivityTimeline'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { DetailsPageSkeleton } from '@/components/common/DetailsPageSkeleton/DetailsPageSkeleton'
import { useGeoFenceDetail } from '@/features/fieldOperations/hooks/useGeoFenceDetail'
import { useGeoFences } from '@/features/fieldOperations/hooks/useGeoFences'
import type {
  GeoFenceVerificationEntry,
  GeoFenceScanEntry,
  GeoFenceAuditEntry,
} from '@/features/fieldOperations/types/fieldOperations.types'

const verificationColumns: CommonTableColumn<GeoFenceVerificationEntry>[] = [
  { key: 'date', header: 'Date', sortable: true, render: (row) => row.date },
  { key: 'verifiedBy', header: 'Verified By', render: (row) => row.verifiedBy },
  { key: 'previousRadiusMeters', header: 'Previous Radius', render: (row) => `${row.previousRadiusMeters} m` },
  { key: 'newRadiusMeters', header: 'New Radius', render: (row) => `${row.newRadiusMeters} m` },
  { key: 'remarks', header: 'Remarks', render: (row) => row.remarks },
]

const scanColumns: CommonTableColumn<GeoFenceScanEntry>[] = [
  { key: 'scanDate', header: 'Scan Date', sortable: true, render: (row) => row.scanDate },
  { key: 'user', header: 'User', render: (row) => row.user },
  { key: 'location', header: 'Location', render: (row) => row.location },
  { key: 'distanceMeters', header: 'Distance', align: 'right', sortable: true, sortValue: (row) => row.distanceMeters, render: (row) => `${row.distanceMeters} m` },
  { key: 'result', header: 'Result', render: (row) => (row.result === 'valid' ? 'Valid' : 'Invalid') },
  { key: 'status', header: 'Status', render: (row) => (row.status === 'within_fence' ? 'Within Fence' : 'Outside Fence') },
]

const auditColumns: CommonTableColumn<GeoFenceAuditEntry>[] = [
  { key: 'date', header: 'Date', sortable: true, render: (row) => row.date },
  { key: 'action', header: 'Action', render: (row) => row.action },
  { key: 'performedBy', header: 'Performed By', render: (row) => row.performedBy },
  { key: 'remarks', header: 'Remarks', render: (row) => row.remarks },
]

export function GeoFenceDetailsPage() {
  const navigate = useNavigate()
  const { fenceId } = useParams<{ fenceId: string }>()
  const { geoFence: fence, isLoading, setStatus, remove } = useGeoFenceDetail(fenceId)
  const { kpis } = useGeoFences()
  const geoFenceKpis = kpis ?? { activeFences: 0, pendingVerification: 0, averageRadius: 0, verifiedThisWeek: 0 }

  if (isLoading) {
    return <DetailsPageSkeleton sections={5} />
  }

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
            <FenceIcon size={20} />
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
            startIcon={<EditOutlined size={20} />}
            onClick={() => navigate(`/field-operations/geo-fence-management/${fence.id}/edit`)}
            sx={{ fontSize: '0.75rem' }}
          >
            Edit Geo Fence
          </Button>
          {fence.status === 'active' ? (
            <Button variant="outlined" color="error" startIcon={<BlockOutlined size={20} />} onClick={() => setStatus('inactive')} sx={{ fontSize: '0.75rem' }}>
              Deactivate
            </Button>
          ) : (
            <Button variant="outlined" color="success" startIcon={<CheckCircleOutlined size={20} />} onClick={() => setStatus('active')} sx={{ fontSize: '0.75rem' }}>
              Activate
            </Button>
          )}
          <Button variant="outlined" color="error" startIcon={<DeleteOutlined size={20} />} onClick={() => remove()} sx={{ fontSize: '0.75rem' }}>
            Delete
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Summary">
          <DetailFieldGrid
            fields={[
              { label: 'ID', value: fence.id },
              { label: 'User Name', value: fence.userName },
              { label: 'Business Name', value: fence.businessName },
              { label: 'User Type', value: fence.userType },
              { label: 'Region', value: fence.region },
              { label: 'Radius', value: `${fence.radiusMeters} m` },
              { label: 'Status', value: <StatusBadge status={fence.status} /> },
            ]}
          />
        </SectionCard>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Active Geo Fences" value={geoFenceKpis.activeFences} icon={<CheckCircleOutlined size={20} />} iconColor="success" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Pending Verification" value={geoFenceKpis.pendingVerification} icon={<PendingActionsOutlined size={20} />} iconColor="warning" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Average Radius" value={`${geoFenceKpis.averageRadius} m`} icon={<TrackChangesIcon size={20} />} iconColor="primary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Verified This Week" value={geoFenceKpis.verifiedThisWeek} icon={<EventAvailableOutlined size={20} />} iconColor="secondary" />
          </Grid>
        </Grid>

        <SectionCard title="Location Information">
          <DetailFieldGrid
            fields={[
              { label: 'User Name', value: fence.userName },
              { label: 'Business Name', value: fence.businessName },
              { label: 'Business Address', value: fence.businessAddress },
              { label: 'User Type', value: fence.userType },
              { label: 'Region', value: fence.region },
              { label: 'Zone', value: fence.zone },
              { label: 'Latitude', value: fence.latitude.toFixed(4) },
              { label: 'Longitude', value: fence.longitude.toFixed(4) },
              { label: 'Radius', value: `${fence.radiusMeters} m` },
              { label: 'Buffer Distance', value: `${fence.bufferDistanceMeters} m` },
              { label: 'Last Verified', value: fence.lastVerified },
              { label: 'Status', value: <StatusBadge status={fence.status} /> },
            ]}
          />
        </SectionCard>

        <SectionCard title="Verification History">
          <CommonTable
            tableKey="geofence-verification-history"
            columns={verificationColumns}
            rows={fence.verificationHistory}
            loading={isLoading}
            getRowId={(row) => row.id}
            searchPlaceholder="Search verification history…"
            searchKeys={(row) => `${row.verifiedBy} ${row.remarks}`}
            defaultSortBy="date"
            emptyTitle="No verification records yet"
          />
        </SectionCard>

        <SectionCard title="Scan History">
          <CommonTable
            tableKey="geofence-scan-history"
            columns={scanColumns}
            rows={fence.scanHistory}
            loading={isLoading}
            getRowId={(row) => row.id}
            searchPlaceholder="Search scans…"
            searchKeys={(row) => `${row.user} ${row.location}`}
            defaultSortBy="scanDate"
            emptyTitle="No scans recorded"
          />
        </SectionCard>

        <SectionCard title="Timeline">
          <ActivityTimeline entries={fence.timeline} emptyTitle="No timeline activity yet" />
        </SectionCard>

        <SectionCard title="Audit History">
          <CommonTable
            tableKey="geofence-audit-history"
            columns={auditColumns}
            rows={fence.auditHistory}
            loading={isLoading}
            getRowId={(row) => row.id}
            searchPlaceholder="Search audit history…"
            searchKeys={(row) => `${row.action} ${row.performedBy} ${row.remarks}`}
            defaultSortBy="date"
            emptyTitle="No audit records yet"
          />
        </SectionCard>
      </Stack>
    </>
  )
}
