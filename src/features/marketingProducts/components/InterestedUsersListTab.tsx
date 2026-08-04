import { useState } from 'react'
import {
  Chip,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { Users, Sparkles, Clock3, CheckCheck } from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { StatCardSkeleton } from '@/components/common/StatCard/StatCardSkeleton'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { useRegionFilter } from '@/contexts/RegionFilterContext'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useInterestedUsers } from '@/features/marketingProducts/hooks/useInterestedUsers'
import { LeadActionDialog } from '@/features/marketingProducts/components/LeadActionDialog'
import { useToast } from '@/contexts/ToastContext'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import type {
  InterestedUserLead,
  LeadStatus,
  LeadUserType,
} from '@/features/marketingProducts/types/marketingProducts.types'

const leadStatusConfig: Record<
  LeadStatus,
  { label: string; color: 'info' | 'warning' | 'success' }
> = {
  new: { label: 'New', color: 'info' },
  followed_up: { label: 'Followed Up', color: 'warning' },
  closed: { label: 'Closed', color: 'success' },
}

interface LeadFilters extends Record<string, unknown> {
  leadStatus: LeadStatus | 'all'
  userType: LeadUserType | 'all'
}

// Maps CommonTable column keys to GET /showcase-products/interests `sortBy` field names.
const SORT_FIELD_MAP: Partial<Record<string, string>> = {
  requestedDate: 'createdAt',
}

interface InterestedUsersListTabProps {
  onViewLead: (lead: InterestedUserLead) => void
}

export function InterestedUsersListTab({
  onViewLead,
}: InterestedUsersListTabProps) {
  const toast = useToast()
  const { regionId: topbarRegionId } = useRegionFilter()
  const [search, setSearch] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<LeadFilters>({
    leadStatus: 'all',
    userType: 'all',
  })
  const [sortColumn, setSortColumn] = useState('requestedDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [actionDialog, setActionDialog] = useState<{ mode: 'follow-up' | 'close'; leadId: string } | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const debouncedSearch = useDebouncedValue(search, 300)

  const { leads, kpis, isLoading, isKpisLoading, followUp, close, remove } = useInterestedUsers({
    page: 1,
    limit: 10,
    search: debouncedSearch,
    status: appliedFilters.leadStatus,
    userType: appliedFilters.userType,
    regionId: topbarRegionId || undefined,
    sortBy: SORT_FIELD_MAP[sortColumn],
    sortOrder,
  })

  async function handleActionSubmit(note: string) {
    if (!actionDialog) return
    setActionLoading(true)
    try {
      if (actionDialog.mode === 'follow-up') {
        await followUp(actionDialog.leadId, note)
        toast.success('Interest marked as followed up.')
      } else {
        await close(actionDialog.leadId, note)
        toast.success('Interest marked as closed.')
      }
      setActionDialog(null)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update interest.'))
    } finally {
      setActionLoading(false)
    }
  }

  const interestedUserKpis = kpis ?? {
    totalInterestedUsers: 0,
    newLeads: 0,
    leadsInProgress: 0,
    closedConvertedLeads: 0,
  }

  const columns: CommonTableColumn<InterestedUserLead>[] = [
    {
      key: 'userName',
      header: 'User Name',
      minWidth: 160,
      sortable: true,
      sortValue: (row) => row.userName,
      render: (row) => (
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={() => onViewLead(row)}
        >
          {row.userName}
        </Typography>
      ),
    },
    {
      key: 'interestedProduct',
      header: 'Interested Product',
      minWidth: 190,
      render: (row) => row.interestedProduct,
    },
    {
      key: 'leadStatus',
      header: 'Interest Status',
      minWidth: 120,
      render: (row) => (
        <Chip
          size="small"
          label={leadStatusConfig[row.leadStatus].label}
          color={leadStatusConfig[row.leadStatus].color}
        />
      ),
    },
    {
      key: 'requestedDate',
      header: 'Requested Date',
      minWidth: 140,
      sortable: true,
      render: (row) => row.requestedDate,
    },
    {
      key: 'handledBy',
      header: 'Handled By',
      minWidth: 140,
      render: (row) => row.handledBy || '-',
    },
  ]

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isKpisLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Total Interested Users"
              value={interestedUserKpis.totalInterestedUsers}
              icon={<Users size={20} />}
              iconColor="primary"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isKpisLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="New Leads"
              value={interestedUserKpis.newLeads}
              icon={<Sparkles size={20} />}
              iconColor="info"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isKpisLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Leads In Progress"
              value={interestedUserKpis.leadsInProgress}
              icon={<Clock3 size={20} />}
              iconColor="warning"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isKpisLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Closed / Converted Leads"
              value={interestedUserKpis.closedConvertedLeads}
              icon={<CheckCheck size={20} />}
              iconColor="success"
            />
          )}
        </Grid>
      </Grid>

      <CommonTable
        key={`${topbarRegionId ?? 'all'}-${appliedFilters.leadStatus}-${appliedFilters.userType}`}
        onSortChange={(columnKey, dir) => {
          setSortColumn(columnKey)
          setSortOrder(dir)
        }}
        tableKey="interested-users-list"
        columns={columns}
        rows={leads}
        loading={isLoading}
        getRowId={(row) => row.id}
        searchPlaceholder="Search by user name or product…"
        searchValue={search}
        onSearchChange={setSearch}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={
          (appliedFilters.leadStatus !== 'all' ? 1 : 0) +
          (appliedFilters.userType !== 'all' ? 1 : 0)
        }
        onExportClick={() => {}}
        defaultSortBy="requestedDate"
        defaultSortDir="desc"
        actions={[
          { label: 'View Details', onClick: (row) => onViewLead(row) },
          {
            label: 'Mark as Followed Up',
            hidden: (row) => row.leadStatus !== 'new',
            onClick: (row) => setActionDialog({ mode: 'follow-up', leadId: row.id }),
          },
          {
            label: 'Mark as Closed',
            hidden: (row) => row.leadStatus === 'closed',
            onClick: (row) => setActionDialog({ mode: 'close', leadId: row.id }),
          },
          {
            label: 'Delete Interest',
            onClick: (row) => remove(row.id),
            danger: true,
          },
        ]}
        emptyTitle="No interested users found"
        emptyDescription="Try adjusting your filters or search terms."
      />

      <FilterDrawer<LeadFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Interested Users"
        value={appliedFilters}
        onApply={setAppliedFilters}
      >
        {(draft, setDraft) => (
          <Stack spacing={3}>
            <TextField
              select
              label="Interest Status"
              size="small"
              value={draft.leadStatus}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  leadStatus: e.target.value as LeadFilters['leadStatus'],
                }))
              }
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="new">New</MenuItem>
              <MenuItem value="followed_up">Followed Up</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </TextField>
            <TextField
              select
              label="User Type"
              size="small"
              value={draft.userType}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  userType: e.target.value as LeadFilters['userType'],
                }))
              }
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="Dealer">Dealer</MenuItem>
              <MenuItem value="Chemist">Chemist</MenuItem>
            </TextField>
          </Stack>
        )}
      </FilterDrawer>

      <LeadActionDialog
        open={!!actionDialog}
        mode={actionDialog?.mode ?? 'follow-up'}
        onClose={() => setActionDialog(null)}
        onSubmit={handleActionSubmit}
        loading={actionLoading}
      />
    </>
  )
}
