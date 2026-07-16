import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Grid, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { Ban as BlockIcon, XCircle as CancelOutlined, Store as StorefrontOutlined, Pill as LocalPharmacyOutlined, Calendar as TodayOutlined } from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { Modal } from '@/components/common/Modal/Modal'
import { useRegionFilter } from '@/contexts/RegionFilterContext'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import { mockApprovalRequests, rejectedRequestKpis } from '@/features/verification/mockApprovalRequests'
import type { ApprovalRequest, RequestType } from '@/types/approvalRequest'
import type { PartnerZone } from '@/types/partner'

const rejectionReasonOptions = [
  'Incomplete documents',
  'Invalid drug license',
  'Duplicate registration',
  'Geo-tag verification failed',
  'Unable to verify business details',
]

interface RejectedFilters extends Record<string, unknown> {
  requestType: RequestType | 'all'
  region: PartnerZone | 'all'
  rejectedBy: string | 'all'
  rejectionReason: string | 'all'
  fromDate: string
  toDate: string
}

export function RejectedRequestsListPage() {
  const navigate = useNavigate()
  const { region } = useRegionFilter()
  useRegionTopbarHeader({
    icon: <BlockIcon size={20} />,
    title: 'Rejected Requests',
    subtitle: 'Manage all Dealer and Chemist onboarding requests that have been rejected.',
  })
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<RejectedFilters>({
    requestType: 'all',
    region: 'all',
    rejectedBy: 'all',
    rejectionReason: 'all',
    fromDate: '',
    toDate: '',
  })
  const [reopened, setReopened] = useState<Set<string>>(new Set())
  const [deleted, setDeleted] = useState<Set<string>>(new Set())
  const [deleteTarget, setDeleteTarget] = useState<ApprovalRequest | null>(null)

  const reviewers = useMemo(
    () => Array.from(new Set(mockApprovalRequests.filter((r) => r.status === 'rejected').map((r) => r.reviewedBy).filter(Boolean))) as string[],
    [],
  )

  const rejectedRequests = useMemo(
    () => mockApprovalRequests.filter((r) => r.status === 'rejected' && !reopened.has(r.id) && !deleted.has(r.id)),
    [reopened, deleted],
  )

  const topbarZone = region === 'All India' ? null : (region as PartnerZone)

  const filteredRequests = useMemo(
    () =>
      rejectedRequests.filter((request) => {
        const topbarRegionMatch = !topbarZone || request.region === topbarZone
        const typeMatch = appliedFilters.requestType === 'all' || request.requestType === appliedFilters.requestType
        const regionMatch = appliedFilters.region === 'all' || request.region === appliedFilters.region
        const reviewerMatch = appliedFilters.rejectedBy === 'all' || request.reviewedBy === appliedFilters.rejectedBy
        const reasonMatch = appliedFilters.rejectionReason === 'all' || request.rejectionReason === appliedFilters.rejectionReason
        return topbarRegionMatch && typeMatch && regionMatch && reviewerMatch && reasonMatch
      }),
    [rejectedRequests, appliedFilters, topbarZone],
  )

  const handleReopen = (request: ApprovalRequest) => {
    setReopened((prev) => new Set(prev).add(request.id))
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    setDeleted((prev) => new Set(prev).add(deleteTarget.id))
    setDeleteTarget(null)
  }

  const columns: CommonTableColumn<ApprovalRequest>[] = [
    { key: 'id', header: 'Request ID', minWidth: 130, render: (row) => row.id },
    {
      key: 'applicantName',
      header: 'Applicant Name',
      minWidth: 160,
      sortable: true,
      render: (row) => (
        <Typography
          sx={{ fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          onClick={() => navigate(`/verification/rejected-requests/${row.id}`)}
        >
          {row.applicantName}
        </Typography>
      ),
    },
    { key: 'requestType', header: 'User Type', sortable: true, render: (row) => row.requestType },
    { key: 'storeName', header: 'Shop Name', minWidth: 160, render: (row) => row.storeName },
    { key: 'ownerName', header: 'Owner Name', minWidth: 150, render: (row) => row.ownerName },
    { key: 'region', header: 'Region', render: (row) => row.region },
    { key: 'submittedDate', header: 'Submitted Date', minWidth: 140, render: (row) => row.submittedDate },
    { key: 'decisionDate', header: 'Rejected Date', minWidth: 140, render: (row) => row.decisionDate ?? '—' },
    { key: 'reviewedBy', header: 'Rejected By', minWidth: 140, render: (row) => row.reviewedBy ?? '—' },
    { key: 'rejectionReason', header: 'Rejection Reason', minWidth: 200, render: (row) => row.rejectionReason ?? '—' },
    { key: 'status', header: 'Status', render: () => <StatusBadge status="rejected" /> },
  ]

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Total Rejected Requests" value={rejectedRequestKpis.totalRejected} icon={<CancelOutlined size={20} />} iconColor="error" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Dealer Rejections" value={rejectedRequestKpis.dealerRejections} icon={<StorefrontOutlined size={20} />} iconColor="warning" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Chemist Rejections" value={rejectedRequestKpis.chemistRejections} icon={<LocalPharmacyOutlined size={20} />} iconColor="secondary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Today's Rejections" value={rejectedRequestKpis.todaysRejections} icon={<TodayOutlined size={20} />} iconColor="primary" />
        </Grid>
      </Grid>

      <CommonTable
        tableKey="rejected-requests-list"
        columns={columns}
        rows={filteredRequests}
        getRowId={(row) => row.id}
        searchPlaceholder="Search rejected requests…"
        searchKeys={(row) => `${row.applicantName} ${row.id} ${row.storeName} ${row.ownerName}`}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={
          (appliedFilters.requestType !== 'all' ? 1 : 0) +
          (appliedFilters.region !== 'all' ? 1 : 0) +
          (appliedFilters.rejectedBy !== 'all' ? 1 : 0) +
          (appliedFilters.rejectionReason !== 'all' ? 1 : 0) +
          (appliedFilters.fromDate || appliedFilters.toDate ? 1 : 0)
        }
        onExportClick={() => {}}
        defaultSortBy="decisionDate"
        actions={[
          { label: 'View Details', onClick: (row) => navigate(`/verification/rejected-requests/${row.id}`) },
          { label: 'Reopen Request', onClick: handleReopen },
          { label: 'Delete Request', onClick: (row) => setDeleteTarget(row), danger: true },
        ]}
        emptyTitle="No rejected requests found"
        emptyDescription="Try adjusting your filters or search terms."
      />

      <FilterDrawer<RejectedFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Rejected Requests"
        value={appliedFilters}
        onApply={setAppliedFilters}
      >
        {(draft, setDraft) => (
          <Stack spacing={3}>
            <TextField
              select
              label="User Type"
              size="small"
              value={draft.requestType}
              onChange={(e) => setDraft((prev) => ({ ...prev, requestType: e.target.value as RejectedFilters['requestType'] }))}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="Dealer">Dealer</MenuItem>
              <MenuItem value="Chemist">Chemist</MenuItem>
            </TextField>
            <TextField
              select
              label="Region"
              size="small"
              value={draft.region}
              onChange={(e) => setDraft((prev) => ({ ...prev, region: e.target.value as RejectedFilters['region'] }))}
            >
              <MenuItem value="all">All Regions</MenuItem>
              <MenuItem value="North">North</MenuItem>
              <MenuItem value="South">South</MenuItem>
              <MenuItem value="East">East</MenuItem>
              <MenuItem value="West">West</MenuItem>
            </TextField>
            <TextField
              select
              label="Rejected By"
              size="small"
              value={draft.rejectedBy}
              onChange={(e) => setDraft((prev) => ({ ...prev, rejectedBy: e.target.value }))}
            >
              <MenuItem value="all">All Reviewers</MenuItem>
              {reviewers.map((reviewer) => (
                <MenuItem key={reviewer} value={reviewer}>
                  {reviewer}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Rejection Reason"
              size="small"
              value={draft.rejectionReason}
              onChange={(e) => setDraft((prev) => ({ ...prev, rejectionReason: e.target.value }))}
            >
              <MenuItem value="all">All Reasons</MenuItem>
              {rejectionReasonOptions.map((reason) => (
                <MenuItem key={reason} value={reason}>
                  {reason}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="date"
              label="Rejected From"
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              value={draft.fromDate}
              onChange={(e) => setDraft((prev) => ({ ...prev, fromDate: e.target.value }))}
            />
            <TextField
              type="date"
              label="Rejected To"
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              value={draft.toDate}
              onChange={(e) => setDraft((prev) => ({ ...prev, toDate: e.target.value }))}
            />
          </Stack>
        )}
      </FilterDrawer>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Request"
        description={`Are you sure you want to permanently delete request ${deleteTarget?.id}? This action cannot be undone.`}
        primaryActionLabel="Delete"
        primaryActionColor="error"
        onPrimaryAction={confirmDelete}
      >
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          {deleteTarget?.applicantName} · {deleteTarget?.storeName}
        </Typography>
      </Modal>
    </>
  )
}
