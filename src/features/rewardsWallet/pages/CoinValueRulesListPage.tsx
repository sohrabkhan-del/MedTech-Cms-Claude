import { useMemo, useState } from 'react'
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
import { Coins, Layers, Landmark, Package, Pencil } from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { StatCardSkeleton } from '@/components/common/StatCard/StatCardSkeleton'
import { Modal } from '@/components/common/Modal/Modal'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { ModularTabs } from '@/components/common/ModularTabs/ModularTabs'
import {
  TreeTable,
  type TreeTableColumn,
  type TreeTableNode,
} from '@/components/common/TreeTable/TreeTable'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import { useCoinRules } from '@/features/rewardsWallet/hooks/useCoinRules'
import type {
  CoinRulePartnerType,
  CoinRuleRegion,
  CoinValueRule,
} from '@/features/rewardsWallet/types/rewardsWallet.types'

type PartnerTypeTab = 'all' | CoinRulePartnerType

const PARTNER_TYPE_TABS: { label: string; value: PartnerTypeTab }[] = [
  { label: 'All', value: 'all' },
  { label: 'Chemist', value: 'Chemist' },
  { label: 'Dealer', value: 'Dealer' },
]

const REGIONS: CoinRuleRegion[] = ['North', 'South', 'East', 'West']
const BASE_COIN_VALUE_OPTIONS = Array.from(
  { length: 10 },
  (_, i) => (i + 1) * 100,
)

type MatrixRow =
  | { rowType: 'product'; rule: CoinValueRule; baseValue: number }
  | {
      rowType: 'region'
      rule: CoinValueRule
      region: CoinRuleRegion
      currentMultiplier: number
      previousMultiplier: number
      previousPoints: number
      previousEffectiveDate: string
      currentPoints: number
      currentEffectiveDate: string
    }

interface CoinRuleFilters extends Record<string, unknown> {
  productCategory: string | 'all'
  region: CoinRuleRegion | 'all'
}

type RowEditState =
  | { rowType: 'product'; ruleId: string; label: string; value: string }
  | {
      rowType: 'region'
      ruleId: string
      region: CoinRuleRegion
      label: string
      value: string
    }
  | null

