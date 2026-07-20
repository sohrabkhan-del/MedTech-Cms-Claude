import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Alert, Button, Card, CardContent, Stack, Typography } from '@mui/material'
import { FormField } from '@/components/common/FormField/FormField'
import { useOtpService } from '@/features/auth/hooks/useOtpService'
import { otpFormDefaults, otpFormSchema, type OtpFormValues } from '@/features/auth/otpFormSchema'

export function OtpPage() {
  const { verifyOtp, pendingEmail, isLoading, error } = useOtpService()
  const { control, handleSubmit } = useForm<OtpFormValues>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: otpFormDefaults,
  })

  return (
    <Card>
      <CardContent>
        <Stack
          component="form"
          spacing={2.5}
          sx={{ p: 1 }}
          onSubmit={handleSubmit((values) => verifyOtp(values.otp))}
        >
          <Typography variant="h2" sx={{ textAlign: 'center' }}>
            Verify OTP
          </Typography>
          <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
            {pendingEmail ? `Enter the code sent to ${pendingEmail}` : 'Enter the code sent to your email'}
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          <FormField
            name="otp"
            control={control}
            label="OTP"
            required
            slotProps={{ htmlInput: { maxLength: 6, inputMode: 'numeric' } }}
          />

          <Button type="submit" variant="contained" size="large" loading={isLoading}>
            Verify
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}
