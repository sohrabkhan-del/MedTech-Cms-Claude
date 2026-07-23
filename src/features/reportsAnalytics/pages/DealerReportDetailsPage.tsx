import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Chip, Grid, Stack, Typography } from '@mui/material'
import { FileBarChart2, ArrowLeft as ArrowBackOutlined, ScanLine, Percent, CalendarClock, Repeat2 } from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { DetailsPageSkeleton } from '@/components/common/DetailsPageSkeleton/DetailsPageSkeleton'
import { useDealerReportDetail } from '@/features/reportsAnalytics/hooks/useDealerReportDetail'
import type { InterestedProductEntry, PointsHistoryEntry, ScanHistoryEntry } from '@/types/partner'
import type { WalletRedemptionEntry, WalletRedemptionStatus } from '@/types/wallet'

const redemptionStatusConfig: Record<WalletRedemptionStatus, { label: string; color: 'default' | 'info' | 'warning' | 'success' | 'error' }> = {
  pending: { label: 'Pending', color: 'warning' },
  approved: { label: 'Approved', color: 'info' },
  shipped: { label: 'Shipped', color: 'info' },
  delivered: { label: 'Delivered', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'error' },
}

const scanResultConfig: Record<ScanHistoryEntry['result'], { label: string; color: 'success' | 'warning' | 'error' }> = {
  valid: { label: 'Valid', color: 'success' },
  duplicate: { label: 'Duplicate', color: 'warning' },
  invalid: { label: 'Invalid', color: 'error' },
}

const interestStatusConfig: Record<InterestedProductEntry['status'], { label: string; color: 'default' | 'warning' | 'success' }> = {
  new: { label: 'New', color: 'warning' },
  in_progress: { label: 'In Progress', color: 'default' },
  closed: { label: 'Closed', color: 'success' },
}

const scanColumns: CommonTableColumn<ScanHistoryEntry>[] = [
  { key: 'scanDate', header: 'Scan Date', minWidth: 120, sortable: true, render: (row) => row.scanDate },
  { key: 'barcodeNumber', header: 'Barcode Number', minWidth: 140, render: (row) => row.barcodeNumber },
  { key: 'productName', header: 'Product Name', minWidth: 170, render: (row) => row.productName },
  { key: 'rewardPoints', header: 'Reward Points', align: 'right', sortable: true, sortValue: (row) => row.rewardPoints, render: (row) => row.rewardPoints.toLocaleString('en-IN') },
  { key: 'result', header: 'Result', minWidth: 100, render: (row) => <Chip size="small" label={scanResultConfig[row.result].label} color={scanResultConfig[row.result].color} /> },
]

const walletHistoryColumns: CommonTableColumn<PointsHistoryEntry>[] = [
  { key: 'date', header: 'Date', minWidth: 120, sortable: true, render: (row) => row.date },
  { key: 'transactionId', header: 'Transaction ID', minWidth: 140, render: (row) => row.transactionId },
  {
    key: 'type',
    header: 'Type',
    minWidth: 100,
    render: (row) => <Chip size="small" label={row.type === 'credit' ? 'Credit' : 'Debit'} color={row.type === 'credit' ? 'success' : 'error'} />,
  },
  { key: 'points', header: 'Points', align: 'right', sortable: true, sortValue: (row) => row.points, render: (row) => row.points.toLocaleString('en-IN') },
  { key: 'description', header: 'Description', minWidth: 200, render: (row) => row.description },
  { key: 'balanceAfter', header: 'Balance After', align: 'right', render: (row) => row.balanceAfter.toLocaleString('en-IN') },
]

