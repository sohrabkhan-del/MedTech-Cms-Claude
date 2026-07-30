import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CircularProgress,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { MapPin as PlaceOutlinedIcon, Plus, Trash2 } from 'lucide-react'
import { FormField } from '@/components/common/FormField/FormField'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { useToast } from '@/contexts/ToastContext'
import { radius } from '@/theme/tokens'
import { fallbackRegions, getRegions } from '@/services/regionsService'
import type { RegionOption } from '@/contexts/RegionFilterContext'
import {
  getStateNames,
  getDistrictsForState,
  getCitiesForDistrict,
} from '@/constants/indiaLocations'
import {
  chemistFormDefaults,
  chemistFormSchema,
  toChemistApiPayload,
  type ChemistFormValues,
} from '@/features/userManagement/chemistFormSchema'
import { useChemistDetail } from '@/features/userManagement/hooks/useChemistDetail'
import {
  useCreateChemistMutation,
  useUpdateChemistMutation,
} from '@/features/userManagement/services/chemistApi'
import { useGetMedicalRepOptionsQuery } from '@/features/systemUsers/services/medicalRepsApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

const sectionTitleSx = {
  fontWeight: 700,
  fontSize: '0.75rem',
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  color: 'primary.main',
  mb: 2.5,
}

const fieldLabelProps = {
  slotProps: {
    inputLabel: { shrink: false, sx: { display: 'none' } },
  },
} as const

