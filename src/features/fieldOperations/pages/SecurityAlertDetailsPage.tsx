import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Grid, Stack, Typography, Button, Chip } from '@mui/material'
import {
  ShieldAlert as GppMaybeIcon,
  TriangleAlert as ReportProblemOutlined,
  ArrowLeft as ArrowBackOutlined,
} from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { DetailsPageSkeleton } from '@/components/common/DetailsPageSkeleton/DetailsPageSkeleton'
import { CommonTable } from '@/components/common/CommonTable/CommonTable'
import { SeverityChip } from '@/features/fieldOperations/components/SeverityChip'
import { SEVERITY_CONFIG, STATUS_CONFIG } from '@/features/fieldOperations/severityConfig'
import { usePartnerSecurityHistory } from '@/features/fieldOperations/hooks/usePartnerSecurityHistory'

export function SecurityAlertDetailsPage() {
  const navigate = useNavigate()
  const { userId: partnerId } = useParams<{ userId: string }>()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const { alerts, totalItems, isLoading } = usePartnerSecurityHistory(partnerId, {
    page: page + 1,
    limit: rowsPerPage,
  })

  if (isLoading && alerts.length === 0) {
    return <DetailsPageSkeleton sections={4} />
  }

  const latestAlert = alerts[0]
  const isScanPartner = latestAlert?.scanPartnerDetails.id === partnerId
  const partnerDetails = latestAlert
    ? isScanPartner
      ? latestAlert.scanPartnerDetails
      : latestAlert.affectedPartnerDetails
    : undefined

  if (!partnerDetails) {
    return (
      <EmptyState
        title="Partner not found"
        description="This partner's security history could not be found."
        actionLabel="Back to Security Alerts"
        onAction={() => navigate('/field-operations/security-alerts')}
      />
    )
  }

  const highSeverityCount = alerts.filter((a) => a.severity === 'high').length

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
              backgroundColor: 'error.light',
              color: 'error.main',
            }}
          >
            <GppMaybeIcon size={18} />
          </Box>
          <Box>
            <Typography variant="h1">{partnerDetails.businessName}</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {partnerDetails.referenceId ?? partnerDetails.id} · {partnerDetails.type}
            </Typography>
          </Box>
        </Stack>
        <Button
          variant="outlined"
          startIcon={<ArrowBackOutlined size={18} />}
          onClick={() => navigate('/field-operations/security-alerts')}
          sx={{ fontSize: '0.8125rem' }}
        >
          Back
        </Button>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Partner Summary">
          <DetailFieldGrid
            fields={[
              { label: 'Partner ID', value: partnerDetails.referenceId ?? partnerDetails.id },
              { label: 'Business Name', value: partnerDetails.businessName },
              { label: 'Owner Name', value: partnerDetails.ownerName },
              { label: 'Partner Type', value: partnerDetails.type },
              { label: 'Region', value: partnerDetails.region },
            ]}
          />
        </SectionCard>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <StatCard
              label="Total Security Alerts"
              value={totalItems}
              icon={<GppMaybeIcon size={20} />}
              iconColor="primary"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <StatCard
              label="High Severity Alerts"
              value={highSeverityCount}
              icon={<ReportProblemOutlined size={20} />}
              iconColor="error"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
            <StatCard
              label="Last Alert Date"
              value={
                latestAlert
                  ? new Date(latestAlert.createdAt).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })
                  : '—'
              }
              icon={<ReportProblemOutlined size={20} />}
              iconColor="warning"
            />
          </Grid>
        </Grid>

        <SectionCard title="Security Alert History">
          <CommonTable
            tableKey="security-alert-partner-history"
            columns={[
              { key: 'type', header: 'Alert Type', render: (row) => row.type },
              { key: 'reason', header: 'Reason', render: (row) => row.reason },
              {
                key: 'scanPartner',
                header: 'Scanning Partner',
                render: (row) => row.scanPartnerDetails.businessName,
              },
              {
                key: 'affectedPartner',
                header: 'Affected Partner',
                render: (row) => row.affectedPartnerDetails.businessName,
              },
              {
                key: 'severity',
                header: 'Severity',
                sortable: true,
                sortValue: (row) => SEVERITY_CONFIG[row.severity].label,
                render: (row) => <SeverityChip severity={row.severity} />,
              },
              {
                key: 'status',
                header: 'Status',
                render: (row) => (
                  <Chip
                    size="small"
                    label={STATUS_CONFIG[row.status].label}
                    color={STATUS_CONFIG[row.status].color === 'default' ? undefined : STATUS_CONFIG[row.status].color}
                    variant="filled"
                  />
                ),
              },
              { key: 'batch', header: 'Batch', render: (row) => row.batch },
              {
                key: 'createdAt',
                header: 'Alert Date & Time',
                sortable: true,
                render: (row) => new Date(row.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
              },
            ]}
            rows={alerts}
            loading={isLoading}
            getRowId={(row) => row.id}
            totalCount={totalItems}
            page={page}
            onPageChange={setPage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(next) => {
              setRowsPerPage(next)
              setPage(0)
            }}
            searchPlaceholder="Search alerts…"
            searchKeys={(row) => `${row.type} ${row.reason}`}
            defaultSortBy="createdAt"
            defaultSortDir="desc"
            emptyTitle="No alerts recorded"
          />
        </SectionCard>
      </Stack>
    </>
  )
}
