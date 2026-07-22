import { useMemo, useState } from 'react'
import {
  Box,
  Card,
  Chip,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  Crosshair as MyLocationIcon,
  ScanLine as QrCodeScannerIcon,
  CircleCheck as CheckCircleOutlined,
  XCircle as CancelOutlined,
  MapPin as PlaceOutlinedIcon,
  RefreshCw as RefreshIcon,
  Pause as PauseIcon,
  Play as PlayArrowIcon,
} from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { StatCardSkeleton } from '@/components/common/StatCard/StatCardSkeleton'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { useRegionFilter } from '@/contexts/RegionFilterContext'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import { ScanResultChip } from '@/features/fieldOperations/components/ScanResultChip'
import { SCAN_RESULT_CONFIG } from '@/features/fieldOperations/scanResultConfig'
import { useLiveScanFeed } from '@/features/fieldOperations/hooks/useLiveScanFeed'
import { useScanEventDetail } from '@/features/fieldOperations/hooks/useScanEventDetail'
import { useScanUserProfile } from '@/features/fieldOperations/hooks/useScanUserProfile'
import type { ScanResult, ScanUserRole } from '@/features/fieldOperations/types/fieldOperations.types'
import type { PartnerZone } from '@/types/partner'

const livePulseKeyframes = {
  '@keyframes live-scan-pulse': {
    '0%': { opacity: 1, boxShadow: '0 0 0 0 rgba(46, 125, 50, 0.5)' },
    '70%': { opacity: 0.6, boxShadow: '0 0 0 6px rgba(46, 125, 50, 0)' },
    '100%': { opacity: 1, boxShadow: '0 0 0 0 rgba(46, 125, 50, 0)' },
  },
}

function ValidationRow({ label, passed }: { label: string; passed: boolean }) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', py: 0.75 }}>
      {passed ? (
        <Box component="span" sx={{ display: 'inline-flex', color: 'success.main' }}>
          <CheckCircleOutlined size={20} />
        </Box>
      ) : (
        <Box component="span" sx={{ display: 'inline-flex', color: 'error.main' }}>
          <CancelOutlined size={20} />
        </Box>
      )}
      <Typography variant="body1">{label}</Typography>
    </Stack>
  )
}

interface ScanFilters extends Record<string, unknown> {
  userRole: ScanUserRole | 'all'
  result: ScanResult | 'all'
}

