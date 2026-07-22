import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Alert, Button } from '@mui/material'
import { FormField } from '@/components/common/FormField/FormField'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { useFirstLoginReset } from '@/features/auth/hooks/useFirstLoginReset'
import {
  firstLoginResetFormDefaults,
  firstLoginResetFormSchema,
  type FirstLoginResetFormValues,
} from '@/features/auth/firstLoginResetFormSchema'

export function FirstLoginResetPage() {
  const { resetPassword, pendingEmail, isLoading, error } = useFirstLoginReset()
  const { control, handleSubmit } = useForm<FirstLoginResetFormValues>({
    resolver: zodResolver(firstLoginResetFormSchema),
    defaultValues: firstLoginResetFormDefaults,
  })

  return (
    <AuthCard
      title="Set a new password"
      subtitle={
        pendingEmail
          ? `This is your first login as ${pendingEmail}. Please set a new password.`
          : 'Please set a new password to continue.'
      }
      onSubmit={handleSubmit((values) => resetPassword(values.newPassword))}
    >
      {error && <Alert severity="error">{error}</Alert>}

      <FormField name="newPassword" control={control} label="New Password" type="password" required autoFocus />
      <FormField name="confirmPassword" control={control} label="Confirm Password" type="password" required />

      <Button type="submit" variant="contained" size="large" loading={isLoading} sx={{ py: 1.25 }}>
        Reset Password
      </Button>
    </AuthCard>
  )
}
