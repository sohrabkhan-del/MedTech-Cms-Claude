import { useEffect, useMemo, type ReactNode } from 'react'
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
  type Control,
  type FieldPath,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  Autocomplete,
  Avatar,
  Box,
  Card,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  Button,
} from '@mui/material'
import { Trash2 } from 'lucide-react'
import { FormField } from '@/components/common/FormField/FormField'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { FileDropzone } from '@/components/common/FileDropzone/FileDropzone'
import { radius } from '@/theme/tokens'
import { useSchemeForm } from '@/features/schemeManagement/hooks/useSchemeForm'
import type { SchemeMasterProductOption } from '@/features/schemeManagement/hooks/useSchemeFormOptions'
import {
  schemeFormDefaults,
  schemeFormSchema,
  type SchemeFormValues,
} from '@/features/schemeManagement/types/schemeManagement.types'
import type { PartnerZone } from '@/types/partner'
import type { SchemePartnerType } from '@/features/schemeManagement/types/schemeManagement.types'

const sectionTitleSx = {
  fontWeight: 700,
  fontSize: '0.75rem',
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  color: 'primary.main',
  mb: 2.5,
}

const fieldLabelProps = {
  slotProps: { inputLabel: { shrink: false, sx: { display: 'none' } } },
} as const

function FieldLabel({
  children,
  required,
}: {
  children: ReactNode
  required?: boolean
}) {
  return (
    <Typography
      sx={{
        fontWeight: 700,
        fontSize: '0.6875rem',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color: 'primary.main',
        mb: 0.75,
      }}
    >
      {children}
      {required ? ' *' : ''}
    </Typography>
  )
}

function ReadOnlyValue({
  name,
  control,
  suffix,
}: {
  name: FieldPath<SchemeFormValues>
  control: Control<SchemeFormValues>
  suffix?: string
}) {
  const value = useWatch({ control, name })
  return (
    <Box
      sx={{
        height: 40,
        display: 'flex',
        alignItems: 'center',
        px: 1.75,
        borderRadius: `${radius.md}px`,
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        fontSize: '0.8125rem',
        fontWeight: 600,
        color: 'text.primary',
      }}
    >
      {(value as ReactNode) || '—'}
      {value && suffix}
    </Box>
  )
}

const ALL_PARTNER_TYPES: SchemePartnerType[] = ['Dealer', 'Chemist']
const ALL_REGIONS: PartnerZone[] = ['East', 'West', 'North', 'South']
const MULTIPLIER_PRESETS = ['1', '1.5', '2', '2.5', '3']

