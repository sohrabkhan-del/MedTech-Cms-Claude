import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Chip, Grid, IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material'
import {
  Wallet as WalletIcon,
  ArrowLeft as ArrowBackOutlined,
  PlusCircle,
  MinusCircle,
  Download,
  ExternalLink,
  Coins,
  TrendingUp,
  TrendingDown,
  Wrench,
  Clock3,
  ScanLine,
  Sparkles,
  Users2,
  Megaphone,
  UserPlus,
  ShieldAlert,
  MoreVertical,
} from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { ActivityTimeline } from '@/components/common/ActivityTimeline/ActivityTimeline'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { WalletAdjustmentModal, type AdjustmentType } from '@/components/wallets/WalletAdjustmentModal'
import { getWalletById } from '@/features/wallets/mockWallets'
import type {
  RecentRewardActivity,
  TransactionStatus,
  WalletRedemptionEntry,
  WalletRedemptionStatus,
  WalletStatus,
  WalletTransaction,
} from '@/types/wallet'

const statusConfig: Record<WalletStatus, { label: string; color: 'success' | 'default' | 'error' }> = {
  active: { label: 'Active', color: 'success' },
  inactive: { label: 'Inactive', color: 'default' },
  suspended: { label: 'Suspended', color: 'error' },
}

const txnStatusConfig: Record<TransactionStatus, { label: string; color: 'success' | 'warning' | 'error' }> = {
  completed: { label: 'Completed', color: 'success' },
  pending: { label: 'Pending', color: 'warning' },
  reversed: { label: 'Reversed', color: 'error' },
}

const redemptionStatusConfig: Record<WalletRedemptionStatus, { label: string; color: 'default' | 'info' | 'warning' | 'success' | 'error' }> = {
  pending: { label: 'Pending', color: 'warning' },
  approved: { label: 'Approved', color: 'info' },
  shipped: { label: 'Shipped', color: 'info' },
  delivered: { label: 'Delivered', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'error' },
}

const activityStatusConfig: Record<RecentRewardActivity['status'], { label: string; color: 'success' | 'warning' | 'error' }> = {
  credited: { label: 'Credited', color: 'success' },
  pending: { label: 'Pending', color: 'warning' },
  failed: { label: 'Failed', color: 'error' },
}

const transactionColumns: CommonTableColumn<WalletTransaction>[] = [
  { key: 'id', header: 'Transaction ID', minWidth: 130, render: (row) => row.id },
  { key: 'transactionDate', header: 'Transaction Date', minWidth: 140, sortable: true, render: (row) => row.transactionDate },
  {
    key: 'transactionType',
    header: 'Transaction Type',
    minWidth: 110,
    render: (row) => <Chip size="small" label={row.transactionType === 'credit' ? 'Credit' : 'Debit'} color={row.transactionType === 'credit' ? 'success' : 'error'} />,
  },
  { key: 'previousBalance', header: 'Previous Balance', align: 'right', render: (row) => row.previousBalance.toLocaleString('en-IN') },
  {
    key: 'coinsAdjusted',
    header: 'Coins Adjusted',
    align: 'right',
    render: (row) => `${row.coinsAdjusted > 0 ? '+' : ''}${row.coinsAdjusted.toLocaleString('en-IN')}`,
  },
  { key: 'updatedBalance', header: 'Updated Balance', align: 'right', render: (row) => row.updatedBalance.toLocaleString('en-IN') },
  { key: 'transactionSource', header: 'Transaction Source', minWidth: 150, render: (row) => row.transactionSource },
  { key: 'reason', header: 'Reason', minWidth: 170, render: (row) => row.reason },
  { key: 'referenceNumber', header: 'Reference Number', minWidth: 140, render: (row) => row.referenceNumber },
  { key: 'performedBy', header: 'Performed By', minWidth: 120, render: (row) => row.performedBy },
  { key: 'status', header: 'Status', minWidth: 100, render: (row) => <Chip size="small" label={txnStatusConfig[row.status].label} color={txnStatusConfig[row.status].color} /> },
]

const redemptionColumns: CommonTableColumn<WalletRedemptionEntry>[] = [
  { key: 'id', header: 'Redemption ID', minWidth: 140, render: (row) => row.id },
  { key: 'giftName', header: 'Gift Name', minWidth: 170, sortable: true, sortValue: (row) => row.giftName, render: (row) => row.giftName },
  { key: 'category', header: 'Category', minWidth: 130, render: (row) => row.category },
  { key: 'coinsRedeemed', header: 'Coins Redeemed', align: 'right', sortable: true, sortValue: (row) => row.coinsRedeemed, render: (row) => row.coinsRedeemed.toLocaleString('en-IN') },
  { key: 'requestDate', header: 'Request Date', minWidth: 130, sortable: true, render: (row) => row.requestDate },
  { key: 'approvalDate', header: 'Approval Date', minWidth: 130, render: (row) => row.approvalDate ?? '—' },
  { key: 'deliveryDate', header: 'Delivery Date', minWidth: 130, render: (row) => row.deliveryDate ?? '—' },
  { key: 'redemptionStatus', header: 'Redemption Status', minWidth: 140, render: (row) => <Chip size="small" label={redemptionStatusConfig[row.redemptionStatus].label} color={redemptionStatusConfig[row.redemptionStatus].color} /> },
  { key: 'courierPartner', header: 'Courier Partner', minWidth: 130, render: (row) => row.courierPartner ?? '—' },
  { key: 'trackingNumber', header: 'Tracking Number', minWidth: 140, render: (row) => row.trackingNumber ?? '—' },
]

