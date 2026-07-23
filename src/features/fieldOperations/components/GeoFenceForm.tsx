import { Controller, type Control } from 'react-hook-form'
import { Autocomplete, Card, Grid, MenuItem, TextField, Typography } from '@mui/material'
import { FormField } from '@/components/common/FormField/FormField'
import type { GeoFenceFormValues } from '@/features/fieldOperations/types/fieldOperations.types'

const zones: GeoFenceFormValues['region'][] = ['North', 'South', 'East', 'West']
const userTypes: GeoFenceFormValues['userType'][] = ['Dealer', 'Chemist']

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

interface GeoFenceFormProps {
  control: Control<GeoFenceFormValues>
  userOptions: { id: string; name: string; userType: GeoFenceFormValues['userType'] }[]
  scope?: 'global' | 'user'
}

export function GeoFenceForm({ control, userOptions, scope = 'user' }: GeoFenceFormProps) {
  const selectableUsers = userOptions.filter((user) => user.userType === 'Dealer' || user.userType === 'Chemist')

  return (
    <>
      {scope === 'user' && (
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={sectionTitleSx}>Basic Information</Typography>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>User</FieldLabel>
              <Controller
                name="userId"
                control={control}
                render={({ field, fieldState }) => (
                  <Autocomplete
                    options={selectableUsers}
                    getOptionLabel={(option) => option.name}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    value={selectableUsers.find((user) => user.id === field.value) ?? null}
                    onChange={(_, selected) => field.onChange(selected?.id ?? '')}
                    size="small"
                    renderInput={(params) => (
                      <TextField {...params} error={!!fieldState.error} helperText={fieldState.error?.message} />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>User Type</FieldLabel>
              <FormField name="userType" control={control} select {...fieldLabelProps}>
                {userTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </FormField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Region</FieldLabel>
              <FormField name="region" control={control} select {...fieldLabelProps}>
                {zones.map((zone) => (
                  <MenuItem key={zone} value={zone}>
                    {zone}
                  </MenuItem>
                ))}
              </FormField>
            </Grid>
          </Grid>
        </Card>
      )}

      <Card sx={{ p: 3, mb: 3 }}>
        <Typography sx={sectionTitleSx}>Location Configuration</Typography>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldLabel required>Radius (meters)</FieldLabel>
            <FormField name="radiusMeters" control={control} type="number" placeholder="e.g. 150" {...fieldLabelProps} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldLabel required>Buffer Distance (meters)</FieldLabel>
            <FormField name="bufferDistanceMeters" control={control} type="number" placeholder="e.g. 50" {...fieldLabelProps} />
          </Grid>
        </Grid>
      </Card>
    </>
  )
}
