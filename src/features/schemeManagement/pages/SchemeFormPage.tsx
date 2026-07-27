import { useEffect, useMemo } from 'react'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  Avatar,
  Box,
  Card,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Button,
} from '@mui/material'
import { Plus, Trash2 } from 'lucide-react'
import { FormField } from '@/components/common/FormField/FormField'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { FileDropzone } from '@/components/common/FileDropzone/FileDropzone'
import { radius } from '@/theme/tokens'
import { useSchemeForm } from '@/features/schemeManagement/hooks/useSchemeForm'
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

function FieldLabel({ children, required }: { children: string; required?: boolean }) {
  return (
    <Typography sx={{ fontWeight: 700, fontSize: '0.6875rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'primary.main', mb: 0.75 }}>
      {children}
      {required ? ' *' : ''}
    </Typography>
  )
}

const ALL_PARTNER_TYPES: SchemePartnerType[] = ['Dealer', 'Chemist']
const ALL_REGIONS: PartnerZone[] = ['East', 'West', 'North', 'South']

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => (typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Failed to read file')))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export function SchemeFormPage() {
  const navigate = useNavigate()
  const { schemeId } = useParams<{ schemeId: string }>()
  const [searchParams] = useSearchParams()
  const cloneFromId = !schemeId ? searchParams.get('cloneFrom') : null
  const { isEdit, scheme, cloneSource, options, isLoading, isSubmitting, submit } = useSchemeForm(schemeId, cloneFromId)

  const listPath = '/scheme-management/schemes'

  const { control, handleSubmit, watch, reset } = useForm<SchemeFormValues>({
    resolver: zodResolver(schemeFormSchema),
    defaultValues: schemeFormDefaults,
  })

  const { fields: productFields, append: appendProduct, remove: removeProduct } = useFieldArray({ control, name: 'products' })
  const schemeType = watch('type')
  const watchedPartnerTypes = useWatch({ control, name: 'partnerTypes' })
  const watchedProductRows = useWatch({ control, name: 'products' })
  const partnerTypes = useMemo(() => watchedPartnerTypes ?? [], [watchedPartnerTypes])
  const watchedProducts = useMemo(() => watchedProductRows ?? [], [watchedProductRows])
  const imageUrl = watch('image')
  const bannerUrl = watch('banner')

  const giftProductOptions = useMemo(() => options?.giftProductOptions ?? [], [options])
  const attachedProductIds = useMemo(() => new Set(watchedProducts.map((p) => p.productId).filter(Boolean)), [watchedProducts])

  useEffect(() => {
    const prefillSource = scheme ?? cloneSource
    if (!prefillSource) return
    reset({
      type: prefillSource.type,
      name: prefillSource.name,
      startDate: prefillSource.startDate,
      endDate: prefillSource.endDate ?? '',
      regions: prefillSource.regions,
      partnerTypes: prefillSource.partnerTypes,
      products: prefillSource.products.map((p) => ({
        productId: p.productId,
        attached: true,
        dealerPoints: String(p.dealerPoints),
        chemistPoints: String(p.chemistPoints),
      })),
      description: prefillSource.description ?? '',
      disclaimer: prefillSource.disclaimer ?? '',
      image: prefillSource.image ?? '',
      banner: prefillSource.banner ?? '',
    })
  }, [scheme, cloneSource, reset])

  const dealerTotal = useMemo(
    () => watchedProducts.reduce((sum, p) => sum + Number(p.dealerPoints || 0), 0),
    [watchedProducts],
  )
  const chemistTotal = useMemo(
    () => watchedProducts.reduce((sum, p) => sum + Number(p.chemistPoints || 0), 0),
    [watchedProducts],
  )

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
      <Stack sx={{ mb: 3, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h1">{isEdit ? 'Edit Scheme' : 'Create Scheme'}</Typography>
      </Stack>

      <form onSubmit={onSubmit} noValidate>
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={sectionTitleSx}>Scheme Details</Typography>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel>Scheme ID</FieldLabel>
              <TextField
                value={isEdit ? scheme?.id ?? '' : 'Auto-generated on save'}
                disabled
                fullWidth
                size="small"
                {...fieldLabelProps}
                slotProps={{ ...fieldLabelProps.slotProps, input: { readOnly: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Scheme Type</FieldLabel>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Stack direction="row" spacing={1}>
                    {(['general', 'seasonal'] as const).map((value) => {
                      const active = field.value === value
                      return (
                        <Box
                          key={value}
                          component="button"
                          type="button"
                          disabled={isEdit}
                          onClick={() => field.onChange(value)}
                          sx={{
                            flex: 1,
                            border: '1px solid',
                            borderColor: active ? 'primary.main' : 'divider',
                            cursor: isEdit ? 'default' : 'pointer',
                            opacity: isEdit && !active ? 0.5 : 1,
                            py: 1,
                            borderRadius: `${radius.md}px`,
                            fontSize: '0.8125rem',
                            fontWeight: 700,
                            fontFamily: 'inherit',
                            backgroundColor: active ? 'primary.light' : 'transparent',
                            color: active ? 'primary.dark' : 'text.secondary',
                          }}
                        >
                          {value === 'general' ? 'General' : 'Seasonal'}
                        </Box>
                      )
                    })}
                  </Stack>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Name</FieldLabel>
              <FormField name="name" control={control} placeholder="e.g. Diwali Double Rewards" {...fieldLabelProps} />
              {cloneSource && (
                <Typography variant="caption" sx={{ color: 'warning.main', display: 'block', mt: 0.5 }}>
                  Cloned from {cloneSource.name} — update the name before saving.
                </Typography>
              )}
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} />
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Start Date</FieldLabel>
              <FormField name="startDate" control={control} type="date" slotProps={{ inputLabel: { shrink: true } }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required={schemeType === 'seasonal'}>
                End Date{schemeType === 'general' ? ' (optional)' : ''}
              </FieldLabel>
              <FormField name="endDate" control={control} type="date" slotProps={{ inputLabel: { shrink: true } }} />
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                {schemeType === 'general'
                  ? 'Optional — leave blank to run continuously until manually deactivated.'
                  : 'Mandatory for seasonal schemes. Points earned under this scheme can only be redeemed within it.'}
              </Typography>
            </Grid>
          </Grid>
        </Card>

        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={sectionTitleSx}>Partner Type</Typography>
          <Controller
            name="partnerTypes"
            control={control}
            render={({ field, fieldState }) => (
              <Grid container spacing={2}>
                {ALL_PARTNER_TYPES.map((partnerType) => {
                  const checked = field.value.includes(partnerType)
                  return (
                    <Grid key={partnerType} size={{ xs: 12, sm: 6 }}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: `${radius.lg}px`,
                          border: '1px solid',
                          borderColor: checked ? 'primary.main' : 'divider',
                          backgroundColor: checked ? 'primary.light' : 'transparent',
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={checked}
                              onChange={(e) => {
                                field.onChange(
                                  e.target.checked ? [...field.value, partnerType] : field.value.filter((p) => p !== partnerType),
                                )
                              }}
                            />
                          }
                          label={<Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>{partnerType}</Typography>}
                          sx={{ m: 0 }}
                        />
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', pl: 4 }}>
                          {checked
                            ? `Adding products for ${partnerType} redemption below.`
                            : `Enable to allow ${partnerType} partners to redeem via this scheme.`}
                        </Typography>
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

        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={sectionTitleSx}>Regions</Typography>
          <Controller
            name="regions"
            control={control}
            render={({ field, fieldState }) => (
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                {ALL_REGIONS.map((region) => (
                  <FormControlLabel
                    key={region}
                    control={
                      <Checkbox
                        size="small"
                        checked={field.value.includes(region)}
                        onChange={(e) => {
                          field.onChange(e.target.checked ? [...field.value, region] : field.value.filter((r) => r !== region))
                        }}
                      />
                    }
                    label={region}
                  />
                ))}
                {fieldState.error && (
                  <Typography variant="caption" sx={{ color: 'error.main', width: '100%' }}>
                    {fieldState.error.message}
                  </Typography>
                )}
              </Stack>
            )}
          />
        </Card>

        <Card sx={{ p: 3, mb: 3 }}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
            <Typography sx={{ ...sectionTitleSx, mb: 0 }}>Attach Gift Products</Typography>
            <Stack direction="row" spacing={1.5}>
              {partnerTypes.includes('Dealer') && (
                <Box sx={{ px: 1.5, py: 0.5, borderRadius: '999px', backgroundColor: 'primary.light', color: 'primary.dark' }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Dealer Total: {dealerTotal}</Typography>
                </Box>
              )}
              {partnerTypes.includes('Chemist') && (
                <Box sx={{ px: 1.5, py: 0.5, borderRadius: '999px', backgroundColor: 'secondary.light', color: 'secondary.dark' }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.75rem' }}>Chemist Total: {chemistTotal}</Typography>
                </Box>
              )}
            </Stack>
          </Stack>

          <Controller
            name="products"
            control={control}
            render={({ fieldState }) =>
              fieldState.error ? (
                <Typography variant="caption" sx={{ color: 'error.main', display: 'block', mb: 1.5 }}>
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
              {productFields.map((field, index) => {
                const selectedProductId = watchedProducts[index]?.productId ?? ''
                const selectedProduct = giftProductOptions.find((p) => p.id === selectedProductId)
                const availableOptions = giftProductOptions.filter(
                  (p) => p.id === selectedProductId || !attachedProductIds.has(p.id),
                )
                return (
                  <Box key={field.id} sx={{ p: 2, borderRadius: `${radius.lg}px`, border: '1px solid', borderColor: 'divider' }}>
                    <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start', flexWrap: 'wrap' }}>
                      <Avatar src={selectedProduct?.image} variant="rounded" sx={{ width: 44, height: 44, flexShrink: 0, mt: 0.25 }} />
                      <Box sx={{ flexGrow: 1, minWidth: 220 }}>
                        <FieldLabel required>Gift Product</FieldLabel>
                        <Controller
                          name={`products.${index}.productId`}
                          control={control}
                          render={({ field: productField }) => (
                            <TextField
                              select
                              size="small"
                              fullWidth
                              value={productField.value}
                              onChange={(e) => productField.onChange(e.target.value)}
                            >
                              {availableOptions.map((product) => (
                                <MenuItem key={product.id} value={product.id}>
                                  {product.name}
                                </MenuItem>
                              ))}
                            </TextField>
                          )}
                        />
                      </Box>
                      {partnerTypes.includes('Dealer') && (
                        <Box sx={{ width: 140 }}>
                          <FieldLabel required>Dealer Pts</FieldLabel>
                          <FormField name={`products.${index}.dealerPoints`} control={control} placeholder="e.g. 200" size="small" fullWidth />
                        </Box>
                      )}
                      {partnerTypes.includes('Chemist') && (
                        <Box sx={{ width: 140 }}>
                          <FieldLabel required>Chemist Pts</FieldLabel>
                          <FormField name={`products.${index}.chemistPoints`} control={control} placeholder="e.g. 150" size="small" fullWidth />
                        </Box>
                      )}
                      <Tooltip title="Remove product">
                        <IconButton size="small" onClick={() => removeProduct(index)} sx={{ mt: 3 }} aria-label="Remove product">
                          <Trash2 size={18} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>
                )
              })}

              <Button
                variant="outlined"
                startIcon={<Plus size={18} />}
                onClick={() => appendProduct({ productId: '', attached: true, dealerPoints: '', chemistPoints: '' })}
                disabled={giftProductOptions.length === 0 || attachedProductIds.size >= giftProductOptions.length}
                sx={{ alignSelf: 'flex-start', fontSize: '0.75rem' }}
              >
                Add Product
              </Button>
            </Stack>
          )}
        </Card>

        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={sectionTitleSx}>Additional Information</Typography>
          <Grid container spacing={2.5}>
            <Grid size={12}>
              <FieldLabel>Description</FieldLabel>
              <FormField name="description" control={control} multiline minRows={3} {...fieldLabelProps} />
            </Grid>
            <Grid size={12}>
              <FieldLabel>Disclaimer</FieldLabel>
              <FormField name="disclaimer" control={control} multiline minRows={2} {...fieldLabelProps} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel>Scheme Image</FieldLabel>
              <Controller
                name="image"
                control={control}
                render={({ field }) => (
                  <FileDropzone
                    file={null}
                    accept="image/*"
                    helperText="PNG or JPG, square thumbnail recommended"
                    existingPreview={imageUrl ? { url: imageUrl, name: 'Scheme image' } : null}
                    onSelect={async (file) => field.onChange(await readFileAsDataUrl(file))}
                    onRemove={() => field.onChange('')}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel>Scheme Banner</FieldLabel>
              <Controller
                name="banner"
                control={control}
                render={({ field }) => (
                  <FileDropzone
                    file={null}
                    accept="image/*"
                    helperText="Wide banner image for the scheme detail page"
                    existingPreview={bannerUrl ? { url: bannerUrl, name: 'Scheme banner' } : null}
                    onSelect={async (file) => field.onChange(await readFileAsDataUrl(file))}
                    onRemove={() => field.onChange('')}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Card>

        <Stack direction="row" spacing={1.5}>
          <Button type="submit" variant="contained" loading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Create Scheme'}
          </Button>
          <Button variant="outlined" color="primary" onClick={() => navigate(backTo)}>
            Cancel
          </Button>
        </Stack>
      </form>
    </>
  )
}
