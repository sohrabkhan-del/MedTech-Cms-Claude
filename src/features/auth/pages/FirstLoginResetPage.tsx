import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Alert, Button, Card, CardContent, Stack, Typography } from '@mui/material'
import { FormField } from '@/components/common/FormField/FormField'
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
    <Card>
      <CardContent>
        <Stack
          component="form"
          spacing={2.5}
          sx={{ p: 1 }}
          onSubmit={handleSubmit((values) => resetPassword(values.newPassword))}
        >
          <Typography variant="h2" sx={{ textAlign: 'center' }}>
            Set a New Password
          </Typography>
          <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
            {pendingEmail
              ? `This is your first login as ${pendingEmail}. Please set a new password.`
              : 'Please set a new password to continue.'}
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          <FormField name="newPassword" control={control} label="New Password" type="password" required />
          <FormField name="confirmPassword" control={control} label="Confirm Password" type="password" required />

          <Button type="submit" variant="contained" size="large" loading={isLoading}>
            Reset Password
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}