function randomMultiplier(): string {
  return MULTIPLIER_PRESETS[
    Math.floor(Math.random() * MULTIPLIER_PRESETS.length)
  ]!
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () =>
      typeof reader.result === 'string'
        ? resolve(reader.result)
        : reject(new Error('Failed to read file'))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export function SchemeFormPage() {
  const navigate = useNavigate()
  const { schemeId } = useParams<{ schemeId: string }>()
  const [searchParams] = useSearchParams()
  const cloneFromId = !schemeId ? searchParams.get('cloneFrom') : null
  const {
    isEdit,
    scheme,
    cloneSource,
    options,
    isLoading,
    isSubmitting,
    submit,
  } = useSchemeForm(schemeId, cloneFromId)

  const listPath = '/scheme-management/schemes'

  const { control, handleSubmit, watch, reset } = useForm<SchemeFormValues>({
    resolver: zodResolver(schemeFormSchema),
    defaultValues: schemeFormDefaults,
  })

  const {
    fields: applicableProductFields,
    append: appendApplicableProduct,
    remove: removeApplicableProduct,
  } = useFieldArray({
    control,
    name: 'applicableProducts',
  })
  const {
    fields: giftRuleFields,
    append: appendGiftRule,
    remove: removeGiftRule,
  } = useFieldArray({ control, name: 'giftRules' })

  const schemeType = watch('type')
  const watchedPartnerTypes = useWatch({ control, name: 'partnerTypes' })
  const watchedApplicableProducts = useWatch({
    control,
    name: 'applicableProducts',
  })
  const watchedGiftRules = useWatch({ control, name: 'giftRules' })
  const partnerTypes = useMemo(
    () => watchedPartnerTypes ?? [],
    [watchedPartnerTypes],
  )
  const applicableProductRows = useMemo(
    () => watchedApplicableProducts ?? [],
    [watchedApplicableProducts],
  )
  const giftRuleRows = useMemo(() => watchedGiftRules ?? [], [watchedGiftRules])
  const imageUrl = watch('image')

  const masterProductOptions = useMemo(
    () => options?.masterProductOptions ?? [],
    [options],
  )
  const giftProductOptions = useMemo(
    () => options?.giftProductOptions ?? [],
    [options],
  )
  const attachedProductIds = useMemo(
    () =>
      new Set(applicableProductRows.map((p) => p.productId).filter(Boolean)),
    [applicableProductRows],
  )
  const attachedGiftIds = useMemo(
    () => new Set(giftRuleRows.map((r) => r.giftId).filter(Boolean)),
    [giftRuleRows],
  )

  useEffect(() => {
    const prefillSource = scheme ?? cloneSource
    if (!prefillSource) return
    reset({
      type: prefillSource.type,
      name: prefillSource.name,
      startDate: prefillSource.startDate,
      endDate: prefillSource.endDate ?? '',
      partnerTypes: prefillSource.partnerTypes,
      dealerRegions: prefillSource.dealerRegions,
      chemistRegions: prefillSource.chemistRegions,
      applicableProducts: prefillSource.applicableProducts.map((p) => ({
        productId: p.productId,
        dealerBaseCoinValue:
          p.dealerBaseCoinValue === null ? '' : String(p.dealerBaseCoinValue),
        chemistBaseCoinValue:
          p.chemistBaseCoinValue === null ? '' : String(p.chemistBaseCoinValue),
        dealerRegionMultipliers: Object.fromEntries(
          Object.entries(p.dealerRegionMultipliers).map(
            ([region, multiplier]) => [region, String(multiplier)],
          ),
        ),
        chemistRegionMultipliers: Object.fromEntries(
          Object.entries(p.chemistRegionMultipliers).map(
            ([region, multiplier]) => [region, String(multiplier)],
          ),
        ),
      })),
      giftRules: prefillSource.giftRules.map((rule) => ({
        giftId: rule.giftId,
        dealerRule: rule.dealerRule
          ? {
              price: String(rule.dealerRule.price),
              points: String(rule.dealerRule.points),
              discountPrice: String(rule.dealerRule.discountPrice),
            }
          : null,
        chemistRule: rule.chemistRule
          ? {
              price: String(rule.chemistRule.price),
              points: String(rule.chemistRule.points),
              discountPrice: String(rule.chemistRule.discountPrice),
            }
          : null,
      })),
      description: prefillSource.description ?? '',
      disclaimer: prefillSource.disclaimer ?? '',
      image: prefillSource.image ?? '',
      banner: prefillSource.banner ?? '',
    })
  }, [scheme, cloneSource, reset])

  if (isEdit && !isLoading && !scheme) {
    return (
      <EmptyState
        title="Scheme not found"
        description="This scheme may have been removed."
        actionLabel="Back to Schemes"
        onAction={() => navigate(listPath)}
      />
    )
  }

  const backTo = isEdit ? `${listPath}/${schemeId}` : listPath

  const onSubmit = handleSubmit(async (values) => {
    const success = await submit(values)
    if (success) navigate(backTo)
  })

  return (
    <>
      <Stack
        sx={{
          mb: 3,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h1">
          {isEdit ? 'Edit Scheme' : 'Create Scheme'}
        </Typography>
      </Stack>

      <form onSubmit={onSubmit} noValidate>
        {/* Card 1 — Scheme Details */}
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={sectionTitleSx}>Scheme Details</Typography>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Name</FieldLabel>
              <FormField
                name="name"
                control={control}
                placeholder="e.g. Diwali Double Rewards"
                {...fieldLabelProps}
              />
              {cloneSource && (
                <Typography
                  variant="caption"
                  sx={{ color: 'warning.main', display: 'block', mt: 0.5 }}
                >
                  Cloned from {cloneSource.name} — update the name before
                  saving.
                </Typography>
              )}
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Scheme Type</FieldLabel>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{ alignItems: 'center' }}
                  >
                    <Typography
                      sx={{
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        color:
                          field.value === 'general'
                            ? 'primary.dark'
                            : 'text.secondary',
                      }}
                    >
                      General
                    </Typography>
                    <Switch
                      checked={field.value === 'seasonal'}
                      disabled={isEdit}
                      onChange={(e) =>
                        field.onChange(
                          e.target.checked ? 'seasonal' : 'general',
                        )
                      }
                    />
                    <Typography
                      sx={{
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        color:
                          field.value === 'seasonal'
                            ? 'primary.dark'
                            : 'text.secondary',
                      }}
                    >
                      Seasonal
                    </Typography>
                  </Stack>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Start Date</FieldLabel>
              <FormField
                name="startDate"
                control={control}
                type="date"
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required={schemeType === 'seasonal'}>
                End Date{schemeType === 'general' ? ' (optional)' : ''}
              </FieldLabel>
              <FormField
                name="endDate"
                control={control}
                type="date"
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}
              >
                {schemeType === 'general'
                  ? 'Optional — leave blank to run continuously until manually deactivated.'
                  : 'Mandatory for seasonal schemes. Points earned under this scheme can only be redeemed within it.'}
              </Typography>
            </Grid>
            <Grid size={12}>
              <FieldLabel>Description</FieldLabel>
              <FormField
                name="description"
                control={control}
                multiline
                minRows={3}
                {...fieldLabelProps}
              />
            </Grid>
          </Grid>
        </Card>
        {/* Card 3 — Partner Type */}
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={sectionTitleSx}>Partner Type</Typography>
          <Controller
            name="partnerTypes"
            control={control}
            render={({ field, fieldState }) => (
              <Grid container spacing={2}>
                {ALL_PARTNER_TYPES.map((partnerType) => {
                  const checked = field.value.includes(partnerType)
                  const regionsFieldName =
                    partnerType === 'Dealer'
                      ? 'dealerRegions'
                      : 'chemistRegions'
                  return (
                    <Grid key={partnerType} size={{ xs: 12, sm: 6 }}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: `${radius.lg}px`,
                          border: '1px solid',
                          borderColor: checked ? 'primary.main' : 'divider',
                          backgroundColor: checked
                            ? 'primary.light'
                            : 'transparent',
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={checked}
                              onChange={(e) => {
                                field.onChange(
                                  e.target.checked
                                    ? [...field.value, partnerType]
                                    : field.value.filter(
                                        (p) => p !== partnerType,
                                      ),
                                )
                              }}
                            />
                          }
                          label={
                            <Typography
                              sx={{ fontWeight: 700, fontSize: '0.875rem' }}
                            >
                              {partnerType}
                            </Typography>
                          }
                          sx={{ m: 0 }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            display: 'block',
                            pl: 4,
                            mb: checked ? 1.5 : 0,
                          }}
                        >
                          {checked
                            ? `Adding gift rules for ${partnerType} redemption below.`
                            : `Enable to allow ${partnerType} partners to redeem via this scheme.`}
                        </Typography>
                        {checked && (
                          <Box sx={{ pl: 4 }}>
                            <FieldLabel required>
                              Regions for {partnerType}
                            </FieldLabel>
                            <Controller
                              name={regionsFieldName}
                              control={control}
                              render={({
                                field: regionField,
                                fieldState: regionFieldState,
                              }) => (
                                <>
                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    sx={{ flexWrap: 'wrap' }}
                                  >
                                    {ALL_REGIONS.map((region) => (
                                      <FormControlLabel
                                        key={region}
                                        control={
                                          <Checkbox
                                            size="small"
                                            checked={regionField.value.includes(
                                              region,
                                            )}
                                            onChange={(e) => {
                                              regionField.onChange(
                                                e.target.checked
                                                  ? [
                                                      ...regionField.value,
                                                      region,
                                                    ]
                                                  : regionField.value.filter(
                                                      (r: PartnerZone) =>
                                                        r !== region,
                                                    ),
                                              )
                                            }}
                                          />
                                        }
                                        label={region}
                                      />
                                    ))}
                                  </Stack>
                                  {regionFieldState.error && (
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: 'error.main',
                                        display: 'block',
                                      }}
                                    >
                                      {regionFieldState.error.message}
                                    </Typography>
                                  )}
                                </>
                              )}
                            />
                          </Box>
                        )}
                      </Box>
                    </Grid>
                  )
                })}
                {fieldState.error && (
                  <Grid size={12}>
                    <Typography variant="caption" sx={{ color: 'error.main' }}>
                      {fieldState.error.message}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            )}
          />
        </Card>

        {/* Card 2 — Applicable Products */}
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={sectionTitleSx}>Applicable Products</Typography>

          <Controller
            name="applicableProducts"
            control={control}
            render={({ fieldState }) =>
              fieldState.error ? (
                <Typography
                  variant="caption"
                  sx={{ color: 'error.main', display: 'block', mb: 1.5 }}
                >
                  {fieldState.error.message}
                </Typography>
              ) : (
                <></>
              )
            }
          />

          <Box sx={{ mb: 2.5 }}>
            <Autocomplete
              multiple
              disableCloseOnSelect
              size="small"
              options={masterProductOptions}
              value={masterProductOptions.filter((p) =>
                attachedProductIds.has(p.id),
              )}
              getOptionLabel={(option) => option.name}
              filterOptions={(opts, state) => {
                const query = state.inputValue.trim().toLowerCase()
                if (!query) return opts
                return opts.filter(
                  (opt) =>
                    opt.name.toLowerCase().includes(query) ||
                    opt.code.toLowerCase().includes(query),
                )
              }}
              renderOption={(props, option) => (
                <Box component="li" {...props} key={option.id}>
                  {option.name} ({option.code})
                </Box>
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(_, selected: SchemeMasterProductOption[]) => {
                const selectedIds = new Set(selected.map((p) => p.id))
                // Remove rows that were unselected.
                applicableProductRows.forEach((row, index) => {
                  if (!selectedIds.has(row.productId))
                    removeApplicableProduct(index)
                })
                // Append rows for newly selected products.
                selected.forEach((product) => {
                  if (!attachedProductIds.has(product.id)) {
                    appendApplicableProduct({
                      productId: product.id,
                      dealerBaseCoinValue: partnerTypes.includes('Dealer')
                        ? String(product.dealerRewardPoints)
                        : '',
                      chemistBaseCoinValue: partnerTypes.includes('Chemist')
                        ? String(product.chemistRewardPoints)
                        : '',
                      dealerRegionMultipliers: Object.fromEntries(
                        ALL_REGIONS.map((region) => [
                          region,
                          randomMultiplier(),
                        ]),
                      ) as Record<PartnerZone, string>,
                      chemistRegionMultipliers: Object.fromEntries(
                        ALL_REGIONS.map((region) => [
                          region,
                          randomMultiplier(),
                        ]),
                      ) as Record<PartnerZone, string>,
                    })
                  }
                })
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search Product Master by name or code…"
                />
              )}
            />
          </Box>

          {applicableProductFields.length === 0 ? (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              No products selected yet.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {applicableProductFields.map((field, index) => {
                const productId = applicableProductRows[index]?.productId ?? ''
                const product = masterProductOptions.find(
                  (p) => p.id === productId,
                )
                return (
                  <Box
                    key={field.id}
                    sx={{
                      p: 2,
                      borderRadius: `${radius.lg}px`,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{ alignItems: 'center', mb: 1.5 }}
                    >
                      <Avatar variant="rounded" sx={{ width: 40, height: 40 }}>
                        {product?.name.charAt(0) ?? '?'}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography
                          sx={{ fontWeight: 700, fontSize: '0.8125rem' }}
                        >
                          {product?.name ?? productId}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary' }}
                        >
                          {product?.category}
                        </Typography>
                      </Box>
                      <Tooltip title="Remove product">
                        <IconButton
                          size="small"
                          onClick={() => removeApplicableProduct(index)}
                          aria-label="Remove product"
                        >
                          <Trash2 size={18} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                    <Stack spacing={2}>
                      {partnerTypes.includes('Dealer') && (
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: `${radius.md}px`,
                            backgroundColor: 'primary.light',
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              color: 'primary.dark',
                              mb: 1,
                            }}
                          >
                            Dealer
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 3 }}>
                              <FieldLabel>Dealer Base Coin Value</FieldLabel>
                              <ReadOnlyValue
                                name={`applicableProducts.${index}.dealerBaseCoinValue`}
                                control={control}
                              />
                            </Grid>
                            {ALL_REGIONS.map((region) => (
                              <Grid key={region} size={{ xs: 6, sm: 2.25 }}>
                                <FieldLabel>{region} Multiplier</FieldLabel>
                                <ReadOnlyValue
                                  name={`applicableProducts.${index}.dealerRegionMultipliers.${region}`}
                                  control={control}
                                />
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}
                      {partnerTypes.includes('Chemist') && (
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: `${radius.md}px`,
                            backgroundColor: 'secondary.light',
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              color: 'secondary.dark',
                              mb: 1,
                            }}
                          >
                            Chemist
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 3 }}>
                              <FieldLabel>Chemist Base Coin Value</FieldLabel>
                              <ReadOnlyValue
                                name={`applicableProducts.${index}.chemistBaseCoinValue`}
                                control={control}
                              />
                            </Grid>
                            {ALL_REGIONS.map((region) => (
                              <Grid key={region} size={{ xs: 6, sm: 2.25 }}>
                                <FieldLabel>{region} Multiplier</FieldLabel>
                                <ReadOnlyValue
                                  name={`applicableProducts.${index}.chemistRegionMultipliers.${region}`}
                                  control={control}
                                />
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}
                    </Stack>
                  </Box>
                )
              })}
            </Stack>
          )}
        </Card>

        {/* Card 4 — Attach Gift Products */}
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={sectionTitleSx}>Attach Gift Products</Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', display: 'block', mb: 2 }}
          >
            Select gifts from the Gift Catalogue, then define price, points, and
            discount pricing rules per partner type.
          </Typography>

          <Controller
            name="giftRules"
            control={control}
            render={({ fieldState }) =>
              fieldState.error ? (
                <Typography
                  variant="caption"
                  sx={{ color: 'error.main', display: 'block', mb: 1.5 }}
                >
                  {fieldState.error.message}
                </Typography>
              ) : (
                <></>
              )
            }
          />

          {partnerTypes.length === 0 ? (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Select a Partner Type above to start attaching gift products.
            </Typography>
          ) : (
            <Stack spacing={2}>
              <Box>
                <FieldLabel>Search &amp; Add Gifts</FieldLabel>
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  size="small"
                  options={giftProductOptions}
                  value={giftProductOptions.filter((g) =>
                    attachedGiftIds.has(g.id),
                  )}
                  getOptionLabel={(option) => option.name}
                  filterOptions={(opts, state) => {
                    const query = state.inputValue.trim().toLowerCase()
                    if (!query) return opts
                    return opts.filter((opt) =>
                      opt.name.toLowerCase().includes(query),
                    )
                  }}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} key={option.id}>
                      <Avatar
                        src={option.image}
                        variant="rounded"
                        sx={{ width: 24, height: 24, mr: 1.5 }}
                      />
                      {option.name}
                    </Box>
                  )}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  onChange={(_, selected) => {
                    const selectedIds = new Set(selected.map((g) => g.id))
                    // Remove rows that were unselected.
                    giftRuleRows.forEach((row, index) => {
                      if (!selectedIds.has(row.giftId)) removeGiftRule(index)
                    })
                    // Append rows for newly selected gifts.
                    selected.forEach((gift) => {
                      if (!attachedGiftIds.has(gift.id)) {
                        appendGiftRule({
                          giftId: gift.id,
                          dealerRule: partnerTypes.includes('Dealer')
                            ? { price: '', points: '', discountPrice: '' }
                            : null,
                          chemistRule: partnerTypes.includes('Chemist')
                            ? { price: '', points: '', discountPrice: '' }
                            : null,
                        })
                      }
                    })
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Search Gift Catalogue by name…"
                    />
                  )}
                />
              </Box>

              {giftRuleFields.map((field, index) => {
                const selectedGiftId = giftRuleRows[index]?.giftId ?? ''
                const selectedGift = giftProductOptions.find(
                  (g) => g.id === selectedGiftId,
                )
                return (
                  <Box
                    key={field.id}
                    sx={{
                      p: 2,
                      borderRadius: `${radius.lg}px`,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{ alignItems: 'center', mb: 2 }}
                    >
                      <Avatar
                        src={selectedGift?.image}
                        variant="rounded"
                        sx={{ width: 44, height: 44, flexShrink: 0 }}
                      />
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.8125rem',
                          flexGrow: 1,
                        }}
                      >
                        {selectedGift?.name ?? selectedGiftId}
                      </Typography>
                      <Tooltip title="Remove gift">
                        <IconButton
                          size="small"
                          onClick={() => removeGiftRule(index)}
                          aria-label="Remove gift"
                        >
                          <Trash2 size={18} />
                        </IconButton>
                      </Tooltip>
                    </Stack>

                    <Stack spacing={2}>
                      {partnerTypes.includes('Dealer') && (
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: `${radius.md}px`,
                            backgroundColor: 'primary.light',
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              color: 'primary.dark',
                              mb: 1,
                            }}
                          >
                            Dealer Rule
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 4 }}>
                              <FieldLabel required>Price</FieldLabel>
                              <FormField
                                name={`giftRules.${index}.dealerRule.price`}
                                control={control}
                                placeholder="e.g. 999"
                                size="small"
                                fullWidth
                                slotProps={{
                                  input: {
                                    startAdornment: (
                                      <InputAdornment position="start">₹</InputAdornment>
                                    ),
                                  },
                                }}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                              <FieldLabel required>Points</FieldLabel>
                              <FormField
                                name={`giftRules.${index}.dealerRule.points`}
                                control={control}
                                placeholder="e.g. 200"
                                size="small"
                                fullWidth
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                              <FieldLabel required>Discount Points</FieldLabel>
                              <FormField
                                name={`giftRules.${index}.dealerRule.discountPrice`}
                                control={control}
                                placeholder="e.g. 799"
                                size="small"
                                fullWidth
                              />
                            </Grid>
                          </Grid>
                        </Box>
                      )}
                      {partnerTypes.includes('Chemist') && (
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: `${radius.md}px`,
                            backgroundColor: 'secondary.light',
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              color: 'secondary.dark',
                              mb: 1,
                            }}
                          >
                            Chemist Rule
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 4 }}>
                              <FieldLabel required>Price</FieldLabel>
                              <FormField
                                name={`giftRules.${index}.chemistRule.price`}
                                control={control}
                                placeholder="e.g. 999"
                                size="small"
                                fullWidth
                                slotProps={{
                                  input: {
                                    startAdornment: (
                                      <InputAdornment position="start">₹</InputAdornment>
                                    ),
                                  },
                                }}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                              <FieldLabel required>Points</FieldLabel>
                              <FormField
                                name={`giftRules.${index}.chemistRule.points`}
                                control={control}
                                placeholder="e.g. 150"
                                size="small"
                                fullWidth
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                              <FieldLabel required>Discount Points</FieldLabel>
                              <FormField
                                name={`giftRules.${index}.chemistRule.discountPrice`}
                                control={control}
                                placeholder="e.g. 699"
                                size="small"
                                fullWidth
                              />
                            </Grid>
                          </Grid>
                        </Box>
                      )}
                    </Stack>
                  </Box>
                )
              })}
            </Stack>
          )}
        </Card>

        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={sectionTitleSx}>Additional Information</Typography>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 12 }}>
              <FieldLabel>Scheme Image</FieldLabel>
              <Controller
                name="image"
                control={control}
                render={({ field }) => (
                  <FileDropzone
                    file={null}
                    accept="image/*"
                    helperText="PNG or JPG, square thumbnail recommended"
                    existingPreview={
                      imageUrl ? { url: imageUrl, name: 'Scheme image' } : null
                    }
                    onSelect={async (file) =>
                      field.onChange(await readFileAsDataUrl(file))
                    }
                    onRemove={() => field.onChange('')}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Card>

        <Stack
          direction="row"
          spacing={1.5}
          sx={{ width: '100%', justifyContent: 'flex-end' }}
        >
          <Button type="submit" variant="contained" loading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Create Scheme'}
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate(backTo)}
          >
            Cancel
          </Button>
        </Stack>
      </form>
    </>
  )
}