export function LiveScanFeedPage() {
  const { region } = useRegionFilter()
  const [tab, setTab] = useState(0)

  useRegionTopbarHeader(
    {
      icon: <MyLocationIcon size={20} />,
      title: 'Live Scan Feed',
      subtitle: 'Real-time barcode scanning activity across Dealers and Chemists.',
      live: true,
    },
    tab === 0,
  )

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selectedScanId, setSelectedScanId] = useState<string | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<ScanFilters>({
    userRole: 'all',
    result: 'all',
  })

  const { liveScans, newRowIds, isLive, toggleLive, isLoading } = useLiveScanFeed()
  const { summary: userSummary, history: userScanHistory, isLoading: userScanHistoryLoading } = useScanUserProfile(selectedUserId ?? undefined)
  const { scanEvent: selectedScan } = useScanEventDetail(selectedScanId ?? undefined)

  const topbarZone = region === 'All India' ? null : (region as PartnerZone)

  const liveKpis = useMemo(() => {
    const successfulScans = liveScans.filter((scan) => scan.result === 'success').length
    return {
      totalScans: liveScans.length,
      successfulScans,
      failedScans: liveScans.length - successfulScans,
      geoFenceViolations: liveScans.filter((scan) => scan.result === 'failed_outside_geofence').length,
    }
  }, [liveScans])

  const filteredScans = useMemo(
    () =>
      liveScans.filter((scan) => {
        const regionMatch = !topbarZone || scan.region === topbarZone
        const roleMatch =
          appliedFilters.userRole === 'all' ||
          scan.userRole === appliedFilters.userRole
        const resultMatch =
          appliedFilters.result === 'all' ||
          scan.result === appliedFilters.result
        return regionMatch && roleMatch && resultMatch
      }),
    [liveScans, appliedFilters, topbarZone],
  )

  const openUser = (userId: string) => {
    setSelectedUserId(userId)
    setTab(1)
  }

  const openScan = (scanId: string) => {
    setSelectedScanId(scanId)
    setTab(2)
  }

  const columns: CommonTableColumn<(typeof liveScans)[number]>[] = [
    {
      key: 'scanDateTime',
      header: 'Scan Date & Time',
      minWidth: 170,
      sortable: true,
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
            }}
          >
            {row.scanDateTime}
          </Typography>
        </Stack>
      ),
    },
    {
      key: 'userName',
      header: 'User Name',
      minWidth: 160,
      sortable: true,
      render: (row) => (
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={() => openUser(row.userId)}
        >
          {row.userName}
        </Typography>
      ),
    },
    { key: 'userRole', header: 'User Role', render: (row) => row.userRole },
    {
      key: 'businessName',
      header: 'Business Name',
      minWidth: 180,
      render: (row) => row.businessName,
    },
    {
      key: 'scanCode',
      header: 'Scan Code',
      minWidth: 150,
      render: (row) => (
        <Typography
          sx={{
            fontWeight: 600,
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
      minWidth: 140,
      render: (row) => row.productCode,
    },
    { key: 'region', header: 'Region', render: (row) => row.region },
    {
      key: 'result',
      header: 'Scan Result',
      sortable: true,
      sortValue: (row) => SCAN_RESULT_CONFIG[row.result].label,
      render: (row) => <ScanResultChip result={row.result} />,
    },
  ]

  return (
    <>
      {tab === 0 && (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              {isLoading ? (
                <StatCardSkeleton />
              ) : (
                <StatCard
                  label="Total Scans"
                  value={liveKpis.totalScans}
                  icon={<QrCodeScannerIcon size={20} />}
                  iconColor="primary"
                />
              )}
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              {isLoading ? (
                <StatCardSkeleton />
              ) : (
                <StatCard
                  label="Successful Scans"
                  value={liveKpis.successfulScans}
                  icon={<CheckCircleOutlined size={20} />}
                  iconColor="success"
                />
              )}
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              {isLoading ? (
                <StatCardSkeleton />
              ) : (
                <StatCard
                  label="Failed Scans"
                  value={liveKpis.failedScans}
                  icon={<CancelOutlined size={20} />}
                  iconColor="error"
                />
              )}
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              {isLoading ? (
                <StatCardSkeleton />
              ) : (
                <StatCard
                  label="Geo-fence Violations"
                  value={liveKpis.geoFenceViolations}
                  icon={<PlaceOutlinedIcon size={20} />}
                  iconColor="warning"
                />
              )}
            </Grid>
          </Grid>

          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'flex-end', mb: 1.5 }}>
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
      )}

      {tab === 1 &&
        (userSummary ? (
          <Stack spacing={3}>
            <SectionCard title="User Summary">
              <DetailFieldGrid
                fields={[
                  { label: 'User ID', value: userSummary.userId },
                  { label: 'User Name', value: userSummary.userName },
                  { label: 'Role', value: userSummary.role },
                  { label: 'Contact Number', value: userSummary.contactNumber },
                  { label: 'Email Address', value: userSummary.email },
                  { label: 'City', value: userSummary.city },
                  { label: 'Address', value: userSummary.address },
                  { label: 'Zone', value: userSummary.zone },
                ]}
              />
            </SectionCard>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard
                  label="Total Scans"
                  value={userSummary.totalScans}
                  icon={<QrCodeScannerIcon size={20} />}
                  iconColor="primary"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard
                  label="Successful Scans"
                  value={userSummary.successfulScans}
                  icon={<CheckCircleOutlined size={20} />}
                  iconColor="success"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard
                  label="Failed Scans"
                  value={userSummary.failedScans}
                  icon={<CancelOutlined size={20} />}
                  iconColor="error"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <StatCard
                  label="Total Points Earned"
                  value={userSummary.totalPointsEarned.toLocaleString('en-IN')}
                  icon={<MyLocationIcon size={20} />}
                  iconColor="secondary"
                />
              </Grid>
            </Grid>

            <SectionCard title="User Information">
              <DetailFieldGrid
                fields={[
                  { label: 'Last Scan Date & Time', value: userSummary.lastScanDateTime },
                  { label: 'Registered Location', value: userSummary.address },
                  { label: 'Assigned Region', value: userSummary.zone },
                  { label: 'Business Name', value: userSummary.businessName },
                  { label: 'User Status', value: userSummary.status === 'active' ? 'Active' : 'Inactive' },
                ]}
              />
            </SectionCard>

            <SectionCard title="Scan History">
              <CommonTable
                tableKey="live-scan-user-history"
                columns={[
                  { key: 'scanDateTime', header: 'Scan Date & Time', sortable: true, render: (row) => row.scanDateTime },
                  {
                    key: 'scanCode',
                    header: 'Scan Code',
                    render: (row) => (
                      <Typography
                        sx={{
                          fontWeight: 600,
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
                  { key: 'productName', header: 'Product Name', render: (row) => row.productName },
                  { key: 'productCode', header: 'Product Code', render: (row) => row.productCode },
                  { key: 'batchNumber', header: 'Batch Number', render: (row) => row.batchNumber },
                  { key: 'region', header: 'Region', render: (row) => row.region },
                  { key: 'sourceIp', header: 'Source IP Address', render: (row) => row.technical.sourceIp },
                  {
                    key: 'result',
                    header: 'Scan Result',
                    sortable: true,
                    sortValue: (row) => SCAN_RESULT_CONFIG[row.result].label,
                    render: (row) => <ScanResultChip result={row.result} />,
                  },
                ]}
                rows={userScanHistory}
                loading={userScanHistoryLoading}
                getRowId={(row) => row.id}
                searchPlaceholder="Search scans…"
                searchKeys={(row) => `${row.scanCode} ${row.productName} ${row.productCode}`}
                defaultSortBy="scanDateTime"
                emptyTitle="No scans recorded"
              />
            </SectionCard>
          </Stack>
        ) : (
          <EmptyState
            title="No user selected"
            description="Select a user from the Live Scan Listing to view their scan history."
          />
        ))}

      {tab === 2 &&
        (selectedScan ? (
          <Stack spacing={3}>
            <SectionCard title="Scan Summary">
              <DetailFieldGrid
                fields={[
                  { label: 'Scan ID', value: selectedScan.id },
                  { label: 'Scan Code', value: selectedScan.scanCode },
                  { label: 'Product Name', value: selectedScan.productName },
                  { label: 'Product Code', value: selectedScan.productCode },
                  { label: 'Batch Number', value: selectedScan.batchNumber },
                  { label: 'Scan Date & Time', value: selectedScan.scanDateTime },
                  { label: 'Reward Points Earned', value: selectedScan.rewardPoints.toString() },
                  { label: 'Scan Result', value: <ScanResultChip result={selectedScan.result} /> },
                ]}
              />
            </SectionCard>

            <SectionCard title="User Information">
              <DetailFieldGrid
                fields={[
                  {
                    label: 'User Name',
                    value: (
                      <Typography
                        sx={{ fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                        onClick={() => openUser(selectedScan.userId)}
                      >
                        {selectedScan.userName}
                      </Typography>
                    ),
                  },
                  { label: 'User Type', value: selectedScan.userRole },
                  { label: 'Registered Location', value: selectedScan.businessName },
                  { label: 'Assigned Region', value: selectedScan.region },
                  { label: 'Business Name', value: selectedScan.businessName },
                ]}
              />
            </SectionCard>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ p: 3, height: '100%' }}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: 'primary.main',
                      mb: 1,
                    }}
                  >
                    Scan Validation Details
                  </Typography>
                  <ValidationRow
                    label="Code Validation"
                    passed={
                      selectedScan.validation.codeValidation === 'passed'
                    }
                  />
                  <ValidationRow
                    label="Duplicate Scan Check"
                    passed={
                      selectedScan.validation.duplicateScanCheck === 'passed'
                    }
                  />
                  <ValidationRow
                    label="Geo-fence Validation"
                    passed={
                      selectedScan.validation.geoFenceValidation === 'passed'
                    }
                  />
                  <ValidationRow
                    label="Product Eligibility"
                    passed={
                      selectedScan.validation.productEligibility === 'passed'
                    }
                  />
                  <ValidationRow
                    label="Reward Eligibility"
                    passed={
                      selectedScan.validation.rewardEligibility === 'passed'
                    }
                  />
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ p: 3, height: '100%' }}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: 'primary.main',
                      mb: 2,
                    }}
                  >
                    Geo-location Information
                  </Typography>
                  <Grid container spacing={2}>
                    {[
                      ['Latitude', selectedScan.location.latitude.toFixed(4)],
                      ['Longitude', selectedScan.location.longitude.toFixed(4)],
                      [
                        'Registered Geo-fence',
                        `${selectedScan.location.registeredGeoFenceRadiusMeters} m`,
                      ],
                      [
                        'Distance from Registered',
                        `${selectedScan.location.distanceFromRegisteredMeters} m`,
                      ],
                    ].map(([label, value]) => (
                      <Grid key={label} size={6}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {label}
                        </Typography>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.8125rem',
                            mt: 0.25,
                          }}
                        >
                          {value}
                        </Typography>
                      </Grid>
                    ))}
                    <Grid size={12}>
                      <Chip
                        label={
                          selectedScan.location.geoFenceValidationResult ===
                          'within_range'
                            ? 'Within Range'
                            : 'Outside Range'
                        }
                        size="small"
                        color={
                          selectedScan.location.geoFenceValidationResult ===
                          'within_range'
                            ? 'success'
                            : 'error'
                        }
                      />
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            </Grid>

            <SectionCard title="Technical Information">
              <DetailFieldGrid
                fields={[
                  { label: 'Source IP Address', value: selectedScan.technical.sourceIp },
                  { label: 'Device Information', value: selectedScan.technical.deviceInfo },
                  { label: 'Scan Timestamp', value: selectedScan.scanDateTime },
                  { label: 'Application Version', value: selectedScan.technical.appVersion },
                ]}
              />
            </SectionCard>
          </Stack>
        ) : (
          <EmptyState
            title="No scan selected"
            description="Select a barcode from the Live Scan Listing to view scan details."
          />
        ))}
    </>
  )
}
