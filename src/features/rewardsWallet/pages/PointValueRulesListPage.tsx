import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import {
  Coins as Points,
  Layers,
  Landmark,
  Package,
  ChevronRight,
} from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { StatCardSkeleton } from '@/components/common/StatCard/StatCardSkeleton'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { ModularTabs } from '@/components/common/ModularTabs/ModularTabs'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import { useProductPointRules } from '@/features/rewardsWallet/hooks/useProductPointRules'
import { fallbackRegions, getRegions } from '@/services/regionsService'
import type { RegionOption } from '@/contexts/RegionFilterContext'
import type { ProductPointRuleRow } from '@/features/rewardsWallet/services/pointValueRulesApi'

type PartnerTypeTab = 'all' | 'Dealer' | 'Chemist'

const PARTNER_TYPE_TABS: { label: string; value: PartnerTypeTab }[] = [
  { label: 'All', value: 'all' },
  { label: 'Chemist', value: 'Chemist' },
  { label: 'Dealer', value: 'Dealer' },
]

function partnerTypeTabFromPath(pathname: string): PartnerTypeTab {
  if (pathname.endsWith('/dealer')) return 'Dealer'
  if (pathname.endsWith('/chemist')) return 'Chemist'
  return 'all'
}

interface PointRuleFilters extends Record<string, unknown> {
  categoryId: string | 'all'
  regionId: string
}

export function PointValueRulesListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [partnerTypeTab, setPartnerTypeTab] = useState<PartnerTypeTab>(
    partnerTypeTabFromPath(location.pathname),
  )
  const [regions, setRegions] = useState<RegionOption[]>(fallbackRegions)

  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<PointRuleFilters>({
    categoryId: 'all',
    regionId: '',
  })

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

  const { rules, kpis, isLoading } = useProductPointRules(appliedFilters.regionId)

  useRegionTopbarHeader({
    icon: <Points size={20} />,
    title:
      partnerTypeTab === 'all'
        ? 'Point Value Rules'
        : `Point Value Rules — ${partnerTypeTab}`,
    subtitle:
      'Configure base Point values, regional multipliers, and monitor reward distribution impact.',
    isLoading,
  })

  const categoryOptions = useMemo(
    () =>
      Array.from(
        new Map(
          rules
            .filter((r) => r.categoryId)
            .map((r) => [r.categoryId as string, r.categoryName ?? r.categoryId as string]),
        ).entries(),
      ),
    [rules],
  )

  const filteredRows = useMemo(
    () =>
      rules.filter(
        (row) =>
          appliedFilters.categoryId === 'all' ||
          row.categoryId === appliedFilters.categoryId,
      ),
    [rules, appliedFilters],
  )

  const showDealerColumn = partnerTypeTab !== 'Chemist'
  const showChemistColumn = partnerTypeTab !== 'Dealer'

  const columns: CommonTableColumn<ProductPointRuleRow>[] = [
    {
      key: 'productName',
      header: 'Product Name',
      minWidth: 200,
      sortable: true,
      sortValue: (row) => row.productName,
      render: (row) => (
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={() => navigate(`/rewards-wallet/point-value-rules/${row.productId}`)}
        >
          {row.productName}
        </Typography>
      ),
    },
    {
      key: 'productCode',
      header: 'Product Code',
      minWidth: 130,
      sortable: true,
      sortValue: (row) => row.productCode,
      render: (row) => (
        <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
          {row.productCode}
        </Typography>
      ),
    },
    {
      key: 'categoryName',
      header: 'Product Category',
      minWidth: 160,
      sortable: true,
      sortValue: (row) => row.categoryName ?? '',
      render: (row) => row.categoryName ?? '-',
    },
    ...(showDealerColumn
      ? [
          {
            key: 'dealerProductPoints',
            header: 'Base Point Value (Dealer)',
            align: 'center' as const,
            minWidth: 170,
            sortable: true,
            sortValue: (row: ProductPointRuleRow) => row.dealerProductPoints,
            render: (row: ProductPointRuleRow) =>
              row.dealerProductPoints.toLocaleString('en-IN'),
          },
        ]
      : []),
    ...(showChemistColumn
      ? [
          {
            key: 'chemistProductPoints',
            header: 'Base Point Value (Chemist)',
            align: 'center' as const,
            minWidth: 170,
            sortable: true,
            sortValue: (row: ProductPointRuleRow) => row.chemistProductPoints,
            render: (row: ProductPointRuleRow) =>
              row.chemistProductPoints.toLocaleString('en-IN'),
          },
        ]
      : []),
  ]

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Total Outstanding Point Liability"
              value={(kpis?.totalOutstandingPointLiability ?? 0).toLocaleString('en-IN')}
              icon={<Landmark size={20} />}
              iconColor="primary"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Configured Product Rules"
              value={kpis?.configuredProductRules ?? 0}
              icon={<Package size={20} />}
              iconColor="secondary"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {isLoading ? (
            <StatCardSkeleton />
          ) : (
            <StatCard
              label="Average Base Point Value"
              value={kpis?.averageBasePointValue ?? 0}
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
              label="Product Categories"
              value={kpis?.productCategories ?? 0}
              icon={<Layers size={20} />}
              iconColor="warning"
            />
          )}
        </Grid>
      </Grid>

      <Stack
        direction="row"
        sx={{
          mb: 2.5,
          mt: 7,
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <ModularTabs
          tabs={PARTNER_TYPE_TABS}
          value={partnerTypeTab}
          onChange={setPartnerTypeTab}
        />
        <Button
          variant="outlined"
          color="secondary"
          endIcon={<ChevronRight size={16} />}
          onClick={() => navigate('/rewards-wallet/point-value-rules/region-multipliers')}
          sx={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            flexShrink: 0,
            borderColor: 'secondary.main',
            color: 'secondary.dark',
            backgroundColor: 'secondary.light',
            '&:hover': {
              borderColor: 'secondary.main',
            },
          }}
        >
          Manage Region Rules
        </Button>
      </Stack>

      <Box>
        <CommonTable
          tableKey="Point-value-rules-product-list"
          columns={columns}
          rows={filteredRows}
          getRowId={(row) => row.productId}
          loading={isLoading}
          searchPlaceholder="Search by product name or code…"
          searchKeys={(row) => `${row.productCode} ${row.productName} ${row.categoryName ?? ''}`}
          onFilterClick={() => setFilterOpen(true)}
          filterCount={
            (appliedFilters.categoryId !== 'all' ? 1 : 0) +
            (appliedFilters.regionId.trim() ? 1 : 0)
          }
          defaultSortBy="productName"
          actions={[
            {
              label: 'View',
              onClick: (row) =>
                navigate(`/rewards-wallet/point-value-rules/${row.productId}`),
            },
            {
              label: 'Edit',
              onClick: (row) =>
                navigate(`/rewards-wallet/point-value-rules/${row.productId}/edit-base-value`),
            },
          ]}
          emptyTitle="No Point value rules configured"
          emptyDescription="Try adjusting your search terms."
        />
      </Box>

      <FilterDrawer<PointRuleFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Point Value Rules"
        value={appliedFilters}
        onApply={setAppliedFilters}
      >
        {(draft, setDraft) => (
          <Stack spacing={3}>
            <TextField
              select
              label="Product Category"
              size="small"
              value={draft.categoryId}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, categoryId: e.target.value }))
              }
            >
              <MenuItem value="all">All Categories</MenuItem>
              {categoryOptions.map(([id, name]) => (
                <MenuItem key={id} value={id}>
                  {name}
                </MenuItem>
              ))}
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
