import { Grid } from '@mui/material'
import { ScanLine, Star, Gift, Package } from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import type { PartnerBase } from '@/types/partner'

interface PartnerStatisticsCardsProps {
  partner: PartnerBase
}

export function PartnerStatisticsCards({ partner }: PartnerStatisticsCardsProps) {
  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard label="Total Scans" value={partner.totalScans.toLocaleString('en-IN')} icon={<ScanLine size={20} />} iconColor="primary" />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard label="Points Earned" value={partner.availableCoins.toLocaleString('en-IN')} icon={<Star size={20} />} iconColor="secondary" />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard label="Total Redemptions" value={partner.totalRedemptions.toLocaleString('en-IN')} icon={<Gift size={20} />} iconColor="success" />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard label="Interested Products" value={partner.interestedProducts.length} icon={<Package size={20} />} iconColor="info" />
      </Grid>
    </Grid>
  )
}
