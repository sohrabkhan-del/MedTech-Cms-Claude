import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  Grid,
  InputAdornment,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { ArrowLeft, ShieldAlert, SlidersHorizontal } from 'lucide-react'
import { Modal } from '@/components/common/Modal/Modal'
import { ModularTabs } from '@/components/common/ModularTabs/ModularTabs'
import { radius } from '@/theme/tokens'
import { useToast } from '@/contexts/ToastContext'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import {
  useGetGlobalRegionMultipliersQuery,
  useBulkUpdateRegionMultipliersMutation,
} from '@/features/rewardsWallet/services/pointValueRulesApi'

type PartnerType = 'Dealer' | 'Chemist'

const PARTNER_TYPE_STYLES: Record<PartnerType, { bg: string; text: string; main: string }> = {
  Dealer: { bg: 'primary.light', text: 'primary.dark', main: 'primary.main' },
  Chemist: { bg: 'secondary.light', text: 'secondary.dark', main: 'secondary.main' },
}

const MULTIPLIER_OPTIONS = Array.from({ length: 37 }, (_, i) => Number((1 + i * 0.25).toFixed(2)))
const MAX_MULTIPLIER = 10

const PARTNER_TYPE_TABS: { label: string; value: PartnerType }[] = [
  { label: 'Dealer', value: 'Dealer' },
  { label: 'Chemist', value: 'Chemist' },
]

function isPartnerType(value: string | null): value is PartnerType {
  return value === 'Dealer' || value === 'Chemist'
}

function closestMultiplierOption(value: number): number {
  return MULTIPLIER_OPTIONS.reduce((closest, option) =>
    Math.abs(option - value) < Math.abs(closest - value) ? option : closest,
  )
}

interface RegionMultiplierValue {
  dealerMultiplier: number
  chemistMultiplier: number
}

