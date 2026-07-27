import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Chip, Grid, Stack, Typography } from '@mui/material'
import { Target, ArrowLeft as ArrowBackOutlined, Users, Gift as GiftIcon } from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { DetailsPageSkeleton } from '@/components/common/DetailsPageSkeleton/DetailsPageSkeleton'
import { useSchemeReportDetail } from '@/features/reportsAnalytics/hooks/useSchemeReportDetail'
import { getGiftById } from '@/features/schemeManagement/mockGifts'
import type { SchemeProduct } from '@/types/scheme'

export function SchemeReportDetailsPage() {
  const navigate = useNavigate()
  const { schemeReportId } = useParams<{ schemeReportId: string }>()
  const { report, isLoading } = useSchemeReportDetail(schemeReportId)

  if (isLoading) {
    return <DetailsPageSkeleton sections={4} />
  }

  if (!report) {
    return (
      <EmptyState
        title="Scheme report not found"
        description="This scheme report may have been removed."
        actionLabel="Back to Scheme Reports"
        onAction={() => navigate('/reports/scheme-reports')}
      />
    )
  }

  const { scheme } = report

  const productColumns: CommonTableColumn<SchemeProduct>[] = [
    { key: 'productName', header: 'Product', minWidth: 200, render: (row) => getGiftById(row.productId)?.giftName ?? row.productId },
    ...(scheme.partnerTypes.includes('Dealer')
      ? [{ key: 'dealerPoints', header: 'Dealer Pts', align: 'center' as const, render: (row: SchemeProduct) => row.dealerPoints.toLocaleString('en-IN') }]
      : []),
    ...(scheme.partnerTypes.includes('Chemist')
      ? [{ key: 'chemistPoints', header: 'Chemist Pts', align: 'center' as const, render: (row: SchemeProduct) => row.chemistPoints.toLocaleString('en-IN') }]
      : []),
  ]

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
              <Typography variant="h1">{report.schemeName}</Typography>
              <Chip size="small" label={report.schemeType === 'general' ? 'General Scheme' : 'Seasonal Scheme'} color={report.schemeType === 'general' ? 'default' : 'info'} />
            </Stack>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {scheme.id}
            </Typography>
          </Box>
        </Stack>
        <Button variant="outlined" startIcon={<ArrowBackOutlined size={20} />} onClick={() => navigate('/reports/scheme-reports')} sx={{ fontSize: '0.75rem' }}>
          Back
        </Button>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Scheme Summary">
          <DetailFieldGrid
            fields={[
              { label: 'Scheme ID', value: scheme.id },
              { label: 'Scheme Name', value: report.schemeName },
              { label: 'Type', value: report.schemeType === 'general' ? 'General' : 'Seasonal' },
              { label: 'Regions', value: report.regions.join(', ') },
              { label: 'Partner Types', value: report.partnerTypes },
              { label: 'Start Date', value: report.startDate },
              { label: 'End Date', value: report.endDate ?? 'No end date' },
            ]}
          />
        </SectionCard>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Enrolled Partners" value={report.enrolledPartners.toLocaleString('en-IN')} icon={<Users size={20} />} iconColor="primary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Dealer Points Allocated" value={report.dealerTotal.toLocaleString('en-IN')} icon={<GiftIcon size={20} />} iconColor="secondary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Chemist Points Allocated" value={report.chemistTotal.toLocaleString('en-IN')} icon={<GiftIcon size={20} />} iconColor="warning" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Attached Products" value={scheme.products.length} icon={<GiftIcon size={20} />} iconColor="success" />
          </Grid>
        </Grid>

        <SectionCard title="Attached Gift Products">
          <CommonTable
            tableKey="scheme-report-products"
            columns={productColumns}
            rows={scheme.products}
            getRowId={(row) => row.productId}
            searchPlaceholder="Search products…"
            searchKeys={(row) => getGiftById(row.productId)?.giftName ?? row.productId}
            emptyTitle="No products attached yet"
          />
        </SectionCard>

        <SectionCard title="Enrollment by Partner Type">
          <Grid container spacing={2}>
            {(['Dealer', 'Chemist'] as const).map((partnerType) => (
              <Grid key={partnerType} size={{ xs: 12, sm: 6 }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', p: 2, borderRadius: '10px', border: '1px solid', borderColor: 'divider' }}>
                  <Box>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>{partnerType}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {partnerType === 'Dealer' ? scheme.partners.dealer.length : scheme.partners.chemist.length} partners
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </SectionCard>
      </Stack>
    </>
  )
}
