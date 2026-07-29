import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Chip,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { Gift as GiftIcon, PackageCheck, PackageX, Repeat2 } from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { StatCardSkeleton } from '@/components/common/StatCard/StatCardSkeleton'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import { useGifts } from '@/features/schemeManagement/hooks/useGifts'
import { useGiftFormOptions } from '@/features/schemeManagement/hooks/useGiftFormOptions'
import { giftsService } from '@/features/schemeManagement/services/giftsService'
import type {
  Gift,
  GiftEligibility,
  GiftStatus,
  StockStatus,
} from '@/features/schemeManagement/types/schemeManagement.types'

interface GiftFilters extends Record<string, unknown> {
  category: string | 'all'
  brand: string | 'all'
  stockStatus: StockStatus | 'all'
  status: GiftStatus | 'all'
  eligibleUserType: GiftEligibility | 'all'
  minPoints: string
  maxPoints: string
}

export function GiftCatalogueListPage() {
  const navigate = useNavigate()
  const { gifts, kpis, isLoading } = useGifts()
  const {
    giftCategoryOptions: categoryOptions,
    giftBrandOptions: brandOptions,
  } = useGiftFormOptions()
  useRegionTopbarHeader({
    icon: <GiftIcon size={20} />,
    title: 'Gift Catalogue',
    subtitle:
      'Manage all redeemable gifts available in the Rewards Marketplace.',
    isLoading,
  })
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<GiftFilters>({
    category: 'all',
    brand: 'all',
    stockStatus: 'all',
    status: 'all',
    eligibleUserType: 'all',
    minPoints: '',
    maxPoints: '',
  })

  const giftCatalogueKpis = kpis ?? {
    totalGifts: 0,
    availableStock: 0,
    outOfStock: 0,
    totalRedemptions: 0,
  }

  const filteredGifts = gifts.filter((gift) => {
    const categoryMatch =
      appliedFilters.category === 'all' ||
      gift.category === appliedFilters.category
    const brandMatch =
      appliedFilters.brand === 'all' || gift.brand === appliedFilters.brand
    const stockMatch =
      appliedFilters.stockStatus === 'all' ||
      giftsService.getStockStatus(gift) === appliedFilters.stockStatus
    const statusMatch =
      appliedFilters.status === 'all' || gift.status === appliedFilters.status
    const eligibilityMatch =
      appliedFilters.eligibleUserType === 'all' ||
      gift.eligibleUserType === appliedFilters.eligibleUserType
    const minMatch =
      !appliedFilters.minPoints ||
      gift.requiredPoints >= Number(appliedFilters.minPoints)
    const maxMatch =
      !appliedFilters.maxPoints ||
      gift.requiredPoints <= Number(appliedFilters.maxPoints)
    return (
      categoryMatch &&
      brandMatch &&
      stockMatch &&
      statusMatch &&
      eligibilityMatch &&
      minMatch &&
      maxMatch
    )
  })

  const columns: CommonTableColumn<Gift>[] = [
    {
      key: 'giftName',
      header: 'Gift Name',
      minWidth: 190,
      sortable: true,
      sortValue: (row) => row.giftName,
      render: (row) => (
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={() =>
            navigate(`/scheme-management/gift-catalogue/${row.id}`)
          }
        >
          {row.giftName}
        </Typography>
      ),
    },
    {
      key: 'price',
      header: 'Price (₹)',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.price,
      render: (row) => `₹${row.price.toLocaleString('en-IN')}`,
    },
    {
      key: 'category',
      header: 'Category',
      minWidth: 140,
      render: (row) => row.category,
    },
    {
      key: 'brand',
      header: 'Brand',
      minWidth: 130,
      render: (row) => row.brand,
    },
    {
      key: 'availableQuantity',
      header: 'Qty',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.availableQuantity,
      render: (row) => row.availableQuantity,
    },
    {
      key: 'status',
      header: 'Status',
      minWidth: 100,
      render: (row) => (
        <Chip
          size="small"
          label={row.status === 'active' ? 'Active' : 'Inactive'}
          color={row.status === 'active' ? 'success' : 'default'}
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
              label="Total Gifts"
              value={giftCatalogueKpis.totalGifts}
              icon={<GiftIcon size={20} />}
              iconColor="primary"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Available Stock"
              value={giftCatalogueKpis.availableStock.toLocaleString('en-IN')}
              icon={<PackageCheck size={20} />}
              iconColor="success"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Out of Stock"
              value={giftCatalogueKpis.outOfStock}
              icon={<PackageX size={20} />}
              iconColor="error"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Total Redemptions"
              value={giftCatalogueKpis.totalRedemptions.toLocaleString('en-IN')}
              icon={<Repeat2 size={20} />}
              iconColor="secondary"
            />
          )}
        </Grid>
      </Grid>

      <CommonTable
        tableKey="gift-catalogue-list"
        columns={columns}
        rows={filteredGifts}
        getRowId={(row) => row.id}
        loading={isLoading}
        searchPlaceholder="Search by gift name or code…"
        searchKeys={(row) => `${row.giftName} ${row.giftCode} ${row.brand}`}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={
          (appliedFilters.category !== 'all' ? 1 : 0) +
          (appliedFilters.brand !== 'all' ? 1 : 0) +
          (appliedFilters.stockStatus !== 'all' ? 1 : 0) +
          (appliedFilters.status !== 'all' ? 1 : 0) +
          (appliedFilters.eligibleUserType !== 'all' ? 1 : 0) +
          (appliedFilters.minPoints || appliedFilters.maxPoints ? 1 : 0)
        }
        onExportClick={() => {}}
        onImportClick={() => {}}
        createAction={{
          label: 'Add Gift',
          to: '/scheme-management/gift-catalogue/new',
        }}
        defaultSortBy="giftName"
        actions={[
          {
            label: 'View',
            onClick: (row) =>
              navigate(`/scheme-management/gift-catalogue/${row.id}`),
          },
          {
            label: 'Edit',
            onClick: (row) =>
              navigate(`/scheme-management/gift-catalogue/${row.id}/edit`),
          },
          { label: 'Activate', onClick: () => {} },
          { label: 'Deactivate', onClick: () => {} },
          { label: 'Delete', onClick: () => {}, danger: true },
        ]}
        emptyTitle="No gifts found"
        emptyDescription="Try adjusting your filters or search terms."
      />

      <FilterDrawer<GiftFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Gifts"
        value={appliedFilters}
        onApply={setAppliedFilters}
      >
        {(draft, setDraft) => (
          <Stack spacing={3}>
            <TextField
              select
              label="Gift Category"
              size="small"
              value={draft.category}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, category: e.target.value }))
              }
            >
              <MenuItem value="all">All Categories</MenuItem>
              {categoryOptions.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Brand"
              size="small"
              value={draft.brand}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, brand: e.target.value }))
              }
            >
              <MenuItem value="all">All Brands</MenuItem>
              {brandOptions.map((brand) => (
                <MenuItem key={brand} value={brand}>
                  {brand}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Stock Status"
              size="small"
              value={draft.stockStatus}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  stockStatus: e.target.value as GiftFilters['stockStatus'],
                }))
              }
            >
              <MenuItem value="all">All Stock Statuses</MenuItem>
              <MenuItem value="in_stock">In Stock</MenuItem>
              <MenuItem value="low_stock">Low Stock</MenuItem>
              <MenuItem value="out_of_stock">Out of Stock</MenuItem>
            </TextField>
            <TextField
              select
              label="Active / Inactive"
              size="small"
              value={draft.status}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  status: e.target.value as GiftFilters['status'],
                }))
              }
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
            <TextField
              select
              label="Eligible User Type"
              size="small"
              value={draft.eligibleUserType}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  eligibleUserType: e.target
                    .value as GiftFilters['eligibleUserType'],
                }))
              }
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="All">All (Dealer + Chemist)</MenuItem>
              <MenuItem value="Dealer">Dealer</MenuItem>
              <MenuItem value="Chemist">Chemist</MenuItem>
            </TextField>
            <TextField
              type="number"
              label="Min Points"
              size="small"
              value={draft.minPoints}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, minPoints: e.target.value }))
              }
            />
            <TextField
              type="number"
              label="Max Points"
              size="small"
              value={draft.maxPoints}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, maxPoints: e.target.value }))
              }
            />
          </Stack>
        )}
      </FilterDrawer>
    </>
  )
}
