import { Grid } from '@mui/material'
import { ScanLine, Star, Gift, Package } from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import type { PartnerBase } from '@/types/partner'

interface PartnerStatisticsCardsProps {
  partner: PartnerBase
}

export function PartnerStatisticsCards({
  partner,
}: PartnerStatisticsCardsProps) {
  const totalScans = partner.totalScans ?? 0
  const pointsEarned = partner.pointsEarned ?? partner.availablePoints ?? 0
  const totalRedemption =
    partner.totalRedemption ?? partner.totalRedemptions ?? 0
  const interestedProductCount =
    partner.interestedProductCount ?? partner.interestedProducts?.length ?? 0

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard
          label="Total Scans"
          value={totalScans.toLocaleString('en-IN')}
          icon={<ScanLine size={20} />}
          iconColor="primary"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard
          label="Points Earned"
          value={pointsEarned.toLocaleString('en-IN')}
          icon={<Star size={20} />}
          iconColor="secondary"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard
          label="Total Redemptions"
          value={totalRedemption.toLocaleString('en-IN')}
          icon={<Gift size={20} />}
          iconColor="success"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard
          label="Interested Products"
          value={interestedProductCount.toLocaleString('en-IN')}
          icon={<Package size={20} />}
          iconColor="info"
        />
      </Grid>
    </Grid>
  )
}
