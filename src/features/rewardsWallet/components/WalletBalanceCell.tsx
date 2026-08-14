import { Skeleton, Typography } from '@mui/material'
import { useGetPartnerWalletBalanceQuery } from '@/features/rewardsWallet/services/walletPartnersApi'

interface WalletBalanceCellProps {
  partnerId: string
  field: 'totalPoints' | 'totalPointsEarned' | 'totalPointsRedeemed'
}

export function WalletBalanceCell({ partnerId, field }: WalletBalanceCellProps) {
  const { data, isLoading } = useGetPartnerWalletBalanceQuery(partnerId)

  if (isLoading) return <Skeleton width={48} sx={{ display: 'inline-block' }} />

  return <Typography sx={{ fontSize: '0.8125rem' }}>{(data?.[field] ?? 0).toLocaleString('en-IN')}</Typography>
}
