import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Chip, Grid, Stack, Typography } from '@mui/material'
import { FileBarChart2, ArrowLeft as ArrowBackOutlined, Coins, TrendingUp, TrendingDown, Clock3, Wrench } from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { ActivityTimeline } from '@/components/common/ActivityTimeline/ActivityTimeline'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { getWalletReportById } from '@/features/reports/mockWalletReports'
import type { WalletReportManualAdjustment } from '@/types/walletReport'
import type { TransactionStatus, WalletRedemptionStatus, WalletStatus, WalletRedemptionEntry, WalletTransaction } from '@/types/wallet'

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

const transactionColumns: CommonTableColumn<WalletTransaction>[] = [
  { key: 'id', header: 'Transaction ID', minWidth: 130, render: (row) => row.id },
  { key: 'transactionDate', header: 'Transaction Date', minWidth: 140, sortable: true, render: (row) => row.transactionDate },
  {
    key: 'transactionType',
    header: 'Transaction Type',
    minWidth: 110,
    render: (row) => <Chip size="small" label={row.transactionType === 'credit' ? 'Credit' : 'Debit'} color={row.transactionType === 'credit' ? 'success' : 'error'} />,
  },
  { key: 'coinsAdjusted', header: 'Coins Adjusted', align: 'right', render: (row) => `${row.coinsAdjusted > 0 ? '+' : ''}${row.coinsAdjusted.toLocaleString('en-IN')}` },
  { key: 'updatedBalance', header: 'Updated Balance', align: 'right', render: (row) => row.updatedBalance.toLocaleString('en-IN') },
  { key: 'transactionSource', header: 'Transaction Source', minWidth: 150, render: (row) => row.transactionSource },
  { key: 'reason', header: 'Reason', minWidth: 170, render: (row) => row.reason },
  { key: 'referenceNumber', header: 'Reference Number', minWidth: 140, render: (row) => row.referenceNumber },
  { key: 'status', header: 'Status', minWidth: 100, render: (row) => <Chip size="small" label={txnStatusConfig[row.status].label} color={txnStatusConfig[row.status].color} /> },
]

const adjustmentColumns: CommonTableColumn<WalletReportManualAdjustment>[] = [
  { key: 'date', header: 'Date', minWidth: 120, sortable: true, render: (row) => row.date },
  {
    key: 'type',
    header: 'Type',
    minWidth: 100,
    render: (row) => <Chip size="small" label={row.type === 'credit' ? 'Credit' : 'Debit'} color={row.type === 'credit' ? 'success' : 'error'} />,
  },
  { key: 'coins', header: 'Coins', align: 'right', sortable: true, sortValue: (row) => row.coins, render: (row) => row.coins.toLocaleString('en-IN') },
  { key: 'reason', header: 'Reason', minWidth: 200, render: (row) => row.reason },
  { key: 'performedBy', header: 'Performed By', minWidth: 130, render: (row) => row.performedBy },
]

const redemptionColumns: CommonTableColumn<WalletRedemptionEntry>[] = [
  { key: 'id', header: 'Redemption ID', minWidth: 140, render: (row) => row.id },
  { key: 'giftName', header: 'Gift Name', minWidth: 170, sortable: true, sortValue: (row) => row.giftName, render: (row) => row.giftName },
  { key: 'category', header: 'Category', minWidth: 130, render: (row) => row.category },
  { key: 'coinsRedeemed', header: 'Coins Redeemed', align: 'right', sortable: true, sortValue: (row) => row.coinsRedeemed, render: (row) => row.coinsRedeemed.toLocaleString('en-IN') },
  { key: 'requestDate', header: 'Request Date', minWidth: 130, sortable: true, render: (row) => row.requestDate },
  {
    key: 'redemptionStatus',
    header: 'Redemption Status',
    minWidth: 140,
    render: (row) => <Chip size="small" label={redemptionStatusConfig[row.redemptionStatus].label} color={redemptionStatusConfig[row.redemptionStatus].color} />,
  },
  { key: 'courierPartner', header: 'Courier Partner', minWidth: 130, render: (row) => row.courierPartner ?? '—' },
]

