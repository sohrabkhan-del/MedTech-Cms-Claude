import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link as RouterLink } from 'react-router-dom'
import { ArrowBack } from '@mui/icons-material'
import { Alert, Button, Link, Stack } from '@mui/material'
import { FormField } from '@/components/common/FormField/FormField'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { useForgotPasswordService } from '@/features/auth/hooks/useForgotPasswordService'
import {
  forgotPasswordFormDefaults,
  forgotPasswordFormSchema,
  type ForgotPasswordFormValues,
} from '@/features/auth/forgotPasswordFormSchema'

export function ForgotPasswordPage() {
  const { requestReset, isLoading, error } = useForgotPasswordService()
  const { control, handleSubmit } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: forgotPasswordFormDefaults,
  })

  return (
    <AuthCard
      title="Forgot password?"
      subtitle="Enter the email linked to your account and we'll send you a verification code to reset your password."
      onSubmit={handleSubmit((values) => requestReset(values.email))}
    >
      {error && <Alert severity="error">{error}</Alert>}

      <FormField name="email" control={control} label="Email" type="email" required autoFocus />

      <Button type="submit" variant="contained" size="large" loading={isLoading} sx={{ py: 1.25 }}>
        Send reset code
      </Button>

      <Stack direction="row" sx={{ justifyContent: 'center' }}>
        <Link
          component={RouterLink}
          to="/login"
          variant="body2"
          underline="hover"
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontWeight: 500 }}
        >
          <ArrowBack sx={{ fontSize: 16 }} />
          Back to sign in
        </Link>
      </Stack>
    </AuthCard>
  )
}
