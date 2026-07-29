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
  Redo2,
  ArrowLeft as ArrowBackOutlined,
  CircleCheck,
  XCircle,
  Clock3,
  PackageCheck,
  Truck,
  Home,
  Ban,
  ExternalLink,
  Wallet as WalletIcon,
  MoreVertical,
  ChevronDown,
} from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { StatCardSkeleton } from '@/components/common/StatCard/StatCardSkeleton'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { DetailsPageSkeleton } from '@/components/common/DetailsPageSkeleton/DetailsPageSkeleton'
import { useRedemptionDetail } from '@/features/rewardsWallet/hooks/useRedemptionDetail'
import type {
  RedemptionDeliveryStatus,
  RedemptionStatus,
} from '@/features/rewardsWallet/types/rewardsWallet.types'

const statusConfig: Record<
  RedemptionStatus,
  { label: string; color: 'warning' | 'info' | 'error' | 'success' }
> = {
  pending: { label: 'Pending', color: 'warning' },
  approved: { label: 'Approved', color: 'info' },
  rejected: { label: 'Rejected', color: 'error' },
  completed: { label: 'Completed', color: 'success' },
}

const deliveryStatusConfig: Record<
  RedemptionDeliveryStatus,
  {
    label: string
    color: 'default' | 'info' | 'warning' | 'success' | 'error'
    icon: typeof Truck
  }
> = {
  pending: { label: 'Pending', color: 'default', icon: Clock3 },
  packed: { label: 'Packed', color: 'info', icon: PackageCheck },
  shipped: { label: 'Shipped', color: 'info', icon: Truck },
  delivered: { label: 'Delivered', color: 'success', icon: Home },
  cancelled: { label: 'Cancelled', color: 'error', icon: Ban },
}

