import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import {
  ClipboardCheck as RuleIcon,
  ClipboardClock as PendingActionsOutlined,
  CircleCheck as CheckCircleOutlined,
  XCircle as CancelOutlined,
  ClipboardList as ListAltOutlined,
} from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { StatCardSkeleton } from '@/components/common/StatCard/StatCardSkeleton'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { Modal } from '@/components/common/Modal/Modal'
import { ModularTabs } from '@/components/common/ModularTabs/ModularTabs'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import { useApprovalRequests } from '@/features/userManagement/hooks/useApprovalRequests'
import type {
  ApprovalRequest,
  ApprovalStatus,
  RequestType,
} from '@/features/userManagement/types/userManagement.types'
import type { PartnerZone } from '@/types/partner'

type RequestTypeTab = 'all' | RequestType

const REQUEST_TYPE_TABS: { label: string; value: RequestTypeTab }[] = [
  { label: 'All', value: 'all' },
  { label: 'Chemist', value: 'Chemist' },
  { label: 'Dealer', value: 'Dealer' },
]

interface ApprovalFilters extends Record<string, unknown> {
  status: ApprovalStatus | 'all'
  region: PartnerZone | 'all'
  fromDate: string
  toDate: string
}

interface DecisionDialogState {
  open: boolean
  action: 'approve' | 'reject'
  request: ApprovalRequest | null
}

