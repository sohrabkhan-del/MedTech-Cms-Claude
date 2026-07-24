import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Grid, Stack, Typography } from '@mui/material'
import { Store as StorefrontIcon } from 'lucide-react'
import { PartnerSummaryHeader } from '@/features/userManagement/components/PartnerSummaryHeader'
import { PartnerDetailsFieldsCard } from '@/features/userManagement/components/PartnerDetailsFieldsCard'
import { PartnerStatisticsCards } from '@/features/userManagement/components/PartnerStatisticsCards'
import { RegisteredAddressCard } from '@/features/userManagement/components/RegisteredAddressCard'
import { GeoLockCard } from '@/features/userManagement/components/GeoLockCard'
import { PointsManagementCard } from '@/features/userManagement/components/PointsManagementCard'
import { ScanHistoryCard } from '@/features/userManagement/components/ScanHistoryCard'
import { PointsHistoryCard } from '@/features/userManagement/components/PointsHistoryCard'
import { InterestedProductsCard } from '@/features/userManagement/components/InterestedProductsCard'
import { LicenseDocumentsCard } from '@/features/userManagement/components/LicenseDocumentsCard'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { DetailsPageSkeleton } from '@/components/common/DetailsPageSkeleton/DetailsPageSkeleton'
import { useDealerDetail } from '@/features/userManagement/hooks/useDealerDetail'

export function DealerDetailsPage() {
  const { dealerId } = useParams<{ dealerId: string }>()
  const navigate = useNavigate()
  const { dealer, isLoading } = useDealerDetail(dealerId)
  const [, forceRerender] = useState(0)

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
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2.5 }}>
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
          <StorefrontIcon size={20} />
        </Box>
        <Box>
          <Typography variant="h1">{dealer.shopName}</Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {dealer.id} · Dealer
          </Typography>
        </Box>
      </Stack>

      <PartnerSummaryHeader
        partner={dealer}
        shopLabel="Business Name"
        onActivate={() => forceRerender((n) => n + 1)}
        onDeactivate={() => forceRerender((n) => n + 1)}
      />

      <PartnerDetailsFieldsCard partner={dealer} shopLabel="Business Name" />

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
