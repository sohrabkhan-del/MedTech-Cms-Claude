import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Chip, Grid, Stack, Typography } from '@mui/material'
import {
  Target,
  ArrowLeft as ArrowBackOutlined,
  Pencil,
  CircleCheck,
  Ban,
  Clock3,
  Copy,
  Trash2,
  Users,
  ScanLine,
  Trophy,
  Gauge,
} from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { ActivityTimeline } from '@/components/common/ActivityTimeline/ActivityTimeline'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { Modal } from '@/components/common/Modal/Modal'
import { useSchemeDetail } from '@/features/schemeManagement/hooks/useSchemeDetail'
import type { Scheme, SchemeAuditEntry, SchemeEligibleProduct, SchemeStatus } from '@/features/schemeManagement/types/schemeManagement.types'

const statusConfig: Record<SchemeStatus, { label: string; color: 'success' | 'default' | 'error' | 'info' | 'warning' }> = {
  active: { label: 'Active', color: 'success' },
  inactive: { label: 'Inactive', color: 'default' },
  expired: { label: 'Expired', color: 'error' },
  upcoming: { label: 'Upcoming', color: 'info' },
  draft: { label: 'Draft', color: 'warning' },
}

const eligibleProductColumns: CommonTableColumn<SchemeEligibleProduct>[] = [
  { key: 'productCode', header: 'Product Code', minWidth: 130, render: (row) => row.productCode },
  { key: 'productName', header: 'Product Name', minWidth: 190, sortable: true, sortValue: (row) => row.productName, render: (row) => row.productName },
  { key: 'productCategory', header: 'Product Category', minWidth: 150, render: (row) => row.productCategory },
  { key: 'productBrand', header: 'Product Brand', minWidth: 150, render: (row) => row.productBrand },
  { key: 'bonusPoints', header: 'Bonus Points', align: 'right', sortable: true, sortValue: (row) => row.bonusPoints, render: (row) => row.bonusPoints },
  { key: 'status', header: 'Status', render: (row) => <Chip size="small" label={row.status === 'active' ? 'Active' : 'Inactive'} color={row.status === 'active' ? 'success' : 'default'} /> },
]

const auditColumns: CommonTableColumn<SchemeAuditEntry>[] = [
  { key: 'date', header: 'Date', sortable: true, render: (row) => row.date },
  { key: 'action', header: 'Action', render: (row) => row.action },
  { key: 'performedBy', header: 'Performed By', render: (row) => row.performedBy },
  { key: 'previousValue', header: 'Previous Value', render: (row) => row.previousValue },
  { key: 'newValue', header: 'New Value', render: (row) => row.newValue },
  { key: 'remarks', header: 'Remarks', render: (row) => row.remarks },
]

function listPathFor(scheme: Scheme): string {
  return scheme.schemeCategory === 'general' ? '/scheme-management/schemes/general' : '/scheme-management/schemes/sessional'
}

