import { Box, Card, Grid, Skeleton, Stack, Typography } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { PartnerSummaryHeader } from '@/features/userManagement/components/PartnerSummaryHeader'
import { PartnerDetailsFieldsCard } from '@/features/userManagement/components/PartnerDetailsFieldsCard'
import { PartnerStatisticsCards } from '@/features/userManagement/components/PartnerStatisticsCards'
import { LocationCard } from '@/features/userManagement/components/LocationCard'
import { ScanHistoryCard } from '@/features/userManagement/components/ScanHistoryCard'
import { PointsHistoryCard } from '@/features/userManagement/components/PointsHistoryCard'
import { InterestedProductsCard } from '@/features/userManagement/components/InterestedProductsCard'
import { RedemptionHistoryCard } from '@/features/userManagement/components/RedemptionHistoryCard'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { ActiveSessionsCard } from '@/features/userManagement/components/ActiveSessionsCard'
import { useDealerDetail } from '@/features/userManagement/hooks/useDealerDetail'

export function DealerDetailsPage() {
  const { dealerId } = useParams<{ dealerId: string }>()
  const navigate = useNavigate()
  const {
    dealer,
    isLoading,
    activate,
    deactivate,
    remove,
    isUpdatingStatus,
    isDeleting,
  } = useDealerDetail(dealerId)

  if (!isLoading && !dealer) {
    return (
      <EmptyState
        title="Dealer not found"
        description="This dealer may have been removed."
        actionLabel="Back to Dealers"
        onAction={() => navigate('/partners/dealers')}
      />
    )
  }

  return (
    <Stack spacing={0}>
      {dealer ? (
        <>
          <PartnerSummaryHeader
            partner={dealer}
            shopLabel="Business Name"
            onActivate={activate}
            onDeactivate={deactivate}
            isUpdatingStatus={isUpdatingStatus}
            editPath={`/partners/dealers/${dealerId}/edit`}
            onDelete={async () => {
              const success = await remove()
              if (success) {
                navigate('/partners/dealers')
              }
              return success
            }}
            isDeleting={isDeleting}
          />

          <PartnerDetailsFieldsCard
            partner={dealer}
            shopLabel="Business Name"
          />

          <PartnerStatisticsCards partner={dealer} partnerId={dealerId} />

          <Typography sx={{ fontWeight: 700, fontSize: '1rem', mb: 2 }}>
            Godowns ({dealer.godowns.length})
          </Typography>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {dealer.godowns.map((godown) => (
              <Grid key={godown.id} size={12}>
                <LocationCard
                  title={godown.name}
                  address={godown.address}
                  geoLock={godown.geoLock}
                />
              </Grid>
            ))}
          </Grid>
          {dealerId && (
            <Box sx={{ mb: 3 }}>
              <ActiveSessionsCard userId={dealerId} />
            </Box>
          )}
        </>
      ) : (
        <>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{
              justifyContent: 'space-between',
              alignItems: { md: 'center' },
              mb: 2,
            }}
          >
            <Skeleton variant="text" width={220} height={32} />
            <Skeleton variant="rounded" width={180} height={36} />
          </Stack>
          <Card sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Grid key={i} size={{ xs: 6, sm: 4, md: 2 }}>
                  <Skeleton variant="text" width="60%" height={16} />
                  <Skeleton variant="text" width="80%" height={20} />
                </Grid>
              ))}
            </Grid>
          </Card>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
                <Skeleton variant="rounded" width="100%" height={100} />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      <Stack spacing={3}>
        <PointsHistoryCard partnerId={dealerId} />
        <ScanHistoryCard partnerId={dealerId} />
        <RedemptionHistoryCard partnerId={dealerId} />
        <InterestedProductsCard partnerId={dealerId} />
      </Stack>
    </Stack>
  )
}
