import { useState } from 'react'
import { skipToken } from '@reduxjs/toolkit/query/react'
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
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import {
  Coins as Points,
  ArrowLeft as ArrowBackOutlined,
  Pencil,
  RotateCcw,
  MoreVertical,
} from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { Modal } from '@/components/common/Modal/Modal'
import { ModularTabs } from '@/components/common/ModularTabs/ModularTabs'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { radius } from '@/theme/tokens'
import { useToast } from '@/contexts/ToastContext'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import {
  useGetProductRegionMultipliersQuery,
  useGetProductRegionMultiplierHistoryQuery,
  useUpdateProductRegionMultiplierMutation,
  useResetProductRegionMultiplierMutation,
  type ProductRegionMultiplierRow,
  type ProductRegionMultiplierHistoryRow,
} from '@/features/rewardsWallet/services/pointValueRulesApi'

type PartnerType = 'Dealer' | 'Chemist'

const PARTNER_TYPE_TABS: { label: string; value: PartnerType }[] = [
  { label: 'Chemist', value: 'Chemist' },
  { label: 'Dealer', value: 'Dealer' },
]

const REGION_STYLE_CYCLE = [
  { bg: 'primary.light', text: 'primary.dark', main: 'primary.main' },
  { bg: 'secondary.light', text: 'secondary.dark', main: 'secondary.main' },
  { bg: 'success.light', text: 'success.dark', main: 'success.main' },
  { bg: 'info.light', text: 'info.dark', main: 'info.main' },
]

function regionStyle(index: number) {
  return REGION_STYLE_CYCLE[index % REGION_STYLE_CYCLE.length]
}

function regionInitials(regionName: string): string {
  const words = regionName.trim().split(/\s+/)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return regionName.slice(0, 2).toUpperCase()
}

/** Stable style-per-region across renders — keyed by region name so the same
 *  region always gets the same color, matching the original design. */
function regionStyleByName(
  regions: { regionName: string }[],
  regionName: string,
) {
  const index = regions.findIndex((r) => r.regionName === regionName)
  return regionStyle(index === -1 ? 0 : index)
}

const MULTIPLIER_OPTIONS = Array.from({ length: 37 }, (_, i) =>
  Number((1 + i * 0.25).toFixed(2)),
)
const MAX_MULTIPLIER = 10

function closestMultiplierOption(value: number): number {
  return MULTIPLIER_OPTIONS.reduce((closest, option) =>
    Math.abs(option - value) < Math.abs(closest - value) ? option : closest,
  )
}

