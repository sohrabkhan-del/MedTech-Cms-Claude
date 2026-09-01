import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Chip,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  Crosshair as MyLocationIcon,
  Pause as PauseIcon,
  Play as PlayArrowIcon,
} from 'lucide-react'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { ModularTabs } from '@/components/common/ModularTabs/ModularTabs'
import { useRegionFilter } from '@/contexts/RegionFilterContext'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { ScanResultChip } from '@/features/fieldOperations/components/ScanResultChip'
import { useScanFeed } from '@/features/fieldOperations/hooks/useScanFeed'
import {
  REWARD_REASON,
  type RewardReason,
  type ScanEvent,
  type ScanStatus,
} from '@/features/fieldOperations/types/fieldOperations.types'

interface ScanFilters extends Record<string, unknown> {
  scanStatus: ScanStatus | 'all'
  type: RewardReason | ''
}

const SORT_FIELD_MAP: Partial<Record<string, string>> = {
  scannedAt: 'scannedAt',
  scanStatus: 'scanStatus',
}

const LIVE_POLL_INTERVAL_MS = 5000
type ScanFeedTab = 'all' | 'CHEMIST' | 'DEALER'

const SCAN_FEED_TABS: Array<{ label: string; value: ScanFeedTab }> = [
  { label: 'All', value: 'all' },
  { label: 'Chemist', value: 'CHEMIST' },
  { label: 'Dealer', value: 'DEALER' },
]

const livePulseKeyframes = {
  '@keyframes live-scan-pulse': {
    '0%': { opacity: 1, boxShadow: '0 0 0 0 rgba(46, 125, 50, 0.5)' },
    '70%': { opacity: 0.6, boxShadow: '0 0 0 6px rgba(46, 125, 50, 0)' },
    '100%': { opacity: 1, boxShadow: '0 0 0 0 rgba(46, 125, 50, 0)' },
  },
}

