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
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import { usePointRules } from '@/features/rewardsWallet/hooks/usePointRules'
import type { ProductPointRuleGroup } from '@/features/rewardsWallet/mockPointRules'
import type {
  PointRulePartnerType,
  PointRuleRegion,
} from '@/features/rewardsWallet/types/rewardsWallet.types'

type PartnerTypeTab = 'all' | PointRulePartnerType

const PARTNER_TYPE_TABS: { label: string; value: PartnerTypeTab }[] = [
  { label: 'All', value: 'all' },
  { label: 'Chemist', value: 'Chemist' },
  { label: 'Dealer', value: 'Dealer' },
]

const REGIONS: PointRuleRegion[] = ['North', 'South', 'East', 'West']

interface PointRuleFilters extends Record<string, unknown> {
  productCategory: string | 'all'
  region: PointRuleRegion | 'all'
}

interface ProductRow extends ProductPointRuleGroup {
  status: 'active' | 'inactive'
}

export function PointValueRulesListPage() {
  const navigate = useNavigate()
  const [partnerTypeTab, setPartnerTypeTab] = useState<PartnerTypeTab>('all')

  const {
    rules: allRules,
    productGroups,
    baseValueOverrides,
    statusOverrides,
    setRuleStatus,
    isLoading,
  } = usePointRules()

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

  const rules = useMemo(
    () =>
      partnerTypeTab === 'all'
        ? allRules
        : allRules.filter((rule) => rule.partnerType === partnerTypeTab),
    [allRules, partnerTypeTab],
  )

  const kpis = useMemo(
    () => ({
      totalOutstandingPointLiability: rules.reduce(
        (sum, r) => sum + r.regions.reduce((s, x) => s + x.currentPoints, 0),
        0,
      ),
      totalConfiguredRules: rules.length,
      averageBasePointValue: rules.length
        ? Math.round(
            rules.reduce((sum, r) => sum + r.basePointValue, 0) / rules.length,
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
  const [appliedFilters, setAppliedFilters] = useState<PointRuleFilters>({
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
              navigate(`/rewards-wallet/point-value-rules/${targetRule.id}`)
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
            key: 'basePointValueDealer',
            header: 'Base Point Value (Dealer)',
            align: 'center' as const,
            minWidth: 170,
            sortable: true,
            sortValue: (row: ProductRow) =>
              row.dealerRule
                ? resolvedBaseValue(
                    row.dealerRule.id,
                    row.dealerRule.basePointValue,
                  )
                : 0,
            render: (row: ProductRow) =>
              row.dealerRule ? (
                <Chip
                  size="small"
                  label={resolvedBaseValue(
                    row.dealerRule.id,
                    row.dealerRule.basePointValue,
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
            key: 'basePointValueChemist',
            header: 'Base Point Value (Chemist)',
            align: 'center' as const,
            minWidth: 170,
            sortable: true,
            sortValue: (row: ProductRow) =>
              row.chemistRule
                ? resolvedBaseValue(
                    row.chemistRule.id,
                    row.chemistRule.basePointValue,
                  )
                : 0,
            render: (row: ProductRow) =>
              row.chemistRule ? (
                <Chip
                  size="small"
                  label={resolvedBaseValue(
                    row.chemistRule.id,
                    row.chemistRule.basePointValue,
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
              label="Total Outstanding Point Liability"
              value={(kpis?.totalOutstandingPointLiability ?? 0).toLocaleString(
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
              `/rewards-wallet/point-value-rules/region-multipliers?partnerType=${
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
          tableKey="Point-value-rules-product-list"
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
                  navigate(`/rewards-wallet/point-value-rules/${targetRule.id}`)
              },
            },
            {
              label: 'Edit',
              onClick: (row) => {
                const targetRule = row.dealerRule ?? row.chemistRule
                if (targetRule)
                  navigate(`/rewards-wallet/point-value-rules/${targetRule.id}`)
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
                  region: e.target.value as PointRuleFilters['region'],
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
