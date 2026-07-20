import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Chip, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { ScanLine, CheckCircle2, XCircle, Coins } from 'lucide-react'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import { ReportKpiGrid } from '@/features/reportsAnalytics/components/ReportTable'
import { DateRangeFields } from '@/features/reportsAnalytics/components/ReportFilters'
import { useScanReports } from '@/features/reportsAnalytics/hooks/useScanReports'
import type { ScanReportEntry, ScanReportResult } from '@/features/reportsAnalytics/types/reportsAnalytics.types'

const resultConfig: Record<ScanReportResult, { label: string; color: 'success' | 'warning' | 'error' }> = {
  valid: { label: 'Valid', color: 'success' },
  duplicate: { label: 'Duplicate', color: 'warning' },
  invalid: { label: 'Invalid', color: 'error' },
}

interface ScanReportFilters extends Record<string, unknown> {
  scanResult: ScanReportResult | 'all'
  product: string | 'all'
  dealer: string | 'all'
  chemist: string | 'all'
  fromDate: string
  toDate: string
}

export function ScanReportListPage() {
  const navigate = useNavigate()
  useRegionTopbarHeader({
    icon: <ScanLine size={20} />,
    title: 'Scan Reports',
    subtitle: 'Insights into barcode scanning activities performed by Dealers and Chemists.',
  })
  const { reports, kpis, filterOptions } = useScanReports()
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<ScanReportFilters>({
    scanResult: 'all',
    product: 'all',
    dealer: 'all',
    chemist: 'all',
    fromDate: '',
    toDate: '',
  })

  const filteredReports = useMemo(
    () =>
      reports.filter((report) => {
        const resultMatch = appliedFilters.scanResult === 'all' || report.scanResult === appliedFilters.scanResult
        const productMatch = appliedFilters.product === 'all' || report.productName === appliedFilters.product
        const dealerMatch = appliedFilters.dealer === 'all' || report.dealerName === appliedFilters.dealer
        const chemistMatch = appliedFilters.chemist === 'all' || report.chemistName === appliedFilters.chemist
        return resultMatch && productMatch && dealerMatch && chemistMatch
      }),
    [reports, appliedFilters],
  )

  const columns: CommonTableColumn<ScanReportEntry>[] = [
    {
      key: 'scanDateTime',
      header: 'Scan Date & Time',
      minWidth: 170,
      sortable: true,
      sortValue: (row) => row.scanDateTime,
      render: (row) => (
        <Typography
          sx={{ fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          onClick={() => navigate(`/reports/scan-reports/${row.id}`)}
        >
          {row.scanDateTime}
        </Typography>
      ),
    },
    { key: 'barcodeNumber', header: 'Barcode Number', minWidth: 140, render: (row) => row.barcodeNumber },
    { key: 'productName', header: 'Product Name', minWidth: 170, sortable: true, sortValue: (row) => row.productName, render: (row) => row.productName },
    { key: 'dealerName', header: 'Dealer', minWidth: 170, render: (row) => row.dealerName ?? '—' },
    { key: 'chemistName', header: 'Chemist', minWidth: 170, render: (row) => row.chemistName ?? '—' },
    {
      key: 'scanResult',
      header: 'Scan Result',
      minWidth: 120,
      render: (row) => <Chip size="small" label={resultConfig[row.scanResult].label} color={resultConfig[row.scanResult].color} />,
    },
    { key: 'rewardPoints', header: 'Reward Points', align: 'right', sortable: true, sortValue: (row) => row.rewardPoints, render: (row) => row.rewardPoints.toLocaleString('en-IN') },
  ]

  return (
    <>
      <ReportKpiGrid
        cards={[
          { key: 'total', label: 'Total Scans', value: kpis?.totalScans ?? 0, icon: <ScanLine size={20} />, iconColor: 'primary' },
          { key: 'successful', label: 'Successful Scans', value: kpis?.successfulScans ?? 0, icon: <CheckCircle2 size={20} />, iconColor: 'success' },
          { key: 'failed', label: 'Failed / Duplicate Scans', value: kpis?.failedScans ?? 0, icon: <XCircle size={20} />, iconColor: 'error' },
          { key: 'points', label: 'Reward Points Issued', value: (kpis?.rewardPointsIssued ?? 0).toLocaleString('en-IN'), icon: <Coins size={20} />, iconColor: 'secondary' },
        ]}
      />

      <CommonTable
        tableKey="scan-reports-list"
        columns={columns}
        rows={filteredReports}
        getRowId={(row) => row.id}
        searchPlaceholder="Search by barcode, product, dealer, or chemist…"
        searchKeys={(row) => `${row.barcodeNumber} ${row.productName} ${row.dealerName ?? ''} ${row.chemistName ?? ''}`}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={
          (appliedFilters.scanResult !== 'all' ? 1 : 0) +
          (appliedFilters.product !== 'all' ? 1 : 0) +
          (appliedFilters.dealer !== 'all' ? 1 : 0) +
          (appliedFilters.chemist !== 'all' ? 1 : 0) +
          (appliedFilters.fromDate || appliedFilters.toDate ? 1 : 0)
        }
        onExportClick={() => {}}
        defaultSortBy="scanDateTime"
        defaultSortDir="desc"
        actions={[{ label: 'View', onClick: (row) => navigate(`/reports/scan-reports/${row.id}`) }]}
        emptyTitle="No scan reports found"
        emptyDescription="Try adjusting your filters or search terms."
      />

      <FilterDrawer<ScanReportFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Scan Reports"
        value={appliedFilters}
        onApply={setAppliedFilters}
      >
        {(draft, setDraft) => (
          <Stack spacing={3}>
            <TextField
              select
              label="Scan Result"
              size="small"
              value={draft.scanResult}
              onChange={(e) => setDraft((prev) => ({ ...prev, scanResult: e.target.value as ScanReportFilters['scanResult'] }))}
            >
              <MenuItem value="all">All Results</MenuItem>
              <MenuItem value="valid">Valid</MenuItem>
              <MenuItem value="duplicate">Duplicate</MenuItem>
              <MenuItem value="invalid">Invalid</MenuItem>
            </TextField>
            <TextField
              select
              label="Product"
              size="small"
              value={draft.product}
              onChange={(e) => setDraft((prev) => ({ ...prev, product: e.target.value }))}
            >
              <MenuItem value="all">All Products</MenuItem>
              {(filterOptions?.productOptions ?? []).map((product) => (
                <MenuItem key={product} value={product}>
                  {product}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Dealer"
              size="small"
              value={draft.dealer}
              onChange={(e) => setDraft((prev) => ({ ...prev, dealer: e.target.value }))}
            >
              <MenuItem value="all">All Dealers</MenuItem>
              {(filterOptions?.dealerOptions ?? []).map((dealer) => (
                <MenuItem key={dealer} value={dealer}>
                  {dealer}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Chemist"
              size="small"
              value={draft.chemist}
              onChange={(e) => setDraft((prev) => ({ ...prev, chemist: e.target.value }))}
            >
              <MenuItem value="all">All Chemists</MenuItem>
              {(filterOptions?.chemistOptions ?? []).map((chemist) => (
                <MenuItem key={chemist} value={chemist}>
                  {chemist}
                </MenuItem>
              ))}
            </TextField>
            <DateRangeFields
              fromDate={draft.fromDate}
              toDate={draft.toDate}
              fromLabel="Scan Date From"
              toLabel="Scan Date To"
              onFromDateChange={(value) => setDraft((prev) => ({ ...prev, fromDate: value }))}
              onToDateChange={(value) => setDraft((prev) => ({ ...prev, toDate: value }))}
            />
          </Stack>
        )}
      </FilterDrawer>
    </>
  )
}
