import { useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button, Grid, Stack, Typography } from '@mui/material'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { GeoFenceForm } from '@/features/fieldOperations/components/GeoFenceForm'
import { GeoFenceRuleCard } from '@/features/fieldOperations/components/GeoFenceRuleCard'
import { useGeoFenceForm } from '@/features/fieldOperations/hooks/useGeoFenceForm'
import {
  geoFenceFormDefaults,
  geoFenceUserFormSchema,
  type GeoFenceFormValues,
} from '@/features/fieldOperations/geoFenceFormSchema'

export function GeoFenceFormPage() {
  const navigate = useNavigate()
  const { fenceId } = useParams<{ fenceId: string }>()
  const [searchParams] = useSearchParams()
  const scope = searchParams.get('scope') === 'global' ? 'global' : 'user'
  const isGlobal = scope === 'global' && !fenceId
  const userTypeFilter = searchParams.get('userType')
  const showDealerCard = userTypeFilter !== 'Chemist'
  const showChemistCard = userTypeFilter !== 'Dealer'
  const { isEdit, fence, settings, isLoading, isSubmitting, submit } =
    useGeoFenceForm(fenceId, scope)

  const { control, handleSubmit, reset } = useForm<GeoFenceFormValues>({
    resolver: zodResolver(geoFenceUserFormSchema),
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

  const partnerBasePath: Record<'Dealer' | 'Chemist', string> = {
    Dealer: '/partners/dealers',
    Chemist: '/partners/chemists',
  }

  const backTo =
    isEdit && fence && (fence.userType === 'Dealer' || fence.userType === 'Chemist')
      ? `${partnerBasePath[fence.userType]}/${fenceId}`
      : '/field-operations/geo-fence-management'

  if (isGlobal) {
    const dealerSetting = settings.find((setting) => setting.partnerType === 'DEALER')
    const chemistSetting = settings.find((setting) => setting.partnerType === 'CHEMIST')
    const showBothCards = showDealerCard && showChemistCard

    return (
      <>
        <Stack sx={{ mb: 3 }}>
          <Typography variant="h1">Geo Fence Rules</Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {showBothCards
              ? "These default rules apply to every Dealer and Chemist who doesn't have their own geo fence. Click Edit on a card to update it."
              : `This default rule applies to every ${userTypeFilter} who doesn't have their own geo fence. Click Edit to update it.`}
          </Typography>
        </Stack>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          {showDealerCard && (
            <Grid size={{ xs: 12, md: showBothCards ? 6 : 12 }}>
              <GeoFenceRuleCard
                key={dealerSetting?.updatedAt ?? 'dealer'}
                setting={dealerSetting}
              />
            </Grid>
          )}
          {showChemistCard && (
            <Grid size={{ xs: 12, md: showBothCards ? 6 : 12 }}>
              <GeoFenceRuleCard
                key={chemistSetting?.updatedAt ?? 'chemist'}
                setting={chemistSetting}
              />
            </Grid>
          )}
        </Grid>

        <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
          <Button variant="outlined" color="primary" onClick={() => navigate(backTo)}>
            Back
          </Button>
        </Stack>
      </>
    )
  }

  const onSubmit = handleSubmit(async (values) => {
    const success = await submit(values)
    if (success) navigate(backTo)
  })

  const title = isEdit ? 'Edit Geo Fence' : 'Add Geo Fence'

  return (
    <>
      <Stack sx={{ mb: 3 }}>
        <Typography variant="h1">{title}</Typography>
      </Stack>

      <form onSubmit={onSubmit} noValidate>
        <GeoFenceForm control={control} />

        <Stack
          direction="row"
          spacing={1.5}
          sx={{ width: '100%', justifyContent: 'flex-end' }}
        >
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
