import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Grid, Stack, Typography } from '@mui/material'
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy'
import { PartnerSummaryHeader } from '@/features/partners/components/PartnerSummaryHeader'
import { PartnerDetailsFieldsCard } from '@/features/partners/components/PartnerDetailsFieldsCard'
import { PartnerStatisticsCards } from '@/features/partners/components/PartnerStatisticsCards'
import { RegisteredAddressCard } from '@/features/partners/components/RegisteredAddressCard'
import { GeoLockCard } from '@/features/partners/components/GeoLockCard'
import { PointsManagementCard } from '@/features/partners/components/PointsManagementCard'
import { ScanHistoryCard } from '@/features/partners/components/ScanHistoryCard'
import { PointsHistoryCard } from '@/features/partners/components/PointsHistoryCard'
import { InterestedProductsCard } from '@/features/partners/components/InterestedProductsCard'
import { LicenseDocumentsCard } from '@/features/partners/components/LicenseDocumentsCard'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { getChemistById } from '@/features/chemists/mockChemists'

export function ChemistDetailsPage() {
  const { chemistId } = useParams<{ chemistId: string }>()
  const navigate = useNavigate()
  const chemist = getChemistById(chemistId ?? '')
  const [, forceRerender] = useState(0)

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
          <LocalPharmacyIcon fontSize="small" />
        </Box>
        <Box>
          <Typography variant="h1">{chemist.shopName}</Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {chemist.id} · Chemist
          </Typography>
        </Box>
      </Stack>

      <PartnerSummaryHeader
        partner={chemist}
        shopLabel="Chemist Shop Name"
        onActivate={() => forceRerender((n) => n + 1)}
        onDeactivate={() => forceRerender((n) => n + 1)}
      />

      <PartnerDetailsFieldsCard partner={chemist} shopLabel="Chemist Shop Name" showGeoLockStatus />

      <PartnerStatisticsCards partner={chemist} />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <RegisteredAddressCard address={chemist.registeredAddress} geoLock={chemist.geoLock} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <GeoLockCard geoLock={chemist.geoLock} />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={12}>
          <PointsManagementCard currentBalance={chemist.availableCoins} onAdjust={handleAdjustPoints} />
        </Grid>
      </Grid>

      <Stack spacing={3}>
        <ScanHistoryCard entries={chemist.scanHistory} />
        <PointsHistoryCard entries={chemist.pointsHistory} />
        <InterestedProductsCard entries={chemist.interestedProducts} />
        <LicenseDocumentsCard documents={chemist.documents} />
      </Stack>
    </Stack>
  )
}
