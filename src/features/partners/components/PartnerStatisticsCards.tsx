import { Grid } from '@mui/material'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import StarOutlineIcon from '@mui/icons-material/StarOutlined'
import RedeemOutlinedIcon from '@mui/icons-material/RedeemOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import { StatCard } from '@/components/common/StatCard/StatCard'
import type { PartnerBase } from '@/types/partner'

interface PartnerStatisticsCardsProps {
  partner: PartnerBase
}

export function PartnerStatisticsCards({ partner }: PartnerStatisticsCardsProps) {
  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard label="Total Scans" value={partner.totalScans.toLocaleString('en-IN')} icon={<QrCodeScannerIcon fontSize="small" />} iconColor="primary" />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard label="Loyalty Points" value={partner.availableCoins.toLocaleString('en-IN')} icon={<StarOutlineIcon fontSize="small" />} iconColor="secondary" />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard label="Total Redemptions" value={partner.totalRedemptions.toLocaleString('en-IN')} icon={<RedeemOutlinedIcon fontSize="small" />} iconColor="success" />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard label="Interested Products" value={partner.interestedProducts.length} icon={<Inventory2OutlinedIcon fontSize="small" />} iconColor="info" />
      </Grid>
    </Grid>
  )
}
