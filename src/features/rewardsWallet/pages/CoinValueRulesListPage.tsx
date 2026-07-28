import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Chip,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { Coins, Layers, Landmark, Package, ChevronRight } from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { StatCardSkeleton } from '@/components/common/StatCard/StatCardSkeleton'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { ModularTabs } from '@/components/common/ModularTabs/ModularTabs'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import { useCoinRules } from '@/features/rewardsWallet/hooks/useCoinRules'
import type { ProductCoinRuleGroup } from '@/features/rewardsWallet/mockCoinRules'
import type {
  CoinRulePartnerType,
  CoinRuleRegion,
} from '@/features/rewardsWallet/types/rewardsWallet.types'

type PartnerTypeTab = 'all' | CoinRulePartnerType

const PARTNER_TYPE_TABS: { label: string; value: PartnerTypeTab }[] = [
  { label: 'All', value: 'all' },
  { label: 'Chemist', value: 'Chemist' },
  { label: 'Dealer', value: 'Dealer' },
]

const REGIONS: CoinRuleRegion[] = ['North', 'South', 'East', 'West']

interface CoinRuleFilters extends Record<string, unknown> {
  productCategory: string | 'all'
  region: CoinRuleRegion | 'all'
}

interface ProductRow extends ProductCoinRuleGroup {
  status: 'active' | 'inactive'
}

