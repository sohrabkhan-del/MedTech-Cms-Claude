import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Chip, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material'
import {
  ClipboardList as ClipboardListIcon,
  LogIn,
  PencilLine,
  Download,
  FileSpreadsheet,
  FileText,
} from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import { useAuditLogs } from '@/features/audit/hooks/useAuditLogs'
import type { AuditActionType, AuditEntityType, AuditLogEntry, AuditModule, AuditStatus, AuditUserRole } from '@/features/audit/types/audit.types'

const statusConfig: Record<AuditStatus, { label: string; color: 'success' | 'error' }> = {
  success: { label: 'Success', color: 'success' },
  failed: { label: 'Failed', color: 'error' },
}

interface AuditLogFilters extends Record<string, unknown> {
  module: AuditModule | 'all'
  action: AuditActionType | 'all'
  entity: AuditEntityType | 'all'
  userRole: AuditUserRole | 'all'
  status: AuditStatus | 'all'
  fromDate: string
  toDate: string
}

export function AuditLogListPage() {
  const navigate = useNavigate()
  useRegionTopbarHeader({
    icon: <ClipboardListIcon size={20} />,
    title: 'Audit Logs',
    subtitle: 'Complete history of user and system activities across the platform.',
  })
  const { logs, kpis, filterOptions } = useAuditLogs()
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<AuditLogFilters>({
    module: 'all',
    action: 'all',
    entity: 'all',
    userRole: 'all',
    status: 'all',
    fromDate: '',
    toDate: '',
  })

  const auditKpis = kpis ?? { totalEntries: 0, loginActivities: 0, recordUpdates: 0, exportActivities: 0 }
  const options = filterOptions ?? { moduleOptions: [], actionOptions: [], entityOptions: [], userRoleOptions: [] }

  const filteredLogs = useMemo(
    () =>
      logs.filter((log) => {
        const moduleMatch = appliedFilters.module === 'all' || log.module === appliedFilters.module
        const actionMatch = appliedFilters.action === 'all' || log.action === appliedFilters.action
        const entityMatch = appliedFilters.entity === 'all' || log.entity === appliedFilters.entity
        const roleMatch = appliedFilters.userRole === 'all' || log.userRole === appliedFilters.userRole
        const statusMatch = appliedFilters.status === 'all' || log.status === appliedFilters.status
        return moduleMatch && actionMatch && entityMatch && roleMatch && statusMatch
      }),
    [logs, appliedFilters],
  )

  const filterCount = [
    appliedFilters.module !== 'all',
    appliedFilters.action !== 'all',
    appliedFilters.entity !== 'all',
    appliedFilters.userRole !== 'all',
    appliedFilters.status !== 'all',
    !!(appliedFilters.fromDate || appliedFilters.toDate),
  ].filter(Boolean).length

  const columns: CommonTableColumn<AuditLogEntry>[] = [
    {
      key: 'id',
      header: 'Log ID',
      minWidth: 130,
      sortable: true,
      sortValue: (row) => row.id,
      render: (row) => (
        <Typography
          sx={{ fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          onClick={() => navigate(`/audit/audit-logs/${row.id}`)}
        >
          {row.id}
        </Typography>
      ),
    },
    { key: 'module', header: 'Module', minWidth: 160, sortable: true, render: (row) => row.module },
    { key: 'action', header: 'Action', minWidth: 140, sortable: true, render: (row) => row.action },
    { key: 'entity', header: 'Entity', minWidth: 110, render: (row) => row.entity },
    { key: 'performedBy', header: 'Performed By', minWidth: 150, sortable: true, sortValue: (row) => row.performedBy, render: (row) => row.performedBy },
    { key: 'userRole', header: 'User Role', minWidth: 120, render: (row) => row.userRole },
    { key: 'dateTime', header: 'Date & Time', minWidth: 170, sortable: true, render: (row) => row.dateTime },
    { key: 'ipAddress', header: 'IP Address', minWidth: 130, render: (row) => row.ipAddress },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      sortValue: (row) => row.status,
      render: (row) => <Chip size="small" label={statusConfig[row.status].label} color={statusConfig[row.status].color} />,
    },
  ]

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Total Audit Entries" value={auditKpis.totalEntries} icon={<ClipboardListIcon size={20} />} iconColor="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Login Activities" value={auditKpis.loginActivities} icon={<LogIn size={20} />} iconColor="info" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Record Updates" value={auditKpis.recordUpdates} icon={<PencilLine size={20} />} iconColor="secondary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Export Activities" value={auditKpis.exportActivities} icon={<Download size={20} />} iconColor="warning" />
        </Grid>
      </Grid>

      <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end', mb: 1.5 }}>
        <Button size="small" variant="outlined" color="success" startIcon={<FileSpreadsheet size={16} />} onClick={() => {}} sx={{ fontSize: '0.75rem' }}>
          Export Excel
        </Button>
        <Button size="small" variant="outlined" color="secondary" startIcon={<FileText size={16} />} onClick={() => {}} sx={{ fontSize: '0.75rem' }}>
          Export CSV
        </Button>
      </Stack>

      <CommonTable
        tableKey="audit-logs-list"
        columns={columns}
        rows={filteredLogs}
        getRowId={(row) => row.id}
        searchPlaceholder="Search by log ID, entity, or performed by…"
        searchKeys={(row) => `${row.id} ${row.entityName} ${row.performedBy} ${row.module}`}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={filterCount}
        defaultSortBy="dateTime"
        defaultSortDir="desc"
        actions={[{ label: 'View', onClick: (row) => navigate(`/audit/audit-logs/${row.id}`) }]}
        emptyTitle="No audit log entries found"
        emptyDescription="Try adjusting your filters or search terms."
      />

      <FilterDrawer<AuditLogFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Audit Logs"
        value={appliedFilters}
        onApply={setAppliedFilters}
      >
        {(draft, setDraft) => (
          <Stack spacing={3}>
            <TextField
              select
              label="Module"
              size="small"
              value={draft.module}
              onChange={(e) => setDraft((prev) => ({ ...prev, module: e.target.value as AuditLogFilters['module'] }))}
            >
              <MenuItem value="all">All Modules</MenuItem>
              {options.moduleOptions.map((m) => (
                <MenuItem key={m} value={m}>
                  {m}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Action Type"
              size="small"
              value={draft.action}
              onChange={(e) => setDraft((prev) => ({ ...prev, action: e.target.value as AuditLogFilters['action'] }))}
            >
              <MenuItem value="all">All Actions</MenuItem>
              {options.actionOptions.map((a) => (
                <MenuItem key={a} value={a}>
                  {a}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Entity"
              size="small"
              value={draft.entity}
              onChange={(e) => setDraft((prev) => ({ ...prev, entity: e.target.value as AuditLogFilters['entity'] }))}
            >
              <MenuItem value="all">All Entities</MenuItem>
              {options.entityOptions.map((e) => (
                <MenuItem key={e} value={e}>
                  {e}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="User Role"
              size="small"
              value={draft.userRole}
              onChange={(e) => setDraft((prev) => ({ ...prev, userRole: e.target.value as AuditLogFilters['userRole'] }))}
            >
              <MenuItem value="all">All Roles</MenuItem>
              {options.userRoleOptions.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Status"
              size="small"
              value={draft.status}
              onChange={(e) => setDraft((prev) => ({ ...prev, status: e.target.value as AuditLogFilters['status'] }))}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="success">Success</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
            </TextField>
            <TextField
              type="date"
              label="Date From"
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              value={draft.fromDate}
              onChange={(e) => setDraft((prev) => ({ ...prev, fromDate: e.target.value }))}
            />
            <TextField
              type="date"
              label="Date To"
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
