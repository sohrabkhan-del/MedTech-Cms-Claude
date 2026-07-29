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
  Download,
  ExternalLink,
  Coins as Points,
  TrendingUp,
  TrendingDown,
  Clock3,
  ScanLine,
  Sparkles,
  Users2,
  Megaphone,
  UserPlus,
  MoreVertical,
} from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { StatCardSkeleton } from '@/components/common/StatCard/StatCardSkeleton'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { DetailsPageSkeleton } from '@/components/common/DetailsPageSkeleton/DetailsPageSkeleton'
import {
  WalletAdjustmentModal,
  type AdjustmentType,
} from '@/components/wallets/WalletAdjustmentModal'
import { useWalletDetail } from '@/features/rewardsWallet/hooks/useWalletDetail'
import type {
  RecentRewardActivity,
  TransactionStatus,
  WalletStatus,
  WalletTransaction,
} from '@/features/rewardsWallet/types/rewardsWallet.types'

const statusConfig: Record<
  WalletStatus,
  { label: string; color: 'success' | 'default' | 'error' }
> = {
  active: { label: 'Active', color: 'success' },
  inactive: { label: 'Inactive', color: 'default' },
  suspended: { label: 'Suspended', color: 'error' },
}

const txnStatusConfig: Record<
  TransactionStatus,
  { label: string; color: 'success' | 'warning' | 'error' }
> = {
  completed: { label: 'Completed', color: 'success' },
  pending: { label: 'Pending', color: 'warning' },
  reversed: { label: 'Reversed', color: 'error' },
}

const activityStatusConfig: Record<
  RecentRewardActivity['status'],
  { label: string; color: 'success' | 'warning' | 'error' }
> = {
  credited: { label: 'Credited', color: 'success' },
  pending: { label: 'Pending', color: 'warning' },
  failed: { label: 'Failed', color: 'error' },
}

const transactionColumns: CommonTableColumn<WalletTransaction>[] = [
  {
    key: 'id',
    header: 'Transaction ID',
    minWidth: 130,
    render: (row) => row.id,
  },
  {
    key: 'transactionDate',
    header: 'Transaction Date',
    minWidth: 140,
    sortable: true,
    render: (row) => row.transactionDate,
  },
  {
    key: 'transactionType',
    header: 'Transaction Type',
    minWidth: 110,
    render: (row) => (
      <Chip
        size="small"
        label={row.transactionType === 'credit' ? 'Credit' : 'Debit'}
        color={row.transactionType === 'credit' ? 'success' : 'error'}
      />
    ),
  },
  {
    key: 'previousBalance',
    header: 'Previous Balance',
    align: 'center',
    render: (row) => row.previousBalance.toLocaleString('en-IN'),
  },
  {
    key: 'PointsAdjusted',
    header: 'Points Adjusted',
    align: 'center',
    render: (row) =>
      `${row.PointsAdjusted > 0 ? '+' : ''}${row.PointsAdjusted.toLocaleString('en-IN')}`,
  },
  {
    key: 'updatedBalance',
    header: 'Updated Balance',
    align: 'center',
    render: (row) => row.updatedBalance.toLocaleString('en-IN'),
  },
  {
    key: 'transactionSource',
    header: 'Transaction Source',
    minWidth: 150,
    render: (row) => row.transactionSource,
  },
  {
    key: 'reason',
    header: 'Reason',
    minWidth: 170,
    render: (row) => row.reason,
  },
  {
    key: 'performedBy',
    header: 'Performed By',
    minWidth: 120,
    render: (row) => row.performedBy,
  },
  {
    key: 'status',
    header: 'Status',
    minWidth: 100,
    render: (row) => (
      <Chip
        size="small"
        label={txnStatusConfig[row.status].label}
        color={txnStatusConfig[row.status].color}
      />
    ),
  },
]

