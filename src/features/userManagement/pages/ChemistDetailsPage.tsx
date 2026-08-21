import { useNavigate, useParams } from 'react-router-dom'
import { Box, Card, Grid, Skeleton, Stack } from '@mui/material'
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
import { ActiveSessionsCard } from '@/features/userManagement/components/ActiveSessionsCard'
import { useChemistDetail } from '@/features/userManagement/hooks/useChemistDetail'
import {
  useGetPartnerWalletBalanceQuery,
  useCreditPartnerWalletMutation,
} from '@/features/rewardsWallet/services/walletPartnersApi'
import { useToast } from '@/contexts/ToastContext'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function ChemistDetailsPage() {
  const { chemistId } = useParams<{ chemistId: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const { chemist, isLoading, activate, deactivate, remove, isUpdatingStatus, isDeleting } =
    useChemistDetail(chemistId)
  const { data: walletBalance } = useGetPartnerWalletBalanceQuery(chemistId ?? '', {
    skip: !chemistId,
  })
  const [creditWallet] = useCreditPartnerWalletMutation()

  if (!isLoading && !chemist) {
    return (
      <EmptyState
        title="Chemist not found"
        description="This chemist may have been removed."
        actionLabel="Back to Chemists"
        onAction={() => navigate('/partners/chemists')}
      />
    )
  }

  const handleAdjustPoints = async (
    type: 'credit' | 'debit',
    points: number,
    reason: string,
  ) => {
    if (!chemistId) return
    try {
      await creditWallet({
        partnerId: chemistId,
        points,
        note: reason,
        type,
      }).unwrap()
      toast.success(
        type === 'credit' ? 'Points added successfully.' : 'Points removed successfully.',
      )
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to adjust points.'))
    }
  }

  return (
    <Stack spacing={0}>
      {chemist ? (
        <>
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
                currentBalance={walletBalance?.totalPoints ?? chemist.availablePoints}
                onAdjust={handleAdjustPoints}
              />
            </Grid>
          </Grid>

          {chemistId && (
            <Box sx={{ mb: 3 }}>
              <ActiveSessionsCard userId={chemistId} />
            </Box>
          )}
        </>
      ) : (
        <>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{ justifyContent: 'space-between', alignItems: { md: 'center' }, mb: 2 }}
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
        <ScanHistoryCard partnerId={chemistId} />
        <PointsHistoryCard partnerId={chemistId} />
        <RedemptionHistoryCard partnerId={chemistId} />
        <InterestedProductsCard partnerId={chemistId} />
      </Stack>
    </Stack>
  )
}