const activityColumns: CommonTableColumn<RecentRewardActivity>[] = [
  { key: 'date', header: 'Date', sortable: true, render: (row) => row.date },
  { key: 'productName', header: 'Product Name', minWidth: 170, render: (row) => row.productName },
  { key: 'qrCode', header: 'QR Code', minWidth: 130, render: (row) => row.qrCode },
  { key: 'dealer', header: 'Dealer', minWidth: 150, render: (row) => row.dealer },
  { key: 'chemist', header: 'Chemist', minWidth: 150, render: (row) => row.chemist },
  { key: 'coinsEarned', header: 'Coins Earned', align: 'right', render: (row) => row.coinsEarned },
  { key: 'appliedScheme', header: 'Applied Scheme', minWidth: 170, render: (row) => row.appliedScheme },
  { key: 'status', header: 'Status', render: (row) => <Chip size="small" label={activityStatusConfig[row.status].label} color={activityStatusConfig[row.status].color} /> },
]

export function WalletDetailsPage() {
  const navigate = useNavigate()
  const { walletId } = useParams<{ walletId: string }>()
  const wallet = walletId ? getWalletById(walletId) : undefined
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType | null>(null)
  const [balanceOverride, setBalanceOverride] = useState<number | null>(null)
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<HTMLElement | null>(null)

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

  const currentBalance = balanceOverride ?? wallet.availableBalance

  const handleAdjustmentConfirm = () => {
    // Mock-only: update in-memory balance for this session view.
  }

  return (
    <>
      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
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
              <Chip size="small" label={statusConfig[wallet.status].label} color={statusConfig[wallet.status].color} />
            </Stack>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {wallet.id} · {wallet.userType}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Button variant="contained" color="success" startIcon={<PlusCircle size={18} />} onClick={() => setAdjustmentType('add')} sx={{ fontSize: '0.8125rem' }}>
            Add Coins
          </Button>
          <Button variant="contained" color="error" startIcon={<MinusCircle size={18} />} onClick={() => setAdjustmentType('deduct')} sx={{ fontSize: '0.8125rem' }}>
            Deduct Coins
          </Button>
          <Button variant="outlined" startIcon={<ArrowBackOutlined size={18} />} onClick={() => navigate('/rewards-wallet/wallet-management')} sx={{ fontSize: '0.8125rem' }}>
            Back
          </Button>
          <IconButton onClick={(e) => setMoreMenuAnchor(e.currentTarget)} sx={{ border: '1px solid', borderColor: 'divider' }} aria-label="More actions">
            <MoreVertical size={18} />
          </IconButton>
          <Menu anchorEl={moreMenuAnchor} open={!!moreMenuAnchor} onClose={() => setMoreMenuAnchor(null)}>
            <MenuItem onClick={() => setMoreMenuAnchor(null)}>
              <Download size={18} style={{ marginRight: 12 }} />
              Export Wallet Statement
            </MenuItem>
            <MenuItem
              onClick={() => {
                setMoreMenuAnchor(null)
                navigate(wallet.userType === 'Dealer' ? `/partners/dealers/${wallet.userId}` : `/partners/chemists/${wallet.userId}`)
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
              { label: 'Wallet ID', value: wallet.id },
              { label: 'User Name', value: wallet.userName },
              { label: 'User Type', value: wallet.userType },
              { label: 'Mobile Number', value: wallet.mobileNumber },
              { label: 'Email Address', value: wallet.email },
              { label: 'Region', value: wallet.region },
              { label: 'Registration Date', value: wallet.registrationDate },
              { label: 'Account Status', value: <Chip size="small" label={statusConfig[wallet.status].label} color={statusConfig[wallet.status].color} /> },
              { label: 'Current Wallet Balance', value: currentBalance.toLocaleString('en-IN') },
            ]}
          />
        </SectionCard>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard label="Current Wallet Balance" value={currentBalance.toLocaleString('en-IN')} icon={<Coins size={20} />} iconColor="primary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard label="Lifetime Coins Earned" value={wallet.lifetimeEarned.toLocaleString('en-IN')} icon={<TrendingUp size={20} />} iconColor="success" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard label="Lifetime Coins Redeemed" value={wallet.lifetimeRedeemed.toLocaleString('en-IN')} icon={<TrendingDown size={20} />} iconColor="secondary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard label="Manual Adjustments" value={wallet.manualAdjustments.toLocaleString('en-IN')} icon={<Wrench size={20} />} iconColor="warning" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard label="Pending Redemption Coins" value={wallet.pendingRedemptionCoins.toLocaleString('en-IN')} icon={<Clock3 size={20} />} iconColor="info" />
          </Grid>
        </Grid>

        <SectionCard title="Wallet Summary">
          <DetailFieldGrid
            fields={[
              { label: 'Current Balance', value: currentBalance.toLocaleString('en-IN') },
              { label: 'Lifetime Earned', value: wallet.lifetimeEarned.toLocaleString('en-IN') },
              { label: 'Lifetime Redeemed', value: wallet.lifetimeRedeemed.toLocaleString('en-IN') },
              { label: 'Total Manual Adjustments', value: wallet.manualAdjustments.toLocaleString('en-IN') },
              { label: 'Last Updated Date & Time', value: wallet.lastUpdated },
            ]}
          />
        </SectionCard>

        <SectionCard title="Wallet Transaction History">
          <CommonTable
            tableKey="wallet-transaction-history"
            columns={transactionColumns}
            rows={wallet.transactions}
            getRowId={(row) => row.id}
            searchPlaceholder="Search transactions…"
            searchKeys={(row) => `${row.id} ${row.reason} ${row.referenceNumber}`}
            defaultSortBy="transactionDate"
            defaultSortDir="desc"
            emptyTitle="No transactions yet"
          />
        </SectionCard>

        <SectionCard title="Reward Redemption History">
          <CommonTable
            tableKey="wallet-redemption-history"
            columns={redemptionColumns}
            rows={wallet.redemptionHistory}
            getRowId={(row) => row.id}
            searchPlaceholder="Search redemptions…"
            searchKeys={(row) => `${row.giftName} ${row.category}`}
            defaultSortBy="requestDate"
            defaultSortDir="desc"
            emptyTitle="No redemptions yet"
          />
        </SectionCard>

        <SectionCard title="Earned Coins Breakdown">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
              <StatCard label="Product Scans" value={wallet.earnedCoinsBreakdown.productScans.toLocaleString('en-IN')} icon={<ScanLine size={20} />} iconColor="primary" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
              <StatCard label="Active Schemes" value={wallet.earnedCoinsBreakdown.activeSchemes.toLocaleString('en-IN')} icon={<Sparkles size={20} />} iconColor="secondary" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
              <StatCard label="Referral Program" value={wallet.earnedCoinsBreakdown.referralProgram.toLocaleString('en-IN')} icon={<UserPlus size={20} />} iconColor="info" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
              <StatCard label="Promotional Campaigns" value={wallet.earnedCoinsBreakdown.promotionalCampaigns.toLocaleString('en-IN')} icon={<Megaphone size={20} />} iconColor="warning" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
              <StatCard label="Manual Credits" value={wallet.earnedCoinsBreakdown.manualCredits.toLocaleString('en-IN')} icon={<Users2 size={20} />} iconColor="success" />
            </Grid>
          </Grid>
        </SectionCard>

        <SectionCard title="Recent Reward Activity">
          <CommonTable
            tableKey="wallet-recent-activity"
            columns={activityColumns}
            rows={wallet.recentActivity}
            getRowId={(row) => row.id}
            searchPlaceholder="Search recent activity…"
            searchKeys={(row) => `${row.productName} ${row.qrCode}`}
            defaultSortBy="date"
            defaultSortDir="desc"
            emptyTitle="No recent activity"
          />
        </SectionCard>

        <SectionCard title="Wallet Activity Timeline">
          <ActivityTimeline entries={wallet.timeline} emptyTitle="No timeline activity yet" />
        </SectionCard>

        <SectionCard title="Fraud & Adjustment Log">
          {wallet.fraudLog.length === 0 ? (
            <EmptyState title="No fraud or adjustment incidents" description="This wallet has no flagged corrections." icon={<ShieldAlert size={28} />} />
          ) : (
            <Stack spacing={1.5}>
              {wallet.fraudLog.map((entry) => (
                <Stack key={entry.id} spacing={0.5} sx={{ p: 2, borderRadius: '10px', border: '1px solid', borderColor: 'divider' }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>{entry.incidentId}</Typography>
                    <Typography sx={{ fontSize: '0.8125rem', color: 'error.main', fontWeight: 600 }}>{entry.coinsAdjusted.toLocaleString('en-IN')} coins</Typography>
                  </Stack>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>{entry.adjustmentReason}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {entry.actionTaken} · By {entry.performedBy} · {entry.dateTime}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          )}
        </SectionCard>

        <SectionCard title="Internal Notes">
          <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', lineHeight: 1.6 }}>{wallet.internalNotes}</Typography>
        </SectionCard>
      </Stack>

      <WalletAdjustmentModal
        open={adjustmentType !== null}
        onClose={() => setAdjustmentType(null)}
        currentBalance={currentBalance}
        defaultType={adjustmentType ?? 'add'}
        onConfirm={(payload) => {
          setBalanceOverride(payload.type === 'add' ? currentBalance + payload.amount : Math.max(0, currentBalance - payload.amount))
          handleAdjustmentConfirm()
        }}
      />
    </>
  )
}
