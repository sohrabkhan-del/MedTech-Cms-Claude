import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import {
  Coins as Points,
  ArrowLeft as ArrowBackOutlined,
  Pencil,
  SlidersHorizontal,
  GitCompare,
  History,
  Download,
  MoreVertical,
} from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { Modal } from '@/components/common/Modal/Modal'
import { ModularTabs } from '@/components/common/ModularTabs/ModularTabs'
import { DetailsPageSkeleton } from '@/components/common/DetailsPageSkeleton/DetailsPageSkeleton'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { radius } from '@/theme/tokens'
import { usePointRuleDetail } from '@/features/rewardsWallet/hooks/usePointRuleDetail'
import type {
  PointRulePartnerType,
  PointRuleRegion,
  PointValueRule,
  RegionPointHistoryEntry,
} from '@/features/rewardsWallet/types/rewardsWallet.types'

const regionInitials: Record<PointRuleRegion, string> = {
  North: 'NR',
  South: 'SR',
  East: 'ER',
  West: 'WR',
}

const REGIONS: PointRuleRegion[] = ['North', 'South', 'East', 'West']

const REGION_STYLES: Record<
  PointRuleRegion,
  { bg: string; text: string; main: string }
> = {
  North: { bg: 'primary.light', text: 'primary.dark', main: 'primary.main' },
  South: {
    bg: 'secondary.light',
    text: 'secondary.dark',
    main: 'secondary.main',
  },
  East: { bg: 'success.light', text: 'success.dark', main: 'success.main' },
  West: { bg: 'info.light', text: 'info.dark', main: 'info.main' },
}

const MULTIPLIER_OPTIONS = Array.from({ length: 37 }, (_, i) =>
  Number((1 + i * 0.25).toFixed(2)),
)

const regionalHistoryColumns: CommonTableColumn<RegionPointHistoryEntry>[] = [
  {
    key: 'region',
    header: 'Region',
    sortable: true,
    sortValue: (entry) => entry.region,
    render: (entry) => (
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: REGION_STYLES[entry.region].bg,
            color: REGION_STYLES[entry.region].text,
            fontSize: '0.625rem',
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {regionInitials[entry.region]}
        </Box>
        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
          {entry.region}
        </Typography>
      </Stack>
    ),
  },
  {
    key: 'previousMultiplier',
    header: 'Previous Multiplier',
    align: 'center',
    sortable: true,
    sortValue: (entry) => entry.previousMultiplier,
    render: (entry) => (
      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
        {entry.previousMultiplier}x
      </Typography>
    ),
  },
  {
    key: 'currentMultiplier',
    header: 'Current Multiplier',
    align: 'center',
    sortable: true,
    sortValue: (entry) => entry.currentMultiplier,
    render: (entry) => (
      <Chip
        size="small"
        color="primary"
        label={`${entry.currentMultiplier}x`}
      />
    ),
  },
  {
    key: 'previousPoints',
    header: 'Previous Points',
    align: 'center',
    sortable: true,
    sortValue: (entry) => entry.previousRewardPoints,
    render: (entry) => (
      <Box>
        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
          {entry.previousRewardPoints.toLocaleString('en-IN')} Points
        </Typography>
        <Typography sx={{ fontSize: '0.6875rem', color: 'text.disabled' }}>
          {entry.previousEffectiveDate}
        </Typography>
      </Box>
    ),
  },
  {
    key: 'currentPoints',
    header: 'Current Points',
    align: 'center',
    sortable: true,
    sortValue: (entry) => entry.currentRewardPoints,
    render: (entry) => (
      <Box>
        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
          {entry.currentRewardPoints.toLocaleString('en-IN')} Points
        </Typography>
        <Typography sx={{ fontSize: '0.6875rem', color: 'text.disabled' }}>
          {entry.currentEffectiveDate}
        </Typography>
      </Box>
    ),
  },
  {
    key: 'changedBy',
    header: 'Changed By',
    sortable: true,
    sortValue: (entry) => entry.changedBy,
    render: (entry) => (
      <Typography sx={{ fontSize: '0.8125rem' }}>{entry.changedBy}</Typography>
    ),
  },
  {
    key: 'changedAt',
    header: 'Changed At',
    sortable: true,
    sortValue: (entry) => entry.changedAt,
    render: (entry) => (
      <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
        {entry.changedAt}
      </Typography>
    ),
  },
]

