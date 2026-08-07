import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Grid, Stack } from '@mui/material'
import { PartnerSummaryHeader } from '@/features/userManagement/components/PartnerSummaryHeader'
import { PartnerDetailsFieldsCard } from '@/features/userManagement/components/PartnerDetailsFieldsCard'
import { PartnerStatisticsCards } from '@/features/userManagement/components/PartnerStatisticsCards'
import { LocationCard } from '@/features/userManagement/components/LocationCard'
import { PointsManagementCard } from '@/features/userManagement/components/PointsManagementCard'
import { ScanHistoryCard } from '@/features/userManagement/components/ScanHistoryCard'
import { PointsHistoryCard } from '@/features/userManagement/components/PointsHistoryCard'
import { InterestedProductsCard } from '@/features/userManagement/components/InterestedProductsCard'
import { RedemptionHistoryCard } from '@/features/userManagement/components/RedemptionHistoryCard'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { DetailsPageSkeleton } from '@/components/common/DetailsPageSkeleton/DetailsPageSkeleton'
import { useChemistDetail } from '@/features/userManagement/hooks/useChemistDetail'
import { useUserRedemptions } from '@/features/rewardsWallet/hooks/useUserRedemptions'

export function ChemistDetailsPage() {
  const { chemistId } = useParams<{ chemistId: string }>()
  const navigate = useNavigate()
  const { chemist, isLoading, activate, deactivate, remove, isUpdatingStatus, isDeleting } =
    useChemistDetail(chemistId)
  const { redemptions, isLoading: isRedemptionsLoading } =
    useUserRedemptions(chemistId)
  const [, forceRerender] = useState(0)

  if (isLoading) {
    return <DetailsPageSkeleton sections={4} />
  }

  if (!chemist) {
    return (
      <EmptyState
        title="Chemist not found"
        description="This chemist may have been removed."
        actionLabel="Back to Chemists"
        onAction={() => navigate('/partners/chemists')}
      />
    )
  }

  const handleAdjustPoints = () => {
    forceRerender((n) => n + 1)
  }

  return (
    <Stack spacing={0}>
      <PartnerSummaryHeader
        partner={chemist}
        shopLabel="Chemist Shop Name"
        onActivate={activate}
        onDeactivate={deactivate}
        isUpdatingStatus={isUpdatingStatus}
        editPath={`/partners/chemists/${chemistId}/edit`}
        onDelete={async () => {
          const success = await remove()
          if (success) {
            navigate('/partners/chemists')
          }
          return success
        }}
        isDeleting={isDeleting}
      />

      <PartnerDetailsFieldsCard
        partner={chemist}
        shopLabel="Chemist Shop Name"
      />

      <PartnerStatisticsCards partner={chemist} />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={12}>
          <LocationCard
            address={chemist.registeredAddress}
            geoLock={chemist.geoLock}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={12}>
          <PointsManagementCard
            currentBalance={chemist.availablePoints}
            onAdjust={handleAdjustPoints}
          />
        </Grid>
      </Grid>

      <Stack spacing={3}>
        <ScanHistoryCard entries={chemist.scanHistory} />
        <PointsHistoryCard entries={chemist.PointsHistory} />
        <RedemptionHistoryCard
          entries={redemptions}
          isLoading={isRedemptionsLoading}
        />
        <InterestedProductsCard entries={chemist.interestedProducts} />
      </Stack>
    </Stack>
  )
}
