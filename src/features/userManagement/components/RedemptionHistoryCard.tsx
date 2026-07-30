import { Chip } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import type {
  RedemptionRequest,
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

export function RedemptionHistoryCard({
  entries,
  isLoading,
}: {
  entries: RedemptionRequest[]
  isLoading?: boolean
}) {
  const navigate = useNavigate()

  const columns: CommonTableColumn<RedemptionRequest>[] = [
    { key: 'id', header: 'Request ID', render: (row) => row.id },
    { key: 'rewardItem', header: 'Reward Item', render: (row) => row.rewardItem },
    {
      key: 'PointsUsed',
      header: 'Points Used',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.PointsUsed,
      render: (row) => row.PointsUsed.toLocaleString('en-IN'),
    },
    {
      key: 'requestDate',
      header: 'Request Date',
      sortable: true,
      render: (row) => row.requestDate,
    },
    {
      key: 'redemptionStatus',
      header: 'Status',
      render: (row) => (
        <Chip
          size="small"
          label={statusConfig[row.redemptionStatus].label}
          color={statusConfig[row.redemptionStatus].color}
        />
      ),
    },
    {
      key: 'deliveryStatus',
      header: 'Delivery Status',
      render: (row) =>
        row.deliveryStatus.charAt(0).toUpperCase() + row.deliveryStatus.slice(1),
    },
  ]

  return (
    <SectionCard title="Redemption History">
      <CommonTable
        tableKey="partner-redemption-history"
        columns={columns}
        rows={entries}
        getRowId={(row) => row.id}
        loading={isLoading}
        searchPlaceholder="Search redemptions…"
        searchKeys={(row) => `${row.id} ${row.rewardItem}`}
        defaultSortBy="requestDate"
        defaultSortDir="desc"
        onRowClick={(row) =>
          navigate(`/rewards-wallet/reward-redemptions/${row.id}`)
        }
        emptyTitle="No redemptions yet"
        emptyDescription="This partner hasn't redeemed any rewards yet."
      />
    </SectionCard>
  )
}