function buildHistoryColumns(
  regions: { regionName: string }[],
): CommonTableColumn<ProductRegionMultiplierHistoryRow>[] {
  return [
    {
      key: 'regionName',
      header: 'Region',
      sortable: true,
      sortValue: (entry) => entry.regionName,
      render: (entry) => {
        const style = regionStyleByName(regions, entry.regionName)
        return (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: style.bg,
                color: style.text,
                fontSize: '0.625rem',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {regionInitials(entry.regionName)}
            </Box>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
              {entry.regionName}
            </Typography>
          </Stack>
        )
      },
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
      sortValue: (entry) => entry.previousPoints,
      render: (entry) => (
        <Box>
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
            {entry.previousPoints.toLocaleString('en-IN')} Points
          </Typography>
        </Box>
      ),
    },
    {
      key: 'currentPoints',
      header: 'Current Points',
      align: 'center',
      sortable: true,
      sortValue: (entry) => entry.currentPoints,
      render: (entry) => (
        <Box>
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
            {entry.currentPoints.toLocaleString('en-IN')} Points
          </Typography>
          <Typography sx={{ fontSize: '0.6875rem', color: 'text.disabled' }}>
            {entry.changedAt
              ? new Date(entry.changedAt).toLocaleDateString('en-IN')
              : '-'}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'changedByName',
      header: 'Changed By',
      sortable: true,
      sortValue: (entry) => entry.changedByName ?? '',
      render: (entry) => (
        <Typography sx={{ fontSize: '0.8125rem' }}>
          {entry.changedByName ?? '-'}
        </Typography>
      ),
    },
    {
      key: 'changedAt',
      header: 'Changed At',
      sortable: true,
      sortValue: (entry) => entry.changedAt ?? '',
      render: (entry) => (
        <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
          {entry.changedAt
            ? new Date(entry.changedAt).toLocaleString('en-IN')
            : '-'}
        </Typography>
      ),
    },
  ]
}

export function PointValueRuleDetailsPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { ruleId: productId } = useParams<{ ruleId: string }>()
  const {
    data: detail,
    isFetching: isLoading,
    refetch: refetchDetail,
  } = useGetProductRegionMultipliersQuery(productId ?? '', { skip: !productId })
  const { data: historyData, isFetching: isHistoryLoading } =
    useGetProductRegionMultiplierHistoryQuery(
      productId ? { id: productId, page: 1, limit: 50 } : skipToken,
    )
  const [updateRegionMultiplier, { isLoading: isSavingMultiplier }] =
    useUpdateProductRegionMultiplierMutation()
  const [resetRegionMultiplier] = useResetProductRegionMultiplierMutation()

  const [moreMenuAnchor, setMoreMenuAnchor] = useState<HTMLElement | null>(null)
  const [activeTab, setActiveTab] = useState<PartnerType>('Chemist')

  const [regionEditTarget, setRegionEditTarget] =
    useState<ProductRegionMultiplierRow | null>(null)
  const [regionEditValue, setRegionEditValue] = useState('')
  const [regionConfirmStep, setRegionConfirmStep] = useState<0 | 1 | 2>(0)
  const [resetAllOpen, setResetAllOpen] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  if (!isLoading && !detail) {
    return (
      <EmptyState
        title="Point value rule not found"
        description="This product may have been removed."
        actionLabel="Back to Point Value Rules"
        onAction={() => navigate('/rewards-wallet/point-value-rules/all')}
      />
    )
  }

  const basePoints = detail
    ? activeTab === 'Dealer'
      ? detail.dealerProductPoints
      : detail.chemistProductPoints
    : 0

  function multiplierFor(region: ProductRegionMultiplierRow): number {
    return activeTab === 'Dealer'
      ? region.dealerMultiplier
      : region.chemistMultiplier
  }

  function pointsFor(region: ProductRegionMultiplierRow): number {
    return activeTab === 'Dealer' ? region.dealerPoints : region.chemistPoints
  }

  function isOverrideFor(region: ProductRegionMultiplierRow): boolean {
    return activeTab === 'Dealer'
      ? region.isDealerOverride
      : region.isChemistOverride
  }

  const openRegionEditDialog = (region: ProductRegionMultiplierRow) => {
    setRegionEditTarget(region)
    setRegionEditValue(String(closestMultiplierOption(multiplierFor(region))))
  }

  const regionEditNextMultiplier = Math.max(0, Number(regionEditValue) || 0)
  const regionEditNextPoints =
    Math.round((basePoints * regionEditNextMultiplier) / 100) * 100
  const regionEditExceedsMax = regionEditNextMultiplier > MAX_MULTIPLIER

  const handleRegionEditContinue = () => setRegionConfirmStep(1)

  const handleRegionEditConfirm = async () => {
    if (!regionEditTarget || !productId) return
    try {
      await updateRegionMultiplier({
        id: productId,
        regionId: regionEditTarget.regionId,
        dealerMultiplier:
          activeTab === 'Dealer'
            ? regionEditNextMultiplier
            : regionEditTarget.dealerMultiplier,
        chemistMultiplier:
          activeTab === 'Chemist'
            ? regionEditNextMultiplier
            : regionEditTarget.chemistMultiplier,
      }).unwrap()
      await refetchDetail()
      toast.success(
        `${regionEditTarget.regionName} multiplier updated successfully.`,
      )
    } catch (err) {
      toast.error(
        getApiErrorMessage(err, 'Failed to update region multiplier.'),
      )
    }
    setRegionConfirmStep(0)
    setRegionEditTarget(null)
  }

  const overriddenRegions = (detail?.regions ?? []).filter(isOverrideFor)

  const handleResetAllConfirm = async () => {
    if (!productId || overriddenRegions.length === 0) return
    setIsResetting(true)
    try {
      await Promise.all(
        overriddenRegions.map((region) =>
          resetRegionMultiplier({ id: productId, regionId: region.regionId }).unwrap(),
        ),
      )
      await refetchDetail()
      toast.success(
        `All ${activeTab.toLowerCase()} region multipliers reset to default.`,
      )
    } catch (err) {
      toast.error(
        getApiErrorMessage(err, 'Failed to reset region multipliers.'),
      )
    } finally {
      setIsResetting(false)
      setResetAllOpen(false)
    }
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
            {detail ? (
              <>
                <Typography variant="h1">{detail.productName}</Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Point Rule · {detail.productCode}
                </Typography>
              </>
            ) : (
              <>
                <Skeleton variant="text" width={220} height={36} />
                <Skeleton variant="text" width={160} height={24} />
              </>
            )}
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Button
            variant="contained"
            startIcon={<Pencil size={18} />}
            onClick={() =>
              navigate(
                `/rewards-wallet/point-value-rules/${productId}/edit-base-value`,
              )
            }
            disabled={!detail}
            sx={{ fontSize: '0.8125rem' }}
          >
            Edit Base Value
          </Button>

          <Menu
            anchorEl={moreMenuAnchor}
            open={!!moreMenuAnchor}
            onClose={() => setMoreMenuAnchor(null)}
          >
            <MenuItem
              onClick={() =>
                navigate('/rewards-wallet/point-value-rules/region-multipliers')
              }
            >
              Manage Global Region Rules
            </MenuItem>
          </Menu>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Overview">
          {detail ? (
            <DetailFieldGrid
              fields={[
                { label: 'Product Code', value: detail.productCode },
                {
                  label: 'Product Category',
                  value: detail.categoryName ?? '-',
                },
                {
                  label: 'Base Point Value (Dealer)',
                  labelColor: 'primary.main',
                  value: detail.dealerProductPoints,
                },
                {
                  label: 'Base Point Value (Chemist)',
                  labelColor: 'secondary.main',
                  value: detail.chemistProductPoints,
                },
                { label: 'Status', value: detail.status },
                {
                  label: 'Last Updated Time',
                  value: detail.updatedAt
                    ? new Date(detail.updatedAt).toLocaleString('en-IN')
                    : '-',
                },
              ]}
            />
          ) : (
            <Grid container spacing={2}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
                  <Skeleton variant="text" width="60%" height={16} />
                  <Skeleton variant="rounded" width="90%" height={24} />
                </Grid>
              ))}
            </Grid>
          )}
        </SectionCard>

        <SectionCard
          title="Regional Point Values"
          action={
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <ModularTabs
                tabs={PARTNER_TYPE_TABS}
                value={activeTab}
                onChange={setActiveTab}
                variant="outlined"
                fontSize="0.8125rem"
              />
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<RotateCcw size={14} />}
                disabled={overriddenRegions.length === 0}
                onClick={() => setResetAllOpen(true)}
                sx={{ fontSize: '0.75rem' }}
              >
                Reset to Default
              </Button>
            </Stack>
          }
        >
          <Grid container spacing={2}>
            {!detail
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
                    <Skeleton
                      variant="rounded"
                      width="100%"
                      height={168}
                      sx={{ borderRadius: `${radius.lg}px` }}
                    />
                  </Grid>
                ))
              : detail.regions.map((region, index) => {
                  const style = regionStyle(index)
                  const isOverride = isOverrideFor(region)
                  return (
                    <Grid key={region.regionId} size={{ xs: 12, sm: 6, lg: 3 }}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: `${radius.lg}px`,
                          backgroundColor: style.bg,
                          height: '100%',
                        }}
                      >
                        <Stack
                          direction="row"
                          sx={{
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 1.5,
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.8125rem',
                              color: style.text,
                            }}
                          >
                            {region.regionName}
                          </Typography>
                          {isOverride && (
                            <Chip
                              size="small"
                              label="Override"
                              sx={{
                                height: 18,
                                fontSize: '0.625rem',
                                backgroundColor: 'background.paper',
                                color: style.text,
                              }}
                            />
                          )}
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
                          {closestMultiplierOption(multiplierFor(region))}x
                        </Typography>
                        <Typography
                          sx={{ fontSize: '0.75rem', color: 'text.secondary' }}
                        >
                          {pointsFor(region).toLocaleString('en-IN')} Points
                        </Typography>

                        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                          <Button
                            fullWidth
                            size="small"
                            variant="outlined"
                            startIcon={<Pencil size={14} />}
                            onClick={() => openRegionEditDialog(region)}
                            sx={{
                              fontSize: '0.75rem',
                              backgroundColor: 'background.paper',
                              borderColor: style.main,
                              color: style.text,
                              '&:hover': {
                                backgroundColor: 'background.paper',
                                borderColor: style.text,
                              },
                            }}
                          >
                            Edit
                          </Button>
                        </Stack>
                      </Box>
                    </Grid>
                  )
                })}
          </Grid>
        </SectionCard>

        <SectionCard title="Regional Point History">
          <CommonTable
            tableKey="Point-rule-regional-history"
            columns={buildHistoryColumns(detail?.regions ?? [])}
            rows={historyData?.items ?? []}
            getRowId={(entry) => entry.id}
            loading={isHistoryLoading}
            hideSearch
            defaultSortBy="changedAt"
            defaultSortDir="desc"
            emptyTitle="No history yet"
            emptyDescription="Changes to region multipliers will appear here."
          />
        </SectionCard>
      </Stack>

      <Modal
        open={regionEditTarget !== null}
        onClose={() => setRegionEditTarget(null)}
        title={`Edit ${regionEditTarget?.regionName ?? ''} Multiplier (${activeTab})`}
        description="Update the region multiplier applied to this region for this product."
        primaryActionLabel="Continue"
        onPrimaryAction={handleRegionEditContinue}
        primaryActionDisabled={regionEditExceedsMax}
        maxWidth="sm"
      >
        <TextField
          fullWidth
          type="number"
          label={`${regionEditTarget?.regionName ?? ''} Multiplier`}
          placeholder="e.g. 1x, 2x, 3x, 4x"
          size="small"
          error={regionEditExceedsMax}
          helperText={
            regionEditExceedsMax
              ? `The multiplier cannot be greater than ${MAX_MULTIPLIER}x.`
              : undefined
          }
          value={regionEditValue}
          onChange={(e) => setRegionEditValue(e.target.value)}
          slotProps={{
            htmlInput: { step: 0.25, min: 0, max: MAX_MULTIPLIER },
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
            This will update the {regionEditTarget?.regionName} region
            multiplier ({activeTab}) for <strong>{detail?.productName}</strong>.
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
                label={`${closestMultiplierOption(regionEditTarget ? multiplierFor(regionEditTarget) : 1)}x`}
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
                label={`${(regionEditTarget ? pointsFor(regionEditTarget) : 0).toLocaleString('en-IN')} Points`}
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
            {regionEditTarget?.regionName} region going forward and add an entry
            to Regional Point History. Existing partner wallets are not
            retroactively adjusted.
          </Typography>
        </Stack>
      </Modal>

      <Modal
        open={regionConfirmStep === 2}
        onClose={() => setRegionConfirmStep(0)}
        title="Are you sure?"
        description="This is your final confirmation — the change is applied immediately and cannot be undone from here."
        primaryActionLabel="Confirm & Save"
        onPrimaryAction={() => void handleRegionEditConfirm()}
        secondaryActionLabel="Back"
        onSecondaryAction={() => setRegionConfirmStep(1)}
        loading={isSavingMultiplier}
        maxWidth="sm"
      >
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
              {regionEditTarget?.regionName} Multiplier
            </Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Chip
                size="small"
                variant="outlined"
                label={`${closestMultiplierOption(regionEditTarget ? multiplierFor(regionEditTarget) : 1)}x`}
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

      <Modal
        open={resetAllOpen}
        onClose={() => setResetAllOpen(false)}
        title={`Reset All ${activeTab} Region Multipliers`}
        description={`This only resets the ${activeTab} multipliers for this product — Chemist and Dealer overrides are independent, and ${
          activeTab === 'Dealer' ? 'Chemist' : 'Dealer'
        } values will not be affected.`}
        primaryActionLabel={`Confirm Reset ${activeTab} Multipliers`}
        primaryActionColor="error"
        onPrimaryAction={() => void handleResetAllConfirm()}
        secondaryActionLabel="Cancel"
        loading={isResetting}
        maxWidth="sm"
      >
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
            {detail?.productName} has {overriddenRegions.length} region
            {overriddenRegions.length === 1 ? '' : 's'} with a{' '}
            {activeTab.toLowerCase()} product-specific override:
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
            {overriddenRegions.map((region) => region.regionName).join(', ')}
          </Typography>
        </Stack>
      </Modal>
    </>
  )
}
