import { useNavigate, useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button, Card, Grid, MenuItem, Stack, Typography } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { FormField } from '@/components/common/FormField/FormField'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { chemistFormDefaults, chemistFormSchema, type ChemistFormValues } from '@/features/chemists/chemistFormSchema'
import { getChemistById } from '@/features/chemists/mockChemists'

const zones: ChemistFormValues['zone'][] = ['North', 'South', 'East', 'West']

export function ChemistFormPage() {
  const navigate = useNavigate()
  const { chemistId } = useParams<{ chemistId: string }>()
  const isEdit = !!chemistId
  const chemist = isEdit ? getChemistById(chemistId) : undefined

  const { control, handleSubmit } = useForm<ChemistFormValues>({
    resolver: zodResolver(chemistFormSchema),
    defaultValues: chemist
      ? {
          shopName: chemist.shopName,
          ownerName: chemist.ownerName,
          phone: chemist.phone,
          email: chemist.email,
          licenseNumber: chemist.licenseNumber,
          city: chemist.city,
          zone: chemist.zone,
          notes: chemist.notes ?? '',
        }
      : chemistFormDefaults,
  })

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

  const submit = handleSubmit(() => {
    navigate(backTo)
  })

  return (
    <>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(backTo)}
        sx={{ mb: 1, color: 'text.secondary' }}
      >
        Back to Chemists
      </Button>

      <Stack sx={{ mb: 3 }}>
        <Typography variant="h1">{isEdit ? 'Edit Chemist' : 'Add New Chemist'}</Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
          {isEdit
            ? 'Update this chemist account.'
            : 'New chemists are saved with Pending Approval status until approved.'}
        </Typography>
      </Stack>

      <form onSubmit={submit} noValidate>
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', mb: 2.5 }}>Basic Details</Typography>
          <Grid container spacing={2.5}>
            <Grid size={12}>
              <FormField name="shopName" control={control} label="Chemist Shop Name" required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField name="ownerName" control={control} label="Owner Name" required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField name="phone" control={control} label="Phone Number" required />
            </Grid>
            <Grid size={12}>
              <FormField name="email" control={control} label="Email Address" required type="email" />
            </Grid>
            <Grid size={12}>
              <FormField name="licenseNumber" control={control} label="Drug License Number" required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField name="city" control={control} label="City" required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField name="zone" control={control} label="Zone" required select>
                {zones.map((zone) => (
                  <MenuItem key={zone} value={zone}>
                    {zone}
                  </MenuItem>
                ))}
              </FormField>
            </Grid>
            <Grid size={12}>
              <FormField name="notes" control={control} label="Notes" multiline minRows={3} />
            </Grid>
          </Grid>
        </Card>

        <Stack direction="row" spacing={1.5}>
          <Button type="submit" variant="contained">
            {isEdit ? 'Save Changes' : 'Create Chemist'}
          </Button>
          <Button variant="outlined" color="primary" onClick={() => navigate(backTo)}>
            Cancel
          </Button>
        </Stack>
      </form>
    </>
  )
}
