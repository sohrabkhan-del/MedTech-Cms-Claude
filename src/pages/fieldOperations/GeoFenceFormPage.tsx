import { useNavigate, useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button, Card, Grid, MenuItem, Stack, Typography } from '@mui/material'
import { FormField } from '@/components/common/FormField/FormField'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import {
  geoFenceFormDefaults,
  geoFenceFormSchema,
  type GeoFenceFormValues,
} from '@/features/fieldOperations/geoFenceFormSchema'
import { getGeoFenceById, geoFenceUserOptions } from '@/features/fieldOperations/mockGeoFences'

const zones: GeoFenceFormValues['region'][] = ['North', 'South', 'East', 'West']
const userTypes: GeoFenceFormValues['userType'][] = ['Dealer', 'Chemist', 'MR']

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

export function GeoFenceFormPage() {
  const navigate = useNavigate()
  const { fenceId } = useParams<{ fenceId: string }>()
  const isEdit = !!fenceId
  const fence = isEdit ? getGeoFenceById(fenceId) : undefined

  const { control, handleSubmit } = useForm<GeoFenceFormValues>({
    resolver: zodResolver(geoFenceFormSchema),
    defaultValues: fence
      ? {
          userId: fence.linkedUserId ?? fence.id,
          userType: fence.userType,
          region: fence.region,
          radiusMeters: String(fence.radiusMeters),
          bufferDistanceMeters: String(fence.bufferDistanceMeters),
        }
      : geoFenceFormDefaults,
  })

  if (isEdit && !fence) {
    return (
      <EmptyState
        title="Geo fence not found"
        description="This geo fence may have been removed."
        actionLabel="Back to Geo Fence Management"
        onAction={() => navigate('/field-operations/geo-fence-management')}
      />
    )
  }

  const backTo = isEdit ? `/field-operations/geo-fence-management/${fenceId}` : '/field-operations/geo-fence-management'

  const submit = handleSubmit(() => {
    navigate(backTo)
  })

  return (
    <>
      <Stack sx={{ mb: 3 }}>
        <Typography variant="h1">{isEdit ? 'Edit Geo Fence' : 'Add Geo Fence'}</Typography>
      </Stack>

      <form onSubmit={submit} noValidate>
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={sectionTitleSx}>Basic Information</Typography>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>User</FieldLabel>
              <FormField name="userId" control={control} select {...fieldLabelProps}>
                {geoFenceUserOptions.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </FormField>
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

        <Stack direction="row" spacing={1.5}>
          <Button type="submit" variant="contained">
            Save
          </Button>
          <Button variant="outlined" color="primary" onClick={() => navigate(backTo)}>
            Cancel
          </Button>
        </Stack>
      </form>
    </>
  )
}
