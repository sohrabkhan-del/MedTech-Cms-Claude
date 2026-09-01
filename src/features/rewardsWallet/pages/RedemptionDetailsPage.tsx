import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
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
  Wallet as WalletIcon,
  MoreVertical,
  ChevronDown,
} from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { StatCardSkeleton } from '@/components/common/StatCard/StatCardSkeleton'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { useToast } from '@/contexts/ToastContext'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import {
  useGetRewardClaimDetailQuery,
  useApproveRewardClaimMutation,
  useRejectRewardClaimMutation,
  useSetRewardClaimDeliveryStatusMutation,
} from '@/features/rewardsWallet/services/rewardClaimsApi'
import type { RewardClaimDeliveryStatus } from '@/features/rewardsWallet/services/rewardClaimsApi'

const statusColorConfig: Record<
  string,
  'warning' | 'info' | 'error' | 'success'
> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
}

function getStatusColor(status: string) {
  return statusColorConfig[status.toUpperCase()] ?? 'info'
}

const deliveryStatusConfig: Record<
  RewardClaimDeliveryStatus,
  {
    label: string
    color: 'default' | 'info' | 'warning' | 'success' | 'error'
    icon: typeof Truck
  }
> = {
  PENDING: { label: 'Pending', color: 'default', icon: Clock3 },
  PACKED: { label: 'Packed', color: 'info', icon: PackageCheck },
  SHIPPED: { label: 'Shipped', color: 'info', icon: Truck },
  DELIVERED: { label: 'Delivered', color: 'success', icon: Home },
  CANCELLED: { label: 'Cancelled', color: 'error', icon: Ban },
}

