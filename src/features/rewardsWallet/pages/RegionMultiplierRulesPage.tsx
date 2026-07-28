import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { ArrowLeft, ShieldAlert, SlidersHorizontal } from 'lucide-react'
import { Modal } from '@/components/common/Modal/Modal'
import { ModularTabs } from '@/components/common/ModularTabs/ModularTabs'
import { radius } from '@/theme/tokens'
import { useCoinRules } from '@/features/rewardsWallet/hooks/useCoinRules'
import type { CoinRulePartnerType, CoinRuleRegion } from '@/features/rewardsWallet/types/rewardsWallet.types'

const PARTNER_TYPE_STYLES: Record<CoinRulePartnerType, { bg: string; text: string; main: string }> = {
  Dealer: { bg: 'primary.light', text: 'primary.dark', main: 'primary.main' },
  Chemist: { bg: 'secondary.light', text: 'secondary.dark', main: 'secondary.main' },
}

const REGIONS: CoinRuleRegion[] = ['North', 'South', 'East', 'West']
const PARTNER_TYPES: CoinRulePartnerType[] = ['Dealer', 'Chemist']

const MULTIPLIER_OPTIONS = Array.from({ length: 37 }, (_, i) => Number((1 + i * 0.25).toFixed(2)))

const PARTNER_TYPE_TABS: { label: string; value: CoinRulePartnerType }[] = [
  { label: 'Dealer', value: 'Dealer' },
  { label: 'Chemist', value: 'Chemist' },
]

function isPartnerType(value: string | null): value is CoinRulePartnerType {
  return value === 'Dealer' || value === 'Chemist'
}

