import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Alert, Button } from '@mui/material'
import { FormField } from '@/components/common/FormField/FormField'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { useOtpService } from '@/features/auth/hooks/useOtpService'
import { otpFormDefaults, otpFormSchema, type OtpFormValues } from '@/features/auth/otpFormSchema'

export function OtpPage() {
  const { verifyOtp, pendingEmail, isLoading, error } = useOtpService()
  const { control, handleSubmit } = useForm<OtpFormValues>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: otpFormDefaults,
  })

  return (
    <AuthCard
      title="Verify OTP"
      subtitle={pendingEmail ? `Enter the code sent to ${pendingEmail}` : 'Enter the code sent to your email'}
      onSubmit={handleSubmit((values) => verifyOtp(values.otp))}
    >
      {error && <Alert severity="error">{error}</Alert>}

      <FormField
        name="otp"
        control={control}
        label="OTP"
        required
        autoFocus
        slotProps={{ htmlInput: { maxLength: 6, inputMode: 'numeric' } }}
      />

      <Button type="submit" variant="contained" size="large" loading={isLoading} sx={{ py: 1.25 }}>
        Verify
      </Button>
    </AuthCard>
  )
}
