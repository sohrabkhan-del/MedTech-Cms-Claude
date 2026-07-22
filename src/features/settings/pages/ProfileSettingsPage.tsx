import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Alert, Box, Button, Chip, Grid, Stack, TextField, Typography } from '@mui/material'
import { UserCircle } from 'lucide-react'
import { FormField } from '@/components/common/FormField/FormField'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { AvatarUpload } from '@/components/common/AvatarUpload/AvatarUpload'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useAppDispatch } from '@/app/store/hooks'
import { updateUser } from '@/features/auth/slices/authSlice'
import {
  profileFormSchema,
  type ProfileFormValues,
} from '@/features/settings/profileFormSchema'

function formatRole(role: string) {
  return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function ProfileSettingsPage() {
  const { user } = useAuth()
  const dispatch = useAppDispatch()
  const [saved, setSaved] = useState(false)

  const { control, handleSubmit, formState } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name ?? '',
      phone: user?.phone ?? '',
      designation: user?.designation ?? '',
      department: user?.department ?? '',
      location: user?.location ?? '',
    },
  })

  if (!user) return null

  function onSubmit(values: ProfileFormValues) {
    dispatch(updateUser(values))
    setSaved(true)
  }

  function handleAvatarChange(dataUrl: string) {
    dispatch(updateUser({ avatarUrl: dataUrl }))
  }

  return (
    <>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'primary.light',
            color: 'primary.main',
          }}
        >
          <UserCircle size={20} />
        </Box>
        <Box>
          <Typography variant="h1">Profile</Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Manage your personal information and profile photo.
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Profile Photo">
          <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
            <AvatarUpload
              imageUrl={user.avatarUrl}
              fallbackText={user.avatarInitial}
              onChange={handleAvatarChange}
            />
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>{user.name}</Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1 }}>
                {user.email}
              </Typography>
              <Chip label={formatRole(user.role)} size="small" color="primary" variant="outlined" />
            </Box>
          </Stack>
        </SectionCard>

        <SectionCard title="Personal Information">
          <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)}>
            {saved && <Alert severity="success">Profile updated successfully.</Alert>}

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormField name="name" control={control} label="Full Name" required />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Email" value={user.email} disabled fullWidth size="small" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormField name="phone" control={control} label="Phone Number" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Role" value={formatRole(user.role)} disabled fullWidth size="small" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormField name="designation" control={control} label="Designation" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormField name="department" control={control} label="Department" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormField name="location" control={control} label="Location" />
              </Grid>
              {user.joinedOn && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Joined On"
                    value={new Date(user.joinedOn).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                    disabled
                    fullWidth
                    size="small"
                  />
                </Grid>
              )}
            </Grid>

            <Box>
              <Button type="submit" variant="contained" loading={formState.isSubmitting}>
                Save Changes
              </Button>
            </Box>
          </Stack>
        </SectionCard>
      </Stack>
    </>
  )
}
