import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Chip,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import {
  Wallet as WalletIcon,
  Coins as Points,
  Repeat2,
  Clock3,
} from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { StatCardSkeleton } from '@/components/common/StatCard/StatCardSkeleton'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { ModularTabs } from '@/components/common/ModularTabs/ModularTabs'
import { useRegionFilter } from '@/contexts/RegionFilterContext'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useWalletPartners } from '@/features/rewardsWallet/hooks/useWalletPartners'
import { WalletBalanceCell } from '@/features/rewardsWallet/components/WalletBalanceCell'
import { fallbackRegions, getRegions } from '@/services/regionsService'
import type { RegionOption } from '@/contexts/RegionFilterContext'
import type {
  WalletPartnerRow,
  WalletPartnerType,
} from '@/features/rewardsWallet/services/walletPartnersApi'

const statusConfig: Record<
  string,
  { label: string; color: 'success' | 'default' | 'error' }
> = {
  ACTIVE: { label: 'Active', color: 'success' },
  INACTIVE: { label: 'Inactive', color: 'default' },
  SUSPENDED: { label: 'Suspended', color: 'error' },
}

function walletDetailsPath(row: WalletPartnerRow): string {
  return `/rewards-wallet/wallet-management/${row.id}`
}

type UserTypeTab = 'all' | WalletPartnerType

const USER_TYPE_TABS: { label: string; value: UserTypeTab }[] = [
  { label: 'All', value: 'all' },
  { label: 'Chemist', value: 'CHEMIST' },
  { label: 'Dealer', value: 'DEALER' },
]

// Maps CommonTable column keys to the real GET /partners `sortBy` field
// names, matching the same best-effort mapping used by DealerListPage.
const SORT_FIELD_MAP: Partial<Record<string, string>> = {
  businessName: 'businessName',
  status: 'status',
}

interface WalletFilters extends Record<string, unknown> {
  status: string
  regionId: string
}

