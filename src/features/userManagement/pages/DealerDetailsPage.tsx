import { Card, Grid, Skeleton, Stack, Typography } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'
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
import { useDealerDetail } from '@/features/userManagement/hooks/useDealerDetail'
import {
  useGetPartnerWalletBalanceQuery,
  useCreditPartnerWalletMutation,
} from '@/features/rewardsWallet/services/walletPartnersApi'
import { useToast } from '@/contexts/ToastContext'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

export function DealerDetailsPage() {
  const { dealerId } = useParams<{ dealerId: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const { dealer, isLoading, activate, deactivate, remove, isUpdatingStatus, isDeleting } =
    useDealerDetail(dealerId)
  const { data: walletBalance } = useGetPartnerWalletBalanceQuery(dealerId ?? '', {
    skip: !dealerId,
  })
  const [creditWallet] = useCreditPartnerWalletMutation()

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

  const handleAdjustPoints = async (
    type: 'credit' | 'debit',
    points: number,
    reason: string,
  ) => {
    if (!dealerId) return
    try {
      await creditWallet({
        partnerId: dealerId,
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
                currentBalance={walletBalance?.totalPoints ?? dealer.availablePoints}
                onAdjust={handleAdjustPoints}
              />
            </Grid>
          </Grid>
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
        <ScanHistoryCard partnerId={dealerId} />
        <PointsHistoryCard partnerId={dealerId} />
        <RedemptionHistoryCard partnerId={dealerId} />
        <InterestedProductsCard partnerId={dealerId} />
      </Stack>
    </Stack>
  )
}
