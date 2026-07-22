import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link as RouterLink } from 'react-router-dom'
import { ArrowBack } from '@mui/icons-material'
import { Alert, Button, Link, Stack } from '@mui/material'
import { FormField } from '@/components/common/FormField/FormField'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { useResetOtpService } from '@/features/auth/hooks/useResetOtpService'
import {
  resetOtpFormDefaults,
  resetOtpFormSchema,
  type ResetOtpFormValues,
} from '@/features/auth/resetOtpFormSchema'

export function ResetOtpPage() {
  const { verifyResetOtp, passwordResetEmail, isLoading, error } = useResetOtpService()
  const { control, handleSubmit } = useForm<ResetOtpFormValues>({
    resolver: zodResolver(resetOtpFormSchema),
    defaultValues: resetOtpFormDefaults,
  })

  return (
    <AuthCard
      title="Enter verification code"
      subtitle={
        passwordResetEmail
          ? `We sent a 6-digit code to ${passwordResetEmail}`
          : 'Enter the 6-digit code sent to your email'
      }
      onSubmit={handleSubmit((values) => verifyResetOtp(values.otp))}
    >
      {error && <Alert severity="error">{error}</Alert>}

      <FormField
        name="otp"
        control={control}
        label="Verification code"
        required
        autoFocus
        slotProps={{ htmlInput: { maxLength: 6, inputMode: 'numeric' } }}
      />

      <Button type="submit" variant="contained" size="large" loading={isLoading} sx={{ py: 1.25 }}>
        Verify code
      </Button>

      <Stack direction="row" sx={{ justifyContent: 'center' }}>
        <Link
          component={RouterLink}
          to="/forgot-password"
          variant="body2"
          underline="hover"
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontWeight: 500 }}
        >
          <ArrowBack sx={{ fontSize: 16 }} />
          Use a different email
        </Link>
      </Stack>
    </AuthCard>
  )
}