const PARTNER_TYPE_TABS: { label: string; value: PointRulePartnerType }[] = [
  { label: 'Chemist', value: 'Chemist' },
  { label: 'Dealer', value: 'Dealer' },
]

export function PointValueRuleDetailsPage() {
  const navigate = useNavigate()
  const { ruleId } = useParams<{ ruleId: string }>()
  const { rule, siblingRule, updateRegionMultiplier, isLoading } =
    usePointRuleDetail(ruleId)
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<HTMLElement | null>(null)
  const [activeTab, setActiveTab] = useState<PointRulePartnerType>('Chemist')

  const [regionEditTarget, setRegionEditTarget] =
    useState<PointRuleRegion | null>(null)
  const [regionEditValue, setRegionEditValue] = useState('')
  const [regionConfirmStep, setRegionConfirmStep] = useState<0 | 1 | 2>(0)

  if (isLoading) {
    return <DetailsPageSkeleton sections={2} />
  }

  if (!rule) {
    return (
      <EmptyState
        title="Point value rule not found"
        description="This rule may have been removed."
        actionLabel="Back to Point Value Rules"
        onAction={() => navigate('/rewards-wallet/point-value-rules')}
      />
    )
  }

  const activeRule: PointValueRule | undefined =
    activeTab === rule.partnerType ? rule : siblingRule

  function closestMultiplierOption(value: number): number {
    return MULTIPLIER_OPTIONS.reduce((closest, option) =>
      Math.abs(option - value) < Math.abs(closest - value) ? option : closest,
    )
  }

  const openRegionEditDialog = (region: PointRuleRegion) => {
    if (!activeRule) return
    const regionRow = activeRule.regions.find((r) => r.region === region)
    setRegionEditTarget(region)
    setRegionEditValue(
      String(closestMultiplierOption(regionRow?.currentMultiplier ?? 1)),
    )
  }

  const regionEditRow =
    regionEditTarget && activeRule
      ? activeRule.regions.find((r) => r.region === regionEditTarget)
      : undefined
  const regionEditNextMultiplier = Math.max(0, Number(regionEditValue) || 0)
  const regionEditNextPoints = activeRule
    ? Math.round((activeRule.basePointValue * regionEditNextMultiplier) / 100) *
      100
    : 0

  const handleRegionEditContinue = () => {
    setRegionConfirmStep(1)
  }

  const handleRegionEditConfirm = () => {
    if (regionEditTarget && activeRule)
      void updateRegionMultiplier(
        regionEditTarget,
        regionEditNextMultiplier,
        activeRule.id,
      )
    setRegionConfirmStep(0)
    setRegionEditTarget(null)
  }

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
            <Points size={20} />
          </Box>
          <Box>
            <Typography variant="h1">{rule.productName}</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Point Rule · {rule.modelCode}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Button
            variant="contained"
            startIcon={<Pencil size={18} />}
            onClick={() =>
              navigate(
                `/rewards-wallet/point-value-rules/${rule.id}/edit-base-value`,
              )
            }
            sx={{ fontSize: '0.8125rem' }}
          >
            Edit Base Value
          </Button>
          <Button
            variant="outlined"
            startIcon={<ArrowBackOutlined size={18} />}
            onClick={() => navigate('/rewards-wallet/point-value-rules')}
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

      <Stack spacing={3}>
        <SectionCard title="Overview">
          <DetailFieldGrid
            fields={[
              { label: 'Rule ID (Model Code)', value: rule.modelCode },
              { label: 'Product Category', value: rule.productCategory },

              {
                label: 'Base Point Value (Dealer)',
                labelColor: 'primary.main',
                value:
                  rule.partnerType === 'Dealer'
                    ? rule.basePointValue
                    : (siblingRule?.basePointValue ?? '—'),
              },
              {
                label: 'Base Point Value (Chemist)',
                labelColor: 'secondary.main',
                value:
                  rule.partnerType === 'Chemist'
                    ? rule.basePointValue
                    : (siblingRule?.basePointValue ?? '—'),
              },

              { label: 'Last Modified By', value: rule.lastModifiedBy },
              { label: 'Last Updated Time', value: rule.lastUpdatedTime },
            ]}
          />
        </SectionCard>

        <SectionCard
          title="Regional Point Values"
          action={
            <ModularTabs
              tabs={PARTNER_TYPE_TABS}
              value={activeTab}
              onChange={setActiveTab}
              variant="outlined"
              fontSize="0.8125rem"
            />
          }
        >
          {activeRule ? (
            <Grid container spacing={2}>
              {REGIONS.map((region) => {
                const regionRow = activeRule.regions.find(
                  (r) => r.region === region,
                )
                return (
                  <Grid key={region} size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: `${radius.lg}px`,
                        backgroundColor: REGION_STYLES[region].bg,
                        height: '100%',
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: 'center', mb: 1.5 }}
                      >
                        <Box
                          sx={{
                            width: 26,
                            height: 26,
                            borderRadius: '7px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'background.paper',
                            color: REGION_STYLES[region].text,
                            fontSize: '0.625rem',
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {regionInitials[region]}
                        </Box>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.8125rem',
                            color: REGION_STYLES[region].text,
                          }}
                        >
                          {region}
                        </Typography>
                      </Stack>

                      <Typography
                        sx={{
                          fontSize: '0.6875rem',
                          color: 'text.secondary',
                          mb: 0.25,
                        }}
                      >
                        Current Multiplier
                      </Typography>
                      <Typography
                        sx={{ fontSize: '1.25rem', fontWeight: 700, mb: 1 }}
                      >
                        {closestMultiplierOption(
                          regionRow?.currentMultiplier ?? 1,
                        )}
                        x
                      </Typography>
                      <Typography
                        sx={{ fontSize: '0.75rem', color: 'text.secondary' }}
                      >
                        {(regionRow?.currentPoints ?? 0).toLocaleString(
                          'en-IN',
                        )}{' '}
                        Points · {regionRow?.currentEffectiveDate}
                      </Typography>

                      <Button
                        fullWidth
                        size="small"
                        variant="outlined"
                        startIcon={<Pencil size={14} />}
                        onClick={() => openRegionEditDialog(region)}
                        sx={{
                          mt: 2,
                          fontSize: '0.75rem',
                          backgroundColor: 'background.paper',
                          borderColor: REGION_STYLES[region].main,
                          color: REGION_STYLES[region].text,
                          '&:hover': {
                            backgroundColor: 'background.paper',
                            borderColor: REGION_STYLES[region].text,
                          },
                        }}
                      >
                        Edit Multiplier
                      </Button>
                    </Box>
                  </Grid>
                )
              })}
            </Grid>
          ) : (
            <EmptyState
              title={`No ${activeTab} rule configured`}
              description={`This product does not have a ${activeTab.toLowerCase()} Point value rule yet.`}
            />
          )}
        </SectionCard>

        {activeRule && (
          <SectionCard title="Regional Point History">
            <CommonTable
              tableKey="Point-rule-regional-history"
              columns={regionalHistoryColumns}
              rows={activeRule.regionalHistory}
              getRowId={(entry) => entry.id}
              searchPlaceholder="Search by region or reviewer…"
              searchKeys={(entry) => `${entry.region} ${entry.changedBy}`}
              defaultSortBy="changedAt"
              defaultSortDir="desc"
              emptyTitle="No history yet"
              emptyDescription="Changes to region multipliers will appear here."
            />
          </SectionCard>
        )}
      </Stack>

      <Modal
        open={regionEditTarget !== null}
        onClose={() => setRegionEditTarget(null)}
        title={`Edit ${regionEditTarget ?? ''} Multiplier (${activeRule?.partnerType ?? ''})`}
        description="Update the region multiplier applied to this region for this product."
        primaryActionLabel="Continue"
        onPrimaryAction={handleRegionEditContinue}
        maxWidth="sm"
      >
        <TextField
          fullWidth
          type="number"
          label={`${regionEditTarget ?? ''} Multiplier`}
          placeholder="e.g. 1x, 2x, 3x, 4x"
          size="small"
          value={regionEditValue}
          onChange={(e) => setRegionEditValue(e.target.value)}
          slotProps={{
            htmlInput: { step: 0.25, min: 0 },
            input: {
              endAdornment: <InputAdornment position="end">x</InputAdornment>,
            },
          }}
          sx={{ mt: 1 }}
        />
      </Modal>

      <Modal
        open={regionConfirmStep === 1}
        onClose={() => setRegionConfirmStep(0)}
        title="Confirm Multiplier Change"
        description="Please review before continuing."
        primaryActionLabel="Continue"
        onPrimaryAction={() => setRegionConfirmStep(2)}
        secondaryActionLabel="Back"
        onSecondaryAction={() => setRegionConfirmStep(0)}
        maxWidth="sm"
      >
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
            This will update the {regionEditTarget} region multiplier (
            {activeRule?.partnerType}) for <strong>{rule.productName}</strong>.
          </Typography>
          <Stack
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
              Multiplier
            </Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Chip
                size="small"
                variant="outlined"
                label={`${closestMultiplierOption(regionEditRow?.currentMultiplier ?? 1)}x`}
              />
              <Typography sx={{ fontSize: '0.75rem', color: 'text.disabled' }}>
                →
              </Typography>
              <Chip
                size="small"
                color="primary"
                label={`${regionEditNextMultiplier}x`}
              />
            </Stack>
          </Stack>
          <Stack
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
              Reward Points
            </Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Chip
                size="small"
                variant="outlined"
                label={`${(regionEditRow?.currentPoints ?? 0).toLocaleString('en-IN')} Points`}
              />
              <Typography sx={{ fontSize: '0.75rem', color: 'text.disabled' }}>
                →
              </Typography>
              <Chip
                size="small"
                color="primary"
                label={`${regionEditNextPoints.toLocaleString('en-IN')} Points`}
              />
            </Stack>
          </Stack>
          <Typography sx={{ fontSize: '0.75rem', color: 'warning.main' }}>
            This will recalculate reward Point payouts for this product in the{' '}
            {regionEditTarget} region going forward and add an entry to Regional
            Point History. Existing partner wallets are not retroactively
            adjusted.
          </Typography>
        </Stack>
      </Modal>

      <Modal
        open={regionConfirmStep === 2}
        onClose={() => setRegionConfirmStep(0)}
        title="Are you sure?"
        description="This is your final confirmation — the change is applied immediately and cannot be undone from here."
        primaryActionLabel="Confirm & Save"
        onPrimaryAction={handleRegionEditConfirm}
        secondaryActionLabel="Back"
        onSecondaryAction={() => setRegionConfirmStep(1)}
        maxWidth="sm"
      >
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
              {regionEditTarget} Multiplier
            </Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Chip
                size="small"
                variant="outlined"
                label={`${closestMultiplierOption(regionEditRow?.currentMultiplier ?? 1)}x`}
              />
              <Typography sx={{ fontSize: '0.75rem', color: 'text.disabled' }}>
                →
              </Typography>
              <Chip
                size="small"
                color="primary"
                label={`${regionEditNextMultiplier}x`}
              />
            </Stack>
          </Stack>
        </Stack>
      </Modal>
    </>
  )
}
