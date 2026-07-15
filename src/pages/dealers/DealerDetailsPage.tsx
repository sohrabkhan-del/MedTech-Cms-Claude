import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Grid, Stack } from '@mui/material'
import { PartnerSummaryHeader } from '@/features/partners/components/PartnerSummaryHeader'
import { PartnerStatisticsCards } from '@/features/partners/components/PartnerStatisticsCards'
import { RegisteredAddressCard } from '@/features/partners/components/RegisteredAddressCard'
import { GeoLockCard } from '@/features/partners/components/GeoLockCard'
import { PointsManagementCard } from '@/features/partners/components/PointsManagementCard'
import { ScanHistoryCard } from '@/features/partners/components/ScanHistoryCard'
import { PointsHistoryCard } from '@/features/partners/components/PointsHistoryCard'
import { InterestedProductsCard } from '@/features/partners/components/InterestedProductsCard'
import { LicenseDocumentsCard } from '@/features/partners/components/LicenseDocumentsCard'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { getDealerById } from '@/features/dealers/mockDealers'

export function DealerDetailsPage() {
  const { dealerId } = useParams<{ dealerId: string }>()
  const navigate = useNavigate()
  const dealer = getDealerById(dealerId ?? '')
  const [, forceRerender] = useState(0)

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
        shopLabel="Godown Name"
        onActivate={() => forceRerender((n) => n + 1)}
        onDeactivate={() => forceRerender((n) => n + 1)}
      />

      <PartnerStatisticsCards partner={dealer} />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <RegisteredAddressCard address={dealer.registeredAddress} geoLock={dealer.geoLock} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <GeoLockCard geoLock={dealer.geoLock} />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={12}>
          <PointsManagementCard currentBalance={dealer.availableCoins} onAdjust={() => forceRerender((n) => n + 1)} />
        </Grid>
      </Grid>

      <Stack spacing={3}>
        <ScanHistoryCard entries={dealer.scanHistory} />
        <PointsHistoryCard entries={dealer.pointsHistory} />
        <InterestedProductsCard entries={dealer.interestedProducts} />
        <LicenseDocumentsCard documents={dealer.documents} />
      </Stack>
    </Stack>
  )
}