const interestedProductColumns: CommonTableColumn<InterestedProductEntry>[] = [
  { key: 'productName', header: 'Product Name', minWidth: 180, sortable: true, sortValue: (row) => row.productName, render: (row) => row.productName },
  { key: 'requestedDate', header: 'Requested Date', minWidth: 130, sortable: true, render: (row) => row.requestedDate },
  { key: 'handledBy', header: 'Handled By', minWidth: 130, render: (row) => row.handledBy },
  {
    key: 'status',
    header: 'Status',
    minWidth: 110,
    render: (row) => <Chip size="small" label={interestStatusConfig[row.status].label} color={interestStatusConfig[row.status].color} />,
  },
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

export function DealerReportDetailsPage() {
  const navigate = useNavigate()
  const { dealerReportId } = useParams<{ dealerReportId: string }>()
  const { report, isLoading } = useDealerReportDetail(dealerReportId)

  if (isLoading) {
    return <DetailsPageSkeleton sections={4} />
  }

  if (!report) {
    return (
      <EmptyState
        title="Dealer report not found"
        description="This dealer report may have been removed."
        actionLabel="Back to Dealer Reports"
        onAction={() => navigate('/reports/dealer-reports')}
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
              <Typography variant="h1">{report.dealerName}</Typography>
              <StatusBadge status={report.status} />
            </Stack>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {report.dealerId} · Dealer
            </Typography>
          </Box>
        </Stack>
        <Button variant="outlined" startIcon={<ArrowBackOutlined size={18} />} onClick={() => navigate('/reports/dealer-reports')} sx={{ fontSize: '0.8125rem' }}>
          Back
        </Button>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Dealer Summary">
          <DetailFieldGrid
            fields={[
              { label: 'Dealer ID', value: report.dealerId },
              { label: 'Dealer Name', value: report.dealerName },
              { label: 'Owner Name', value: report.ownerName },
              { label: 'Email', value: report.email },
              { label: 'Phone', value: report.phone },
              { label: 'City', value: report.city },
              { label: 'Zone', value: report.zone },
              { label: 'License Number', value: report.licenseNumber },
              { label: 'Assigned MR', value: report.assignedMr },
              { label: 'Registered Address', value: report.registeredAddress },
              { label: 'Status', value: <StatusBadge status={report.status} /> },
              { label: 'Onboarded Date', value: report.onboardedDate },
            ]}
          />
        </SectionCard>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Total Scans" value={report.totalScans.toLocaleString('en-IN')} icon={<ScanLine size={20} />} iconColor="primary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Wallet Points" value={report.walletPoints.toLocaleString('en-IN')} icon={<Repeat2 size={20} />} iconColor="secondary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Total Redemptions" value={report.redemptions.toLocaleString('en-IN')} icon={<Percent size={20} />} iconColor="success" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Active Months" value={report.performanceSummary.activeMonths} icon={<CalendarClock size={20} />} iconColor="warning" />
          </Grid>
        </Grid>

        <SectionCard title="Scan History">
          <CommonTable
            tableKey="dealer-report-scan-history"
            columns={scanColumns}
            rows={report.scanHistory}
            getRowId={(row) => row.id}
            searchPlaceholder="Search scans…"
            searchKeys={(row) => `${row.barcodeNumber} ${row.productName}`}
            defaultSortBy="scanDate"
            defaultSortDir="desc"
            emptyTitle="No scan history yet"
          />
        </SectionCard>

        <SectionCard title="Wallet History">
          <CommonTable
            tableKey="dealer-report-wallet-history"
            columns={walletHistoryColumns}
            rows={report.walletHistory}
            getRowId={(row) => row.id}
            searchPlaceholder="Search wallet history…"
            searchKeys={(row) => `${row.transactionId} ${row.description}`}
            defaultSortBy="date"
            defaultSortDir="desc"
            emptyTitle="No wallet history yet"
          />
        </SectionCard>

        <SectionCard title="Interested Products">
          <CommonTable
            tableKey="dealer-report-interested-products"
            columns={interestedProductColumns}
            rows={report.interestedProducts}
            getRowId={(row) => row.id}
            searchPlaceholder="Search interested products…"
            searchKeys={(row) => `${row.productName} ${row.handledBy}`}
            defaultSortBy="requestedDate"
            defaultSortDir="desc"
            emptyTitle="No interested products recorded"
          />
        </SectionCard>

        <SectionCard title="Redemption History">
          <CommonTable
            tableKey="dealer-report-redemption-history"
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

        <SectionCard title="Performance Summary">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard label="Scan-to-Reward Conversion" value={`${report.performanceSummary.scanToRewardConversion}%`} icon={<Percent size={20} />} iconColor="primary" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard label="Average Monthly Scans" value={report.performanceSummary.averageMonthlyScans.toLocaleString('en-IN')} icon={<ScanLine size={20} />} iconColor="secondary" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard label="Redemption Rate" value={`${report.performanceSummary.redemptionRate}%`} icon={<Repeat2 size={20} />} iconColor="success" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard label="Active Months" value={report.performanceSummary.activeMonths} icon={<CalendarClock size={20} />} iconColor="warning" />
            </Grid>
          </Grid>
        </SectionCard>
      </Stack>
    </>
  )
}
