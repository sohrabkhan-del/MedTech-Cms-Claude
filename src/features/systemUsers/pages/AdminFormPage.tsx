import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import {
  Box,
  Button,
  Card,
  Checkbox,
  FormControlLabel,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
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
  const { isEdit, admin, modules, regions, isLoading, isSubmitting, submit } = useAdminForm(adminId)

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
      modulePermissions: admin.modulePermissions,
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

  if (isEdit && isLoading) {
    return (
      <>
        <Stack sx={{ mb: 3, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h1">Edit Admin</Typography>
        </Stack>

        <Card sx={{ p: 3, mb: 3 }}>
          <Skeleton variant="text" width="25%" height={22} sx={{ mb: 2.5 }} />
          <Grid container spacing={2.5}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6 }}>
                <Skeleton variant="text" width="35%" height={16} sx={{ mb: 0.75 }} />
                <Skeleton variant="rounded" height={40} sx={{ borderRadius: '8px' }} />
              </Grid>
            ))}
          </Grid>
        </Card>

        <Stack direction="row" spacing={1.5} sx={{ width: '100%', justifyContent: 'flex-end' }}>
          <Skeleton variant="rounded" width={110} height={36} sx={{ borderRadius: '8px' }} />
          <Skeleton variant="rounded" width={90} height={36} sx={{ borderRadius: '8px' }} />
        </Stack>
      </>
    )
  }

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
              <FormField
                name="phone"
                control={control}
                placeholder="98xxx xxxxx"
                numeric
                {...fieldLabelProps}
                slotProps={{
                  ...fieldLabelProps.slotProps,
                  htmlInput: { maxLength: 10 },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Region</FieldLabel>
              <RegionMultiSelectField name="regionIds" control={control} regions={regions} />
            </Grid>
          </Grid>
        </Card>

        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={sectionTitleSx}>Module Access</Typography>
          <Controller
            name="modulePermissions"
            control={control}
            render={({ field, fieldState }) => (
              <Stack spacing={1.25}>
                <Grid container spacing={1.5}>
                  {modules.map((module) => {
                    const checked = field.value.includes(module.code)
                    return (
                      <Grid key={module.code} size={{ xs: 12, sm: 6, lg: 4 }}>
                        <Box
                          sx={{
                            height: '100%',
                            border: '1px solid',
                            borderColor: checked ? 'primary.main' : 'divider',
                            borderRadius: '8px',
                            px: 1.5,
                            py: 1.25,
                            backgroundColor: checked ? 'primary.light' : 'background.paper',
                          }}
                        >
                          <FormControlLabel
                            sx={{ alignItems: 'flex-start', m: 0 }}
                            control={
                              <Checkbox
                                checked={checked}
                                onChange={(event) => {
                                  const nextValue = event.target.checked
                                    ? [...field.value, module.code]
                                    : field.value.filter((code) => code !== module.code)
                                  field.onChange(nextValue)
                                }}
                              />
                            }
                            label={
                              <Box sx={{ pt: 0.75 }}>
                                <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
                                  {module.name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
                                  {module.description}
                                </Typography>
                              </Box>
                            }
                          />
                        </Box>
                      </Grid>
                    )
                  })}
                </Grid>
                {fieldState.error ? (
                  <Typography variant="caption" sx={{ color: 'error.main' }}>
                    {fieldState.error.message}
                  </Typography>
                ) : null}
              </Stack>
            )}
          />
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
