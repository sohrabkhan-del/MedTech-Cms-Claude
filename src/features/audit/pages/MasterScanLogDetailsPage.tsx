import { useNavigate, useParams } from 'react-router-dom'
import { Box, Chip, Stack, Typography } from '@mui/material'
import { ListTree as ListTreeIcon, ArrowLeft as ArrowLeftIcon, ShieldAlert } from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { ActivityTimeline } from '@/components/common/ActivityTimeline/ActivityTimeline'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { HierarchyTree, type HierarchyTreeNode } from '@/components/common/HierarchyTree/HierarchyTree'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { useMasterScanLogDetail } from '@/features/audit/hooks/useMasterScanLogDetail'
import type { ScanHistoryEntry, ScanLogStatus, ScanLogWalletStatus } from '@/features/audit/types/audit.types'

const scanStatusConfig: Record<ScanLogStatus, { label: string; color: 'success' | 'warning' | 'error' }> = {
  valid: { label: 'Valid', color: 'success' },
  duplicate: { label: 'Duplicate', color: 'warning' },
  invalid: { label: 'Invalid', color: 'error' },
}

const walletStatusConfig: Record<ScanLogWalletStatus, { label: string; color: 'success' | 'warning' | 'error' }> = {
  credited: { label: 'Credited', color: 'success' },
  pending: { label: 'Pending', color: 'warning' },
  failed: { label: 'Failed', color: 'error' },
}