export function SchemeDetailsPage() {
  const navigate = useNavigate()
  const { schemeId } = useParams<{ schemeId: string }>()
  const { scheme, setStatus, remove } = useSchemeDetail(schemeId)
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (!scheme) {
    return (
      <EmptyState
        title="Scheme not found"
        description="This scheme may have been removed."
        actionLabel="Back to Schemes"
        onAction={() => navigate('/scheme-management/schemes/general')}
      />
    )
  }

  const listPath = listPathFor(scheme)

  const confirmDelete = () => {
    remove()
    setDeleteOpen(false)
    navigate(listPath)
  }

  return (
    <>
      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
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
            }}
          >
            <Target size={18} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="h1">{scheme.schemeName}</Typography>
              <Chip size="small" label={statusConfig[scheme.status].label} color={statusConfig[scheme.status].color} />
            </Stack>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {scheme.id} · {scheme.schemeCategory === 'general' ? 'General Scheme' : 'Seasonal Scheme'}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
          <Button variant="outlined" startIcon={<Pencil size={20} />} onClick={() => navigate(`${listPath}/${scheme.id}/edit`)} sx={{ fontSize: '0.75rem' }}>
            Edit Scheme
          </Button>
          {scheme.status !== 'active' ? (
            <Button variant="outlined" color="success" startIcon={<CircleCheck size={20} />} onClick={() => setStatus('active')} sx={{ fontSize: '0.75rem' }}>
              Activate
            </Button>
          ) : (
            <Button variant="outlined" color="warning" startIcon={<Ban size={20} />} onClick={() => setStatus('inactive')} sx={{ fontSize: '0.75rem' }}>
              Deactivate
            </Button>
          )}
          <Button variant="outlined" color="error" startIcon={<Clock3 size={20} />} disabled={scheme.status === 'expired'} onClick={() => setStatus('expired')} sx={{ fontSize: '0.75rem' }}>
            Expire
          </Button>
          <Button
            variant="outlined"
            startIcon={<Copy size={20} />}
            onClick={() => navigate(`${listPath}/new?cloneFrom=${scheme.id}`)}
            sx={{ fontSize: '0.75rem' }}
          >
            Clone
          </Button>
          <Button variant="outlined" color="error" startIcon={<Trash2 size={20} />} onClick={() => setDeleteOpen(true)} sx={{ fontSize: '0.75rem' }}>
            Delete
          </Button>
          <Button variant="outlined" startIcon={<ArrowBackOutlined size={20} />} onClick={() => navigate(listPath)} sx={{ fontSize: '0.75rem' }}>
            Back
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Summary">
          <DetailFieldGrid
            fields={[
              { label: 'Scheme ID', value: scheme.id },
              { label: 'Scheme Name', value: scheme.schemeName },
              { label: 'Scheme Category', value: scheme.schemeCategory === 'general' ? 'General' : 'Seasonal' },
              { label: 'Scheme Type', value: scheme.schemeType },
              { label: 'Applicable Users', value: scheme.applicableUsers.join(', ') },
              { label: 'Bonus Value', value: scheme.bonusValue },
              { label: 'Start Date', value: scheme.startDate },
              { label: 'End Date', value: scheme.endDate ?? 'Ongoing' },
              { label: 'Status', value: <Chip size="small" label={statusConfig[scheme.status].label} color={statusConfig[scheme.status].color} /> },
            ]}
          />
        </SectionCard>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Total Participants" value={scheme.totalParticipants.toLocaleString('en-IN')} icon={<Users size={20} />} iconColor="primary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Total Product Scans" value={scheme.totalProductScans.toLocaleString('en-IN')} icon={<ScanLine size={20} />} iconColor="secondary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Reward Points Issued" value={scheme.rewardPointsIssued.toLocaleString('en-IN')} icon={<Trophy size={20} />} iconColor="warning" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Completion Rate" value={`${scheme.completionRate}%`} icon={<Gauge size={20} />} iconColor="success" />
          </Grid>
        </Grid>

        <SectionCard title="Scheme Configuration">
          <DetailFieldGrid
            fields={[
              { label: 'Scheme Category', value: scheme.schemeCategory === 'general' ? 'General' : 'Seasonal' },
              { label: 'Scheme Type', value: scheme.schemeType },
              { label: 'Applicable To', value: scheme.applicableUsers.join(', ') },
              { label: 'Product List', value: `${scheme.eligibleProducts.length} products` },
              { label: 'Scan Target', value: scheme.scanTarget },
              { label: 'Bonus Value', value: scheme.bonusValue },
              { label: 'Description', value: scheme.description },
              { label: 'Start Date', value: scheme.startDate },
              { label: 'End Date', value: scheme.endDate ?? 'Ongoing' },
              { label: 'Status', value: <Chip size="small" label={statusConfig[scheme.status].label} color={statusConfig[scheme.status].color} /> },
            ]}
          />
        </SectionCard>

        <SectionCard title="Reward Configuration">
          <DetailFieldGrid
            fields={[
              { label: 'Reward Type', value: scheme.rewardType },
              { label: 'Bonus Points', value: scheme.bonusPoints },
              { label: 'Multiplier', value: `${scheme.multiplier}x` },
              { label: 'Target Quantity', value: scheme.targetQuantity },
              { label: 'Maximum Reward', value: scheme.maximumReward.toLocaleString('en-IN') },
              { label: 'Reward Frequency', value: scheme.rewardFrequency },
              { label: 'Stackable', value: scheme.stackable ? 'Yes' : 'No' },
            ]}
          />
        </SectionCard>

        <SectionCard title="Eligible Products">
          <CommonTable
            tableKey="scheme-eligible-products"
            columns={eligibleProductColumns}
            rows={scheme.eligibleProducts}
            getRowId={(row) => row.id}
            searchPlaceholder="Search eligible products…"
            searchKeys={(row) => `${row.productCode} ${row.productName} ${row.productBrand}`}
            emptyTitle="No eligible products yet"
          />
        </SectionCard>

        <SectionCard title="Eligible Users">
          <Grid container spacing={2}>
            {(['Dealer', 'Chemist', 'MR'] as const).map((userType) => (
              <Grid key={userType} size={{ xs: 12, sm: 4 }}>
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: 'center', p: 2, borderRadius: '10px', border: '1px solid', borderColor: 'divider' }}
                >
                  {scheme.applicableUsers.includes(userType) ? (
                    <CircleCheck size={20} color="var(--mui-palette-success-main, #1E9E5A)" />
                  ) : (
                    <Ban size={20} color="var(--mui-palette-text-disabled, #9CA3AF)" />
                  )}
                  <Box>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>{userType}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {scheme.applicableUsers.includes(userType) ? 'Eligible' : 'Not Eligible'}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </SectionCard>

        <SectionCard title="Performance Summary">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard label="Total Participants" value={scheme.totalParticipants.toLocaleString('en-IN')} icon={<Users size={20} />} iconColor="primary" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard label="Total Product Scans" value={scheme.totalProductScans.toLocaleString('en-IN')} icon={<ScanLine size={20} />} iconColor="secondary" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard label="Reward Points Issued" value={scheme.rewardPointsIssued.toLocaleString('en-IN')} icon={<Trophy size={20} />} iconColor="warning" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard label="Completion Rate" value={`${scheme.completionRate}%`} icon={<Gauge size={20} />} iconColor="success" />
            </Grid>
          </Grid>
        </SectionCard>

        <SectionCard title="Scheme Timeline">
          <ActivityTimeline entries={scheme.timeline} emptyTitle="No timeline activity yet" />
        </SectionCard>

        <SectionCard title="Audit History">
          <CommonTable
            tableKey="scheme-audit-history"
            columns={auditColumns}
            rows={scheme.auditHistory}
            getRowId={(row) => row.id}
            searchPlaceholder="Search audit history…"
            searchKeys={(row) => `${row.action} ${row.performedBy}`}
            defaultSortBy="date"
            emptyTitle="No audit records yet"
          />
        </SectionCard>

        <SectionCard title="Internal Notes">
          <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', lineHeight: 1.6 }}>{scheme.internalNotes}</Typography>
        </SectionCard>
      </Stack>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Scheme"
        description={`Are you sure you want to permanently delete "${scheme.schemeName}"? This action cannot be undone.`}
        primaryActionLabel="Delete"
        primaryActionColor="error"
        onPrimaryAction={confirmDelete}
      >
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          {scheme.id} · {scheme.schemeName}
        </Typography>
      </Modal>
    </>
  )
}
