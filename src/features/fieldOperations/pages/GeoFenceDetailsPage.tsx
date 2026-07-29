import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Stack, Typography } from '@mui/material'
import {
  Pencil as EditOutlined,
  CircleCheck as CheckCircleOutlined,
  Ban as BlockOutlined,
  Trash2 as DeleteOutlined,
  Fence as FenceIcon,
} from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { DetailsPageSkeleton } from '@/components/common/DetailsPageSkeleton/DetailsPageSkeleton'
import { useGeoFenceDetail } from '@/features/fieldOperations/hooks/useGeoFenceDetail'
import type { GeoFenceScanEntry } from '@/features/fieldOperations/types/fieldOperations.types'

const scanColumns: CommonTableColumn<GeoFenceScanEntry>[] = [
  {
    key: 'scanDate',
    header: 'Scan Date',
    sortable: true,
    render: (row) => row.scanDate,
  },
  { key: 'user', header: 'User', render: (row) => row.user },
  { key: 'location', header: 'Location', render: (row) => row.location },
  {
    key: 'distanceMeters',
    header: 'Distance',
    align: 'center',
    sortable: true,
    sortValue: (row) => row.distanceMeters,
    render: (row) => `${row.distanceMeters} m`,
  },
  {
    key: 'result',
    header: 'Result',
    render: (row) => (row.result === 'valid' ? 'Valid' : 'Invalid'),
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) =>
      row.status === 'within_fence' ? 'Within Fence' : 'Outside Fence',
  },
]

export function GeoFenceDetailsPage() {
  const navigate = useNavigate()
  const { fenceId } = useParams<{ fenceId: string }>()
  const {
    geoFence: fence,
    isLoading,
    setStatus,
    remove,
  } = useGeoFenceDetail(fenceId)

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
            }}
          >
            <FenceIcon size={20} />
          </Box>
          <Box>
            <Typography variant="h1">{fence.businessName}</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {fence.id} · {fence.userType}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<EditOutlined size={20} />}
            onClick={() =>
              navigate(
                `/field-operations/geo-fence-management/${fence.id}/edit`,
              )
            }
            sx={{ fontSize: '0.75rem' }}
          >
            Edit Geo Fence
          </Button>
          {fence.status === 'active' ? (
            <Button
              variant="outlined"
              color="error"
              startIcon={<BlockOutlined size={20} />}
              onClick={() => setStatus('inactive')}
              sx={{ fontSize: '0.75rem' }}
            >
              Deactivate
            </Button>
          ) : (
            <Button
              variant="outlined"
              color="success"
              startIcon={<CheckCircleOutlined size={20} />}
              onClick={() => setStatus('active')}
              sx={{ fontSize: '0.75rem' }}
            >
              Activate
            </Button>
          )}
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteOutlined size={20} />}
            onClick={() => remove()}
            sx={{ fontSize: '0.75rem' }}
          >
            Delete
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Summary">
          <DetailFieldGrid
            fields={[
              { label: 'User Name', value: fence.userName },
              { label: 'Business Name', value: fence.businessName },
              { label: 'Region', value: fence.region },
              { label: 'Radius', value: `${fence.radiusMeters} m` },
              { label: 'Status', value: <StatusBadge status={fence.status} /> },
            ]}
          />
        </SectionCard>

        <SectionCard title="Location Information">
          <DetailFieldGrid
            fields={[
              { label: 'Business Address', value: fence.businessAddress },
              { label: 'User Type', value: fence.userType },
              { label: 'Region', value: fence.region },
              { label: 'Latitude', value: fence.latitude.toFixed(4) },
              { label: 'Longitude', value: fence.longitude.toFixed(4) },
              { label: 'Radius', value: `${fence.radiusMeters} m` },
              {
                label: 'Buffer Distance',
                value: `${fence.bufferDistanceMeters} m`,
              },
              { label: 'Last Verified', value: fence.lastVerified },
            ]}
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
      </Stack>
    </>
  )
}
