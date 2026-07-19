import { useNavigate, useParams } from 'react-router-dom'
import { Box, Chip, Stack, Typography } from '@mui/material'
import { ClipboardList as ClipboardListIcon, ArrowLeft as ArrowLeftIcon, ExternalLink } from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { ActivityTimeline } from '@/components/common/ActivityTimeline/ActivityTimeline'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { getAuditLogById } from '@/features/audit/mockAuditLogs'
import type { AuditChangedField, AuditEntityType, AuditStatus } from '@/types/auditLog'

const statusConfig: Record<AuditStatus, { label: string; color: 'success' | 'error' }> = {
  success: { label: 'Success', color: 'success' },
  failed: { label: 'Failed', color: 'error' },
}

const entityRouteResolver: Partial<Record<AuditEntityType, (entityId: string) => string>> = {
  Dealer: () => '/partners/dealers',
  Chemist: () => '/partners/chemists',
  MR: () => '/system-users/medical-representatives',
  Product: () => '/inventory/product-master',
  Scheme: () => '/scheme-management/schemes/general',
  Wallet: () => '/rewards-wallet/wallet-management',
  Redemption: () => '/rewards-wallet/reward-redemptions',
}

export function AuditLogDetailsPage() {
  const { logId } = useParams<{ logId: string }>()
  const navigate = useNavigate()
  const log = getAuditLogById(logId ?? '')

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
    { key: 'fieldName', header: 'Field Name', minWidth: 180, sortable: true, render: (row) => row.fieldName },
    { key: 'oldValue', header: 'Old Value', minWidth: 160, render: (row) => row.oldValue },
    { key: 'newValue', header: 'New Value', minWidth: 160, render: (row) => row.newValue },
  ]

  const relatedEntityPath = entityRouteResolver[log.entity]?.(log.entityId)

  return (
    <>
      <Stack
        direction="row"
        sx={{ alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}
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
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant="h1">{log.id}</Typography>
              <Chip size="small" label={statusConfig[log.status].label} color={statusConfig[log.status].color} />
            </Stack>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {log.module} · {log.action} · {log.entityName}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Chip size="small" label="Read-only" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.75rem' }} />
          <Box
            component="button"
            type="button"
            onClick={() => navigate('/audit/audit-logs')}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              height: 36,
              px: 1.5,
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'primary.main',
              border: '1px solid',
              borderColor: 'primary.main',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              cursor: 'pointer',
            }}
          >
            <ArrowLeftIcon size={18} />
            Back
          </Box>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Summary">
          <DetailFieldGrid
            fields={[
              { label: 'Log ID', value: log.id },
              { label: 'Module', value: log.module },
              { label: 'Action', value: log.action },
              { label: 'Entity', value: log.entity },
              { label: 'Performed By', value: log.performedBy },
              { label: 'User Role', value: log.userRole },
              { label: 'Date & Time', value: log.dateTime },
              { label: 'Status', value: <Chip size="small" label={statusConfig[log.status].label} color={statusConfig[log.status].color} /> },
            ]}
          />
        </SectionCard>

        <SectionCard title="Activity Information">
          <DetailFieldGrid
            fields={[
              { label: 'Action Type', value: log.action },
              { label: 'Module Name', value: log.module },
              { label: 'Entity Name', value: log.entityName },
              { label: 'Entity ID', value: log.entityId },
              { label: 'Performed By', value: log.performedBy },
              { label: 'User Role', value: log.userRole },
              { label: 'Timestamp', value: log.dateTime },
              { label: 'IP Address', value: log.ipAddress },
              { label: 'Device Information', value: log.device },
              { label: 'Browser', value: log.browser },
              { label: 'Status', value: <Chip size="small" label={statusConfig[log.status].label} color={statusConfig[log.status].color} /> },
            ]}
          />
        </SectionCard>

        <SectionCard title="Changed Data">
          <CommonTable
            tableKey="audit-log-changed-data"
            columns={changedDataColumns}
            rows={log.changedData}
            getRowId={(row) => row.id}
            searchPlaceholder="Search changed fields…"
            searchKeys={(row) => row.fieldName}
            emptyTitle="No field changes recorded"
            emptyDescription="This activity did not modify any tracked fields."
          />
        </SectionCard>

        <SectionCard title="Activity Timeline">
          <ActivityTimeline entries={log.timeline} emptyTitle="No timeline activity yet" />
        </SectionCard>

        <SectionCard title="Related Entity">
          {relatedEntityPath ? (
            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                borderRadius: '10px',
                border: '1px solid',
                borderColor: 'divider',
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'background.default' },
              }}
              onClick={() => navigate(relatedEntityPath)}
            >
              <Box>
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{log.entityName}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {log.entity} · {log.entityId}
                </Typography>
              </Box>
              <ExternalLink size={18} />
            </Stack>
          ) : (
            <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
              {log.entityName} ({log.entity} · {log.entityId})
            </Typography>
          )}
        </SectionCard>
      </Stack>
    </>
  )
}