export function RedemptionDetailsPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { requestId } = useParams<{ requestId: string }>()
  const {
    data: request,
    isFetching: isLoading,
    refetch: refetchDetail,
  } = useGetRewardClaimDetailQuery(requestId ?? '', { skip: !requestId })
  const [approveMutation, { isLoading: isApproving }] =
    useApproveRewardClaimMutation()
  const [rejectMutation, { isLoading: isRejecting }] =
    useRejectRewardClaimMutation()
  const [setDeliveryStatusMutation] = useSetRewardClaimDeliveryStatusMutation()
  const [deliveryMenuAnchor, setDeliveryMenuAnchor] =
    useState<HTMLElement | null>(null)
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<HTMLElement | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [reviewNote, setReviewNote] = useState('')
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REJECT' | null>(
    null,
  )
  const [optimisticApprovalStatus, setOptimisticApprovalStatus] = useState<
    string | null
  >(null)

  // clear optimistic state once the backend reflects the change
  useEffect(() => {
    if (
      optimisticApprovalStatus &&
      request?.approvalStatus === optimisticApprovalStatus
    ) {
      const t = setTimeout(() => setOptimisticApprovalStatus(null), 250)
      return () => clearTimeout(t)
    }
    return
  }, [request?.approvalStatus, optimisticApprovalStatus])

  if (!isLoading && !request) {
    return (
      <EmptyState
        title="Redemption request not found"
        description="This redemption request may have been removed."
        actionLabel="Back to Redemption Requests"
        onAction={() => navigate('/rewards-wallet/reward-redemptions')}
      />
    )
  }

  async function handleReview(action: 'APPROVE' | 'REJECT') {
    setReviewAction(action)
    setReviewNote('')
    setReviewDialogOpen(true)
  }

  async function submitReview() {
    if (!requestId || !reviewAction) return
    setReviewDialogOpen(false)
    try {
      if (reviewAction === 'APPROVE') {
        await approveMutation({ id: requestId, note: reviewNote }).unwrap()
      } else {
        await rejectMutation({ id: requestId, note: reviewNote }).unwrap()
      }
      // set optimistic state immediately so UI updates without flicker
      const optimistic = reviewAction === 'APPROVE' ? 'APPROVED' : 'REJECTED'
      setOptimisticApprovalStatus(optimistic)
      await refetchDetail()
      toast.success(
        `Redemption request ${reviewAction === 'APPROVE' ? 'approved' : 'rejected'} successfully.`,
      )
    } catch (err) {
      toast.error(
        getApiErrorMessage(err, 'Failed to update redemption request.'),
      )
    }
  }

  async function handleDeliveryChange(
    deliveryStatus: RewardClaimDeliveryStatus,
  ) {
    if (!requestId) return
    setDeliveryMenuAnchor(null)
    try {
      await setDeliveryStatusMutation({
        id: requestId,
        deliveryStatus,
      }).unwrap()
      await refetchDetail()
      toast.success(
        `Delivery status updated to ${deliveryStatusConfig[deliveryStatus].label}.`,
      )
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update delivery status.'))
    }
  }

  const currentApprovalStatus =
    optimisticApprovalStatus ?? request?.approvalStatus
  const currentDelivery = request?.deliveryStatus

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
            {request ? (
              <>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center' }}
                >
                  <Typography variant="h1">
                    {request.rewardItem ?? '-'}
                  </Typography>
                  <Chip
                    size="small"
                    label={request.approvalStatus}
                    color={getStatusColor(request.approvalStatus)}
                  />
                </Stack>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  {request.requestId} · {request.businessName ?? '-'}
                </Typography>
              </>
            ) : (
              <>
                <Skeleton variant="text" width={220} height={36} />
                <Skeleton variant="text" width={160} height={24} />
              </>
            )}
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <>
            <Button
              variant="contained"
              color="success"
              startIcon={<CircleCheck size={18} />}
              onClick={() => {
                if (currentApprovalStatus?.toUpperCase() === 'PENDING') {
                  void handleReview('APPROVE')
                }
              }}
              disabled={
                currentApprovalStatus?.toUpperCase() !== 'PENDING' ||
                isApproving ||
                isRejecting
              }
              sx={{ fontSize: '0.8125rem' }}
            >
              Approve
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<XCircle size={18} />}
              onClick={() => {
                if (currentApprovalStatus?.toUpperCase() === 'PENDING') {
                  void handleReview('REJECT')
                }
              }}
              disabled={
                currentApprovalStatus?.toUpperCase() !== 'PENDING' ||
                isApproving ||
                isRejecting
              }
              sx={{ fontSize: '0.8125rem' }}
            >
              Reject
            </Button>
          </>
          <Button
            variant="outlined"
            endIcon={<ChevronDown size={16} />}
            onClick={(e) => setDeliveryMenuAnchor(e.currentTarget)}
            disabled={!request}
            sx={{ fontSize: '0.8125rem' }}
          >
            Delivery Status
          </Button>
          <Menu
            anchorEl={deliveryMenuAnchor}
            open={!!deliveryMenuAnchor}
            onClose={() => setDeliveryMenuAnchor(null)}
          >
            <MenuItem onClick={() => void handleDeliveryChange('PACKED')}>
              <PackageCheck size={18} style={{ marginRight: 12 }} />
              Mark as Packed
            </MenuItem>
            <MenuItem onClick={() => void handleDeliveryChange('SHIPPED')}>
              <Truck size={18} style={{ marginRight: 12 }} />
              Mark as Shipped
            </MenuItem>
            <MenuItem onClick={() => void handleDeliveryChange('DELIVERED')}>
              <Home size={18} style={{ marginRight: 12 }} />
              Mark as Delivered
            </MenuItem>
            <MenuItem
              onClick={() => void handleDeliveryChange('CANCELLED')}
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
            disabled={!request}
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
          </Menu>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Summary">
          {request ? (
            <DetailFieldGrid
              fields={[
                { label: 'Request ID', value: request.requestId },
                { label: 'Business Name', value: request.businessName ?? '-' },
                { label: 'User Type', value: request.userType ?? '-' },
                { label: 'Mobile Number', value: request.mobileNumber ?? '-' },
                { label: 'Reward Item', value: request.rewardItem ?? '-' },
                {
                  label: 'Reward Category',
                  value: request.rewardCategory ?? '-',
                },
                {
                  label: 'Points Used',
                  value: request.pointsUsed.toLocaleString('en-IN'),
                },
                {
                  label: 'Current Wallet Balance',
                  value: (request.currentWalletBalance ?? 0).toLocaleString(
                    'en-IN',
                  ),
                },
                {
                  label: 'Request Date',
                  value: new Date(request.requestDate).toLocaleString('en-IN'),
                },
                {
                  label: 'Redemption Status',
                  value: (
                    <Chip
                      size="small"
                      label={request.redemptionStatus}
                      color={getStatusColor(request.redemptionStatus)}
                    />
                  ),
                },
              ]}
            />
          ) : (
            <Grid container spacing={2}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
                  <Skeleton variant="text" width="60%" height={16} />
                  <Skeleton variant="rounded" width="90%" height={24} />
                </Grid>
              ))}
            </Grid>
          )}
        </SectionCard>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            {isLoading ? (
              <StatCardSkeleton />
            ) : (
              <StatCard
                label="Points Redeemed"
                value={(request?.pointsRedeemed ?? 0).toLocaleString('en-IN')}
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
                value={(
                  request?.walletBalanceAfterRedemption ?? 0
                ).toLocaleString('en-IN')}
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
                value={currentApprovalStatus ?? '-'}
                icon={
                  currentApprovalStatus?.toUpperCase() === 'REJECTED' ? (
                    <XCircle size={20} />
                  ) : (
                    <CircleCheck size={20} />
                  )
                }
                iconColor={
                  currentApprovalStatus?.toUpperCase() === 'REJECTED'
                    ? 'error'
                    : currentApprovalStatus?.toUpperCase() === 'PENDING'
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
                value={
                  currentDelivery
                    ? deliveryStatusConfig[currentDelivery].label
                    : '-'
                }
                icon={(() => {
                  const DeliveryIcon = currentDelivery
                    ? deliveryStatusConfig[currentDelivery].icon
                    : Clock3
                  return <DeliveryIcon size={20} />
                })()}
                iconColor={
                  !currentDelivery ||
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
              {
                label: 'Delivery Status',
                value: currentDelivery ? (
                  <Chip
                    size="small"
                    label={deliveryStatusConfig[currentDelivery].label}
                    color={deliveryStatusConfig[currentDelivery].color}
                  />
                ) : (
                  '-'
                ),
              },
              { label: 'Approved By', value: request?.approvedBy?.name ?? '—' },
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
            {request?.internalNotes || '-'}
          </Typography>
        </SectionCard>
      </Stack>

      <Dialog
        open={reviewDialogOpen}
        onClose={() => setReviewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <Box>
          <DialogTitle>
            {reviewAction === 'APPROVE'
              ? 'Approve Redemption Request'
              : 'Reject Redemption Request'}
          </DialogTitle>
        </Box>

        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Note"
            placeholder="e.g., right you get ball pen"
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color={reviewAction === 'APPROVE' ? 'success' : 'error'}
            onClick={() => void submitReview()}
            disabled={isApproving || isRejecting}
            startIcon={
              isApproving || isRejecting ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
          >
            {reviewAction === 'APPROVE' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