export function WalletReportDetailsPage() {
  const navigate = useNavigate()
  const { walletReportId } = useParams<{ walletReportId: string }>()
  const report = walletReportId ? getWalletReportById(walletReportId) : undefined

  if (!report) {
    return (
      <EmptyState
        title="Wallet report not found"
        description="This wallet report may have been removed."
        actionLabel="Back to Wallet Reports"
        onAction={() => navigate('/reports/wallet-reports')}
      />
    )
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
            <FileBarChart2 size={18} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="h1">{report.userName}</Typography>
              <Chip size="small" label={statusConfig[report.status].label} color={statusConfig[report.status].color} />
            </Stack>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {report.walletId} · {report.userType}
            </Typography>
          </Box>
        </Stack>
        <Button variant="outlined" startIcon={<ArrowBackOutlined size={18} />} onClick={() => navigate('/reports/wallet-reports')} sx={{ fontSize: '0.8125rem' }}>
          Back
        </Button>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Wallet Summary">
          <DetailFieldGrid
            fields={[
              { label: 'Wallet ID', value: report.walletId },
              { label: 'User Name', value: report.userName },
              { label: 'User Type', value: report.userType },
              { label: 'Mobile Number', value: report.mobileNumber },
              { label: 'Email Address', value: report.email },
              { label: 'Region', value: report.region },
              { label: 'Registration Date', value: report.registrationDate },
              { label: 'Account Status', value: <Chip size="small" label={statusConfig[report.status].label} color={statusConfig[report.status].color} /> },
              { label: 'Last Transaction', value: report.lastTransaction },
            ]}
          />
        </SectionCard>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard label="Wallet Balance" value={report.walletBalance.toLocaleString('en-IN')} icon={<Coins size={20} />} iconColor="primary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard label="Total Credits" value={report.credits.toLocaleString('en-IN')} icon={<TrendingUp size={20} />} iconColor="success" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard label="Total Debits" value={report.debits.toLocaleString('en-IN')} icon={<TrendingDown size={20} />} iconColor="error" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard label="Manual Adjustments" value={report.manualAdjustments.length} icon={<Wrench size={20} />} iconColor="warning" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard label="Pending Redemption Coins" value={report.pendingRedemptionCoins.toLocaleString('en-IN')} icon={<Clock3 size={20} />} iconColor="info" />
          </Grid>
        </Grid>

        <SectionCard title="Transaction History">
          <CommonTable
            tableKey="wallet-report-transaction-history"
            columns={transactionColumns}
            rows={report.transactions}
            getRowId={(row) => row.id}
            searchPlaceholder="Search transactions…"
            searchKeys={(row) => `${row.id} ${row.reason} ${row.referenceNumber}`}
            defaultSortBy="transactionDate"
            defaultSortDir="desc"
            emptyTitle="No transactions yet"
          />
        </SectionCard>

        <SectionCard title="Manual Adjustments">
          <CommonTable
            tableKey="wallet-report-manual-adjustments"
            columns={adjustmentColumns}
            rows={report.manualAdjustments}
            getRowId={(row) => row.id}
            searchPlaceholder="Search adjustments…"
            searchKeys={(row) => `${row.reason} ${row.performedBy}`}
            defaultSortBy="date"
            defaultSortDir="desc"
            emptyTitle="No manual adjustments recorded"
          />
        </SectionCard>

        <SectionCard title="Redemption History">
          <CommonTable
            tableKey="wallet-report-redemption-history"
            columns={redemptionColumns}
            rows={report.redemptionHistory}
            getRowId={(row) => row.id}
            searchPlaceholder="Search redemptions…"
            searchKeys={(row) => `${row.giftName} ${row.category}`}
            defaultSortBy="requestDate"
            defaultSortDir="desc"
            emptyTitle="No redemptions yet"
          />
        </SectionCard>

        <SectionCard title="Wallet Timeline">
          <ActivityTimeline entries={report.timeline} emptyTitle="No timeline activity yet" />
        </SectionCard>
      </Stack>
    </>
  )
}