const activityColumns: CommonTableColumn<RecentRewardActivity>[] = [
  { key: 'date', header: 'Date', sortable: true, render: (row) => row.date },
  {
    key: 'productName',
    header: 'Product Name',
    minWidth: 170,
    render: (row) => row.productName,
  },
  {
    key: 'scanCode',
    header: 'Scan Code',
    minWidth: 130,
    render: (row) => row.scanCode,
  },
  {
    key: 'dealer',
    header: 'Dealer',
    minWidth: 150,
    render: (row) => row.dealer,
  },
  {
    key: 'chemist',
    header: 'Chemist',
    minWidth: 150,
    render: (row) => row.chemist,
  },
  {
    key: 'PointsEarned',
    header: 'Points Earned',
    align: 'center',
    render: (row) => row.PointsEarned,
  },
  {
    key: 'appliedScheme',
    header: 'Applied Scheme',
    minWidth: 170,
    render: (row) => row.appliedScheme,
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <Chip
        size="small"
        label={activityStatusConfig[row.status].label}
        color={activityStatusConfig[row.status].color}
      />
    ),
  },
]

export function WalletDetailsPage() {
  const navigate = useNavigate()
  const { walletId } = useParams<{ walletId: string }>()
  const { wallet, adjustBalance, exportStatement, isLoading } =
    useWalletDetail(walletId)
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType | null>(
    null,
  )
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<HTMLElement | null>(null)

  if (isLoading) {
    return <DetailsPageSkeleton sections={4} />
  }

  if (!wallet) {
    return (
      <EmptyState
        title="Wallet not found"
        description="This wallet may have been removed."
        actionLabel="Back to Wallet Directory"
        onAction={() => navigate('/rewards-wallet/wallet-management')}
      />
    )
  }

  const currentBalance = wallet.availableBalance

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
              <Typography variant="h1">{wallet.userName}</Typography>
              <Chip
                size="small"
                label={statusConfig[wallet.status].label}
                color={statusConfig[wallet.status].color}
              />
            </Stack>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {wallet.id} · {wallet.userType}
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
                void exportStatement()
              }}
            >
              <Download size={18} style={{ marginRight: 12 }} />
              Export Wallet Statement
            </MenuItem>
            <MenuItem
              onClick={() => {
                setMoreMenuAnchor(null)
                navigate(
                  wallet.userType === 'Dealer'
                    ? `/partners/dealers/${wallet.userId}`
                    : `/partners/chemists/${wallet.userId}`,
                )
              }}
            >
              <ExternalLink size={18} style={{ marginRight: 12 }} />
              View {wallet.userType} Profile
            </MenuItem>
          </Menu>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Summary">
          <DetailFieldGrid
            fields={[
              { label: 'Business Name', value: wallet.userName },
              { label: 'User Type', value: wallet.userType },
              { label: 'Mobile Number', value: wallet.mobileNumber },
              { label: 'Email Address', value: wallet.email },
              { label: 'Region', value: wallet.region },
              { label: 'Registration Date', value: wallet.registrationDate },
              {
                label: 'Account Status',
                value: (
                  <Chip
                    size="small"
                    label={statusConfig[wallet.status].label}
                    color={statusConfig[wallet.status].color}
                  />
                ),
              },
              {
                label: 'Current Wallet Balance',
                value: currentBalance.toLocaleString('en-IN'),
              },
              { label: 'Last Updated Date & Time', value: wallet.lastUpdated },
            ]}
          />
        </SectionCard>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            {isLoading ? (
              <StatCardSkeleton />
            ) : (
              <StatCard
                label="Current Wallet Balance"
                value={currentBalance.toLocaleString('en-IN')}
                icon={<Points size={20} />}
                iconColor="primary"
              />
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            {isLoading ? (
              <StatCardSkeleton />
            ) : (
              <StatCard
                label="Lifetime Points Earned"
                value={wallet.lifetimeEarned.toLocaleString('en-IN')}
                icon={<TrendingUp size={20} />}
                iconColor="success"
              />
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            {isLoading ? (
              <StatCardSkeleton />
            ) : (
              <StatCard
                label="Lifetime Points Redeemed"
                value={wallet.lifetimeRedeemed.toLocaleString('en-IN')}
                icon={<TrendingDown size={20} />}
                iconColor="secondary"
              />
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            {isLoading ? (
              <StatCardSkeleton />
            ) : (
              <StatCard
                label="Pending Redemption Points"
                value={wallet.pendingRedemptionPoints.toLocaleString('en-IN')}
                icon={<Clock3 size={20} />}
                iconColor="info"
              />
            )}
          </Grid>
        </Grid>

        <SectionCard title="Wallet Transaction History">
          <CommonTable
            tableKey="wallet-transaction-history"
            columns={transactionColumns}
            rows={wallet.transactions}
            getRowId={(row) => row.id}
            loading={isLoading}
            searchPlaceholder="Search transactions…"
            searchKeys={(row) =>
              `${row.id} ${row.reason} ${row.referenceNumber}`
            }
            defaultSortBy="transactionDate"
            defaultSortDir="desc"
            emptyTitle="No transactions yet"
          />
        </SectionCard>

        <SectionCard title="Earned Points Breakdown">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
              {isLoading ? (
                <StatCardSkeleton />
              ) : (
                <StatCard
                  label="Product Scans"
                  value={wallet.earnedPointsBreakdown.productScans.toLocaleString(
                    'en-IN',
                  )}
                  icon={<ScanLine size={20} />}
                  iconColor="primary"
                />
              )}
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
              {isLoading ? (
                <StatCardSkeleton />
              ) : (
                <StatCard
                  label="Active Schemes"
                  value={wallet.earnedPointsBreakdown.activeSchemes.toLocaleString(
                    'en-IN',
                  )}
                  icon={<Sparkles size={20} />}
                  iconColor="secondary"
                />
              )}
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
              {isLoading ? (
                <StatCardSkeleton />
              ) : (
                <StatCard
                  label="Referral Program"
                  value={wallet.earnedPointsBreakdown.referralProgram.toLocaleString(
                    'en-IN',
                  )}
                  icon={<UserPlus size={20} />}
                  iconColor="info"
                />
              )}
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
              {isLoading ? (
                <StatCardSkeleton />
              ) : (
                <StatCard
                  label="Promotional Campaigns"
                  value={wallet.earnedPointsBreakdown.promotionalCampaigns.toLocaleString(
                    'en-IN',
                  )}
                  icon={<Megaphone size={20} />}
                  iconColor="warning"
                />
              )}
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
              {isLoading ? (
                <StatCardSkeleton />
              ) : (
                <StatCard
                  label="Manual Credits"
                  value={wallet.earnedPointsBreakdown.manualCredits.toLocaleString(
                    'en-IN',
                  )}
                  icon={<Users2 size={20} />}
                  iconColor="success"
                />
              )}
            </Grid>
          </Grid>
        </SectionCard>

        <SectionCard title="Recent Reward Activity">
          <CommonTable
            tableKey="wallet-recent-activity"
            columns={activityColumns}
            rows={wallet.recentActivity}
            getRowId={(row) => row.id}
            loading={isLoading}
            searchPlaceholder="Search recent activity…"
            searchKeys={(row) => `${row.productName} ${row.scanCode}`}
            defaultSortBy="date"
            defaultSortDir="desc"
            emptyTitle="No recent activity"
          />
        </SectionCard>
      </Stack>

      <WalletAdjustmentModal
        open={adjustmentType !== null}
        onClose={() => setAdjustmentType(null)}
        currentBalance={currentBalance}
        defaultType={adjustmentType ?? 'add'}
        onConfirm={(payload) => {
          void adjustBalance(payload.type, payload.amount, currentBalance)
        }}
      />
    </>
  )
}