export function CoinValueRulesListPage() {
  const navigate = useNavigate()
  const [partnerTypeTab, setPartnerTypeTab] = useState<PartnerTypeTab>('all')

  const {
    rules: allRules,
    regionMultipliers,
    baseValueOverrides,
    setRegionMultiplier,
    setBaseValueOverride,
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

  const filteredRules = useMemo(
    () =>
      rules.filter((rule) => {
        const categoryMatch =
          appliedFilters.productCategory === 'all' ||
          rule.productCategory === appliedFilters.productCategory
        const regionMatch =
          appliedFilters.region === 'all' ||
          rule.regions.some((r) => r.region === appliedFilters.region)
        return categoryMatch && regionMatch
      }),
    [rules, appliedFilters],
  )

  const [regionEditDialog, setRegionEditDialog] = useState<{
    region: CoinRuleRegion
    value: string
  } | null>(null)
  const [rowEditDialog, setRowEditDialog] = useState<RowEditState>(null)

  const resolvedBaseValue = (rule: CoinValueRule) =>
    baseValueOverrides[rule.id] ?? rule.baseCoinValue

  const openRegionMultiplierDialog = (region: CoinRuleRegion) => {
    if (!regionMultipliers) return
    setRegionEditDialog({ region, value: regionMultipliers[region].toFixed(2) })
  }

  const handleSaveRegionMultiplier = () => {
    if (!regionEditDialog) return
    const numeric = Math.max(0, Number(regionEditDialog.value) || 0)
    void setRegionMultiplier(
      regionEditDialog.region,
      Number(numeric.toFixed(2)),
    )
    setRegionEditDialog(null)
  }

  const openRowEditDialog = (row: MatrixRow) => {
    if (row.rowType === 'product') {
      setRowEditDialog({
        rowType: 'product',
        ruleId: row.rule.id,
        label: `${row.rule.modelCode} — ${row.rule.productCategory}`,
        value: String(resolvedBaseValue(row.rule)),
      })
      return
    }
    setRowEditDialog({
      rowType: 'region',
      ruleId: row.rule.id,
      region: row.region,
      label: `${row.rule.modelCode} / ${row.region}`,
      value: row.currentMultiplier.toFixed(2),
    })
  }

  const handleSaveRowEdit = () => {
    if (!rowEditDialog) return
    if (rowEditDialog.rowType === 'product') {
      const numeric = Math.max(0, Number(rowEditDialog.value) || 0)
      setBaseValueOverride(rowEditDialog.ruleId, numeric)
      setRowEditDialog(null)
      return
    }
    // Region-level multiplier override recorded globally per-region for this mock (matches
    // the shared region-multiplier model already used across the module).
    const numeric = Math.max(0, Number(rowEditDialog.value) || 0)
    void setRegionMultiplier(rowEditDialog.region, Number(numeric.toFixed(2)))
    setRowEditDialog(null)
  }

  const nodes: TreeTableNode<MatrixRow>[] = useMemo(
    () =>
      filteredRules.map((rule) => ({
        id: rule.id,
        data: { rowType: 'product', rule, baseValue: resolvedBaseValue(rule) },
        children: rule.regions.map((r) => ({
          id: `${rule.id}-${r.region}`,
          data: {
            rowType: 'region',
            rule,
            region: r.region,
            currentMultiplier:
              regionMultipliers?.[r.region] ?? r.currentMultiplier,
            previousMultiplier: r.previousMultiplier,
            previousPoints: r.previousPoints,
            previousEffectiveDate: r.previousEffectiveDate,
            currentPoints: Math.round(
              resolvedBaseValue(rule) *
                (regionMultipliers?.[r.region] ?? r.currentMultiplier),
            ),
            currentEffectiveDate: r.currentEffectiveDate,
          },
        })),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filteredRules, regionMultipliers, baseValueOverrides],
  )

  const columns: TreeTableColumn<MatrixRow>[] = [
    {
      key: 'name',
      header: 'Product/Region',
      minWidth: 220,
      render: (row) =>
        row.rowType === 'product' ? (
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
            onClick={() =>
              navigate(`/rewards-wallet/coin-value-rules/${row.rule.id}`)
            }
          >
            {row.rule.productCategory}
          </Typography>
        ) : (
          <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
            {row.region} Region
          </Typography>
        ),
    },
    {
      key: 'modelCode',
      header: 'Product Code',
      minWidth: 120,
      render: (row) => (
        <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
          {row.rule.modelCode}
        </Typography>
      ),
    },
    {
      key: 'baseValue',
      header: 'Base Coin Value',
      minWidth: 150,
      render: (row) =>
        row.rowType === 'region' ? (
          <Chip
            size="small"
            label={resolvedBaseValue(row.rule)}
            variant="outlined"
          />
        ) : (
          <Chip
            size="small"
            label={row.baseValue}
            color={
              row.baseValue !== row.rule.baseCoinValue ? 'warning' : 'default'
            }
          />
        ),
    },
    {
      key: 'previousMultiplier',
      header: 'Previous Multiplier',
      align: 'center',
      minWidth: 150,
      render: (row) =>
        row.rowType === 'region' ? (
          <Chip
            size="small"
            label={`${row.previousMultiplier}x`}
            variant="outlined"
          />
        ) : (
          <Typography sx={{ fontSize: '0.8125rem', color: 'text.disabled' }}>
            Regional
          </Typography>
        ),
    },
    {
      key: 'currentMultiplier',
      header: 'Current Multiplier',
      align: 'center',
      minWidth: 150,
      render: (row) =>
        row.rowType === 'region' ? (
          <Chip
            size="small"
            label={`${row.currentMultiplier}x`}
            color="primary"
          />
        ) : (
          <Typography sx={{ fontSize: '0.8125rem', color: 'text.disabled' }}>
            Regional
          </Typography>
        ),
    },
    {
      key: 'previousPoints',
      header: 'Previous Points',
      align: 'center',
      minWidth: 130,
      render: (row) =>
        row.rowType === 'region'
          ? `${row.previousPoints.toLocaleString('en-IN')} Coins`
          : '—',
    },
    {
      key: 'currentPoints',
      header: 'Current Points',
      align: 'center',
      minWidth: 130,
      render: (row) =>
        row.rowType === 'region'
          ? `${row.currentPoints.toLocaleString('en-IN')} Coins`
          : '—',
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

      <Box sx={{ mb: 2.5, mt: 7 }}>
        <ModularTabs
          tabs={PARTNER_TYPE_TABS}
          value={partnerTypeTab}
          onChange={setPartnerTypeTab}
        />
      </Box>

      <Box>
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
            mb: 1.5,
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: '1.0625rem' }}>
            Dynamic Product-to-Coin Matrix
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', flexWrap: 'wrap' }}
          >
            <Typography
              sx={{ fontSize: '0.8125rem', color: 'text.secondary', mr: 0.5 }}
            >
              Region Multipliers:
            </Typography>
            {REGIONS.map((region) => (
              <Chip
                key={region}
                size="small"
                variant="outlined"
                label={`${region} · ${(regionMultipliers?.[region] ?? 1).toFixed(2)}x`}
                deleteIcon={<Pencil size={13} />}
                onDelete={() => openRegionMultiplierDialog(region)}
                onClick={() => openRegionMultiplierDialog(region)}
              />
            ))}
          </Stack>
        </Stack>
        <TreeTable
          tableKey="coin-value-rules-matrix"
          columns={columns}
          nodes={nodes}
          searchPlaceholder="Search by model code or category…"
          searchKeys={(row) =>
            `${row.rule.modelCode} ${row.rule.productCategory} ${row.rule.productName}`
          }
          onFilterClick={() => setFilterOpen(true)}
          filterCount={
            (appliedFilters.productCategory !== 'all' ? 1 : 0) +
            (appliedFilters.region !== 'all' ? 1 : 0)
          }
          actions={[
            {
              label: 'View Rule Details',
              onClick: (row) =>
                navigate(`/rewards-wallet/coin-value-rules/${row.rule.id}`),
            },
            { label: 'Edit', onClick: openRowEditDialog },
            { label: 'Delete Rule', onClick: () => {}, danger: true },
          ]}
          emptyTitle="No coin value rules configured"
          emptyDescription="Try adjusting your search terms."
          defaultExpanded={false}
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

      <Modal
        open={!!regionEditDialog}
        onClose={() => setRegionEditDialog(null)}
        title={
          regionEditDialog ? `Edit ${regionEditDialog.region} Multiplier` : ''
        }
        description="Update the coin-point multiplier applied to this region across all products."
        primaryActionLabel="Save Multiplier"
        onPrimaryAction={handleSaveRegionMultiplier}
      >
        {regionEditDialog && (
          <TextField
            fullWidth
            type="number"
            label="New Multiplier"
            size="small"
            slotProps={{ htmlInput: { step: 0.05, min: 0 } }}
            value={regionEditDialog.value}
            onChange={(e) =>
              setRegionEditDialog((prev) =>
                prev ? { ...prev, value: e.target.value } : prev,
              )
            }
            sx={{ mt: 1 }}
          />
        )}
      </Modal>

      <Modal
        open={!!rowEditDialog}
        onClose={() => setRowEditDialog(null)}
        title={
          rowEditDialog?.rowType === 'product'
            ? `Edit ${rowEditDialog.label} Base Value`
            : rowEditDialog
              ? `Edit ${rowEditDialog.label} Multiplier`
              : ''
        }
        description={
          rowEditDialog?.rowType === 'product'
            ? 'Update the base coin value for this product.'
            : 'Update the multiplier for this region.'
        }
        primaryActionLabel="Save"
        onPrimaryAction={handleSaveRowEdit}
      >
        {rowEditDialog?.rowType === 'product' ? (
          <TextField
            fullWidth
            select
            label="New Base Coin Value"
            size="small"
            value={rowEditDialog.value}
            onChange={(e) =>
              setRowEditDialog((prev) =>
                prev ? { ...prev, value: e.target.value } : prev,
              )
            }
            sx={{ mt: 1 }}
          >
            {(BASE_COIN_VALUE_OPTIONS.includes(Number(rowEditDialog.value))
              ? BASE_COIN_VALUE_OPTIONS
              : [Number(rowEditDialog.value), ...BASE_COIN_VALUE_OPTIONS].sort(
                  (a, b) => a - b,
                )
            ).map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        ) : (
          rowEditDialog && (
            <TextField
              fullWidth
              type="number"
              label="New Multiplier"
              size="small"
              slotProps={{ htmlInput: { step: 0.05, min: 0 } }}
              value={rowEditDialog.value}
              onChange={(e) =>
                setRowEditDialog((prev) =>
                  prev ? { ...prev, value: e.target.value } : prev,
                )
              }
              sx={{ mt: 1 }}
            />
          )
        )}
      </Modal>
    </>
  )
}
