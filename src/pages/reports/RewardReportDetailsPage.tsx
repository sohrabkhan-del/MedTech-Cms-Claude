import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Chip, Grid, Stack, Typography } from '@mui/material'
import { Gift, ArrowLeft as ArrowBackOutlined, Coins, Layers, Wallet as WalletIcon } from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { ActivityTimeline } from '@/components/common/ActivityTimeline/ActivityTimeline'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { getRewardReportById } from '@/features/reports/mockRewardReports'
import type { RewardReportStatus } from '@/types/rewardReport'

const statusConfig: Record<RewardReportStatus, { label: string; color: 'success' | 'warning' | 'info' | 'error' }> = {
  credited: { label: 'Credited', color: 'success' },
  pending: { label: 'Pending', color: 'warning' },
  redeemed: { label: 'Redeemed', color: 'info' },
  reversed: { label: 'Reversed', color: 'error' },
}

interface RedemptionRow {
  id: string
  redeemedItem: string
  coinsUsed: number
  redemptionDate: string
  deliveryStatus: string
}

const redemptionColumns: CommonTableColumn<RedemptionRow>[] = [
  { key: 'redeemedItem', header: 'Redeemed Item', minWidth: 180, render: (row) => row.redeemedItem },
  { key: 'coinsUsed', header: 'Coins Used', align: 'right', render: (row) => row.coinsUsed.toLocaleString('en-IN') },
  { key: 'redemptionDate', header: 'Redemption Date', minWidth: 140, render: (row) => row.redemptionDate },
  { key: 'deliveryStatus', header: 'Delivery Status', minWidth: 140, render: (row) => row.deliveryStatus },
]

export function RewardReportDetailsPage() {
  const navigate = useNavigate()
  const { rewardId } = useParams<{ rewardId: string }>()
  const report = rewardId ? getRewardReportById(rewardId) : undefined

  if (!report) {
    return (
      <EmptyState
        title="Reward report not found"
        description="This reward report may have been removed."
        actionLabel="Back to Reward Reports"
        onAction={() => navigate('/reports/reward-reports')}
      />
    )
  }

  const redemptionRows: RedemptionRow[] =
    report.isRedeemed && report.redeemedItem && report.coinsUsed !== undefined && report.redemptionDate && report.deliveryStatus
      ? [
          {
            id: `${report.id}-redemption`,
            redeemedItem: report.redeemedItem,
            coinsUsed: report.coinsUsed,
            redemptionDate: report.redemptionDate,
            deliveryStatus: report.deliveryStatus,
          },
        ]
      : []

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
            <Gift size={18} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="h1">{report.userName}</Typography>
              <Chip size="small" label={statusConfig[report.status].label} color={statusConfig[report.status].color} />
            </Stack>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {report.id} · {report.rewardType}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Button variant="outlined" startIcon={<ArrowBackOutlined size={18} />} onClick={() => navigate('/reports/reward-reports')} sx={{ fontSize: '0.8125rem' }}>
            Back
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Reward Summary">
          <DetailFieldGrid
            fields={[
              { label: 'Reward ID', value: report.id },
              { label: 'User Name', value: report.userName },
              { label: 'User Type', value: report.userType },
              { label: 'Reward Type', value: report.rewardType },
              { label: 'Reward Points', value: report.rewardPoints.toLocaleString('en-IN') },
              { label: 'Date', value: report.date },
              { label: 'Status', value: <Chip size="small" label={statusConfig[report.status].label} color={statusConfig[report.status].color} /> },
            ]}
          />
        </SectionCard>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Total Reward Points" value={report.totalRewardPoints.toLocaleString('en-IN')} icon={<Coins size={20} />} iconColor="primary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Applied Scheme" value={report.schemeName} icon={<Layers size={20} />} iconColor="secondary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Wallet Balance After" value={report.walletBalanceAfter.toLocaleString('en-IN')} icon={<WalletIcon size={20} />} iconColor="success" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Reward Status" value={statusConfig[report.status].label} icon={<Gift size={20} />} iconColor={report.status === 'reversed' ? 'error' : 'success'} />
          </Grid>
        </Grid>

        <SectionCard title="User Information">
          <DetailFieldGrid
            fields={[
              { label: 'User Name', value: report.userName },
              { label: 'User Type', value: report.userType },
              { label: 'Mobile Number', value: report.mobileNumber },
              { label: 'Email Address', value: report.email },
              { label: 'Region', value: report.region },
            ]}
          />
        </SectionCard>

        <SectionCard title="Applied Scheme">
          <DetailFieldGrid
            fields={[
              { label: 'Scheme Name', value: report.schemeName },
              { label: 'Scheme Type', value: report.schemeType },
              { label: 'Bonus Value', value: report.bonusValue },
              { label: 'Scheme ID', value: report.schemeId },
            ]}
          />
        </SectionCard>

        <SectionCard title="Reward Calculation">
          <DetailFieldGrid
            fields={[
              { label: 'Base Reward Points', value: report.baseRewardPoints.toLocaleString('en-IN') },
              { label: 'Multiplier', value: `${report.multiplier}x` },
              { label: 'Bonus Points', value: report.bonusPoints.toLocaleString('en-IN') },
              { label: 'Total Reward Points', value: report.totalRewardPoints.toLocaleString('en-IN') },
              { label: 'Wallet Balance Before', value: report.walletBalanceBefore.toLocaleString('en-IN') },
              { label: 'Wallet Balance After', value: report.walletBalanceAfter.toLocaleString('en-IN') },
            ]}
          />
        </SectionCard>

        <SectionCard title="Redemption Details">
          <CommonTable
            tableKey="reward-report-redemption-details"
            columns={redemptionColumns}
            rows={redemptionRows}
            getRowId={(row) => row.id}
            emptyTitle="Not redeemed"
            emptyDescription="This reward has not been redeemed yet."
          />
        </SectionCard>

        <SectionCard title="Reward Timeline">
          <ActivityTimeline entries={report.timeline} emptyTitle="No timeline activity yet" />
        </SectionCard>
      </Stack>
    </>
  )
}
