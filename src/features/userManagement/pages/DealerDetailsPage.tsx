import { Grid, Stack, Typography } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
import { PartnerSummaryHeader } from '@/features/userManagement/components/PartnerSummaryHeader'
import { PartnerDetailsFieldsCard } from '@/features/userManagement/components/PartnerDetailsFieldsCard'
import { PartnerStatisticsCards } from '@/features/userManagement/components/PartnerStatisticsCards'
import { LocationCard } from '@/features/userManagement/components/LocationCard'
import { PointsManagementCard } from '@/features/userManagement/components/PointsManagementCard'
import { ScanHistoryCard } from '@/features/userManagement/components/ScanHistoryCard'
import { PointsHistoryCard } from '@/features/userManagement/components/PointsHistoryCard'
import { InterestedProductsCard } from '@/features/userManagement/components/InterestedProductsCard'
import { LicenseDocumentsCard } from '@/features/userManagement/components/LicenseDocumentsCard'
import { RedemptionHistoryCard } from '@/features/userManagement/components/RedemptionHistoryCard'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { DetailsPageSkeleton } from '@/components/common/DetailsPageSkeleton/DetailsPageSkeleton'
import { useDealerDetail } from '@/features/userManagement/hooks/useDealerDetail'
import { useUserRedemptions } from '@/features/rewardsWallet/hooks/useUserRedemptions'

export function DealerDetailsPage() {
  const { dealerId } = useParams<{ dealerId: string }>()
  const navigate = useNavigate()
  const { dealer, isLoading, activate, deactivate } = useDealerDetail(dealerId)
  const { redemptions, isLoading: isRedemptionsLoading } =
    useUserRedemptions(dealerId)

  if (isLoading) {
    return <DetailsPageSkeleton sections={4} />
  }

  if (!dealer) {
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
      <PartnerSummaryHeader
        partner={dealer}
        shopLabel="Business Name"
        onActivate={activate}
        onDeactivate={deactivate}
      />

      <PartnerDetailsFieldsCard partner={dealer} shopLabel="Business Name" />

      <PartnerStatisticsCards partner={dealer} />

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

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={12}>
          <PointsManagementCard
            currentBalance={dealer.availablePoints}
            onAdjust={() => {}}
          />
        </Grid>
      </Grid>

      <Stack spacing={3}>
        <ScanHistoryCard entries={dealer.scanHistory} />
        <PointsHistoryCard entries={dealer.PointsHistory} />
        <RedemptionHistoryCard
          entries={redemptions}
          isLoading={isRedemptionsLoading}
        />
        <InterestedProductsCard entries={dealer.interestedProducts} />
        <LicenseDocumentsCard documents={dealer.documents} />
      </Stack>
    </Stack>
  )
}
