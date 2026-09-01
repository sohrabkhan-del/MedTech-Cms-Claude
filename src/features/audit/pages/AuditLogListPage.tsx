import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Chip,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { ClipboardList as ClipboardListIcon } from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { StatCardSkeleton } from '@/components/common/StatCard/StatCardSkeleton'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import { useRegionFilter } from '@/contexts/RegionFilterContext'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useAuditLogs } from '@/features/audit/hooks/useAuditLogs'
import { dateRangeToAnalyticsParams } from '@/utils/dateRangeToAnalyticsParams'
import type { AuditLogEntry } from '@/features/audit/types/audit.types'

const ENTITY_OPTIONS = ['PARTNER_AUTH', 'PARTNER_BUSINESS']
const ACTION_OPTIONS = ['CREATE', 'UPDATE', 'DELETE']
const DEFAULT_AUDIT_LOG_FILTERS: AuditLogFilters = {
  entity: 'all',
  action: 'all',
  fromDate: '',
  toDate: '',
}

const actionColor: Record<string, 'success' | 'info' | 'error' | 'default'> = {
  CREATE: 'success',
  UPDATE: 'info',
  DELETE: 'error',
}

function formatAuditLabel(value?: string | null): string {
  if (!value) return '—'

  return value
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

interface AuditLogFilters extends Record<string, unknown> {
  entity: string
  action: string
  fromDate: string
  toDate: string
}

export function AuditLogListPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const entityIdFilter = searchParams.get('entityId') || undefined
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<AuditLogFilters>(
    DEFAULT_AUDIT_LOG_FILTERS,
  )
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortBy, setSortBy] = useState('dateTime')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const { dateRange } = useRegionFilter()
  const analyticsParams = dateRangeToAnalyticsParams(dateRange)
  const shouldUseTopbarDateRange =
    dateRange.presetLabel !== 'Custom Range' ||
    !!(dateRange.from && dateRange.to)

  const { logs, totalItems, isLoading } = useAuditLogs({
    page: page + 1,
    limit: rowsPerPage,
    search: debouncedSearch || undefined,
    entity: appliedFilters.entity !== 'all' ? appliedFilters.entity : undefined,
    entityId: entityIdFilter,
    action: appliedFilters.action !== 'all' ? appliedFilters.action : undefined,
    preset: analyticsParams.preset,
    startDate: shouldUseTopbarDateRange
      ? analyticsParams.startDate
      : appliedFilters.fromDate || undefined,
    endDate: shouldUseTopbarDateRange
      ? analyticsParams.endDate
      : appliedFilters.toDate || undefined,
    sortBy,
    sortDir,
  })

  useRegionTopbarHeader({
    icon: <ClipboardListIcon size={20} />,
    title: 'Audit Logs',
    subtitle:
      'Complete history of user and system activities across the platform.',
    isLoading,
  })

  const filterCount = [
    appliedFilters.entity !== 'all',
    appliedFilters.action !== 'all',
    !!(appliedFilters.fromDate || appliedFilters.toDate),
  ].filter(Boolean).length

  const columns: CommonTableColumn<AuditLogEntry>[] = [
    {
      key: 'module',
      header: 'Module',
      minWidth: 160,
      sortable: true,
      render: (row) => (
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={() => navigate(`/audit/audit-logs/${row.entityId}`)}
        >
          {formatAuditLabel(row.module)}
        </Typography>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      minWidth: 120,
      sortable: true,
      render: (row) => (
        <Chip
          size="small"
          label={formatAuditLabel(row.action)}
          color={actionColor[row.action] ?? 'default'}
        />
      ),
    },
    {
      key: 'entityName',
      header: 'Entity',
      minWidth: 150,
      sortable: true,
      render: (row) => row.entityName,
    },
    {
      key: 'reason',
      header: 'Reason',
      minWidth: 220,
      sortable: true,
      render: (row) => row.reason || '—',
    },
    {
      key: 'performedBy',
      header: 'Performed By',
      minWidth: 150,
      sortable: true,
      render: (row) => row.performedBy,
    },
    {
      key: 'userRole',
      header: 'User Role',
      minWidth: 130,
      sortable: true,
      render: (row) => row.userRole,
    },
    {
      key: 'dateTime',
      header: 'Date & Time',
      minWidth: 170,
      sortable: true,
      sortValue: (row) => new Date(row.dateTime).getTime(),
      render: (row) => new Date(row.dateTime).toLocaleString('en-IN'),
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
              label="Total Audit Entries"
              value={totalItems}
              icon={<ClipboardListIcon size={20} />}
              iconColor="primary"
            />
          )}
        </Grid>
      </Grid>

      {entityIdFilter && (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Filtered by Entity ID:
          </Typography>
          <Chip
            size="small"
            label={entityIdFilter}
            onDelete={() =>
              setSearchParams((prev) => {
                const params = new URLSearchParams(prev)
                params.delete('entityId')
                return params
              })
            }
          />
        </Stack>
      )}

      <CommonTable
        tableKey="audit-logs-list"
        columns={columns}
        rows={logs}
        loading={isLoading}
        getRowId={(row) => row.id}
        searchPlaceholder="Search by entity ID or reason…"
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(0)
        }}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={filterCount}
        onSortChange={(columnKey, dir) => {
          setSortBy(columnKey)
          setSortDir(dir)
          setPage(0)
        }}
        defaultSortBy="dateTime"
        defaultSortDir="desc"
        totalCount={totalItems}
        page={page}
        onPageChange={setPage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(next) => {
          setRowsPerPage(next)
          setPage(0)
        }}
        actions={[
          {
            label: 'View',
            onClick: (row) => navigate(`/audit/audit-logs/${row.entityId}`),
          },
        ]}
        emptyTitle="No audit log entries found"
        emptyDescription="Try adjusting your filters or search terms."
      />

      <FilterDrawer<AuditLogFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Audit Logs"
        value={appliedFilters}
        resetValue={DEFAULT_AUDIT_LOG_FILTERS}
        onApply={(next) => {
          setAppliedFilters(next)
          setPage(0)
        }}
        onReset={() => {
          setAppliedFilters(DEFAULT_AUDIT_LOG_FILTERS)
          setPage(0)
        }}
      >
        {(draft, setDraft) => (
          <Stack spacing={3}>
            <TextField
              select
              label="Action"
              size="small"
              value={draft.action}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, action: e.target.value }))
              }
            >
              <MenuItem value="all">All Actions</MenuItem>
              {ACTION_OPTIONS.map((action) => (
                <MenuItem key={action} value={action}>
                  {action}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        )}
      </FilterDrawer>
    </>
  )
}
