import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { Alert, Button, IconButton, InputAdornment } from '@mui/material'
import { FormField } from '@/components/common/FormField/FormField'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { useResetPasswordService } from '@/features/auth/hooks/useResetPasswordService'
import {
  resetPasswordFormDefaults,
  resetPasswordFormSchema,
  type ResetPasswordFormValues,
} from '@/features/auth/resetPasswordFormSchema'

export function ResetPasswordPage() {
  const { resetPassword, passwordResetEmail, isLoading, error } = useResetPasswordService()
  const { control, handleSubmit } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: resetPasswordFormDefaults,
  })
  const [showPassword, setShowPassword] = useState(false)

  const visibilityAdornment = (
    <InputAdornment position="end">
      <IconButton
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        onClick={() => setShowPassword((prev) => !prev)}
        edge="end"
        size="small"
      >
        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
      </IconButton>
    </InputAdornment>
  )

  return (
    <AuthCard
      title="Set a new password"
      subtitle={
        passwordResetEmail
          ? `Create a new password for ${passwordResetEmail}`
          : 'Create a new password for your account'
      }
      onSubmit={handleSubmit((values) => resetPassword(values.newPassword))}
    >
      {error && <Alert severity="error">{error}</Alert>}

      <FormField
        name="newPassword"
        control={control}
        label="New password"
        type={showPassword ? 'text' : 'password'}
        required
        autoFocus
        slotProps={{ input: { endAdornment: visibilityAdornment } }}
      />
      <FormField
        name="confirmPassword"
        control={control}
        label="Confirm password"
        type={showPassword ? 'text' : 'password'}
        required
        slotProps={{ input: { endAdornment: visibilityAdornment } }}
      />

      <Button type="submit" variant="contained" size="large" loading={isLoading} sx={{ py: 1.25 }}>
        Reset password
      </Button>
    </AuthCard>
  )
}