export function RegionMultiplierRulesPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { rules, regionMultipliers, setRegionMultipliers } = useCoinRules()

  const partnerType: CoinRulePartnerType = isPartnerType(searchParams.get('partnerType'))
    ? (searchParams.get('partnerType') as CoinRulePartnerType)
    : 'Dealer'

  const setPartnerType = (next: CoinRulePartnerType) => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev)
      params.set('partnerType', next)
      return params
    })
    setValues(null)
  }

  const [values, setValues] = useState<Record<CoinRuleRegion, number> | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)

  const activeMultipliers = regionMultipliers?.[partnerType]

  function closestMultiplierOption(value: number): number {
    return MULTIPLIER_OPTIONS.reduce((closest, option) =>
      Math.abs(option - value) < Math.abs(closest - value) ? option : closest,
    )
  }

  const currentValues = useMemo<Record<CoinRuleRegion, number>>(
    () =>
      values ?? {
        North: closestMultiplierOption(activeMultipliers?.North ?? 1),
        South: closestMultiplierOption(activeMultipliers?.South ?? 1),
        East: closestMultiplierOption(activeMultipliers?.East ?? 1),
        West: closestMultiplierOption(activeMultipliers?.West ?? 1),
      },
    [values, activeMultipliers],
  )

  const changedRegions = useMemo(
    () =>
      REGIONS.filter((region) => {
        const current = closestMultiplierOption(activeMultipliers?.[region] ?? 1)
        return currentValues[region] !== current
      }),
    [currentValues, activeMultipliers],
  )

  const partnerRules = useMemo(() => rules.filter((rule) => rule.partnerType === partnerType), [rules, partnerType])

  const affectedProductCount = useMemo(() => {
    if (changedRegions.length === 0) return 0
    return partnerRules.filter((rule) => rule.regions.some((r) => changedRegions.includes(r.region))).length
  }, [changedRegions, partnerRules])

  const handleValueChange = (region: CoinRuleRegion, value: number) => {
    setValues({ ...currentValues, [region]: value })
  }

  const handleReset = () => setValues(null)

  const handleConfirmSave = () => {
    void setRegionMultipliers(partnerType, currentValues)
    setConfirmOpen(false)
    setValues(null)
    setSavedAt(new Date())
  }

  return (
    <>
      <Button
        variant="text"
        startIcon={<ArrowLeft size={16} />}
        onClick={() => navigate('/rewards-wallet/coin-value-rules/all')}
        sx={{ fontSize: '0.8125rem', mb: 2, px: 0 }}
      >
        Back to Coin Value Rules
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
            Bulk-edit the coin-point multiplier applied to every product in a region, per partner type.
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
          Region multipliers apply instantly to <strong>every product rule</strong> configured for the
          affected region(s) — but only for the <strong>{partnerType}</strong> partner type selected below.
          Dealer and Chemist multipliers are configured independently. Changing a multiplier will
          immediately recalculate how many reward coins partners earn in that region going forward.
          Existing wallet balances and already-issued coins are not retroactively adjusted. Please
          double-check the values below before saving.
        </Typography>
      </Alert>

      <Box sx={{ mb: 3 }}>
        <ModularTabs tabs={PARTNER_TYPE_TABS} value={partnerType} onChange={setPartnerType} />
      </Box>

      {savedAt && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSavedAt(null)}>
          {partnerType} region multipliers updated successfully at {savedAt.toLocaleTimeString()}.
        </Alert>
      )}

      <Grid container spacing={3}>
        {PARTNER_TYPES.map((type) => {
          const isActive = type === partnerType
          const typeRules = rules.filter((rule) => rule.partnerType === type)
          return (
            <Grid key={type} size={{ xs: 12, lg: 12 }}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: `${radius.lg}px`,
                  backgroundColor: PARTNER_TYPE_STYLES[type].bg,
                }}
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
                  <Typography
                    sx={{ fontWeight: 700, fontSize: '0.75rem', color: PARTNER_TYPE_STYLES[type].text }}
                  >
                    {isActive ? `Edit ${type} Multipliers` : `${type} Multipliers`}
                  </Typography>
                  {isActive && (
                    <Chip
                      size="small"
                      variant="outlined"
                      label="Editing"
                      sx={{
                        height: 18,
                        fontSize: '0.625rem',
                        borderColor: PARTNER_TYPE_STYLES[type].text,
                        color: PARTNER_TYPE_STYLES[type].text,
                      }}
                    />
                  )}
                </Stack>

                {isActive ? (
                  <Grid container spacing={1.5}>
                    {REGIONS.map((region) => {
                      const isChanged = changedRegions.includes(region)
                      return (
                        <Grid key={region} size={{ xs: 6, sm: 3 }}>
                          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', mb: 0.5 }}>
                            <Typography sx={{ fontSize: '0.6875rem', color: 'text.secondary' }}>
                              {region}
                            </Typography>
                            {isChanged && (
                              <Chip
                                size="small"
                                color="warning"
                                label="•"
                                sx={{ height: 14, width: 14, minWidth: 14, '& .MuiChip-label': { p: 0 } }}
                              />
                            )}
                          </Stack>
                          <TextField
                            fullWidth
                            select
                            size="small"
                            value={currentValues[region]}
                            onChange={(e) => handleValueChange(region, Number(e.target.value))}
                            sx={{ backgroundColor: 'background.paper', borderRadius: `${radius.sm}px` }}
                          >
                            {MULTIPLIER_OPTIONS.map((option) => (
                              <MenuItem key={option} value={option}>
                                {option}x
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                      )
                    })}
                  </Grid>
                ) : (
                  <Grid container spacing={1.5}>
                    {REGIONS.map((region) => (
                      <Grid key={region} size={{ xs: 6, sm: 3 }}>
                        <Typography sx={{ fontSize: '0.6875rem', color: 'text.secondary', mb: 0.25 }}>
                          {region}
                        </Typography>
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                          {closestMultiplierOption(regionMultipliers?.[type]?.[region] ?? 1)}x
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                )}

                {isActive ? (
                  <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }}>
                    <Button
                      variant="contained"
                      disabled={changedRegions.length === 0}
                      onClick={() => setConfirmOpen(true)}
                      sx={{
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        boxShadow: 'none',
                        backgroundColor: PARTNER_TYPE_STYLES[type].main,
                        '&:hover': { backgroundColor: PARTNER_TYPE_STYLES[type].text, boxShadow: 'none' },
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
                      disabled={changedRegions.length === 0}
                      onClick={handleReset}
                      sx={{
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        backgroundColor: 'background.paper',
                        borderColor: PARTNER_TYPE_STYLES[type].main,
                        color: PARTNER_TYPE_STYLES[type].text,
                        '&:hover': {
                          backgroundColor: 'background.paper',
                          borderColor: PARTNER_TYPE_STYLES[type].text,
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
                ) : (
                  <Typography sx={{ fontSize: '0.75rem', color: 'text.disabled', mt: 2 }}>
                    {typeRules.length} {type} product rule{typeRules.length === 1 ? '' : 's'} use these
                    multipliers. Switch to the {type} tab above to edit.
                  </Typography>
                )}
              </Box>
            </Grid>
          )
        })}
      </Grid>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={`Confirm ${partnerType} Multiplier Changes`}
        description="Please review carefully — this change is applied immediately and cannot be undone automatically."
        primaryActionLabel="Confirm & Save"
        primaryActionColor="error"
        onPrimaryAction={handleConfirmSave}
        secondaryActionLabel="Cancel"
        maxWidth="sm"
      >
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Alert severity="warning" sx={{ fontSize: '0.75rem' }}>
            This will affect coin values for <strong>{affectedProductCount}</strong> {partnerType} product
            rule
            {affectedProductCount === 1 ? '' : 's'} across {changedRegions.length} region
            {changedRegions.length === 1 ? '' : 's'}, effective immediately.
          </Alert>
          <Stack spacing={1}>
            {changedRegions.map((region) => (
              <Stack key={region} direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>{region}</Typography>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`${closestMultiplierOption(activeMultipliers?.[region] ?? 1)}x`}
                  />
                  <Typography sx={{ fontSize: '0.75rem', color: 'text.disabled' }}>→</Typography>
                  <Chip size="small" color="warning" label={`${currentValues[region]}x`} />
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Modal>
    </>
  )
}