export function ApprovalRequestsListPage() {
  const navigate = useNavigate()
  const [requestTypeTab, setRequestTypeTab] = useState<RequestTypeTab>('all')
  const [filterOpen, setFilterOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [appliedFilters, setAppliedFilters] = useState<ApprovalFilters>({
    status: 'all',
    region: 'all',
    fromDate: '',
    toDate: '',
  })
  const [dialog, setDialog] = useState<DecisionDialogState>({
    open: false,
    action: 'approve',
    request: null,
  })
  const [remarks, setRemarks] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const { requests, totalItems, kpis, decide, isLoading } = useApprovalRequests({
    page: page + 1,
    limit: rowsPerPage,
    search,
    type: requestTypeTab === 'all' ? undefined : requestTypeTab,
    status: appliedFilters.status === 'all' ? undefined : appliedFilters.status,
  })
  useRegionTopbarHeader({
    icon: <RuleIcon size={20} />,
    title: 'Approval Requests',
    subtitle: 'Review and process Dealer and Chemist onboarding requests.',
    isLoading,
  })

  const approvalRequestKpis = kpis ?? {
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  }

  const filteredRequests = requests.filter((request) => {
    const regionMatch =
      appliedFilters.region === 'all' ||
      request.region === appliedFilters.region
    return regionMatch
  })

  const openDialog = (
    action: 'approve' | 'reject',
    request: ApprovalRequest,
  ) => {
    setRemarks('')
    setDialog({ open: true, action, request })
  }

  const closeDialog = () =>
    setDialog({ open: false, action: 'approve', request: null })

  const confirmDecision = () => {
    if (!dialog.request) return
    decide(dialog.request.id, dialog.action, remarks)
    closeDialog()
  }

  const columns: CommonTableColumn<ApprovalRequest>[] = [
    {
      key: 'applicantName',
      header: 'Partner Name',
      minWidth: 170,
      sortable: true,
      render: (row) => (
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={() => navigate(`/verification/approval-requests/${row.id}`)}
        >
          {row.applicantName}
        </Typography>
      ),
    },
    {
      key: 'requestType',
      header: 'Partner Type',
      sortable: true,
      render: (row) => row.requestType,
    },
    { key: 'city', header: 'City', sortable: true, render: (row) => row.city },
    {
      key: 'region',
      header: 'Region',
      sortable: true,
      render: (row) => row.region,
    },
    {
      key: 'submittedDate',
      header: 'Submitted Date',
      minWidth: 140,
      render: (row) => row.submittedDate,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      sortValue: (row) => row.status,
      render: (row) => <StatusBadge status={row.status} />,
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
              label="Pending Requests"
              value={approvalRequestKpis.pending}
              icon={<PendingActionsOutlined size={20} />}
              iconColor="warning"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Approved Requests"
              value={approvalRequestKpis.approved}
              icon={<CheckCircleOutlined size={20} />}
              iconColor="success"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Rejected Requests"
              value={approvalRequestKpis.rejected}
              icon={<CancelOutlined size={20} />}
              iconColor="error"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Total Requests"
              value={approvalRequestKpis.total}
              icon={<ListAltOutlined size={20} />}
              iconColor="primary"
            />
          )}
        </Grid>
      </Grid>

      <Box sx={{ mb: 2.5, mt: 7 }}>
        <ModularTabs
          tabs={REQUEST_TYPE_TABS}
          value={requestTypeTab}
          onChange={(next) => {
            setRequestTypeTab(next)
            setPage(0)
          }}
        />
      </Box>

      <CommonTable
        totalCount={totalItems}
        page={page}
        onPageChange={setPage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(next) => {
          setRowsPerPage(next)
          setPage(0)
        }}
        tableKey="approval-requests-list"
        columns={columns}
        rows={filteredRequests}
        loading={isLoading}
        getRowId={(row) => row.id}
        searchPlaceholder="Search requests…"
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(0)
        }}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={
          (appliedFilters.status !== 'all' ? 1 : 0) +
          (appliedFilters.region !== 'all' ? 1 : 0) +
          (appliedFilters.fromDate || appliedFilters.toDate ? 1 : 0)
        }
        onExportClick={() => {}}
        defaultSortBy="submittedDate"
        actions={[
          {
            label: 'View Details',
            onClick: (row) =>
              navigate(`/verification/approval-requests/${row.id}`),
          },
          { label: 'Approve', onClick: (row) => openDialog('approve', row) },
          {
            label: 'Reject',
            onClick: (row) => openDialog('reject', row),
            danger: true,
          },
        ]}
        emptyTitle="No approval requests found"
        emptyDescription="Try adjusting your filters or search terms."
      />

      <FilterDrawer<ApprovalFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Approval Requests"
        value={appliedFilters}
        onApply={(next) => {
          setAppliedFilters(next)
          setPage(0)
        }}
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
                  status: e.target.value as ApprovalFilters['status'],
                }))
              }
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </TextField>
            <TextField
              select
              label="Region"
              size="small"
              value={draft.region}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  region: e.target.value as ApprovalFilters['region'],
                }))
              }
            >
              <MenuItem value="all">All Regions</MenuItem>
              <MenuItem value="North">North</MenuItem>
              <MenuItem value="South">South</MenuItem>
              <MenuItem value="East">East</MenuItem>
              <MenuItem value="West">West</MenuItem>
            </TextField>
            <TextField
              type="date"
              label="Submitted From"
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              value={draft.fromDate}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, fromDate: e.target.value }))
              }
            />
            <TextField
              type="date"
              label="Submitted To"
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              value={draft.toDate}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, toDate: e.target.value }))
              }
            />
          </Stack>
        )}
      </FilterDrawer>

      <Modal
        open={dialog.open}
        onClose={closeDialog}
        title={
          dialog.action === 'approve' ? 'Approve Request' : 'Reject Request'
        }
        description={
          dialog.action === 'approve'
            ? 'The applicant will be activated and eligible for login and reward activities.'
            : 'Provide a reason for rejecting this request. The applicant will remain inactive.'
        }
        primaryActionLabel={dialog.action === 'approve' ? 'Approve' : 'Reject'}
        primaryActionColor={dialog.action === 'approve' ? 'primary' : 'error'}
        onPrimaryAction={confirmDecision}
      >
        <TextField
          fullWidth
          multiline
          minRows={3}
          size="small"
          label={
            dialog.action === 'approve'
              ? 'Remarks (optional)'
              : 'Rejection Reason'
          }
          required={dialog.action === 'reject'}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
      </Modal>
    </>
  )
}