export function RedemptionDetailsPage() {
  const navigate = useNavigate()
  const { requestId } = useParams<{ requestId: string }>()
  const { request, setStatus, setDeliveryStatus, isLoading } =
    useRedemptionDetail(requestId)
  const [deliveryMenuAnchor, setDeliveryMenuAnchor] =
    useState<HTMLElement | null>(null)
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<HTMLElement | null>(null)

  if (isLoading) {
    return <DetailsPageSkeleton sections={4} />
  }

  if (!request) {
    return (
      <EmptyState
        title="Redemption request not found"
        description="This redemption request may have been removed."
        actionLabel="Back to Redemption Requests"
        onAction={() => navigate('/rewards-wallet/reward-redemptions')}
      />
    )
  }

  const currentStatus = request.redemptionStatus
  const currentDelivery = request.deliveryStatus

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
            <Redo2 size={18} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="h1">{request.rewardItem}</Typography>
              <Chip
                size="small"
                label={statusConfig[currentStatus].label}
                color={statusConfig[currentStatus].color}
              />
            </Stack>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {request.id} · {request.userName}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          {currentStatus === 'pending' && (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={<CircleCheck size={18} />}
                onClick={() => void setStatus('approved')}
                sx={{ fontSize: '0.8125rem' }}
              >
                Approve
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<XCircle size={18} />}
                onClick={() => void setStatus('rejected')}
                sx={{ fontSize: '0.8125rem' }}
              >
                Reject
              </Button>
            </>
          )}
          <Button
            variant="outlined"
            endIcon={<ChevronDown size={16} />}
            onClick={(e) => setDeliveryMenuAnchor(e.currentTarget)}
            sx={{ fontSize: '0.8125rem' }}
          >
            Delivery Status
          </Button>
          <Menu
            anchorEl={deliveryMenuAnchor}
            open={!!deliveryMenuAnchor}
            onClose={() => setDeliveryMenuAnchor(null)}
          >
            <MenuItem
              onClick={() => {
                void setDeliveryStatus('packed')
                setDeliveryMenuAnchor(null)
              }}
            >
              <PackageCheck size={18} style={{ marginRight: 12 }} />
              Mark as Packed
            </MenuItem>
            <MenuItem
              onClick={() => {
                void setDeliveryStatus('shipped')
                setDeliveryMenuAnchor(null)
              }}
            >
              <Truck size={18} style={{ marginRight: 12 }} />
              Mark as Shipped
            </MenuItem>
            <MenuItem
              onClick={() => {
                void setDeliveryStatus('delivered')
                setDeliveryMenuAnchor(null)
              }}
            >
              <Home size={18} style={{ marginRight: 12 }} />
              Mark as Delivered
            </MenuItem>
            <MenuItem
              onClick={() => {
                void setDeliveryStatus('cancelled')
                setDeliveryMenuAnchor(null)
              }}
              sx={{ color: 'error.main' }}
            >
              <Ban size={18} style={{ marginRight: 12 }} />
              Cancel
            </MenuItem>
          </Menu>
          <Button
            variant="outlined"
            startIcon={<ArrowBackOutlined size={18} />}
            onClick={() => navigate('/rewards-wallet/reward-redemptions')}
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
                navigate('/rewards-wallet/wallet-management')
              }}
            >
              <WalletIcon size={18} style={{ marginRight: 12 }} />
              View Wallet
            </MenuItem>
            <MenuItem
              onClick={() => {
                setMoreMenuAnchor(null)
                navigate(
                  request.userType === 'Dealer'
                    ? `/partners/dealers/${request.userId}`
                    : `/partners/chemists/${request.userId}`,
                )
              }}
            >
              <ExternalLink size={18} style={{ marginRight: 12 }} />
              View {request.userType} Profile
            </MenuItem>
          </Menu>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Summary">
          <DetailFieldGrid
            fields={[
              { label: 'Request ID', value: request.id },
              { label: 'Business Name', value: request.userName },
              { label: 'User Type', value: request.userType },
              { label: 'Mobile Number', value: request.mobileNumber },
              { label: 'Reward Item', value: request.rewardItem },
              { label: 'Reward Category', value: request.rewardCategory },
              {
                label: 'Points Used',
                value: request.PointsUsed.toLocaleString('en-IN'),
              },
              {
                label: 'Current Wallet Balance',
                value: request.currentWalletBalance.toLocaleString('en-IN'),
              },
              { label: 'Request Date', value: request.requestDate },
              {
                label: 'Redemption Status',
                value: (
                  <Chip
                    size="small"
                    label={statusConfig[currentStatus].label}
                    color={statusConfig[currentStatus].color}
                  />
                ),
              },
            ]}
          />
        </SectionCard>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            {isLoading ? (
              <StatCardSkeleton />
            ) : (
              <StatCard
                label="Points Redeemed"
                value={request.PointsUsed.toLocaleString('en-IN')}
                icon={<Redo2 size={20} />}
                iconColor="primary"
              />
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            {isLoading ? (
              <StatCardSkeleton />
            ) : (
              <StatCard
                label="Wallet Balance After Redemption"
                value={request.walletBalanceAfterRedemption.toLocaleString(
                  'en-IN',
                )}
                icon={<WalletIcon size={20} />}
                iconColor="secondary"
              />
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            {isLoading ? (
              <StatCardSkeleton />
            ) : (
              <StatCard
                label="Approval Status"
                value={statusConfig[currentStatus].label}
                icon={
                  currentStatus === 'rejected' ? (
                    <XCircle size={20} />
                  ) : (
                    <CircleCheck size={20} />
                  )
                }
                iconColor={
                  currentStatus === 'rejected'
                    ? 'error'
                    : currentStatus === 'pending'
                      ? 'warning'
                      : 'success'
                }
              />
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            {isLoading ? (
              <StatCardSkeleton />
            ) : (
              <StatCard
                label="Delivery Status"
                value={deliveryStatusConfig[currentDelivery].label}
                icon={(() => {
                  const DeliveryIcon = deliveryStatusConfig[currentDelivery].icon
                  return <DeliveryIcon size={20} />
                })()}
                iconColor={
                  deliveryStatusConfig[currentDelivery].color === 'default'
                    ? 'secondary'
                    : deliveryStatusConfig[currentDelivery].color
                }
              />
            )}
          </Grid>
        </Grid>

        <SectionCard title="Redemption Information">
          <DetailFieldGrid
            fields={[
              { label: 'Expected Delivery Date', value: request.expectedDeliveryDate },
              {
                label: 'Delivery Status',
                value: (
                  <Chip
                    size="small"
                    label={deliveryStatusConfig[currentDelivery].label}
                    color={deliveryStatusConfig[currentDelivery].color}
                  />
                ),
              },
              { label: 'Approved By', value: request.approvedBy ?? '—' },
            ]}
          />
        </SectionCard>

        <SectionCard title="Wallet Transaction Details">
          <DetailFieldGrid
            fields={[
              { label: 'Transaction ID', value: request.transactionId },
              {
                label: 'Points Redeemed',
                value: request.PointsUsed.toLocaleString('en-IN'),
              },
              { label: 'Transaction Date', value: request.transactionDate },
              {
                label: 'Transaction Status',
                value:
                  request.transactionStatus.charAt(0).toUpperCase() +
                  request.transactionStatus.slice(1),
              },
            ]}
          />
        </SectionCard>

        <SectionCard title="Internal Notes">
          <Typography
            sx={{
              fontSize: '0.8125rem',
              color: 'text.secondary',
              lineHeight: 1.6,
            }}
          >
            {request.internalNotes}
          </Typography>
        </SectionCard>
      </Stack>
    </>
  )
}
