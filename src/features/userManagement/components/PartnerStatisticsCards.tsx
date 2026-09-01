import { Grid } from '@mui/material'
import { ScanLine, Star, Wallet, Gift, Sparkles } from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { useGetPartnerWalletBalanceQuery } from '@/features/rewardsWallet/services/walletPartnersApi'
import type { PartnerBase } from '@/types/partner'

interface PartnerStatisticsCardsProps {
  partner: PartnerBase
  partnerId?: string
}

export function PartnerStatisticsCards({
  partner,
  partnerId,
}: PartnerStatisticsCardsProps) {
  const { data: walletBalance } = useGetPartnerWalletBalanceQuery(
    partnerId ?? '',
    {
      skip: !partnerId,
    },
  )

  const totalScans = partner.totalScans ?? 0
  const availableBalance =
    walletBalance?.totalPoints ?? partner.availablePoints ?? 0
  const totalPointsEarned =
    walletBalance?.totalPointsEarned ?? partner.pointsEarned ?? 0
  const generalPoints = walletBalance?.general ?? 0
  const seasonalPoints = walletBalance?.seasonalPoints ?? 0

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <StatCard
          label="Total Scans"
          value={totalScans.toLocaleString('en-IN')}
          icon={<ScanLine size={20} />}
          iconColor="primary"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <StatCard
          label="Available Balance"
          value={availableBalance.toLocaleString('en-IN')}
          icon={<Wallet size={20} />}
          iconColor="success"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <StatCard
          label="Total Points Earned"
          value={totalPointsEarned.toLocaleString('en-IN')}
          icon={<Star size={20} />}
          iconColor="secondary"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <StatCard
          label="General Points"
          value={generalPoints.toLocaleString('en-IN')}
          icon={<Gift size={20} />}
          iconColor="info"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
        <StatCard
          label="Seasonal Points"
          value={seasonalPoints.toLocaleString('en-IN')}
          icon={<Sparkles size={20} />}
          iconColor="warning"
        />
      </Grid>
    </Grid>
  )
}
