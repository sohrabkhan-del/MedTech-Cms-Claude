import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { ShieldCheck, Pencil } from 'lucide-react'
import { FormField } from '@/components/common/FormField/FormField'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { Modal } from '@/components/common/Modal/Modal'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { RegionMultiSelectField } from '@/components/common/RegionMultiSelectField/RegionMultiSelectField'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useAppDispatch } from '@/app/store/hooks'
import { updateUser } from '@/features/auth/slices/authSlice'
import { authService } from '@/features/auth/services/authService'
import { useToast } from '@/contexts/ToastContext'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { fallbackRegions, getRegions } from '@/services/regionsService'
import type { RegionOption } from '@/contexts/RegionFilterContext'
import {
  createProfileFormSchema,
  type ProfileFormValues,
} from '@/features/settings/profileFormSchema'
import {
  changePasswordFormDefaults,
  changePasswordFormSchema,
  type ChangePasswordFormValues,
} from '@/features/settings/changePasswordFormSchema'

function formatRole(role: string) {
  return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function ProfileSettingsPage() {
  const { user } = useAuth()
  const dispatch = useAppDispatch()
  const toast = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [regions, setRegions] = useState<RegionOption[]>(fallbackRegions)
  const isSuperAdmin = user?.role === 'super_admin'

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: changePasswordFormDefaults,
  })

  function closePasswordModal() {
    setIsPasswordModalOpen(false)
    resetPasswordForm(changePasswordFormDefaults)
    setShowCurrentPassword(false)
    setShowNewPassword(false)
  }

  useEffect(() => {
    let ignore = false
    getRegions()
      .then((options) => {
        if (!ignore && options.length > 0) setRegions(options)
      })
      .catch((error) => {
        console.warn('[regions] failed to load regions, using fallback', error)
      })
    return () => {
      ignore = true
    }
  }, [])

  const { control, handleSubmit, reset } = useForm<ProfileFormValues>({
    resolver: zodResolver(createProfileFormSchema(!isSuperAdmin)),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      regionIds: user?.regions?.map((r) => r.id) ?? [],
    },
  })

  useEffect(() => {
    if (!user) return
    reset({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      email: user.email,
      phone: user.phone ?? '',
      regionIds: user.regions?.map((r) => r.id) ?? [],
    })
  }, [user, reset])

  if (!user) return null

  function startEditing() {
    if (!user) return
    reset({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      email: user.email,
      phone: user.phone ?? '',
      regionIds: user.regions?.map((r) => r.id) ?? [],
    })
    setIsEditing(true)
  }

  async function onSubmit(values: ProfileFormValues) {
    setIsSubmitting(true)
    try {
      const updated = await authService.updateOwnProfile(user!.id, values)
      dispatch(updateUser(updated))
      toast.success('Profile updated successfully.')
      setIsEditing(false)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update profile.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function onChangePassword(values: ChangePasswordFormValues) {
    setIsChangingPassword(true)
    try {
      await authService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      })
      toast.success('Password changed successfully.')
      closePasswordModal()
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to change password.'))
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <>
   
      <Stack spacing={3}>
        <SectionCard title="Profile">
          <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 96,
                height: 96,
                bgcolor: 'secondary.main',
                fontSize: 34,
                fontWeight: 700,
              }}
            >
              {user.avatarInitial}
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>
                {user.name}
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: 'text.secondary', mb: 1 }}
              >
                {user.email}
              </Typography>
              <Chip
                label={formatRole(user.role)}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Box>
          </Stack>
        </SectionCard>

        <SectionCard
          title="Personal Information"
          action={
            !isEditing && !isSuperAdmin ? (
              <Button
                variant="outlined"
                size="small"
                startIcon={<Pencil size={16} />}
                onClick={startEditing}
              >
                Edit
              </Button>
            ) : undefined
          }
        >
          {isEditing ? (
            <Stack
              component="form"
              spacing={2.5}
              onSubmit={handleSubmit(onSubmit)}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField
                    name="firstName"
                    control={control}
                    label="First Name"
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField
                    name="lastName"
                    control={control}
                    label="Last Name"
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField
                    name="email"
                    control={control}
                    type="email"
                    label="Email"
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormField
                    name="phone"
                    control={control}
                    label="Phone Number"
                    required
                    numeric
                    slotProps={{ htmlInput: { maxLength: 10 } }}
                  />
                </Grid>
                {!isSuperAdmin && (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        mb: 0.75,
                        display: 'block',
                      }}
                    >
                      Region Access *
                    </Typography>
                    <RegionMultiSelectField
                      name="regionIds"
                      control={control}
                      regions={regions}
                    />
                  </Grid>
                )}
              </Grid>

              <Stack direction="row" spacing={1.5}>
                <Button
                  type="submit"
                  variant="contained"
                  loading={isSubmitting}
                >
                  Save Changes
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  disabled={isSubmitting}
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          ) : (
            <Stack spacing={2.5}>
              <DetailFieldGrid
                fields={[
                  ...(isSuperAdmin
                    ? []
                    : [
                        {
                          label: 'Reference ID',
                          value: user.referenceId ?? '-',
                        },
                      ]),
                  { label: 'Full Name', value: user.name },
                  { label: 'Email', value: user.email },
                  { label: 'Phone Number', value: user.phone ?? '-' },
                  { label: 'Role', value: formatRole(user.role) },
                  {
                    label: 'Status',
                    value: user.status ? (
                      <Chip
                        size="small"
                        label={formatStatus(user.status)}
                        color={user.status === 'active' ? 'success' : 'default'}
                      />
                    ) : (
                      '-'
                    ),
                  },
                  {
                    label: 'Email Verified',
                    value: (
                      <Chip
                        size="small"
                        label={
                          user.isEmailVerified ? 'Verified' : 'Not Verified'
                        }
                        color={user.isEmailVerified ? 'success' : 'warning'}
                      />
                    ),
                  },
                  {
                    label: 'Phone Verified',
                    value: (
                      <Chip
                        size="small"
                        label={
                          user.isPhoneVerified ? 'Verified' : 'Not Verified'
                        }
                        color={user.isPhoneVerified ? 'success' : 'warning'}
                      />
                    ),
                  },
                ]}
              />

              {isSuperAdmin ? (
                <Alert
                  icon={<ShieldCheck size={20} />}
                  severity="info"
                  variant="outlined"
                  sx={{ alignItems: 'center' }}
                >
                  Super Admin has unrestricted access to all regions and
                  actions across the platform.
                </Alert>
              ) : (
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      mb: 1,
                      display: 'block',
                    }}
                  >
                    Region Access
                  </Typography>
                  {user.regions && user.regions.length > 0 ? (
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ flexWrap: 'wrap', gap: 1 }}
                    >
                      {user.regions.map((region) => (
                        <Chip
                          key={region.id}
                          label={region.name}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  ) : (
                    <TextField value="-" disabled fullWidth size="small" />
                  )}
                </Box>
              )}
            </Stack>
          )}
        </SectionCard>

        <SectionCard
          title="Change Password"
          action={
            <Button
              variant="outlined"
              size="small"
              onClick={() => setIsPasswordModalOpen(true)}
            >
              Change
            </Button>
          }
        >
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Update the password used to sign in to your account.
          </Typography>
        </SectionCard>
      </Stack>

      <Modal
        open={isPasswordModalOpen}
        onClose={closePasswordModal}
        title="Change Password"
        description="Enter your current password and choose a new one."
        primaryActionLabel="Change Password"
        onPrimaryAction={handlePasswordSubmit(onChangePassword)}
        secondaryActionLabel="Cancel"
        onSecondaryAction={closePasswordModal}
        loading={isChangingPassword}
      >
        <Stack
          component="form"
          spacing={2.5}
          onSubmit={handlePasswordSubmit(onChangePassword)}
          sx={{ pb: 1 }}
        >
          <FormField
            name="currentPassword"
            control={passwordControl}
            label="Current Password"
            type={showCurrentPassword ? 'text' : 'password'}
            required
            autoFocus
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={
                        showCurrentPassword ? 'Hide password' : 'Show password'
                      }
                      onClick={() => setShowCurrentPassword((prev) => !prev)}
                      edge="end"
                      size="small"
                    >
                      {showCurrentPassword ? (
                        <VisibilityOff fontSize="small" />
                      ) : (
                        <Visibility fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <FormField
            name="newPassword"
            control={passwordControl}
            label="New Password"
            type={showNewPassword ? 'text' : 'password'}
            required
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={
                        showNewPassword ? 'Hide password' : 'Show password'
                      }
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      edge="end"
                      size="small"
                    >
                      {showNewPassword ? (
                        <VisibilityOff fontSize="small" />
                      ) : (
                        <Visibility fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <FormField
            name="confirmPassword"
            control={passwordControl}
            label="Confirm New Password"
            type={showNewPassword ? 'text' : 'password'}
            required
          />
        </Stack>
      </Modal>
    </>
  )
}
