import { useNavigate, useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button, Card, Grid, MenuItem, Stack, Typography } from '@mui/material'
import { FormField } from '@/components/common/FormField/FormField'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import {
  medicalRepFormDefaults,
  medicalRepFormSchema,
  type MedicalRepFormValues,
} from '@/features/systemUsers/medicalRepFormSchema'
import { getMedicalRepById } from '@/features/systemUsers/mockMedicalReps'

const regions: MedicalRepFormValues['region'][] = ['North', 'South', 'East', 'West']
const statuses: MedicalRepFormValues['status'][] = ['active', 'pending', 'inactive']

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

export function MedicalRepFormPage() {
  const navigate = useNavigate()
  const { mrId } = useParams<{ mrId: string }>()
  const isEdit = !!mrId
  const mr = isEdit ? getMedicalRepById(mrId) : undefined

  const { control, handleSubmit } = useForm<MedicalRepFormValues>({
    resolver: zodResolver(medicalRepFormSchema),
    defaultValues: mr
      ? {
          name: mr.name,
          email: mr.email,
          phone: mr.phone,
          region: mr.region,
          status: mr.status,
          notes: mr.notes ?? '',
        }
      : medicalRepFormDefaults,
  })

  if (isEdit && !mr) {
    return (
      <EmptyState
        title="Medical Representative not found"
        description="This MR account may have been removed."
        actionLabel="Back to MR List"
        onAction={() => navigate('/system-users/medical-representatives')}
      />
    )
  }

  const backTo = isEdit ? `/system-users/medical-representatives/${mrId}` : '/system-users/medical-representatives'

  const submit = handleSubmit(() => {
    navigate(backTo)
  })

  return (
    <>
      <Stack sx={{ mb: 3, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h1">{isEdit ? 'Edit MR' : 'Create MR'}</Typography>
      </Stack>

      <form onSubmit={submit} noValidate>
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={sectionTitleSx}>MR Information</Typography>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Full Name</FieldLabel>
              <FormField name="name" control={control} placeholder="Full name" {...fieldLabelProps} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Email Address</FieldLabel>
              <FormField name="email" control={control} type="email" placeholder="name@example.com" {...fieldLabelProps} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Phone Number</FieldLabel>
              <FormField name="phone" control={control} placeholder="98xxx xxxxx" {...fieldLabelProps} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Region</FieldLabel>
              <FormField name="region" control={control} select {...fieldLabelProps}>
                {regions.map((region) => (
                  <MenuItem key={region} value={region}>
                    {region}
                  </MenuItem>
                ))}
              </FormField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Status</FieldLabel>
              <FormField name="status" control={control} select {...fieldLabelProps}>
                {statuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </MenuItem>
                ))}
              </FormField>
            </Grid>
            <Grid size={12}>
              <FieldLabel>Notes</FieldLabel>
              <FormField name="notes" control={control} multiline minRows={3} {...fieldLabelProps} />
            </Grid>
          </Grid>
        </Card>

        <Stack direction="row" spacing={1.5}>
          <Button type="submit" variant="contained">
            {isEdit ? 'Save MR' : 'Save MR'}
          </Button>
          <Button variant="outlined" color="primary" onClick={() => navigate(backTo)}>
            Back
          </Button>
          <Button variant="text" color="primary" onClick={() => navigate(backTo)}>
            Cancel
          </Button>
        </Stack>
      </form>
    </>
  )
}