export function RegionMultiplierRulesPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: regions = [], isFetching: isLoading } = useGetGlobalRegionMultipliersQuery()
  const [bulkUpdate, { isLoading: isSaving }] = useBulkUpdateRegionMultipliersMutation()

  const partnerType: PartnerType = isPartnerType(searchParams.get('partnerType'))
    ? (searchParams.get('partnerType') as PartnerType)
    : 'Dealer'

  const setPartnerType = (next: PartnerType) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev)
      params.set('partnerType', next)
      return params
    })
  }

  // Tracks BOTH dealer and chemist edits together (even though only one tab
  // is shown at a time) since the real bulk endpoint requires both values
  // per region in the same request.
  const [values, setValues] = useState<Record<string, RegionMultiplierValue> | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const activeValueByRegion = useMemo(
    () =>
      new Map(
        regions.map((region) => [
          region.regionId,
          {
            dealerMultiplier: closestMultiplierOption(region.dealerMultiplier),
            chemistMultiplier: closestMultiplierOption(region.chemistMultiplier),
          },
        ]),
      ),
    [regions],
  )

  const currentValues = useMemo<Record<string, RegionMultiplierValue>>(() => {
    if (values) return values
    const next: Record<string, RegionMultiplierValue> = {}
    for (const region of regions) {
      next[region.regionId] = activeValueByRegion.get(region.regionId) ?? {
        dealerMultiplier: 1,
        chemistMultiplier: 1,
      }
    }
    return next
  }, [values, regions, activeValueByRegion])

  const field: keyof RegionMultiplierValue =
    partnerType === 'Dealer' ? 'dealerMultiplier' : 'chemistMultiplier'

  const changedRegionIds = useMemo(
    () =>
      regions
        .filter((region) => {
          const active = activeValueByRegion.get(region.regionId)
          const current = currentValues[region.regionId]
          if (!active || !current) return false
          return active[field] !== current[field]
        })
        .map((region) => region.regionId),
    [regions, currentValues, activeValueByRegion, field],
  )

  // Backend rule: after this update, exactly one region (across all 4) must
  // sit at multiplier 1 for the active partner type. Resolve the post-save
  // value for every region and validate before allowing save.
  const resultingRegionsAtOne = useMemo(() => {
    return regions.filter((region) => {
      const resolved = changedRegionIds.includes(region.regionId)
        ? currentValues[region.regionId]?.[field]
        : activeValueByRegion.get(region.regionId)?.[field]
      return resolved === 1
    }).length
  }, [regions, changedRegionIds, currentValues, activeValueByRegion, field])

  const multiplierRuleError =
    changedRegionIds.length > 0 && resultingRegionsAtOne !== 1
      ? resultingRegionsAtOne === 0
        ? 'Exactly one region must have a multiplier of 1. Set one of the regions above to 1x.'
        : 'Exactly one region must have a multiplier of 1. More than one region is currently at 1x — adjust so only one remains at 1x.'
      : null

  const overLimitRegionIds = useMemo(
    () =>
      regions
        .filter((region) => (currentValues[region.regionId]?.[field] ?? 0) > MAX_MULTIPLIER)
        .map((region) => region.regionId),
    [regions, currentValues, field],
  )

  const maxMultiplierError =
    overLimitRegionIds.length > 0
      ? `The multiplier cannot be greater than ${MAX_MULTIPLIER}x. Please correct the highlighted region${overLimitRegionIds.length === 1 ? '' : 's'} below.`
      : null

  const handleValueChange = (regionId: string, value: number) => {
    setValues((prev) => {
      const base = prev ?? currentValues
      return {
        ...base,
        [regionId]: {
          ...base[regionId],
          [field]: value,
        },
      }
    })
  }

  const handleReset = () => setValues(null)

  const handleConfirmSave = async () => {
    try {
      await bulkUpdate({
        regions: regions.map((region) => ({
          regionId: region.regionId,
          dealerMultiplier: currentValues[region.regionId].dealerMultiplier,
          chemistMultiplier: currentValues[region.regionId].chemistMultiplier,
        })),
      }).unwrap()
      setConfirmOpen(false)
      setValues(null)
      toast.success(`${partnerType} region multipliers updated successfully.`)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update region multipliers.'))
    }
  }

  return (
    <>
      <Button
        variant="text"
        startIcon={<ArrowLeft size={16} />}
        onClick={() => navigate('/rewards-wallet/point-value-rules/all')}
        sx={{ fontSize: '0.8125rem', mb: 2, px: 0 }}
      >
        Back to Point Value Rules
      </Button>

      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'warning.light',
            color: 'warning.dark',
            flexShrink: 0,
          }}
        >
          <SlidersHorizontal size={20} />
        </Box>
        <Box>
          <Typography variant="h1">Region Multiplier Rules</Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Bulk-edit the region multiplier applied to every product in a region, per partner
            type.
          </Typography>
        </Box>
      </Stack>

      <Alert
        severity="warning"
        icon={<ShieldAlert size={20} />}
        sx={{ mb: 3, alignItems: 'flex-start', '& .MuiAlert-message': { width: '100%' } }}
      >
        <AlertTitle sx={{ fontWeight: 700 }}>This is a major, high-impact operation</AlertTitle>
        <Typography sx={{ fontSize: '0.8125rem' }}>
          Region multipliers apply instantly to <strong>every product rule</strong> configured
          for the affected region(s) — but only for the <strong>{partnerType}</strong> partner
          type selected below. Dealer and Chemist multipliers are configured independently.
          Changing a multiplier will immediately recalculate how many reward points partners earn
          in that region going forward. Existing wallet balances and already-issued Points are
          not retroactively adjusted. Please double-check the values below before saving.
        </Typography>
      </Alert>

      <Box sx={{ mb: 3 }}>
        <ModularTabs tabs={PARTNER_TYPE_TABS} value={partnerType} onChange={setPartnerType} />
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 12 }}>
          <Box
            sx={{
              p: 3,
              borderRadius: `${radius.lg}px`,
              backgroundColor: PARTNER_TYPE_STYLES[partnerType].bg,
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  color: PARTNER_TYPE_STYLES[partnerType].text,
                }}
              >
                Edit {partnerType} Multipliers
              </Typography>
              <Chip
                size="small"
                variant="outlined"
                label="Editing"
                sx={{
                  height: 18,
                  fontSize: '0.625rem',
                  borderColor: PARTNER_TYPE_STYLES[partnerType].text,
                  color: PARTNER_TYPE_STYLES[partnerType].text,
                }}
              />
            </Stack>

            <Grid container spacing={1.5}>
              {isLoading && regions.length === 0
                ? Array.from({ length: 4 }, (_, i) => (
                    <Grid key={i} size={{ xs: 6, sm: 3 }}>
                      <Skeleton width={80} height={18} sx={{ mb: 0.5 }} />
                      <Skeleton variant="rounded" height={40} />
                    </Grid>
                  ))
                : null}
              {regions.map((region) => {
                const isChanged = changedRegionIds.includes(region.regionId)
                return (
                  <Grid key={region.regionId} size={{ xs: 6, sm: 3 }}>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: 0.5 }}>
                      <Typography sx={{ fontSize: '0.6875rem', color: 'text.secondary' }}>
                        {region.regionName}
                      </Typography>
                      {isChanged && (
                        <Chip
                          size="small"
                          color="warning"
                          label="•"
                          sx={{
                            height: 14,
                            width: 14,
                            minWidth: 14,
                            '& .MuiChip-label': { p: 0 },
                          }}
                        />
                      )}
                    </Stack>
                    {isLoading ? (
                      <Skeleton variant="rounded" height={40} />
                    ) : (
                      <TextField
                        fullWidth
                        type="number"
                        size="small"
                        error={overLimitRegionIds.includes(region.regionId)}
                        value={
                          currentValues[region.regionId]?.[field] === 0
                            ? ''
                            : (currentValues[region.regionId]?.[field] ?? 1)
                        }
                        onChange={(e) =>
                          handleValueChange(
                            region.regionId,
                            e.target.value === '' ? 0 : Number(e.target.value),
                          )
                        }
                        slotProps={{
                          htmlInput: { step: 0.25, min: 0, max: MAX_MULTIPLIER },
                          input: {
                            endAdornment: <InputAdornment position="end">x</InputAdornment>,
                          },
                        }}
                        sx={{ backgroundColor: 'background.paper', borderRadius: `${radius.sm}px` }}
                      />
                    )}
                  </Grid>
                )
              })}
            </Grid>

            {maxMultiplierError && (
              <Alert severity="error" sx={{ mt: 2, fontSize: '0.75rem' }}>
                {maxMultiplierError}
              </Alert>
            )}

            {multiplierRuleError && (
              <Alert severity="error" sx={{ mt: 2, fontSize: '0.75rem' }}>
                {multiplierRuleError}
              </Alert>
            )}

            <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }}>
              <Button
                variant="contained"
                disabled={
                  changedRegionIds.length === 0 ||
                  isLoading ||
                  !!multiplierRuleError ||
                  !!maxMultiplierError
                }
                onClick={() => setConfirmOpen(true)}
                sx={{
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  boxShadow: 'none',
                  backgroundColor: PARTNER_TYPE_STYLES[partnerType].main,
                  '&:hover': {
                    backgroundColor: PARTNER_TYPE_STYLES[partnerType].text,
                    boxShadow: 'none',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: 'background.paper',
                    color: 'text.disabled',
                  },
                }}
              >
                Review & Save Changes
              </Button>
              <Button
                variant="outlined"
                disabled={changedRegionIds.length === 0}
                onClick={handleReset}
                sx={{
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  backgroundColor: 'background.paper',
                  borderColor: PARTNER_TYPE_STYLES[partnerType].main,
                  color: PARTNER_TYPE_STYLES[partnerType].text,
                  '&:hover': {
                    backgroundColor: 'background.paper',
                    borderColor: PARTNER_TYPE_STYLES[partnerType].text,
                  },
                  '&.Mui-disabled': {
                    backgroundColor: 'transparent',
                    borderColor: 'divider',
                    color: 'text.disabled',
                  },
                }}
              >
                Reset
              </Button>
            </Stack>
          </Box>
        </Grid>
      </Grid>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={`Confirm ${partnerType} Multiplier Changes`}
        description="Please review carefully — this change is applied immediately and cannot be undone automatically."
        primaryActionLabel="Confirm & Save"
        primaryActionColor="error"
        onPrimaryAction={() => void handleConfirmSave()}
        secondaryActionLabel="Cancel"
        loading={isSaving}
        maxWidth="sm"
      >
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Alert severity="warning" sx={{ fontSize: '0.75rem' }}>
            This will affect point values for every {partnerType} product rule across{' '}
            {changedRegionIds.length} region{changedRegionIds.length === 1 ? '' : 's'}, effective
            immediately.
          </Alert>
          <Stack spacing={1}>
            {changedRegionIds.map((regionId) => {
              const region = regions.find((r) => r.regionId === regionId)
              return (
                <Stack
                  key={regionId}
                  direction="row"
                  sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                    {region?.regionName ?? regionId}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`${activeValueByRegion.get(regionId)?.[field] ?? 1}x`}
                    />
                    <Typography sx={{ fontSize: '0.75rem', color: 'text.disabled' }}>→</Typography>
                    <Chip
                      size="small"
                      color="warning"
                      label={`${currentValues[regionId]?.[field] ?? 1}x`}
                    />
                  </Stack>
                </Stack>
              )
            })}
          </Stack>
        </Stack>
      </Modal>
    </>
  )
}