export function WalletListPage() {
  const navigate = useNavigate()
  const { regionId: topbarRegionId } = useRegionFilter()
  const [regions, setRegions] = useState<RegionOption[]>(fallbackRegions)
  const [userTypeTab, setUserTypeTab] = useState<UserTypeTab>('all')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<WalletFilters>({
    status: 'all',
    regionId: '',
  })
  const [sortColumn, setSortColumn] = useState('businessName')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  useEffect(() => {
    let ignore = false
    getRegions()
      .then((options) => {
        if (!ignore && options.length > 0) setRegions(options)
      })
      .catch((error) => {
        console.warn('[regions] failed to load regions, using fallback', error)
      })
    return () => {
      ignore = true
    }
  }, [])

  const effectiveRegionId =
    appliedFilters.regionId || topbarRegionId || undefined

  const { wallets, totalItems, isLoading } = useWalletPartners({
    page: page + 1,
    limit: rowsPerPage,
    search: debouncedSearch || undefined,
    type: userTypeTab === 'all' ? undefined : userTypeTab,
    regionId: effectiveRegionId,
    status: appliedFilters.status !== 'all' ? appliedFilters.status : undefined,
    sortBy: SORT_FIELD_MAP[sortColumn],
    sortOrder,
  })

  useRegionTopbarHeader({
    icon: <WalletIcon size={20} />,
    title: 'Wallet Directory',
    subtitle:
      'Manage wallet balances, reward points, and transaction history for Dealers and Chemists.',
    isLoading,
  })

  const columns: CommonTableColumn<WalletPartnerRow>[] = [
    {
      key: 'businessName',
      header: 'Business Name',
      minWidth: 180,
      sortable: true,
      sortValue: (row) => row.businessName,
      render: (row) => (
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={() => navigate(walletDetailsPath(row))}
        >
          {row.businessName}
        </Typography>
      ),
    },
    {
      key: 'userType',
      header: 'User Type',
      minWidth: 100,
      render: (row) => row.userType,
    },
    {
      key: 'mobileNumber',
      header: 'Mobile Number',
      minWidth: 140,
      render: (row) => row.mobileNumber,
    },
    {
      key: 'regionName',
      header: 'Region',
      minWidth: 90,
      render: (row) => row.regionName,
    },
    {
      key: 'availableBalance',
      header: 'Available Balance',
      align: 'center',
      render: (row) => (
        <WalletBalanceCell partnerId={row.id} field="totalPoints" />
      ),
    },
    {
      key: 'pointsEarned',
      header: 'Points Earned',
      align: 'center',
      render: (row) => (
        <WalletBalanceCell partnerId={row.id} field="totalPointsEarned" />
      ),
    },
    {
      key: 'pointsRedeemed',
      header: 'Points Redeemed',
      align: 'center',
      render: (row) => (
        <WalletBalanceCell partnerId={row.id} field="totalPointsRedeemed" />
      ),
    },
    {
      key: 'lastUpdated',
      header: 'Last Updated',
      minWidth: 160,
      render: (row) => row.lastUpdated,
    },
    {
      key: 'status',
      header: 'Status',
      minWidth: 100,
      sortable: true,
      render: (row) => (
        <Chip
          size="small"
          label={statusConfig[row.status]?.label ?? row.status}
          color={statusConfig[row.status]?.color ?? 'default'}
        />
      ),
    },
  ]

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Total Partners"
              value={totalItems}
              icon={<WalletIcon size={20} />}
              iconColor="primary"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Chemists"
              value={wallets.filter((w) => w.userType === 'Chemist').length}
              icon={<Points size={20} />}
              iconColor="success"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Dealers"
              value={wallets.filter((w) => w.userType === 'Dealer').length}
              icon={<Repeat2 size={20} />}
              iconColor="secondary"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Active Wallets"
              value={wallets.filter((w) => w.status === 'ACTIVE').length}
              icon={<Clock3 size={20} />}
              iconColor="warning"
            />
          )}
        </Grid>
      </Grid>

      <Box sx={{ mb: 2.5, mt: 7 }}>
        <ModularTabs
          tabs={USER_TYPE_TABS}
          value={userTypeTab}
          variant="filled"
          onChange={(value) => {
            setUserTypeTab(value)
            setPage(0)
          }}
        />
      </Box>

      <CommonTable
        key={`${effectiveRegionId ?? 'all'}-${appliedFilters.status}-${userTypeTab}`}
        tableKey="wallet-directory-list"
        columns={columns}
        rows={wallets}
        getRowId={(row) => row.id}
        loading={isLoading}
        searchPlaceholder="Search by business name or mobile number…"
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(0)
        }}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={
          (appliedFilters.status !== 'all' ? 1 : 0) +
          (appliedFilters.regionId.trim() ? 1 : 0)
        }
        onExportClick={() => {}}
        onSortChange={(columnKey, dir) => {
          setSortColumn(columnKey)
          setSortOrder(dir)
        }}
        defaultSortBy="businessName"
        defaultSortDir="desc"
        totalCount={totalItems}
        page={page}
        onPageChange={setPage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(next) => {
          setRowsPerPage(next)
          setPage(0)
        }}
        actions={[
          {
            label: 'View Wallet',
            onClick: (row) => navigate(walletDetailsPath(row)),
          },
        ]}
        emptyTitle="No wallets found"
        emptyDescription="Try adjusting your filters or search terms."
      />

      <FilterDrawer<WalletFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Wallets"
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
              label="Wallet Status"
              size="small"
              value={draft.status}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, status: e.target.value }))
              }
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="INACTIVE">Inactive</MenuItem>
              <MenuItem value="SUSPENDED">Suspended</MenuItem>
            </TextField>
            <TextField
              select
              label="Region"
              size="small"
              value={draft.regionId}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, regionId: e.target.value }))
              }
            >
              <MenuItem value="">
                <em>All Regions</em>
              </MenuItem>
              {regions.map((region) => (
                <MenuItem key={region.id} value={region.id}>
                  {region.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        )}
      </FilterDrawer>
    </>
  )
}
