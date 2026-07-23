import { useNavigate, useParams } from 'react-router-dom'
import { Box, Grid, Stack, Typography } from '@mui/material'
import { Truck, Phone, Mail, MapPin, FileText, Calendar } from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { DetailsPageSkeleton } from '@/components/common/DetailsPageSkeleton/DetailsPageSkeleton'
import { useDistributorDetail } from '@/features/inventoryManagement/hooks/useDistributorDetail'

export function DistributorDetailsPage() {
  const navigate = useNavigate()
  const { distributorId } = useParams<{ distributorId: string }>()
  const { distributor, isLoading } = useDistributorDetail(distributorId)

  if (isLoading) {
    return <DetailsPageSkeleton sections={3} />
  }

  if (!distributor) {
    return (
      <EmptyState
        title="Distributor not found"
        description="This distributor may have been removed."
        actionLabel="Back to Distributor Upload"
        onAction={() => navigate('/distributor-upload')}
      />
    )
  }

  return (
    <Stack spacing={3}>
      <Stack
        direction="row"
        sx={{
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'primary.light',
              color: 'primary.main',
            }}
          >
            <Truck size={22} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="h1">
                {distributor.distributorName}
              </Typography>
              <StatusBadge status={distributor.status} />
            </Stack>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {distributor.distributorCode} · {distributor.city},{' '}
              {distributor.region} Zone
            </Typography>
          </Box>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Region"
            value={distributor.region}
            icon={<MapPin size={20} />}
            iconColor="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="City"
            value={distributor.city}
            icon={<MapPin size={20} />}
            iconColor="secondary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Contact Person"
            value={distributor.contactPerson}
            icon={<Phone size={20} />}
            iconColor="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Uploaded On"
            value={distributor.uploadedDate}
            icon={<Calendar size={20} />}
            iconColor="warning"
          />
        </Grid>
      </Grid>

      <SectionCard title="Distributor Information">
        <DetailFieldGrid
          fields={[
            { label: 'Distributor Name', value: distributor.distributorName },
            { label: 'Distributor Code', value: distributor.distributorCode },
            {
              label: 'Status',
              value: <StatusBadge status={distributor.status} />,
            },
            { label: 'Contact Person', value: distributor.contactPerson },
            { label: 'Phone', value: distributor.phone },
            { label: 'Email', value: distributor.email },
            { label: 'City', value: distributor.city },
            { label: 'Region', value: distributor.region },
          ]}
        />
      </SectionCard>

      <SectionCard title="Address">
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
          <Box sx={{ color: 'text.secondary', mt: 0.25 }}>
            <MapPin size={18} />
          </Box>
          <Typography variant="body1">{distributor.address}</Typography>
        </Stack>
      </SectionCard>

      <SectionCard title="Compliance & Documentation">
        <DetailFieldGrid
          fields={[
            { label: 'GST Number', value: distributor.gstNumber },
            { label: 'Source File', value: distributor.uploadFile },
            { label: 'Uploaded Date', value: distributor.uploadedDate },
          ]}
        />
      </SectionCard>

      <SectionCard title="Contact Details">
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
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
                <Phone size={18} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Phone
                </Typography>
                <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                  {distributor.phone}
                </Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'secondary.light',
                  color: 'secondary.main',
                }}
              >
                <Mail size={18} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Email
                </Typography>
                <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                  {distributor.email}
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </SectionCard>

      <SectionCard title="Import Metadata">
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: 'center', color: 'text.secondary' }}
        >
          <FileText size={18} />
          <Typography variant="body1">
            Imported from <strong>{distributor.uploadFile}</strong> on{' '}
            {distributor.uploadedDate}.
          </Typography>
        </Stack>
      </SectionCard>
    </Stack>
  )
}