export function MasterScanLogDetailsPage() {
  const { logId } = useParams<{ logId: string }>()
  const navigate = useNavigate()
  const { log } = useMasterScanLogDetail(logId)

  if (!log) {
    return (
      <EmptyState
        title="Scan log not found"
        description="This scan record may have been removed."
        actionLabel="Back to Master Scan Table Logs"
        onAction={() => navigate('/audit/master-scan-table-logs')}
      />
    )
  }

  const scanHistoryColumns: CommonTableColumn<ScanHistoryEntry>[] = [
    { key: 'scanDateTime', header: 'Scan Date & Time', minWidth: 170, sortable: true, render: (row) => row.scanDateTime },
    { key: 'userName', header: 'User Name', minWidth: 170, render: (row) => row.userName },
    { key: 'userType', header: 'User Type', minWidth: 110, render: (row) => row.userType },
    {
      key: 'scanResult',
      header: 'Scan Result',
      render: (row) => <Chip size="small" label={scanStatusConfig[row.scanResult].label} color={scanStatusConfig[row.scanResult].color} />,
    },
    { key: 'rewardPoints', header: 'Reward Points', align: 'right', render: (row) => row.rewardPoints.toLocaleString('en-IN') },
    { key: 'device', header: 'Device', minWidth: 150, render: (row) => row.device },
    { key: 'ipAddress', header: 'IP Address', minWidth: 130, render: (row) => row.ipAddress },
  ]

  const distributionNodes: HierarchyTreeNode[] = [
    {
      id: 'medtech',
      label: 'MedTech',
      sublabel: 'Manufacturer',
      children: [
        {
          id: 'distributor',
          label: log.distributor,
          sublabel: 'Distributor',
          children: [
            log.dealer
              ? {
                  id: 'dealer',
                  label: log.dealer,
                  sublabel: 'Dealer',
                  children: log.chemist
                    ? [{ id: 'chemist', label: log.chemist, sublabel: 'Chemist' }]
                    : undefined,
                }
              : log.chemist
                ? { id: 'chemist', label: log.chemist, sublabel: 'Chemist' }
                : { id: 'unassigned', label: 'Unassigned', sublabel: 'No downstream partner recorded' },
          ],
        },
      ],
    },
  ]

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
            <ListTreeIcon size={18} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant="h1">{log.barcodeNumber}</Typography>
              <Chip size="small" label={scanStatusConfig[log.scanResult].label} color={scanStatusConfig[log.scanResult].color} />
            </Stack>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {log.id} · {log.productName} · {log.batchNumber}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Chip size="small" label="Read-only" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.75rem' }} />
          <Box
            component="button"
            type="button"
            onClick={() => navigate('/audit/master-scan-table-logs')}
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
        <SectionCard title="Product Traceability">
          <DetailFieldGrid
            fields={[
              { label: 'Product Code', value: log.productCode },
              { label: 'Product Name', value: log.productName },
              { label: 'Product Category', value: log.productCategory },
              { label: 'Batch Number', value: log.batchNumber },
              { label: 'Manufacturing Date', value: log.manufacturingDate },
              { label: 'Expiry Date', value: log.expiryDate },
            ]}
          />
        </SectionCard>

        <SectionCard title="Distribution Journey">
          <HierarchyTree nodes={distributionNodes} defaultExpandedDepth={3} />
        </SectionCard>

        <SectionCard title="Scan Information">
          <DetailFieldGrid
            fields={[
              { label: 'Barcode Number', value: log.barcodeNumber },
              { label: 'Scan Date & Time', value: log.scanDateTime },
              { label: 'Scan Location', value: log.scanLocation },
              { label: 'Scan Result', value: <Chip size="small" label={scanStatusConfig[log.scanResult].label} color={scanStatusConfig[log.scanResult].color} /> },
              { label: 'Device Information', value: log.device },
              { label: 'IP Address', value: log.ipAddress },
            ]}
          />
        </SectionCard>

        <SectionCard title="Reward Calculation">
          <DetailFieldGrid
            fields={[
              { label: 'Base Reward Points', value: log.baseRewardPoints.toLocaleString('en-IN') },
              { label: 'Applied Scheme', value: log.appliedScheme },
              { label: 'Bonus Points', value: log.bonusPoints.toLocaleString('en-IN') },
              { label: 'Total Reward Points', value: log.totalRewardPoints.toLocaleString('en-IN') },
              {
                label: 'Wallet Credit Status',
                value: <Chip size="small" label={walletStatusConfig[log.walletStatus].label} color={walletStatusConfig[log.walletStatus].color} />,
              },
              { label: 'Wallet Transaction ID', value: log.walletTransactionId ?? '—' },
            ]}
          />
        </SectionCard>

        <SectionCard title="Ownership Timeline">
          <ActivityTimeline
            entries={log.ownershipTimeline.map((entry) => ({ id: entry.id, activity: entry.activity, dateTime: entry.dateTime }))}
            emptyTitle="No ownership activity recorded"
          />
        </SectionCard>

        <SectionCard title="Scan History">
          <CommonTable
            tableKey="scan-log-scan-history"
            columns={scanHistoryColumns}
            rows={log.scanHistory}
            getRowId={(row) => row.id}
            searchPlaceholder="Search scan history…"
            searchKeys={(row) => `${row.userName} ${row.device}`}
            defaultSortBy="scanDateTime"
            defaultSortDir="desc"
            emptyTitle="No scans recorded for this barcode"
          />
        </SectionCard>

        <SectionCard title="Audit Timeline">
          <ActivityTimeline
            entries={log.auditTimeline.map((entry) => ({
              id: entry.id,
              activity: entry.flagged ? `⚠ ${entry.activity}` : entry.activity,
              dateTime: entry.dateTime,
            }))}
            emptyTitle="No audit events recorded"
          />
          {log.auditTimeline.some((e) => e.flagged) && (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 2, p: 1.5, borderRadius: '8px', backgroundColor: 'error.light' }}>
              <ShieldAlert size={18} color="#E5484D" />
              <Typography sx={{ fontSize: '0.8125rem', color: 'error.main', fontWeight: 600 }}>
                A security alert was generated for this barcode — flagged for fraud investigation.
              </Typography>
            </Stack>
          )}
        </SectionCard>
      </Stack>
    </>
  )
}
