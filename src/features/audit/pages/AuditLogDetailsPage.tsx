import { useNavigate, useParams } from 'react-router-dom'
import { Box, Chip, Stack, Typography } from '@mui/material'
import {
  ClipboardList as ClipboardListIcon,
  ArrowLeft as ArrowLeftIcon,
} from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { DetailsPageSkeleton } from '@/components/common/DetailsPageSkeleton/DetailsPageSkeleton'
import { useAuditLogDetail } from '@/features/audit/hooks/useAuditLogDetail'
import type { AuditChangedField } from '@/features/audit/types/audit.types'

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

export function AuditLogDetailsPage() {
  const { entityId } = useParams<{ entityId: string }>()
  const navigate = useNavigate()
  const { log, isLoading } = useAuditLogDetail(entityId)

  if (isLoading) {
    return <DetailsPageSkeleton sections={3} />
  }

  if (!log) {
    return (
      <EmptyState
        title="Audit log not found"
        description="This audit record may have been removed."
        actionLabel="Back to Audit Logs"
        onAction={() => navigate('/audit/audit-logs')}
      />
    )
  }

  const changedDataColumns: CommonTableColumn<AuditChangedField>[] = [
    {
      key: 'fieldName',
      header: 'Field',
      minWidth: 180,
      sortable: true,
      render: (row) => formatAuditLabel(row.fieldName),
    },
    {
      key: 'oldValue',
      header: 'Previous Value',
      minWidth: 180,
      render: (row) => row.oldValue,
    },
    {
      key: 'newValue',
      header: 'Updated Value',
      minWidth: 180,
      render: (row) => row.newValue,
    },
  ]

  return (
    <>
      <Stack
        direction="row"
        sx={{
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
        }}
      >
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
              flexShrink: 0,
            }}
          >
            <ClipboardListIcon size={18} />
          </Box>
          <Box>
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', flexWrap: 'wrap' }}
            >
              <Typography variant="h1">{log.module}</Typography>
              <Chip
                size="small"
                label={formatAuditLabel(log.action)}
                color={actionColor[log.action] ?? 'default'}
              />
            </Stack>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Chip
            size="small"
            label="Read-only"
            variant="outlined"
            sx={{ fontWeight: 600, fontSize: '0.75rem' }}
          />
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Audit Details">
          <DetailFieldGrid
            fields={[
              { label: 'Module', value: formatAuditLabel(log.module) },
              { label: 'Action', value: formatAuditLabel(log.action) },

              { label: 'Reason', value: log.reason || '—' },
              { label: 'Performed By', value: log.performedBy || '—' },
              { label: 'User Role', value: log.userRole || '—' },
              {
                label: 'Date & Time',
                value: new Date(log.dateTime).toLocaleString('en-IN'),
              },
            ]}
          />
        </SectionCard>

        <SectionCard title="Changed Data">
          <CommonTable
            tableKey="audit-log-changed-data"
            columns={changedDataColumns}
            rows={log.changedData}
            loading={isLoading}
            getRowId={(row) => row.id}
            hideSearch
            emptyTitle="No field changes recorded"
            emptyDescription="This activity did not modify any tracked fields."
          />
        </SectionCard>
      </Stack>
    </>
  )
}