export function CoinValueRulesListPage() {
  const navigate = useNavigate()
  const [partnerTypeTab, setPartnerTypeTab] = useState<PartnerTypeTab>('all')

  const {
    rules: allRules,
    productGroups,
    baseValueOverrides,
    statusOverrides,
    setRuleStatus,
    isLoading,
  } = useCoinRules()

  useRegionTopbarHeader({
    icon: <Coins size={20} />,
    title:
      partnerTypeTab === 'all'
        ? 'Coin Value Rules'
        : `Coin Value Rules — ${partnerTypeTab}`,
    subtitle:
      'Configure base coin values, regional multipliers, and monitor reward distribution impact.',
    isLoading,
  })

  const rules = useMemo(
    () =>
      partnerTypeTab === 'all'
        ? allRules
        : allRules.filter((rule) => rule.partnerType === partnerTypeTab),
    [allRules, partnerTypeTab],
  )

  const kpis = useMemo(
    () => ({
      totalOutstandingCoinLiability: rules.reduce(
        (sum, r) => sum + r.regions.reduce((s, x) => s + x.currentPoints, 0),
        0,
      ),
      totalConfiguredRules: rules.length,
      averageBaseCoinValue: rules.length
        ? Math.round(
            rules.reduce((sum, r) => sum + r.baseCoinValue, 0) / rules.length,
          )
        : 0,
    }),
    [rules],
  )

  const distributionByCategory = useMemo(
    () =>
      Object.entries(
        rules.reduce<Record<string, number>>((acc, rule) => {
          const total = rule.regions.reduce((s, x) => s + x.currentPoints, 0)
          acc[rule.productCategory] = (acc[rule.productCategory] ?? 0) + total
          return acc
        }, {}),
      ).map(([category, value]) => ({ category, value })),
    [rules],
  )

  const productCategoryOptions = useMemo(
    () => Array.from(new Set(rules.map((r) => r.productCategory))).sort(),
    [rules],
  )

  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<CoinRuleFilters>({
    productCategory: 'all',
    region: 'all',
  })

  const resolvedBaseValue = (ruleId: string, fallback: number) =>
    baseValueOverrides[ruleId] ?? fallback

  const resolvedStatus = (ruleId: string, fallback: 'active' | 'inactive') =>
    statusOverrides[ruleId] ?? fallback

  const productRows: ProductRow[] = useMemo(
    () =>
      productGroups
        .filter((group) => {
          if (partnerTypeTab === 'Dealer') return !!group.dealerRule
          if (partnerTypeTab === 'Chemist') return !!group.chemistRule
          return true
        })
        .map((group) => {
          const primaryRule = group.dealerRule ?? group.chemistRule
          return {
            ...group,
            status: resolvedStatus(
              primaryRule?.id ?? group.modelCode,
              primaryRule?.status ?? 'active',
            ),
          }
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [productGroups, partnerTypeTab, statusOverrides],
  )

  const filteredProductRows = useMemo(
    () =>
      productRows.filter((row) => {
        const categoryMatch =
          appliedFilters.productCategory === 'all' ||
          row.productCategory === appliedFilters.productCategory
        const regionMatch =
          appliedFilters.region === 'all' ||
          [row.dealerRule, row.chemistRule].some((rule) =>
            rule?.regions.some((r) => r.region === appliedFilters.region),
          )
        return categoryMatch && regionMatch
      }),
    [productRows, appliedFilters],
  )

  const showDealerColumn = partnerTypeTab !== 'Chemist'
  const showChemistColumn = partnerTypeTab !== 'Dealer'

  const columns: CommonTableColumn<ProductRow>[] = [
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
          onClick={() => {
            const targetRule = row.dealerRule ?? row.chemistRule
            if (targetRule)
              navigate(`/rewards-wallet/coin-value-rules/${targetRule.id}`)
          }}
        >
          {row.productName}
        </Typography>
      ),
    },
    {
      key: 'modelCode',
      header: 'Product Code',
      minWidth: 130,
      sortable: true,
      sortValue: (row) => row.modelCode,
      render: (row) => (
        <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
          {row.modelCode}
        </Typography>
      ),
    },
    ...(showDealerColumn
      ? [
          {
            key: 'baseCoinValueDealer',
            header: 'Base Coin Value (Dealer)',
            align: 'center' as const,
            minWidth: 170,
            sortable: true,
            sortValue: (row: ProductRow) =>
              row.dealerRule
                ? resolvedBaseValue(
                    row.dealerRule.id,
                    row.dealerRule.baseCoinValue,
                  )
                : 0,
            render: (row: ProductRow) =>
              row.dealerRule ? (
                <Chip
                  size="small"
                  label={resolvedBaseValue(
                    row.dealerRule.id,
                    row.dealerRule.baseCoinValue,
                  )}
                  variant="outlined"
                />
              ) : (
                <Typography
                  sx={{ fontSize: '0.8125rem', color: 'text.disabled' }}
                >
                  —
                </Typography>
              ),
          },
        ]
      : []),
    ...(showChemistColumn
      ? [
          {
            key: 'baseCoinValueChemist',
            header: 'Base Coin Value (Chemist)',
            align: 'center' as const,
            minWidth: 170,
            sortable: true,
            sortValue: (row: ProductRow) =>
              row.chemistRule
                ? resolvedBaseValue(
                    row.chemistRule.id,
                    row.chemistRule.baseCoinValue,
                  )
                : 0,
            render: (row: ProductRow) =>
              row.chemistRule ? (
                <Chip
                  size="small"
                  label={resolvedBaseValue(
                    row.chemistRule.id,
                    row.chemistRule.baseCoinValue,
                  )}
                  variant="outlined"
                />
              ) : (
                <Typography
                  sx={{ fontSize: '0.8125rem', color: 'text.disabled' }}
                >
                  —
                </Typography>
              ),
          },
        ]
      : []),
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      sortValue: (row) => row.status,
      render: (row) => <StatusBadge status={row.status} />,
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
              label="Total Outstanding Coin Liability"
              value={(kpis?.totalOutstandingCoinLiability ?? 0).toLocaleString(
                'en-IN',
              )}
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
              value={kpis?.totalConfiguredRules ?? 0}
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
              label="Average Base Coin Value"
              value={kpis?.averageBaseCoinValue ?? 0}
              icon={<Coins size={20} />}
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
              value={distributionByCategory.length}
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
          onClick={() =>
            navigate(
              `/rewards-wallet/coin-value-rules/region-multipliers?partnerType=${
                partnerTypeTab === 'all' ? 'Dealer' : partnerTypeTab
              }`,
            )
          }
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
          tableKey="coin-value-rules-product-list"
          columns={columns}
          rows={filteredProductRows}
          getRowId={(row) => row.modelCode}
          loading={isLoading}
          searchPlaceholder="Search by product name or code…"
          searchKeys={(row) =>
            `${row.modelCode} ${row.productCategory} ${row.productName}`
          }
          onFilterClick={() => setFilterOpen(true)}
          filterCount={
            (appliedFilters.productCategory !== 'all' ? 1 : 0) +
            (appliedFilters.region !== 'all' ? 1 : 0)
          }
          defaultSortBy="productName"
          actions={[
            {
              label: 'View',
              onClick: (row) => {
                const targetRule = row.dealerRule ?? row.chemistRule
                if (targetRule)
                  navigate(`/rewards-wallet/coin-value-rules/${targetRule.id}`)
              },
            },
            {
              label: 'Edit',
              onClick: (row) => {
                const targetRule = row.dealerRule ?? row.chemistRule
                if (targetRule)
                  navigate(`/rewards-wallet/coin-value-rules/${targetRule.id}`)
              },
            },
            {
              label: 'Activate',
              hidden: (row) => row.status === 'active',
              onClick: (row) => {
                if (row.dealerRule)
                  void setRuleStatus(row.dealerRule.id, 'active')
                if (row.chemistRule)
                  void setRuleStatus(row.chemistRule.id, 'active')
              },
            },
            {
              label: 'Deactivate',
              hidden: (row) => row.status === 'inactive',
              onClick: (row) => {
                if (row.dealerRule)
                  void setRuleStatus(row.dealerRule.id, 'inactive')
                if (row.chemistRule)
                  void setRuleStatus(row.chemistRule.id, 'inactive')
              },
            },
          ]}
          emptyTitle="No coin value rules configured"
          emptyDescription="Try adjusting your search terms."
        />
      </Box>

      <FilterDrawer<CoinRuleFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Coin Value Rules"
        value={appliedFilters}
        onApply={setAppliedFilters}
      >
        {(draft, setDraft) => (
          <Stack spacing={3}>
            <TextField
              select
              label="Product Category"
              size="small"
              value={draft.productCategory}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  productCategory: e.target.value,
                }))
              }
            >
              <MenuItem value="all">All Categories</MenuItem>
              {productCategoryOptions.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Region"
              size="small"
              value={draft.region}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  region: e.target.value as CoinRuleFilters['region'],
                }))
              }
            >
              <MenuItem value="all">All Regions</MenuItem>
              {REGIONS.map((region) => (
                <MenuItem key={region} value={region}>
                  {region}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        )}
      </FilterDrawer>
    </>
  )
}
