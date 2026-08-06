import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button, Card, Grid, MenuItem, Stack, Typography } from '@mui/material'
import { FormField } from '@/components/common/FormField/FormField'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { useToast } from '@/contexts/ToastContext'
import { fallbackRegions, getRegions } from '@/services/regionsService'
import type { RegionOption } from '@/contexts/RegionFilterContext'
import {
  medicalRepFormDefaults,
  medicalRepFormSchema,
  toMedicalRepApiPayload,
  type MedicalRepFormValues,
} from '@/features/systemUsers/medicalRepFormSchema'
import {
  useGetMedicalRepDetailQuery,
  useCreateMedicalRepMutation,
  useUpdateMedicalRepMutation,
} from '@/features/systemUsers/services/medicalRepsApi'
import { skipToken } from '@reduxjs/toolkit/query/react'
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

export function MedicalRepFormPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { mrId } = useParams<{ mrId: string }>()
  const isEdit = !!mrId
  const { data: mr, isLoading: isMrLoading } = useGetMedicalRepDetailQuery(mrId ?? skipToken)
  const [createMedicalRep, { isLoading: isCreating }] = useCreateMedicalRepMutation()
  const [updateMedicalRep, { isLoading: isUpdating }] = useUpdateMedicalRepMutation()
  const [regions, setRegions] = useState<RegionOption[]>(
    fallbackRegions.filter((region) => region.code !== 'ALL_INDIA'),
  )
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

  const { control, handleSubmit, reset } = useForm<MedicalRepFormValues>({
    resolver: zodResolver(medicalRepFormSchema),
    defaultValues: medicalRepFormDefaults,
  })

  useEffect(() => {
    if (!isEdit || !mr) return
    reset({
      fullName: mr.fullName ?? mr.name,
      email: mr.email,
      phone: mr.phone,
      country: mr.country ?? '91',
      regionId: mr.regionId ?? '',
    })
  }, [isEdit, mr, reset])

  if (isEdit && isMrLoading) {
    return null
  }

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

  const onSubmit = handleSubmit(async (values) => {
    const payload = toMedicalRepApiPayload(values)
    try {
      if (isEdit && mrId) {
        await updateMedicalRep({ id: mrId, values: payload }).unwrap()
        toast.success('Medical rep updated successfully.')
      } else {
        await createMedicalRep(payload).unwrap()
        toast.success('Medical rep created successfully.')
      }
      navigate(backTo)
    } catch (err) {
      toast.error(
        getApiErrorMessage(
          err,
          isEdit ? 'Failed to update medical representative.' : 'Failed to create medical representative.',
        ),
      )
    }
  })

  return (
    <>
      <Stack sx={{ mb: 3, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h1">{isEdit ? 'Edit MR' : 'Create MR'}</Typography>
      </Stack>

      <form onSubmit={onSubmit} noValidate>
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={sectionTitleSx}>MR Information</Typography>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Full Name</FieldLabel>
              <FormField name="fullName" control={control} placeholder="Full name" {...fieldLabelProps} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Email Address</FieldLabel>
              <FormField name="email" control={control} type="email" placeholder="name@example.com" {...fieldLabelProps} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Phone Number</FieldLabel>
              <FormField
                name="phone"
                control={control}
                placeholder="98xxx xxxxx"
                numeric
                slotProps={{
                  ...fieldLabelProps.slotProps,
                  htmlInput: { maxLength: 10 },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
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
          </Grid>
        </Card>

        <Stack
          direction="row"
          spacing={1.5}
          sx={{ width: '100%', justifyContent: 'flex-end' }}
        >
          <Button type="submit" variant="contained" loading={isSubmitting}>
            Save
          </Button>
          <Button variant="text" color="primary" onClick={() => navigate(backTo)}>
            Cancel
          </Button>
        </Stack>
      </form>
    </>
  )
}
