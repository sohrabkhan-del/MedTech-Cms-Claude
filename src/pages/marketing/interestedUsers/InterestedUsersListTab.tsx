import { useMemo, useState } from 'react'
import { Chip, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { Users, Sparkles, Clock3, CheckCheck } from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { useRegionFilter } from '@/contexts/RegionFilterContext'
import { mockInterestedUsers, interestedUserKpis } from '@/features/marketing/mockInterestedUsers'
import { mrs } from '@/features/partners/mockPartnerData'
import type { InterestedUserLead, LeadStatus, LeadUserType } from '@/types/interestedUser'
import type { PartnerZone } from '@/types/partner'

const leadStatusConfig: Record<LeadStatus, { label: string; color: 'info' | 'warning' | 'success' }> = {
  new: { label: 'New', color: 'info' },
  in_progress: { label: 'In Progress', color: 'warning' },
  closed: { label: 'Closed', color: 'success' },
}

interface LeadFilters extends Record<string, unknown> {
  leadStatus: LeadStatus | 'all'
  userType: LeadUserType | 'all'
  handledBy: string | 'all'
  fromDate: string
  toDate: string
}

interface InterestedUsersListTabProps {
  onViewLead: (lead: InterestedUserLead) => void
}

export function InterestedUsersListTab({ onViewLead }: InterestedUsersListTabProps) {
  const { region } = useRegionFilter()
  const regionZone = region === 'All India' ? null : (region as PartnerZone)
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<LeadFilters>({
    leadStatus: 'all',
    userType: 'all',
    handledBy: 'all',
    fromDate: '',
    toDate: '',
  })
  const [statusOverrides, setStatusOverrides] = useState<Record<string, LeadStatus>>({})
  const [deleted, setDeleted] = useState<Set<string>>(new Set())

  const resolveStatus = (lead: InterestedUserLead) => statusOverrides[lead.id] ?? lead.leadStatus

  const filteredLeads = useMemo(
    () =>
      mockInterestedUsers
        .filter((lead) => !deleted.has(lead.id))
        .filter((lead) => {
          const status = resolveStatus(lead)
          const regionMatch = !regionZone || lead.region === regionZone
          const statusMatch = appliedFilters.leadStatus === 'all' || status === appliedFilters.leadStatus
          const userTypeMatch = appliedFilters.userType === 'all' || lead.userType === appliedFilters.userType
          const handledByMatch = appliedFilters.handledBy === 'all' || lead.handledBy === appliedFilters.handledBy
          return regionMatch && statusMatch && userTypeMatch && handledByMatch
        }),
    [appliedFilters, statusOverrides, deleted, regionZone],
  )

  const columns: CommonTableColumn<InterestedUserLead>[] = [
    {
      key: 'userName',
      header: 'User Name',
      minWidth: 160,
      sortable: true,
      sortValue: (row) => row.userName,
      render: (row) => (
        <Typography
          sx={{ fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          onClick={() => onViewLead(row)}
        >
          {row.userName}
        </Typography>
      ),
    },
    { key: 'interestedProduct', header: 'Interested Product', minWidth: 190, render: (row) => row.interestedProduct },
    {
      key: 'leadStatus',
      header: 'Lead Status',
      minWidth: 120,
      render: (row) => {
        const status = resolveStatus(row)
        return <Chip size="small" label={leadStatusConfig[status].label} color={leadStatusConfig[status].color} />
      },
    },
    { key: 'requestedDate', header: 'Requested Date', minWidth: 140, sortable: true, render: (row) => row.requestedDate },
    { key: 'handledBy', header: 'Handled By', minWidth: 140, render: (row) => row.handledBy },
  ]

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Total Interested Users" value={interestedUserKpis.totalInterestedUsers} icon={<Users size={20} />} iconColor="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="New Leads" value={interestedUserKpis.newLeads} icon={<Sparkles size={20} />} iconColor="info" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Leads In Progress" value={interestedUserKpis.inProgressLeads} icon={<Clock3 size={20} />} iconColor="warning" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Closed / Converted Leads" value={interestedUserKpis.closedLeads} icon={<CheckCheck size={20} />} iconColor="success" />
        </Grid>
      </Grid>

      <CommonTable
        tableKey="interested-users-list"
        columns={columns}
        rows={filteredLeads}
        getRowId={(row) => row.id}
        searchPlaceholder="Search by user name or product…"
        searchKeys={(row) => `${row.userName} ${row.interestedProduct}`}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={
          (appliedFilters.leadStatus !== 'all' ? 1 : 0) +
          (appliedFilters.userType !== 'all' ? 1 : 0) +
          (appliedFilters.handledBy !== 'all' ? 1 : 0) +
          (appliedFilters.fromDate || appliedFilters.toDate ? 1 : 0)
        }
        onExportClick={() => {}}
        defaultSortBy="requestedDate"
        defaultSortDir="desc"
        actions={[
          { label: 'View Details', onClick: (row) => onViewLead(row) },
          { label: 'Approve / Close Lead', onClick: (row) => setStatusOverrides((prev) => ({ ...prev, [row.id]: 'closed' })) },
          { label: 'Delete Lead', onClick: (row) => setDeleted((prev) => new Set(prev).add(row.id)), danger: true },
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
              label="Lead Status"
              size="small"
              value={draft.leadStatus}
              onChange={(e) => setDraft((prev) => ({ ...prev, leadStatus: e.target.value as LeadFilters['leadStatus'] }))}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="new">New</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </TextField>
            <TextField
              select
              label="User Type"
              size="small"
              value={draft.userType}
              onChange={(e) => setDraft((prev) => ({ ...prev, userType: e.target.value as LeadFilters['userType'] }))}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="Dealer">Dealer</MenuItem>
              <MenuItem value="Chemist">Chemist</MenuItem>
            </TextField>
            <TextField
              select
              label="Handled By"
              size="small"
              value={draft.handledBy}
              onChange={(e) => setDraft((prev) => ({ ...prev, handledBy: e.target.value }))}
            >
              <MenuItem value="all">All Executives</MenuItem>
              {mrs.map((mr) => (
                <MenuItem key={mr} value={mr}>
                  {mr}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="date"
              label="Requested From"
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              value={draft.fromDate}
              onChange={(e) => setDraft((prev) => ({ ...prev, fromDate: e.target.value }))}
            />
            <TextField
              type="date"
              label="Requested To"
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              value={draft.toDate}
              onChange={(e) => setDraft((prev) => ({ ...prev, toDate: e.target.value }))}
            />
          </Stack>
        )}
      </FilterDrawer>
    </>
  )
}
