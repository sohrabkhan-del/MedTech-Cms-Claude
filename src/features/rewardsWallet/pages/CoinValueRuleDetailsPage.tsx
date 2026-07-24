import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import {
  Coins,
  ArrowLeft as ArrowBackOutlined,
  Pencil,
  SlidersHorizontal,
  GitCompare,
  History,
  Download,
  Package,
  Trophy,
  Repeat2,
  MoreVertical,
} from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { StatCardSkeleton } from '@/components/common/StatCard/StatCardSkeleton'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { Modal } from '@/components/common/Modal/Modal'
import { DetailsPageSkeleton } from '@/components/common/DetailsPageSkeleton/DetailsPageSkeleton'
import { useCoinRuleDetail } from '@/features/rewardsWallet/hooks/useCoinRuleDetail'
import type {
  CoinRuleRegion,
  RegionCoinHistoryEntry,
} from '@/features/rewardsWallet/types/rewardsWallet.types'

const regionInitials: Record<CoinRuleRegion, string> = {
  North: 'NR',
  South: 'SR',
  East: 'ER',
  West: 'WR',
}

const BASE_COIN_VALUE_OPTIONS = Array.from({ length: 10 }, (_, i) => (i + 1) * 100)

export function CoinValueRuleDetailsPage() {
  const navigate = useNavigate()
  const { ruleId } = useParams<{ ruleId: string }>()
  const { rule, highestCurrentPoints, setBaseCoinValue, isLoading } =
    useCoinRuleDetail(ruleId)
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<HTMLElement | null>(null)
  const [editDialog, setEditDialog] = useState<'base' | null>(null)
  const [baseValue, setBaseValue] = useState('')

  if (isLoading) {
    return <DetailsPageSkeleton sections={3} />
  }

  if (!rule) {
    return (
      <EmptyState
        title="Coin value rule not found"
        description="This rule may have been removed."
        actionLabel="Back to Coin Value Rules"
        onAction={() => navigate('/rewards-wallet/coin-value-rules')}
      />
    )
  }

  const maxCurrentPoints = highestCurrentPoints
  const multiplierChanges = rule.regions.filter(
    (r) => r.previousMultiplier !== r.currentMultiplier,
  ).length

  const regionHistoryColumns: CommonTableColumn<RegionCoinHistoryEntry>[] = [
    {
      key: 'region',
      header: 'Region',
      minWidth: 130,
      render: (row) => (
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'primary.light',
              color: 'primary.main',
              fontSize: '0.6875rem',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {regionInitials[row.region]}
          </Box>
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
            {row.region} Region
          </Typography>
        </Stack>
      ),
    },
    {
      key: 'previousMultiplier',
      header: 'Previous Multiplier',
      align: 'center',
      render: (row) => `${row.previousMultiplier}x`,
    },
    {
      key: 'currentMultiplier',
      header: 'Current Multiplier',
      align: 'center',
      render: (row) => (
        <Chip
          size="small"
          label={`${row.currentMultiplier}x`}
          color="primary"
        />
      ),
    },
    {
      key: 'previousRewardPoints',
      header: 'Previous Points',
      align: 'center',
      render: (row) =>
        `${row.previousRewardPoints.toLocaleString('en-IN')} Coins`,
    },
    {
      key: 'previousEffectiveDate',
      header: 'Previous Date',
      minWidth: 130,
      render: (row) => row.previousEffectiveDate,
    },
    {
      key: 'currentRewardPoints',
      header: 'Current Points',
      align: 'center',
      render: (row) =>
        `${row.currentRewardPoints.toLocaleString('en-IN')} Coins`,
    },
    {
      key: 'currentEffectiveDate',
      header: 'Current Date',
      minWidth: 130,
      render: (row) => row.currentEffectiveDate,
    },
    {
      key: 'changedBy',
      header: 'Changed By',
      minWidth: 110,
      render: (row) => row.changedBy,
    },
    {
      key: 'changedAt',
      header: 'Changed At',
      minWidth: 150,
      render: (row) => row.changedAt,
    },
  ]

  return (
    <>
      <Stack
        direction="row"
        sx={{
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          mb: 1.5,
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'primary.light',
              color: 'primary.main',
            }}
          >
            <Coins size={20} />
          </Box>
          <Box>
            <Typography variant="h1">{rule.productName}</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Coin Rule · {rule.modelCode}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Button
            variant="contained"
            startIcon={<Pencil size={18} />}
            onClick={() => {
              setBaseValue(String(rule.baseCoinValue))
              setEditDialog('base')
            }}
            sx={{ fontSize: '0.8125rem' }}
          >
            Edit Base Value
          </Button>
          <Button
            variant="outlined"
            startIcon={<ArrowBackOutlined size={18} />}
            onClick={() => navigate('/rewards-wallet/coin-value-rules')}
            sx={{ fontSize: '0.8125rem' }}
          >
            Back
          </Button>
          <IconButton
            onClick={(e) => setMoreMenuAnchor(e.currentTarget)}
            sx={{ border: '1px solid', borderColor: 'divider' }}
            aria-label="More actions"
          >
            <MoreVertical size={18} />
          </IconButton>
          <Menu
            anchorEl={moreMenuAnchor}
            open={!!moreMenuAnchor}
            onClose={() => setMoreMenuAnchor(null)}
          >
            <MenuItem onClick={() => setMoreMenuAnchor(null)}>
              <SlidersHorizontal size={18} style={{ marginRight: 12 }} />
              Modify Regional Multiplier
            </MenuItem>
            <MenuItem onClick={() => setMoreMenuAnchor(null)}>
              <GitCompare size={18} style={{ marginRight: 12 }} />
              Compare Previous vs Current
            </MenuItem>
            <MenuItem onClick={() => setMoreMenuAnchor(null)}>
              <History size={18} style={{ marginRight: 12 }} />
              Review Change History
            </MenuItem>
            <MenuItem onClick={() => setMoreMenuAnchor(null)}>
              <Download size={18} style={{ marginRight: 12 }} />
              Export Configuration
            </MenuItem>
          </Menu>
        </Stack>
      </Stack>

      {/* Compact identity strip matching the model-code / default-coins / base-coins / regions summary */}
      <Stack
        direction="row"
        spacing={4}
        sx={{
          flexWrap: 'wrap',
          mb: 3,
          p: 2,
          borderRadius: '12px',
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Model Code
          </Typography>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>
            {rule.modelCode}
          </Typography>
        </Box>
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Default Coins
          </Typography>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>
            {rule.defaultCoinValue}
          </Typography>
        </Box>
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Base Coins
          </Typography>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>
            {rule.baseCoinValue}
          </Typography>
        </Box>
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Regions
          </Typography>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>
            {rule.regions.length}
          </Typography>
        </Box>
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Max Current Points
          </Typography>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>
            {maxCurrentPoints}
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Summary">
          <DetailFieldGrid
            fields={[
              { label: 'Rule ID (Model Code)', value: rule.modelCode },
              { label: 'Product Category', value: rule.productCategory },
              { label: 'Default Coin Value', value: rule.defaultCoinValue },
              { label: 'Base Coin Value', value: rule.baseCoinValue },
              { label: 'Total Configured Regions', value: rule.regions.length },
              {
                label: 'Maximum Current Coin Value',
                value: maxCurrentPoints.toLocaleString('en-IN'),
              },
            ]}
          />
        </SectionCard>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            {isLoading ? (
              <StatCardSkeleton />
            ) : (
              <StatCard
                label="Product Category"
                value={rule.productCategory}
                icon={<Package size={20} />}
                iconColor="primary"
              />
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            {isLoading ? (
              <StatCardSkeleton />
            ) : (
              <StatCard
                label="Base Coin Value"
                value={rule.baseCoinValue}
                icon={<Coins size={20} />}
                iconColor="secondary"
              />
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            {isLoading ? (
              <StatCardSkeleton />
            ) : (
              <StatCard
                label="Highest Current Points"
                value={maxCurrentPoints.toLocaleString('en-IN')}
                icon={<Trophy size={20} />}
                iconColor="success"
              />
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            {isLoading ? (
              <StatCardSkeleton />
            ) : (
              <StatCard
                label="Multiplier Changes"
                value={multiplierChanges}
                icon={<Repeat2 size={20} />}
                iconColor="warning"
              />
            )}
          </Grid>
        </Grid>

        <SectionCard title="Regional Coin History">
          <CommonTable
            tableKey="coin-rule-regional-history"
            columns={regionHistoryColumns}
            rows={rule.regionalHistory}
            getRowId={(row) => row.id}
            loading={isLoading}
            searchPlaceholder="Search…"
            searchKeys={(row) => row.region}
            defaultSortBy="region"
            emptyTitle="No regional configuration yet"
          />
        </SectionCard>

        <SectionCard title="Business Information">
          <DetailFieldGrid
            fields={[
              { label: 'Product Category', value: rule.productCategory },
              { label: 'Model Code', value: rule.modelCode },
              { label: 'Base Coin Value', value: rule.baseCoinValue },
              { label: 'Default Coin Value', value: rule.defaultCoinValue },
              {
                label: 'Highest Applicable Coin Value',
                value: maxCurrentPoints.toLocaleString('en-IN'),
              },
              { label: 'Last Modified By', value: rule.lastModifiedBy },
              { label: 'Last Updated Time', value: rule.lastUpdatedTime },
            ]}
          />
        </SectionCard>
      </Stack>

      <Modal
        open={editDialog === 'base'}
        onClose={() => setEditDialog(null)}
        title="Edit Base Coin Value"
        description="Update the base coin value used to calculate reward points for this product."
        primaryActionLabel="Save"
        onPrimaryAction={() => {
          const numeric = Math.max(0, Number(baseValue) || 0)
          void setBaseCoinValue(numeric)
          setEditDialog(null)
        }}
      >
        <TextField
          fullWidth
          select
          label="New Base Coin Value"
          size="small"
          value={baseValue}
          onChange={(e) => setBaseValue(e.target.value)}
          sx={{ mt: 1 }}
        >
          {(BASE_COIN_VALUE_OPTIONS.includes(Number(baseValue))
            ? BASE_COIN_VALUE_OPTIONS
            : [Number(baseValue), ...BASE_COIN_VALUE_OPTIONS].sort((a, b) => a - b)
          ).map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      </Modal>
    </>
  )
}
