import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button, Card, Grid, Stack, Typography } from '@mui/material'
import { FormField } from '@/components/common/FormField/FormField'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { RegionMultiSelectField } from '@/components/common/RegionMultiSelectField/RegionMultiSelectField'
import { useAdminForm } from '@/features/systemUsers/hooks/useAdminForm'
import { adminFormDefaults, adminFormSchema, type AdminFormValues } from '@/features/systemUsers/types/systemUsers.types'

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

export function AdminFormPage() {
  const navigate = useNavigate()
  const { adminId } = useParams<{ adminId: string }>()
  const { isEdit, admin, regions, isLoading, isSubmitting, submit } = useAdminForm(adminId)

  const { control, handleSubmit, reset } = useForm<AdminFormValues>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: adminFormDefaults,
  })

  useEffect(() => {
    if (!admin) return
    reset({
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      phone: admin.phone,
      regionIds: admin.regionIds,
    })
  }, [admin, reset])

  if (isEdit && !isLoading && !admin) {
    return (
      <EmptyState
        title="Admin not found"
        description="This administrator account may have been removed."
        actionLabel="Back to Admin List"
        onAction={() => navigate('/system-users/admin')}
      />
    )
  }

  const backTo = isEdit ? `/system-users/admin/${adminId}` : '/system-users/admin'

  const onSubmit = handleSubmit(async (values) => {
    const success = await submit(values)
    if (success) navigate(backTo)
  })

  return (
    <>
      <Stack sx={{ mb: 3, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h1">{isEdit ? 'Edit Admin' : 'Create Admin'}</Typography>
      </Stack>

      <form onSubmit={onSubmit} noValidate>
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={sectionTitleSx}>Admin Information</Typography>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>First Name</FieldLabel>
              <FormField name="firstName" control={control} placeholder="First name" {...fieldLabelProps} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Last Name</FieldLabel>
              <FormField name="lastName" control={control} placeholder="Last name" {...fieldLabelProps} />
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
              <RegionMultiSelectField name="regionIds" control={control} regions={regions} />
            </Grid>
          </Grid>
        </Card>

        <Stack
          direction="row"
          spacing={1.5}
          sx={{ width: '100%', justifyContent: 'flex-end' }}
        >
          <Button type="submit" variant="contained" loading={isSubmitting}>
            {isEdit ? 'Save Admin' : 'Save Admin'}
          </Button>
          <Button variant="outlined" color="primary" onClick={() => navigate(backTo)}>
            Cancel
          </Button>
        </Stack>
      </form>
    </>
  )
}
