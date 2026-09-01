import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Chip,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { Redo2, Clock3, CheckCheck, Coins as Points } from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { StatCardSkeleton } from '@/components/common/StatCard/StatCardSkeleton'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import { useRewardClaims } from '@/features/rewardsWallet/hooks/useRewardClaims'
import type {
  RewardClaimRow,
  RewardClaimStatus,
} from '@/features/rewardsWallet/services/rewardClaimsApi'

const statusConfig: Record<
  RewardClaimStatus,
  { label: string; color: 'warning' | 'info' | 'error' | 'success' }
> = {
  PENDING: { label: 'Pending', color: 'warning' },
  APPROVED: { label: 'Approved', color: 'success' },
  REJECTED: { label: 'Rejected', color: 'error' },
}

function getStatusDisplay(status: string) {
  return (
    statusConfig[status.toUpperCase() as RewardClaimStatus] ?? {
      label: status,
      color: 'info' as const,
    }
  )
}

interface RedemptionFilters extends Record<string, unknown> {
  status: RewardClaimStatus | 'all'
}

export function RedemptionListPage() {
  const navigate = useNavigate()
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortColumn, setSortColumn] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [appliedFilters, setAppliedFilters] = useState<RedemptionFilters>({
    status: 'all',
  })

  const { claims, kpis, isLoading } = useRewardClaims({
    status: appliedFilters.status,
    sortBy: sortColumn,
    sortOrder,
  })

  useRegionTopbarHeader({
    icon: <Redo2 size={20} />,
    title: 'Redemption Requests',
    subtitle:
      'Review, approve, and track reward redemption requests submitted by partners.',
    isLoading,
  })

  const columns: CommonTableColumn<RewardClaimRow>[] = [
    {
      key: 'referenceId',
      header: 'Request ID',
      minWidth: 140,
      render: (row) => (
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={() =>
            navigate(`/rewards-wallet/reward-redemptions/${row.id}`)
          }
        >
          {row.referenceId}
        </Typography>
      ),
    },
    {
      key: 'businessName',
      header: 'Business Name',
      minWidth: 170,
      sortable: true,
      sortValue: (row) => row.businessName ?? row.partnerName,
      render: (row) => (
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={(e) => {
            e.stopPropagation()
            if (!row.partnerId) return
            navigate(
              row.partnerRole === 'Dealer'
                ? `/partners/dealers/${row.partnerId}`
                : `/partners/chemists/${row.partnerId}`,
            )
          }}
        >
          {row.businessName ?? row.partnerName}
        </Typography>
      ),
    },
    {
      key: 'partnerRole',
      header: 'User Type',
      minWidth: 100,
      render: (row) => row.partnerRole ?? '-',
    },
    {
      key: 'rewardItem',
      header: 'Reward Item',
      minWidth: 180,
      render: (row) => row.rewardItem,
    },
    {
      key: 'pointsRequired',
      header: 'Points Used',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.pointsRequired,
      render: (row) => row.pointsRequired.toLocaleString('en-IN'),
    },
    {
      key: 'createdAt',
      header: 'Request Date',
      minWidth: 130,
      sortable: true,
      sortValue: (row) => row.createdAt,
      render: (row) => new Date(row.createdAt).toLocaleDateString('en-IN'),
    },
    {
      key: 'status',
      header: 'Redemption Status',
      minWidth: 140,
      render: (row) => (
        <Chip
          size="small"
          label={getStatusDisplay(row.status).label}
          color={getStatusDisplay(row.status).color}
        />
      ),
    },
    {
      key: 'reviewedBy',
      header: 'Reviewed By',
      minWidth: 130,
      render: (row) => row.reviewedBy ?? '—',
    },
  ]

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Total Redemption Requests"
              value={kpis?.totalRequests ?? 0}
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
              label="Pending Approvals"
              value={kpis?.pendingApprovals ?? 0}
              icon={<Clock3 size={20} />}
              iconColor="warning"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Completed Redemptions"
              value={kpis?.completedRedemptions ?? 0}
              icon={<CheckCheck size={20} />}
              iconColor="success"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Points Redeemed"
              value={(kpis?.pointsRedeemed ?? 0).toLocaleString('en-IN')}
              icon={<Points size={20} />}
              iconColor="secondary"
            />
          )}
        </Grid>
      </Grid>

      <CommonTable
        tableKey="redemption-requests-list"
        columns={columns}
        rows={claims}
        getRowId={(row) => row.id}
        loading={isLoading}
        searchPlaceholder="Search by business name or request ID…"
        searchKeys={(row) =>
          `${row.partnerName} ${row.businessName ?? ''} ${row.referenceId} ${row.rewardItem}`
        }
        onFilterClick={() => setFilterOpen(true)}
        filterCount={appliedFilters.status !== 'all' ? 1 : 0}
        onExportClick={() => {}}
        defaultSortBy={sortColumn}
        defaultSortDir={sortOrder}
        onSortChange={(nextSortBy, nextSortDir) => {
          setSortColumn(nextSortBy)
          setSortOrder(nextSortDir)
        }}
        actions={[
          {
            label: 'View',
            onClick: (row) =>
              navigate(`/rewards-wallet/reward-redemptions/${row.id}`),
          },
        ]}
        emptyTitle="No redemption requests found"
        emptyDescription="Try adjusting your filters or search terms."
      />

      <FilterDrawer<RedemptionFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Redemption Requests"
        value={appliedFilters}
        onApply={setAppliedFilters}
      >
        {(draft, setDraft) => (
          <Stack spacing={3}>
            <TextField
              select
              label="Status"
              size="small"
              value={draft.status}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  status: e.target.value as RedemptionFilters['status'],
                }))
              }
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="APPROVED">Approved</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
            </TextField>
          </Stack>
        )}
      </FilterDrawer>
    </>
  )
}
