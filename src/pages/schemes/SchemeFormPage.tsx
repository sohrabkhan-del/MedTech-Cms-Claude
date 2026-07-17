import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Card, Checkbox, FormControlLabel, Grid, MenuItem, Stack, Switch, Typography, Button } from '@mui/material'
import { FormField } from '@/components/common/FormField/FormField'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import {
  schemeFormDefaults,
  schemeFormSchema,
  type SchemeFormValues,
} from '@/features/schemes/schemeFormSchema'
import {
  getSchemeById,
  schemeTypeOptions,
  rewardTypeOptions,
  rewardFrequencyOptions,
  schemeProductCategoryOptions,
} from '@/features/schemes/mockSchemes'
import type { ApplicableUserType } from '@/types/scheme'

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

const ALL_APPLICABLE_USERS: ApplicableUserType[] = ['Dealer', 'Chemist', 'MR']

export function SchemeFormPage() {
  const navigate = useNavigate()
  const { schemeId, category } = useParams<{ schemeId: string; category: string }>()
  const [searchParams] = useSearchParams()
  const isEdit = !!schemeId
  const scheme = isEdit ? getSchemeById(schemeId) : undefined

  const cloneFromId = !isEdit ? searchParams.get('cloneFrom') : null
  const cloneSource = cloneFromId ? getSchemeById(cloneFromId) : undefined

  const prefillSource = scheme ?? cloneSource
  const categorySlug = category === 'sessional' ? 'sessional' : 'general'
  const listPath = `/scheme-management/schemes/${categorySlug}`

  const { control, handleSubmit, watch } = useForm<SchemeFormValues>({
    resolver: zodResolver(schemeFormSchema),
    defaultValues: prefillSource
      ? {
          schemeName: prefillSource.schemeName,
          schemeCategory: prefillSource.schemeCategory,
          schemeType: prefillSource.schemeType,
          applicableUsers: prefillSource.applicableUsers,
          bonusValue: String(prefillSource.bonusValue),
          scanTarget: String(prefillSource.scanTarget),
          rewardType: prefillSource.rewardType,
          maximumReward: String(prefillSource.maximumReward),
          rewardFrequency: prefillSource.rewardFrequency,
          stackable: prefillSource.stackable,
          productCategory: prefillSource.eligibleProducts[0]?.productCategory ?? '',
          brand: prefillSource.eligibleProducts[0]?.productBrand ?? '',
          startDate: '',
          endDate: '',
          description: prefillSource.description,
          status: prefillSource.status === 'expired' || prefillSource.status === 'upcoming' ? 'active' : prefillSource.status,
        }
      : { ...schemeFormDefaults, schemeCategory: categorySlug === 'sessional' ? 'seasonal' : 'general' },
  })

  const schemeCategory = watch('schemeCategory')

  if (isEdit && !scheme) {
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

  const submit = handleSubmit(() => {
    navigate(backTo)
  })

  return (
    <>
      <Stack sx={{ mb: 3, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h1">{isEdit ? 'Edit Scheme' : 'Create Scheme'}</Typography>
      </Stack>

      <form onSubmit={submit} noValidate>
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={sectionTitleSx}>Basic Information</Typography>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Scheme Name</FieldLabel>
              <FormField name="schemeName" control={control} placeholder="e.g. Quarterly Scan Booster" {...fieldLabelProps} />
              {cloneSource && (
                <Typography variant="caption" sx={{ color: 'warning.main', display: 'block', mt: 0.5 }}>
                  Cloned from {cloneSource.schemeName} — update the name before saving.
                </Typography>
              )}
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Scheme Category</FieldLabel>
              <FormField name="schemeCategory" control={control} select {...fieldLabelProps}>
                <MenuItem value="general">General Scheme</MenuItem>
                <MenuItem value="seasonal">Seasonal Scheme</MenuItem>
              </FormField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Scheme Type</FieldLabel>
              <FormField name="schemeType" control={control} select {...fieldLabelProps}>
                {schemeTypeOptions.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </FormField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Applicable Users</FieldLabel>
              <Controller
                name="applicableUsers"
                control={control}
                render={({ field, fieldState }) => (
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                    {ALL_APPLICABLE_USERS.map((userType) => (
                      <FormControlLabel
                        key={userType}
                        control={
                          <Checkbox
                            size="small"
                            checked={field.value.includes(userType)}
                            onChange={(e) => {
                              field.onChange(
                                e.target.checked ? [...field.value, userType] : field.value.filter((u) => u !== userType),
                              )
                            }}
                          />
                        }
                        label={userType}
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
            </Grid>
          </Grid>
        </Card>

        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={sectionTitleSx}>Reward Configuration</Typography>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Bonus Value</FieldLabel>
              <FormField name="bonusValue" control={control} placeholder="e.g. 25" {...fieldLabelProps} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Scan Target</FieldLabel>
              <FormField name="scanTarget" control={control} placeholder="e.g. 100" {...fieldLabelProps} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Reward Type</FieldLabel>
              <FormField name="rewardType" control={control} select {...fieldLabelProps}>
                {rewardTypeOptions.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </FormField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Maximum Reward</FieldLabel>
              <FormField name="maximumReward" control={control} placeholder="e.g. 2000" {...fieldLabelProps} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Reward Frequency</FieldLabel>
              <FormField name="rewardFrequency" control={control} select {...fieldLabelProps}>
                {rewardFrequencyOptions.map((freq) => (
                  <MenuItem key={freq} value={freq}>
                    {freq}
                  </MenuItem>
                ))}
              </FormField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel>Stackable</FieldLabel>
              <Controller
                name="stackable"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                    label={field.value ? 'Yes' : 'No'}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Card>

        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={sectionTitleSx}>Product Mapping</Typography>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Product Category</FieldLabel>
              <FormField name="productCategory" control={control} select {...fieldLabelProps}>
                {schemeProductCategoryOptions.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </FormField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel>Brand</FieldLabel>
              <FormField name="brand" control={control} placeholder="e.g. MedTech Labs" {...fieldLabelProps} />
            </Grid>
          </Grid>
        </Card>

        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={sectionTitleSx}>Schedule</Typography>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Start Date</FieldLabel>
              <FormField name="startDate" control={control} type="date" slotProps={{ inputLabel: { shrink: true } }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required={schemeCategory === 'seasonal'}>End Date</FieldLabel>
              <FormField name="endDate" control={control} type="date" slotProps={{ inputLabel: { shrink: true } }} />
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                {schemeCategory === 'general'
                  ? 'Optional for general schemes — leave blank to run continuously until manually deactivated.'
                  : 'Mandatory for seasonal schemes — the scheme automatically becomes inactive after this date.'}
              </Typography>
            </Grid>
          </Grid>
        </Card>

        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={sectionTitleSx}>Additional Information</Typography>
          <Grid container spacing={2.5}>
            <Grid size={12}>
              <FieldLabel>Description</FieldLabel>
              <FormField name="description" control={control} multiline minRows={3} {...fieldLabelProps} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Status</FieldLabel>
              <FormField name="status" control={control} select {...fieldLabelProps}>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </FormField>
            </Grid>
          </Grid>
        </Card>

        <Stack direction="row" spacing={1.5}>
          <Button type="submit" variant="contained">
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
