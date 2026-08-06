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
import { LocationMapPicker } from '@/components/common/LocationMapPicker/LocationMapPicker'
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
  dealerBusinessDefaults,
  dealerFormDefaults,
  dealerFormSchema,
  toDealerApiPayload,
  type DealerFormValues,
} from '@/features/userManagement/dealerFormSchema'
import { useDealerDetail } from '@/features/userManagement/hooks/useDealerDetail'
import {
  useCreateDealerMutation,
  useUpdateDealerMutation,
} from '@/features/userManagement/services/dealerApi'
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

function FieldLabel({
  children,
  required,
}: {
  children: string
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

function BusinessAddressFields({
  control,
  setValue,
  watch,
  index,
}: {
  control: ReturnType<typeof useForm<DealerFormValues>>['control']
  setValue: ReturnType<typeof useForm<DealerFormValues>>['setValue']
  watch: ReturnType<typeof useForm<DealerFormValues>>['watch']
  index: number
}) {
  const selectedState = watch(`businesses.${index}.state`)
  const selectedDistrict = watch(`businesses.${index}.district`)
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

  return (
    <>
      <Grid size={{ xs: 12, sm: 4 }}>
        <FieldLabel required>State</FieldLabel>
        <Controller
          name={`businesses.${index}.state`}
          control={control}
          render={({ field, fieldState }) => (
            <Autocomplete
              options={stateOptions}
              value={field.value || null}
              onChange={(_, selected) => {
                field.onChange(selected ?? '')
                setValue(`businesses.${index}.district`, '')
                setValue(`businesses.${index}.city`, '')
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
          name={`businesses.${index}.district`}
          control={control}
          render={({ field, fieldState }) => (
            <Autocomplete
              options={districtOptions}
              value={field.value || null}
              onChange={(_, selected) => {
                field.onChange(selected ?? '')
                setValue(`businesses.${index}.city`, '')
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
          name={`businesses.${index}.city`}
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
    </>
  )
}

export function DealerFormPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { dealerId } = useParams<{ dealerId: string }>()
  const isEdit = !!dealerId
  const { dealer, isLoading: isDealerLoading } = useDealerDetail(dealerId)
  const [createDealer, { isLoading: isCreating }] = useCreateDealerMutation()
  const [updateDealer, { isLoading: isUpdating }] = useUpdateDealerMutation()
  const [regions, setRegions] = useState<RegionOption[]>(
    fallbackRegions.filter((region) => region.code !== 'ALL_INDIA'),
  )
  const { data: mrOptions = [], isFetching: isMrOptionsLoading } =
    useGetMedicalRepOptionsQuery()
  const isSubmitting = isCreating || isUpdating
  const [mapPickerIndex, setMapPickerIndex] = useState<number | null>(null)

  useEffect(() => {
    let ignore = false
    getRegions()
      .then((options) => {
        const regionsOnly = options.filter(
          (region) => region.code !== 'ALL_INDIA',
        )
        if (!ignore && regionsOnly.length > 0) setRegions(regionsOnly)
      })
      .catch((error) => {
        console.warn('[regions] failed to load regions, using fallback', error)
      })
    return () => {
      ignore = true
    }
  }, [])

  const { control, handleSubmit, reset, watch, setValue } =
    useForm<DealerFormValues>({
      resolver: zodResolver(dealerFormSchema),
      defaultValues: dealerFormDefaults,
    })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'businesses',
  })

  useEffect(() => {
    if (!isEdit || !dealer) return
    reset({
      businessName: dealer.shopName,
      ownerFirstName: dealer.ownerName.split(' ')[0] ?? '',
      ownerLastName: dealer.ownerName.split(' ').slice(1).join(' '),
      email: dealer.email,
      phone: dealer.phone,
      country: '91',
      gstNumber: dealer.licenseNumber,
      regionId: '',
      assignedMedicalRepresentativeId: dealer.assignedMr,
      notes: dealer.notes ?? '',
      businesses:
        dealer.godowns.length > 0
          ? dealer.godowns.map((godown) => ({
              outletName: godown.name,
              userName: '',
              panNumber: dealer.panNumber ?? '',
              drugLicenseNumber: dealer.drugLicenseNumber ?? '',
              drugLicenseExpiry: dealer.drugLicenseExpiry ?? '',
              addressType: 'GODOWN' as const,
              addressLine1: godown.address,
              addressLine2: '',
              landmark: '',
              city: dealer.city,
              district: '',
              state: '',
              pincode: '',
              latitude: String(godown.geoLock.latitude),
              longitude: String(godown.geoLock.longitude),
              notes: dealer.notes ?? '',
            }))
          : [
              {
                outletName: dealer.shopName,
                userName: '',
                panNumber: dealer.panNumber ?? '',
                drugLicenseNumber: dealer.drugLicenseNumber ?? '',
                drugLicenseExpiry: dealer.drugLicenseExpiry ?? '',
                addressType: 'GODOWN' as const,
                addressLine1: dealer.registeredAddress,
                addressLine2: '',
                landmark: '',
                city: dealer.city,
                district: '',
                state: '',
                pincode: '',
                latitude: String(dealer.geoLock.latitude),
                longitude: String(dealer.geoLock.longitude),
                notes: dealer.notes ?? '',
              },
            ],
    })
  }, [isEdit, dealer, reset])

  if (isEdit && isDealerLoading) {
    return (
      <Stack sx={{ alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Stack>
    )
  }

  if (isEdit && !dealer) {
    return (
      <EmptyState
        title="Dealer not found"
        description="This dealer may have been removed."
        actionLabel="Back to Dealers"
        onAction={() => navigate('/partners/dealers')}
      />
    )
  }

  const backTo = isEdit ? `/partners/dealers/${dealerId}` : '/partners/dealers'

  const submit = handleSubmit(async (values) => {
    const payload = toDealerApiPayload(values)
    try {
      if (isEdit && dealerId) {
        await updateDealer({ id: dealerId, payload }).unwrap()
        toast.success('Dealer updated successfully.')
      } else {
        await createDealer(payload).unwrap()
        toast.success('Dealer created successfully.')
      }
      navigate(backTo)
    } catch (err) {
      toast.error(
        getApiErrorMessage(
          err,
          isEdit ? 'Failed to update dealer.' : 'Failed to create dealer.',
        ),
      )
    }
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
          {isEdit ? 'Edit Dealer' : 'Add New Dealer'}
        </Typography>
      </Stack>

      <form onSubmit={submit} noValidate>
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={sectionTitleSx}>Basic Details</Typography>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FieldLabel required>Business Name</FieldLabel>
              <FormField
                name="businessName"
                control={control}
                placeholder="e.g. Shree Pharma Agency"
                {...fieldLabelProps}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FieldLabel required>Owner First Name</FieldLabel>
              <FormField
                name="ownerFirstName"
                control={control}
                placeholder="First name"
                {...fieldLabelProps}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FieldLabel required>Owner Last Name</FieldLabel>
              <FormField
                name="ownerLastName"
                control={control}
                placeholder="Last name"
                {...fieldLabelProps}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FieldLabel required>Contact Number</FieldLabel>
              <FormField
                name="phone"
                control={control}
                placeholder="98xxx xxxxx"
                numeric
                slotProps={{ htmlInput: { maxLength: 10 } }}
                {...fieldLabelProps}
              />
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
            <Grid size={{ xs: 12, sm: 4 }}>
              <FieldLabel required>GST Number</FieldLabel>
              <FormField
                name="gstNumber"
                control={control}
                placeholder="e.g. 27ABCDE1234F1Z5"
                uppercase
                {...fieldLabelProps}
              />
            </Grid>
          </Grid>
        </Card>

        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={sectionTitleSx}>Business / Godowns</Typography>
          <Stack spacing={2.5}>
            {fields.map((field, index) => (
              <Box
                key={field.id}
                sx={{
                  p: 2.5,
                  borderRadius: `${radius.lg}px`,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Stack
                  direction="row"
                  sx={{
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>
                    Godown {index + 1}
                  </Typography>
                  {fields.length > 1 && (
                    <Tooltip title="Remove godown">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => remove(index)}
                        aria-label="Remove godown"
                      >
                        <Trash2 size={18} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>

                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FieldLabel required>Godown Name</FieldLabel>
                    <FormField name={`businesses.${index}.outletName`} control={control} placeholder={`e.g. Godown ${index + 1}`} {...fieldLabelProps} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FieldLabel>Godown Manager / User Name</FieldLabel>
                    <FormField name={`businesses.${index}.userName`} control={control} placeholder="Person handling this godown" {...fieldLabelProps} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FieldLabel required>PAN Number</FieldLabel>
                    <FormField name={`businesses.${index}.panNumber`} control={control} placeholder="e.g. ABCDE1234F" uppercase {...fieldLabelProps} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FieldLabel required>Drug License Number</FieldLabel>
                    <FormField name={`businesses.${index}.drugLicenseNumber`} control={control} placeholder="e.g. MH/MUM/DRUG/2026/45879" {...fieldLabelProps} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FieldLabel required>Drug License Expiry</FieldLabel>
                    <FormField name={`businesses.${index}.drugLicenseExpiry`} control={control} type="date" {...fieldLabelProps} />
                  </Grid>

                  <Grid size={12}>
                    <FieldLabel required>Address Line 1</FieldLabel>
                    <FormField name={`businesses.${index}.addressLine1`} control={control} placeholder="Godown no., building, street" {...fieldLabelProps} />
                  </Grid>
                  <Grid size={12}>
                    <FieldLabel>Address Line 2</FieldLabel>
                    <FormField name={`businesses.${index}.addressLine2`} control={control} placeholder="Area, locality" {...fieldLabelProps} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FieldLabel>Landmark</FieldLabel>
                    <FormField name={`businesses.${index}.landmark`} control={control} placeholder="e.g. Near Metro Station" {...fieldLabelProps} />
                  </Grid>

                  <BusinessAddressFields control={control} setValue={setValue} watch={watch} index={index} />

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FieldLabel required>Pincode</FieldLabel>
                    <FormField name={`businesses.${index}.pincode`} control={control} placeholder="e.g. 400086" numeric {...fieldLabelProps} />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 5 }}>
                    <FieldLabel>Latitude</FieldLabel>
                    <FormField name={`businesses.${index}.latitude`} control={control} placeholder="e.g. 19.0760" {...fieldLabelProps} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 5 }}>
                    <FieldLabel>Longitude</FieldLabel>
                    <FormField name={`businesses.${index}.longitude`} control={control} placeholder="e.g. 72.8777" {...fieldLabelProps} />
                  </Grid>
                  <Grid
                    size={{ xs: 12, sm: 2 }}
                    sx={{ display: 'flex', alignItems: 'flex-end' }}
                  >
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<PlaceOutlinedIcon size={20} />}
                      sx={{ height: 40, fontSize: '0.75rem' }}
                      onClick={() => setMapPickerIndex(index)}
                    >
                      Pick on Map
                    </Button>
                  </Grid>

                  <Grid size={12}>
                    <FieldLabel>Godown Notes</FieldLabel>
                    <FormField name={`businesses.${index}.notes`} control={control} multiline minRows={2} {...fieldLabelProps} />
                  </Grid>
                </Grid>

                <LocationMapPicker
                  open={mapPickerIndex === index}
                  latitude={watch(`businesses.${index}.latitude`)}
                  longitude={watch(`businesses.${index}.longitude`)}
                  onChange={(lat, lng) => {
                    setValue(`businesses.${index}.latitude`, lat)
                    setValue(`businesses.${index}.longitude`, lng)
                  }}
                  onClose={() => setMapPickerIndex(null)}
                />
              </Box>
            ))}
            <Button
              variant="outlined"
              startIcon={<Plus size={18} />}
              sx={{ alignSelf: 'flex-start', fontSize: '0.75rem' }}
              onClick={() =>
                append({
                  ...dealerBusinessDefaults,
                  outletName: `Godown ${fields.length + 1}`,
                })
              }
            >
              Add Another Godown
            </Button>
          </Stack>
        </Card>

        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={sectionTitleSx}>Assignment</Typography>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FieldLabel required>Region</FieldLabel>
              <FormField
                name="regionId"
                control={control}
                select
                {...fieldLabelProps}
              >
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
                      option.employeeCode
                        ? `${option.name} (${option.employeeCode})`
                        : option.name
                    }
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    value={
                      mrOptions.find((mr) => mr.id === field.value) ?? null
                    }
                    onChange={(_, selected) =>
                      field.onChange(selected?.id ?? '')
                    }
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
              <FormField
                name="notes"
                control={control}
                multiline
                minRows={3}
                {...fieldLabelProps}
              />
            </Grid>
          </Grid>
        </Card>

        <Stack
          direction="row"
          spacing={1.5}
          sx={{ width: '100%', justifyContent: 'flex-end' }}
        >
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting
              ? 'Saving…'
              : isEdit
                ? 'Save Changes'
                : 'Create Dealer'}
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate(backTo)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </Stack>
      </form>
    </>
  )
}
