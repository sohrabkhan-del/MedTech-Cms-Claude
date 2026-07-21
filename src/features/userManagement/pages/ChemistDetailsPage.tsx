import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Grid, Stack, Typography } from '@mui/material'
import { Pill as LocalPharmacyIcon } from 'lucide-react'
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
import { getChemistById } from '@/features/userManagement/mockChemists'

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
          <LocalPharmacyIcon size={20} />
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
