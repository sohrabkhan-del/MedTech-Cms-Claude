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
  RefreshCw as RefreshIcon,
  Pause as PauseIcon,
  Play as PlayArrowIcon,
} from 'lucide-react'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { useRegionFilter } from '@/contexts/RegionFilterContext'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import { ScanResultChip } from '@/features/fieldOperations/components/ScanResultChip'
import { SCAN_RESULT_CONFIG } from '@/features/fieldOperations/scanResultConfig'
import { useLiveScanFeed } from '@/features/fieldOperations/hooks/useLiveScanFeed'
import type {
  ScanResult,
  ScanUserRole,
} from '@/features/fieldOperations/types/fieldOperations.types'
import type { PartnerZone } from '@/types/partner'

const livePulseKeyframes = {
  '@keyframes live-scan-pulse': {
    '0%': { opacity: 1, boxShadow: '0 0 0 0 rgba(46, 125, 50, 0.5)' },
    '70%': { opacity: 0.6, boxShadow: '0 0 0 6px rgba(46, 125, 50, 0)' },
    '100%': { opacity: 1, boxShadow: '0 0 0 0 rgba(46, 125, 50, 0)' },
  },
}

interface ScanFilters extends Record<string, unknown> {
  userRole: ScanUserRole | 'all'
  result: ScanResult | 'all'
}

export function LiveScanFeedPage() {
  const navigate = useNavigate()
  const { region } = useRegionFilter()

  useRegionTopbarHeader({
    icon: <MyLocationIcon size={20} />,
    title: 'Live Scan Feed',
    subtitle:
      'Real-time barcode scanning activity across Dealers and Chemists.',
    live: true,
  })

  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<ScanFilters>({
    userRole: 'all',
    result: 'all',
  })

  const { liveScans, newRowIds, isLive, toggleLive, isLoading } =
    useLiveScanFeed()

  const topbarZone = region === 'All India' ? null : (region as PartnerZone)

  const filteredScans = liveScans.filter((scan) => {
    const regionMatch = !topbarZone || scan.region === topbarZone
    const roleMatch =
      appliedFilters.userRole === 'all' ||
      scan.userRole === appliedFilters.userRole
    const resultMatch =
      appliedFilters.result === 'all' || scan.result === appliedFilters.result
    return regionMatch && roleMatch && resultMatch
  })

  const openScan = (scanId: string) => {
    navigate(`/field-operations/live-scan-feed/${scanId}`)
  }

  const columns: CommonTableColumn<(typeof liveScans)[number]>[] = [
    {
      key: 'businessName',
      header: 'Business Name',
      minWidth: 250,
      render: (row) => (
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
          {newRowIds.has(row.id) && (
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: 'success.main',
                animation: 'live-scan-pulse 1.2s ease-in-out infinite',
                ...livePulseKeyframes,
              }}
            />
          )}
          <Typography
            sx={{
              fontSize: '0.8125rem',
              fontWeight: newRowIds.has(row.id) ? 700 : 400,
              color: newRowIds.has(row.id) ? 'success.dark' : 'inherit',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
            onClick={() => openScan(row.id)}
          >
            {row.businessName}
          </Typography>
        </Stack>
      ),
    },
    { key: 'userRole', header: 'Type', render: (row) => row.userRole },
    {
      key: 'userName',
      header: 'Name',
      minWidth: 160,
      sortable: true,
      render: (row) => (
        <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
          {row.userName}
        </Typography>
      ),
    },
    {
      key: 'scanDateTime',
      header: 'Scan Date & Time',
      minWidth: 170,
      sortable: true,
      render: (row) => (
        <Typography sx={{ fontSize: '0.8125rem' }}>
          {row.scanDateTime}
        </Typography>
      ),
    },
    {
      key: 'result',
      header: 'Scan Result',
      sortable: true,
      sortValue: (row) => SCAN_RESULT_CONFIG[row.result].label,
      render: (row) => <ScanResultChip result={row.result} />,
    },
    {
      key: 'scanCode',
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
          {row.scanCode}
        </Typography>
      ),
    },
    {
      key: 'productName',
      header: 'Product Name',
      minWidth: 170,
      render: (row) => row.productName,
    },
    {
      key: 'productCode',
      header: 'Product Code',
      minWidth: 130,
      render: (row) => (
        <Typography
          onClick={(e) => e.stopPropagation()}
          sx={{ fontWeight: 700, fontSize: '0.8125rem', cursor: 'default' }}
        >
          {row.productCode}
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
          label={isLive ? 'Live · updating every second' : 'Paused'}
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
            onClick={toggleLive}
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

      <CommonTable
        tableKey="live-scan-feed"
        columns={columns}
        rows={filteredScans}
        loading={isLoading}
        getRowId={(row) => row.id}
        onRowClick={(row) => openScan(row.id)}
        searchPlaceholder="Search scans…"
        searchKeys={(row) =>
          `${row.userName} ${row.businessName} ${row.scanCode} ${row.productName} ${row.productCode}`
        }
        onFilterClick={() => setFilterOpen(true)}
        filterCount={
          (appliedFilters.userRole !== 'all' ? 1 : 0) +
          (appliedFilters.result !== 'all' ? 1 : 0)
        }
        emptyTitle="No scans found"
        emptyDescription="Try adjusting your filters or search terms."
      />

      <Tooltip title={isLive ? 'Pause Live Feed' : 'Resume Live Feed'}>
        <IconButton
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            '&:hover': { backgroundColor: 'primary.dark' },
          }}
          onClick={toggleLive}
          aria-label={isLive ? 'Pause live feed' : 'Resume live feed'}
        >
          {isLive ? <RefreshIcon /> : <PlayArrowIcon />}
        </IconButton>
      </Tooltip>

      <FilterDrawer<ScanFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Scans"
        value={appliedFilters}
        onApply={setAppliedFilters}
      >
        {(draft, setDraft) => (
          <Stack spacing={3}>
            <TextField
              select
              label="Partner Filter"
              size="small"
              value={draft.userRole}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  userRole: e.target.value as ScanFilters['userRole'],
                }))
              }
            >
              <MenuItem value="all">All Partners</MenuItem>
              <MenuItem value="Dealer">Dealer</MenuItem>
              <MenuItem value="Chemist">Chemist</MenuItem>
            </TextField>
            <TextField
              select
              label="Scan Result"
              size="small"
              value={draft.result}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  result: e.target.value as ScanFilters['result'],
                }))
              }
            >
              <MenuItem value="all">All Results</MenuItem>
              {(Object.keys(SCAN_RESULT_CONFIG) as ScanResult[]).map(
                (result) => (
                  <MenuItem key={result} value={result}>
                    {SCAN_RESULT_CONFIG[result].label}
                  </MenuItem>
                ),
              )}
            </TextField>
          </Stack>
        )}
      </FilterDrawer>
    </>
  )
}