export function LiveScanFeedPage() {
  const navigate = useNavigate()
  const { regionId: topbarRegionId } = useRegionFilter()
  const [search, setSearch] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<ScanFilters>({
    scanStatus: 'all',
    type: '',
  })
  const [sortColumn, setSortColumn] = useState('scannedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [isLive, setIsLive] = useState(true)
  const [tab, setTab] = useState<ScanFeedTab>('all')

  const debouncedSearch = useDebouncedValue(search, 300)

  const { scanEvents, totalItems, isLoading, error } = useScanFeed(
    {
      page: page + 1,
      limit: rowsPerPage,
      search: debouncedSearch,
      scanStatus:
        appliedFilters.scanStatus !== 'all'
          ? appliedFilters.scanStatus.toUpperCase()
          : undefined,
      scanResultType: appliedFilters.type || undefined,
      partnerType: tab === 'all' ? undefined : tab,
      regionId: topbarRegionId || undefined,
      sortBy: SORT_FIELD_MAP[sortColumn],
      sortOrder,
    },
    isLive ? LIVE_POLL_INTERVAL_MS : 0,
  )

  useRegionTopbarHeader({
    icon: <MyLocationIcon size={20} />,
    title: 'Live Scan Feed',
    subtitle:
      'Real-time barcode scanning activity across Dealers and Chemists.',
    isLoading,
  })

  const openScan = (scanId: string) => {
    navigate(`/field-operations/live-scan-feed/${scanId}`)
  }

  const openPartner = (partnerId: string) => {
    navigate(`/field-operations/live-scan-feed/user/${partnerId}`)
  }

  const columns: CommonTableColumn<ScanEvent>[] = [
    {
      key: 'businessName',
      header: 'Business Name',
      minWidth: 220,
      render: (row) => (
        <Typography
          sx={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={() => openScan(row.id)}
        >
          {row.businessDetails.businessName}
        </Typography>
      ),
    },
    { key: 'partnerType', header: 'Type', render: (row) => row.partnerType },
    {
      key: 'partnerName',
      header: 'Name',
      minWidth: 160,
      render: (row) => (
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={() => openPartner(row.id)}
        >
          {row.businessDetails.partnerName}
        </Typography>
      ),
    },
    {
      key: 'scannedAt',
      header: 'Scan Date & Time',
      minWidth: 170,
      sortable: true,
      render: (row) => (
        <Typography sx={{ fontSize: '0.8125rem' }}>
          {new Date(row.scannedAt).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </Typography>
      ),
    },
    {
      key: 'scanResult',
      header: 'Scan Result',
      sortable: true,
      render: (row) => (
        <ScanResultChip status={row.scanStatus} label={row.scanResult} />
      ),
    },
    {
      key: 'scannedCode',
      header: 'Scan Code',
      minWidth: 220,
      render: (row) => (
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={() => openScan(row.id)}
        >
          {row.scannedCode}
        </Typography>
      ),
    },
    {
      key: 'productCode',
      header: 'Product Code',
      minWidth: 150,
      render: (row) => (
        <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>
          {row.productDetails.productCode}
        </Typography>
      ),
    },
    { key: 'region', header: 'Region', render: (row) => row.region },
  ]

  return (
    <>
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: 'center', justifyContent: 'flex-end', mb: 1.5 }}
      >
        <Chip
          label={isLive ? 'Live' : 'Paused'}
          size="small"
          color={isLive ? 'success' : 'default'}
          variant="filled"
          icon={
            isLive ? (
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: 'success.contrastText',
                  ml: '8px !important',
                  animation: 'live-scan-pulse 1.2s ease-in-out infinite',
                  ...livePulseKeyframes,
                }}
              />
            ) : undefined
          }
        />
        <Tooltip title={isLive ? 'Pause Live Feed' : 'Resume Live Feed'}>
          <IconButton
            size="small"
            onClick={() => setIsLive((prev) => !prev)}
            aria-label={isLive ? 'Pause live feed' : 'Resume live feed'}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '8px',
            }}
          >
            {isLive ? <PauseIcon size={20} /> : <PlayArrowIcon size={20} />}
          </IconButton>
        </Tooltip>
      </Stack>

      <Box sx={{ mb: 2.5 }}>
        <ModularTabs<ScanFeedTab>
          variant="filled"
          tabs={SCAN_FEED_TABS}
          value={tab}
          onChange={(next) => {
            setTab(next)
            setPage(0)
          }}
        />
      </Box>

      <CommonTable
        key={`${tab}-${appliedFilters.scanStatus}-${appliedFilters.type}`}
        onSortChange={(columnKey, dir) => {
          setSortColumn(columnKey)
          setSortOrder(dir)
        }}
        totalCount={totalItems}
        page={page}
        onPageChange={setPage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(next) => {
          setRowsPerPage(next)
          setPage(0)
        }}
        tableKey="live-scan-feed"
        columns={columns}
        rows={scanEvents}
        loading={isLoading}
        getRowId={(row) => row.id}
        onRowClick={(row) => openScan(row.id)}
        searchPlaceholder="Search scans…"
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(0)
        }}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={
          (appliedFilters.scanStatus !== 'all' ? 1 : 0) +
          (appliedFilters.type.trim() ? 1 : 0)
        }
        defaultSortBy="scannedAt"
        defaultSortDir="desc"
        emptyTitle="No scans found"
        emptyDescription={
          error ?? 'Try adjusting your filters or search terms.'
        }
      />

      <FilterDrawer<ScanFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Scans"
        value={appliedFilters}
        onApply={(next) => {
          setAppliedFilters(next)
          setPage(0)
        }}
      >
        {(draft, setDraft) => (
          <Stack spacing={3}>
            <TextField
              select
              label="Scan Status"
              size="small"
              value={draft.scanStatus}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  scanStatus: e.target.value as ScanFilters['scanStatus'],
                }))
              }
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="success">Success</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
            </TextField>
            <TextField
              select
              label="Scan Result Type"
              size="small"
              value={draft.type}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  type: e.target.value as RewardReason | '',
                }))
              }
            >
              <MenuItem value="">All Types</MenuItem>
              {Object.values(REWARD_REASON).map((reason) => (
                <MenuItem key={reason} value={reason}>
                  {reason}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        )}
      </FilterDrawer>
    </>
  )
}
