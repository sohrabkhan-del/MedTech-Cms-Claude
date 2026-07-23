import { useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button, Stack, Typography } from '@mui/material'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { GeoFenceForm } from '@/features/fieldOperations/components/GeoFenceForm'
import { useGeoFenceForm } from '@/features/fieldOperations/hooks/useGeoFenceForm'
import {
  geoFenceFormDefaults,
  geoFenceFormSchema,
  geoFenceUserFormSchema,
  type GeoFenceFormValues,
} from '@/features/fieldOperations/geoFenceFormSchema'

export function GeoFenceFormPage() {
  const navigate = useNavigate()
  const { fenceId } = useParams<{ fenceId: string }>()
  const [searchParams] = useSearchParams()
  const scope = searchParams.get('scope') === 'global' ? 'global' : 'user'
  const { isEdit, fence, userOptions, isLoading, isSubmitting, submit } = useGeoFenceForm(fenceId)

  const { control, handleSubmit, reset } = useForm<GeoFenceFormValues>({
    resolver: zodResolver(scope === 'global' ? geoFenceFormSchema : geoFenceUserFormSchema),
    defaultValues: geoFenceFormDefaults,
  })

  useEffect(() => {
    if (!fence) return
    reset({
      userId: fence.linkedUserId ?? fence.id,
      userType: fence.userType,
      region: fence.region,
      radiusMeters: String(fence.radiusMeters),
      bufferDistanceMeters: String(fence.bufferDistanceMeters),
    })
  }, [fence, reset])

  if (isEdit && !isLoading && !fence) {
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

  const onSubmit = handleSubmit(async (values) => {
    const success = await submit(values)
    if (success) navigate(backTo)
  })

  const title = isEdit ? 'Edit Geo Fence' : scope === 'global' ? 'Add Geo Fence Rule' : 'Add Geo Fence'

  return (
    <>
      <Stack sx={{ mb: 3 }}>
        <Typography variant="h1">{title}</Typography>
        {!isEdit && scope === 'global' && (
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            This sets the default rule applied globally to every Dealer and Chemist who doesn't have their own geo fence.
          </Typography>
        )}
      </Stack>

      <form onSubmit={onSubmit} noValidate>
        <GeoFenceForm control={control} userOptions={userOptions} scope={isEdit ? 'user' : scope} />

        <Stack direction="row" spacing={1.5}>
          <Button type="submit" variant="contained" loading={isSubmitting}>
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
