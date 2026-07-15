import { useNavigate, useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button, Card, Grid, MenuItem, Stack, Typography } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { FormField } from '@/components/common/FormField/FormField'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { dealerFormDefaults, dealerFormSchema, type DealerFormValues } from '@/features/dealers/dealerFormSchema'
import { getDealerById } from '@/features/dealers/mockDealers'

const zones: DealerFormValues['zone'][] = ['North', 'South', 'East', 'West']

export function DealerFormPage() {
  const navigate = useNavigate()
  const { dealerId } = useParams<{ dealerId: string }>()
  const isEdit = !!dealerId
  const dealer = isEdit ? getDealerById(dealerId) : undefined

  const { control, handleSubmit } = useForm<DealerFormValues>({
    resolver: zodResolver(dealerFormSchema),
    defaultValues: dealer
      ? {
          shopName: dealer.shopName,
          ownerName: dealer.ownerName,
          phone: dealer.phone,
          email: dealer.email,
          licenseNumber: dealer.licenseNumber,
          city: dealer.city,
          zone: dealer.zone,
          notes: dealer.notes ?? '',
        }
      : dealerFormDefaults,
  })

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
        Back to Dealers
      </Button>

      <Stack sx={{ mb: 3 }}>
        <Typography variant="h1">{isEdit ? 'Edit Dealer' : 'Add New Dealer'}</Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
          {isEdit
            ? 'Update this dealer account.'
            : 'Fill in the details below to create a new dealer record.'}
        </Typography>
      </Stack>

      <form onSubmit={submit} noValidate>
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', mb: 2.5 }}>Basic Details</Typography>
          <Grid container spacing={2.5}>
            <Grid size={12}>
              <FormField name="shopName" control={control} label="Godown Name" required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField name="ownerName" control={control} label="Owner Name" required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField name="phone" control={control} label="Phone" required />
            </Grid>
            <Grid size={12}>
              <FormField name="email" control={control} label="Email" required type="email" />
            </Grid>
            <Grid size={12}>
              <FormField name="licenseNumber" control={control} label="License Number" required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField name="city" control={control} label="Location" required />
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
            {isEdit ? 'Save Changes' : 'Create Dealer'}
          </Button>
          <Button variant="outlined" color="primary" onClick={() => navigate(backTo)}>
            Cancel
          </Button>
        </Stack>
      </form>
    </>
  )
}