function FieldLabel({ children, required }: { children: string; required?: boolean }) {
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

export function ChemistFormPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { chemistId } = useParams<{ chemistId: string }>()
  const isEdit = !!chemistId
  const { chemist, isLoading: isChemistLoading } = useChemistDetail(chemistId)
  const [createChemist, { isLoading: isCreating }] = useCreateChemistMutation()
  const [updateChemist, { isLoading: isUpdating }] = useUpdateChemistMutation()
  const [regions, setRegions] = useState<RegionOption[]>(
    fallbackRegions.filter((region) => region.code !== 'ALL_INDIA'),
  )
  const { data: mrOptions = [], isFetching: isMrOptionsLoading } = useGetMedicalRepOptionsQuery()
  const isSubmitting = isCreating || isUpdating

  useEffect(() => {
    let ignore = false
    getRegions()
      .then((options) => {
        const regionsOnly = options.filter((region) => region.code !== 'ALL_INDIA')
        if (!ignore && regionsOnly.length > 0) setRegions(regionsOnly)
      })
      .catch((error) => {
        console.warn('[regions] failed to load regions, using fallback', error)
      })
    return () => {
      ignore = true
    }
  }, [])

  const { control, handleSubmit, reset, watch, setValue } = useForm<ChemistFormValues>({
    resolver: zodResolver(chemistFormSchema),
    defaultValues: chemistFormDefaults,
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'locations' })

  const selectedState = watch('state')
  const selectedDistrict = watch('district')
  const stateOptions = useMemo(() => getStateNames(), [])
  const districtOptions = useMemo(
    () => (selectedState ? getDistrictsForState(selectedState) : []),
    [selectedState],
  )
  const cityOptions = useMemo(
    () =>
      selectedState && selectedDistrict
        ? getCitiesForDistrict(selectedState, selectedDistrict)
        : [],
    [selectedState, selectedDistrict],
  )

  useEffect(() => {
    if (!isEdit || !chemist) return
    reset({
      businessName: chemist.shopName,
      ownerFirstName: chemist.ownerName.split(' ')[0] ?? '',
      ownerLastName: chemist.ownerName.split(' ').slice(1).join(' '),
      email: chemist.email,
      phone: chemist.phone,
      country: '91',
      gstNumber: chemist.licenseNumber,
      panNumber: '',
      drugLicenseNumber: '',
      drugLicenseExpiry: '',
      addressLine1: chemist.registeredAddress,
      addressLine2: '',
      landmark: '',
      city: chemist.city,
      district: '',
      state: '',
      pincode: '',
      regionId: '',
      assignedMedicalRepresentativeId: chemist.assignedMr,
      locations: [
        {
          address: chemist.registeredAddress,
          latitude: String(chemist.geoLock.latitude),
          longitude: String(chemist.geoLock.longitude),
          scanRadius: String(chemist.geoLock.allowedRadiusMeters),
          bufferRadius: String(chemist.geoLock.bufferRadiusMeters),
        },
      ],
      notes: chemist.notes ?? '',
    })
  }, [isEdit, chemist, reset])

  if (isEdit && isChemistLoading) {
    return (
      <Stack sx={{ alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Stack>
    )
  }

  if (isEdit && !chemist) {
    return (
      <EmptyState
        title="Chemist not found"
        description="This chemist may have been removed."
        actionLabel="Back to Chemists"
        onAction={() => navigate('/partners/chemists')}
      />
    )
  }

  const backTo = isEdit ? `/partners/chemists/${chemistId}` : '/partners/chemists'

  const submit = handleSubmit(async (values) => {
    const payload = toChemistApiPayload(values)
    try {
      if (isEdit && chemistId) {
        await updateChemist({ id: chemistId, payload }).unwrap()
        toast.success('Chemist updated successfully.')
      } else {
        await createChemist(payload).unwrap()
        toast.success('Chemist created successfully.')
      }
      navigate(backTo)
    } catch (err) {
      toast.error(
        getApiErrorMessage(
          err,
          isEdit ? 'Failed to update chemist.' : 'Failed to create chemist.',
        ),
      )
    }
  })

  return (
    <>
      <Stack sx={{ mb: 3, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h1">{isEdit ? 'Edit Chemist' : 'Add New Chemist'}</Typography>
      </Stack>

      <form onSubmit={submit} noValidate>
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={sectionTitleSx}>Basic Details</Typography>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FieldLabel required>Business / Shop Name</FieldLabel>
              <FormField name="businessName" control={control} placeholder="e.g. Shree Medical Store" {...fieldLabelProps} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FieldLabel required>Owner First Name</FieldLabel>
              <FormField name="ownerFirstName" control={control} placeholder="First name" {...fieldLabelProps} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FieldLabel required>Owner Last Name</FieldLabel>
              <FormField name="ownerLastName" control={control} placeholder="Last name" {...fieldLabelProps} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FieldLabel required>Contact Number</FieldLabel>
              <FormField name="phone" control={control} placeholder="98xxx xxxxx" numeric {...fieldLabelProps} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FieldLabel required>Email</FieldLabel>
              <FormField
                name="email"
                control={control}
                type="email"
                placeholder="name@example.com"
                {...fieldLabelProps}
              />
            </Grid>
          </Grid>
        </Card>

        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={sectionTitleSx}>Licensing</Typography>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>GST Number</FieldLabel>
              <FormField name="gstNumber" control={control} placeholder="e.g. 27ABCDE1234F1Z5" uppercase {...fieldLabelProps} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>PAN Number</FieldLabel>
              <FormField name="panNumber" control={control} placeholder="e.g. ABCDE1234F" uppercase {...fieldLabelProps} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Drug License Number</FieldLabel>
              <FormField name="drugLicenseNumber" control={control} placeholder="e.g. MH/MUM/DRUG/2026/45879" {...fieldLabelProps} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Drug License Expiry</FieldLabel>
              <FormField name="drugLicenseExpiry" control={control} type="date" {...fieldLabelProps} />
            </Grid>
          </Grid>
        </Card>

        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={sectionTitleSx}>Registered Address</Typography>
          <Grid container spacing={2.5}>
            <Grid size={12}>
              <FieldLabel required>Address Line 1</FieldLabel>
              <FormField name="addressLine1" control={control} placeholder="Shop no., building, street" {...fieldLabelProps} />
            </Grid>
            <Grid size={12}>
              <FieldLabel>Address Line 2</FieldLabel>
              <FormField name="addressLine2" control={control} placeholder="Area, locality" {...fieldLabelProps} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FieldLabel>Landmark</FieldLabel>
              <FormField name="landmark" control={control} placeholder="e.g. Near Metro Station" {...fieldLabelProps} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FieldLabel required>State</FieldLabel>
              <Controller
                name="state"
                control={control}
                render={({ field, fieldState }) => (
                  <Autocomplete
                    options={stateOptions}
                    value={field.value || null}
                    onChange={(_, selected) => {
                      field.onChange(selected ?? '')
                      setValue('district', '')
                      setValue('city', '')
                    }}
                    size="small"
                    renderInput={(params) => (
                      <TextField {...params} placeholder="Select state" error={!!fieldState.error} helperText={fieldState.error?.message} />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FieldLabel required>District</FieldLabel>
              <Controller
                name="district"
                control={control}
                render={({ field, fieldState }) => (
                  <Autocomplete
                    options={districtOptions}
                    value={field.value || null}
                    onChange={(_, selected) => {
                      field.onChange(selected ?? '')
                      setValue('city', '')
                    }}
                    disabled={!selectedState}
                    size="small"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder={selectedState ? 'Select district' : 'Select a state first'}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FieldLabel required>City</FieldLabel>
              <Controller
                name="city"
                control={control}
                render={({ field, fieldState }) => (
                  <Autocomplete
                    freeSolo
                    options={cityOptions}
                    value={field.value || null}
                    onChange={(_, selected) => field.onChange(selected ?? '')}
                    onInputChange={(_, inputValue, reason) => {
                      if (reason === 'input') field.onChange(inputValue)
                    }}
                    disabled={!selectedDistrict}
                    size="small"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder={selectedDistrict ? 'Select or type a city' : 'Select a district first'}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Pincode</FieldLabel>
              <FormField name="pincode" control={control} placeholder="e.g. 400086" numeric {...fieldLabelProps} />
            </Grid>
          </Grid>
        </Card>

        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={sectionTitleSx}>Geo-tagging &amp; Scanning Range</Typography>
          <Stack spacing={2.5}>
            {fields.map((field, index) => (
              <Box
                key={field.id}
                sx={{
                  p: 2,
                  borderRadius: `${radius.lg}px`,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>
                    Shop Location {index + 1}
                  </Typography>
                  {fields.length > 1 && (
                    <Tooltip title="Remove location">
                      <IconButton size="small" color="error" onClick={() => remove(index)} aria-label="Remove location">
                        <Trash2 size={18} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
                <Grid container spacing={2.5}>
                  <Grid size={12}>
                    <FieldLabel required>Shop Address</FieldLabel>
                    <FormField
                      name={`locations.${index}.address`}
                      control={control}
                      placeholder="Full address including landmark"
                      multiline
                      minRows={2}
                      {...fieldLabelProps}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 5 }}>
                    <FieldLabel>Latitude</FieldLabel>
                    <FormField name={`locations.${index}.latitude`} control={control} placeholder="e.g. 19.0760" {...fieldLabelProps} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 5 }}>
                    <FieldLabel>Longitude</FieldLabel>
                    <FormField name={`locations.${index}.longitude`} control={control} placeholder="e.g. 72.8777" {...fieldLabelProps} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 2 }} sx={{ display: 'flex', alignItems: 'flex-end' }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<PlaceOutlinedIcon size={20} />}
                      sx={{ height: 40, fontSize: '0.75rem' }}
                      onClick={() => {}}
                    >
                      Open in Maps
                    </Button>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FieldLabel>Scan Radius</FieldLabel>
                    <FormField name={`locations.${index}.scanRadius`} control={control} placeholder="e.g. 200" {...fieldLabelProps} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FieldLabel>Buffer Radius (in meters)</FieldLabel>
                    <FormField name={`locations.${index}.bufferRadius`} control={control} placeholder="e.g. 50" {...fieldLabelProps} />
                  </Grid>
                </Grid>
              </Box>
            ))}
            <Button
              variant="outlined"
              startIcon={<Plus size={18} />}
              sx={{ alignSelf: 'flex-start', fontSize: '0.75rem' }}
              onClick={() => append({ address: '', latitude: '', longitude: '', scanRadius: '', bufferRadius: '' })}
            >
              Add Another Location
            </Button>
          </Stack>
        </Card>

        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={sectionTitleSx}>Assignment</Typography>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FieldLabel required>Region</FieldLabel>
              <FormField name="regionId" control={control} select {...fieldLabelProps}>
                <MenuItem value="">
                  <em>Select a region</em>
                </MenuItem>
                {regions.map((region) => (
                  <MenuItem key={region.id} value={region.id}>
                    {region.name}
                  </MenuItem>
                ))}
              </FormField>
            </Grid>
            <Grid size={{ xs: 12, sm: 8 }}>
              <FieldLabel required>Assigned MR</FieldLabel>
              <Controller
                name="assignedMedicalRepresentativeId"
                control={control}
                render={({ field, fieldState }) => (
                  <Autocomplete
                    options={mrOptions}
                    loading={isMrOptionsLoading}
                    getOptionLabel={(option) =>
                      option.employeeCode ? `${option.name} (${option.employeeCode})` : option.name
                    }
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    value={mrOptions.find((mr) => mr.id === field.value) ?? null}
                    onChange={(_, selected) => field.onChange(selected?.id ?? '')}
                    size="small"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Search medical representatives…"
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid size={12}>
              <FieldLabel>Notes</FieldLabel>
              <FormField name="notes" control={control} multiline minRows={3} {...fieldLabelProps} />
            </Grid>
          </Grid>
        </Card>

        <Stack
          direction="row"
          spacing={1.5}
          sx={{ width: '100%', justifyContent: 'flex-end' }}
        >
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Chemist'}
          </Button>
          <Button variant="outlined" color="primary" onClick={() => navigate(backTo)} disabled={isSubmitting}>
            Cancel
          </Button>
        </Stack>
      </form>
    </>
  )
}
