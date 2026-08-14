import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material'
import {
  Wallet as WalletIcon,
  ArrowLeft as ArrowBackOutlined,
  PlusCircle,
  MinusCircle,
  ExternalLink,
  Coins as Points,
  TrendingUp,
  TrendingDown,
  Clock3,
  MoreVertical,
} from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { StatCardSkeleton } from '@/components/common/StatCard/StatCardSkeleton'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { DetailsPageSkeleton } from '@/components/common/DetailsPageSkeleton/DetailsPageSkeleton'
import {
  WalletAdjustmentModal,
  type AdjustmentType,
} from '@/components/wallets/WalletAdjustmentModal'
import { ScanHistoryCard } from '@/features/userManagement/components/ScanHistoryCard'
import { PointsHistoryCard } from '@/features/userManagement/components/PointsHistoryCard'
import { RedemptionHistoryCard } from '@/features/userManagement/components/RedemptionHistoryCard'
import { InterestedProductsCard } from '@/features/userManagement/components/InterestedProductsCard'
import {
  useGetPartnerWalletDetailsQuery,
  useCreditPartnerWalletMutation,
} from '@/features/rewardsWallet/services/walletPartnersApi'
import { useToast } from '@/contexts/ToastContext'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

const statusConfig: Record<string, { label: string; color: 'success' | 'default' | 'error' }> = {
  ACTIVE: { label: 'Active', color: 'success' },
  INACTIVE: { label: 'Inactive', color: 'default' },
  SUSPENDED: { label: 'Suspended', color: 'error' },
}

export function WalletDetailsPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { walletId: partnerId } = useParams<{ walletId: string }>()
  const {
    data: details,
    isLoading,
    error,
  } = useGetPartnerWalletDetailsQuery(partnerId ?? '', { skip: !partnerId })
  const [creditWallet] = useCreditPartnerWalletMutation()
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType | null>(null)
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<HTMLElement | null>(null)

  if (isLoading) {
    return <DetailsPageSkeleton sections={4} />
  }

  if (!details || error) {
    return (
      <EmptyState
        title="Wallet not found"
        description="This wallet may have been removed."
        actionLabel="Back to Wallet Directory"
        onAction={() => navigate('/rewards-wallet/wallet-management')}
      />
    )
  }

  const currentBalance = details.currentWalletBalance

  async function handleAdjust(payload: { type: AdjustmentType; amount: number; reason: string }) {
    if (!partnerId) return
    try {
      await creditWallet({
        partnerId,
        points: payload.amount,
        note: payload.reason,
        type: payload.type === 'add' ? 'credit' : 'debit',
      }).unwrap()
      toast.success(
        payload.type === 'add' ? 'Points added successfully.' : 'Points deducted successfully.',
      )
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to adjust points.'))
    }
  }

  return (
    <>
      <Stack
        direction="row"
        sx={{
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
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
            <WalletIcon size={18} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="h1">{details.businessName}</Typography>
              <Chip
                size="small"
                label={statusConfig[details.status]?.label ?? details.status}
                color={statusConfig[details.status]?.color ?? 'default'}
              />
            </Stack>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {details.referenceId} · {details.userType}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Button
            variant="contained"
            color="success"
            startIcon={<PlusCircle size={18} />}
            onClick={() => setAdjustmentType('add')}
            sx={{ fontSize: '0.8125rem' }}
          >
            Add Points
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<MinusCircle size={18} />}
            onClick={() => setAdjustmentType('deduct')}
            sx={{ fontSize: '0.8125rem' }}
          >
            Deduct Points
          </Button>
          <Button
            variant="outlined"
            startIcon={<ArrowBackOutlined size={18} />}
            onClick={() => navigate('/rewards-wallet/wallet-management')}
            sx={{ fontSize: '0.8125rem' }}
          >
            Back
          </Button>
          <IconButton
            onClick={(e) => setMoreMenuAnchor(e.currentTarget)}
            sx={{ border: '1px solid', borderColor: 'divider' }}
            aria-label="More actions"
          >
            <MoreVertical size={18} />
          </IconButton>
          <Menu
            anchorEl={moreMenuAnchor}
            open={!!moreMenuAnchor}
            onClose={() => setMoreMenuAnchor(null)}
          >
            <MenuItem
              onClick={() => {
                setMoreMenuAnchor(null)
                navigate(
                  details.userType === 'Dealer'
                    ? `/partners/dealers/${details.partnerId}`
                    : `/partners/chemists/${details.partnerId}`,
                )
              }}
            >
              <ExternalLink size={18} style={{ marginRight: 12 }} />
              View {details.userType} Profile
            </MenuItem>
          </Menu>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Summary">
          <DetailFieldGrid
            fields={[
              { label: 'Business Name', value: details.businessName },
              { label: 'Owner Name', value: details.ownerName },
              { label: 'User Type', value: details.userType },
              { label: 'Mobile Number', value: details.mobileNumber },
              { label: 'Email Address', value: details.email },
              { label: 'Region', value: details.regionName },
              {
                label: 'Account Status',
                value: (
                  <Chip
                    size="small"
                    label={statusConfig[details.status]?.label ?? details.status}
                    color={statusConfig[details.status]?.color ?? 'default'}
                  />
                ),
              },
              {
                label: 'Current Wallet Balance',
                value: currentBalance.toLocaleString('en-IN'),
              },
              {
                label: 'Last Updated Date & Time',
                value: new Date(details.updatedAt).toLocaleString('en-IN'),
              },
            ]}
          />
        </SectionCard>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Current Wallet Balance"
              value={currentBalance.toLocaleString('en-IN')}
              icon={<Points size={20} />}
              iconColor="primary"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Lifetime Points Earned"
              value={details.lifetimePointsEarned.toLocaleString('en-IN')}
              icon={<TrendingUp size={20} />}
              iconColor="success"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Lifetime Points Redeemed"
              value={details.lifetimePointsRedeemed.toLocaleString('en-IN')}
              icon={<TrendingDown size={20} />}
              iconColor="secondary"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Pending Redemption Points"
              value={details.pendingRedemptionPoints.toLocaleString('en-IN')}
              icon={<Clock3 size={20} />}
              iconColor="info"
            />
          </Grid>
        </Grid>

        <PointsHistoryCard partnerId={partnerId} />
        <ScanHistoryCard partnerId={partnerId} />
        <RedemptionHistoryCard partnerId={partnerId} />
        <InterestedProductsCard partnerId={partnerId} />
      </Stack>

      <WalletAdjustmentModal
        open={adjustmentType !== null}
        onClose={() => setAdjustmentType(null)}
        currentBalance={currentBalance}
        defaultType={adjustmentType ?? 'add'}
        onConfirm={(payload) => {
          void handleAdjust(payload)
        }}
      />
    </>
  )
}
