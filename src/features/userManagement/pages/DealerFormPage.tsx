import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button, Stack, Typography } from '@mui/material'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { DealerForm } from '@/features/userManagement/components/DealerForm'
import { useDealerForm } from '@/features/userManagement/hooks/useDealerForm'
import { dealerFormDefaults, dealerFormSchema, type DealerFormValues } from '@/features/userManagement/types/userManagement.types'

export function DealerFormPage() {
  const navigate = useNavigate()
  const { dealerId } = useParams<{ dealerId: string }>()
  const { isEdit, dealer, mrOptions, isLoading, isSubmitting, submit } = useDealerForm(dealerId)

  const { control, handleSubmit, reset } = useForm<DealerFormValues>({
    resolver: zodResolver(dealerFormSchema),
    defaultValues: dealerFormDefaults,
  })

  useEffect(() => {
    if (!dealer) return
    reset({
      shopName: dealer.shopName,
      ownerName: dealer.ownerName,
      phone: dealer.phone,
      email: dealer.email,
      licenseNumber: dealer.licenseNumber,
      city: dealer.city,
      zone: dealer.zone,
      registeredAddress: dealer.registeredAddress,
      latitude: String(dealer.geoLock.latitude),
      longitude: String(dealer.geoLock.longitude),
      scanRadius: String(dealer.geoLock.allowedRadiusMeters),
      bufferRadius: String(dealer.geoLock.bufferRadiusMeters),
      assignedMr: dealer.assignedMr,
      notes: dealer.notes ?? '',
    })
  }, [dealer, reset])

  if (isEdit && !isLoading && !dealer) {
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
          {isEdit ? 'Edit Dealer' : 'Add New Dealer'}
        </Typography>
      </Stack>

      <form onSubmit={onSubmit} noValidate>
        <DealerForm control={control} mrOptions={mrOptions} />

        <Stack direction="row" spacing={1.5}>
          <Button type="submit" variant="contained" loading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Create Dealer'}
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
