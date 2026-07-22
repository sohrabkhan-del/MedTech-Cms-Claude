import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Alert, Button, Link, Stack, Typography } from '@mui/material'
import { FormField } from '@/components/common/FormField/FormField'
import { InviteCard } from '@/features/partnerInvite/components/InviteCard'
import { useInviteDetailsService } from '@/features/partnerInvite/hooks/useInviteDetailsService'
import {
  inviteDetailsFormDefaults,
  inviteDetailsFormSchema,
  inviteOtpFormDefaults,
  inviteOtpFormSchema,
  type InviteDetailsFormValues,
  type InviteOtpFormValues,
} from '@/features/partnerInvite/inviteDetailsFormSchema'

interface OtpStepProps {
  pendingEmail: string | undefined
  verifyOtp: (otp: string) => void
  editDetails: () => void
  isLoading: boolean
  error: string | null
}

function OtpStep({ pendingEmail, verifyOtp, editDetails, isLoading, error }: OtpStepProps) {
  const { control, handleSubmit } = useForm<InviteOtpFormValues>({
    resolver: zodResolver(inviteOtpFormSchema),
    defaultValues: inviteOtpFormDefaults,
  })

  return (
    <InviteCard
      step={1}
      title="Verify your email"
      subtitle={pendingEmail ? `Enter the 6-digit code sent to ${pendingEmail}` : 'Enter the 6-digit code sent to your email'}
      onSubmit={handleSubmit((values) => verifyOtp(values.otp))}
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
        Verify & Continue
      </Button>

      <Stack direction="row" sx={{ justifyContent: 'center' }}>
        <Link component="button" type="button" variant="body2" underline="hover" onClick={editDetails} sx={{ fontWeight: 500 }}>
          Change email or phone number
        </Link>
      </Stack>
    </InviteCard>
  )
}

interface DetailsStepProps {
  sendOtp: (values: InviteDetailsFormValues) => void
  isLoading: boolean
  error: string | null
}

function DetailsStep({ sendOtp, isLoading, error }: DetailsStepProps) {
  const { control, handleSubmit } = useForm<InviteDetailsFormValues>({
    resolver: zodResolver(inviteDetailsFormSchema),
    defaultValues: inviteDetailsFormDefaults,
  })

  return (
    <InviteCard
      step={1}
      title="Welcome to MedTech CMS"
      subtitle="Let's get your partner account set up. Start with your basic details."
      onSubmit={handleSubmit((values) => sendOtp(values))}
    >
      {error && <Alert severity="error">{error}</Alert>}

      <FormField name="name" control={control} label="Full Name" required autoFocus />
      <FormField name="email" control={control} label="Email" type="email" required />
      <FormField name="phone" control={control} label="Phone Number" required />

      <Button type="submit" variant="contained" size="large" loading={isLoading} sx={{ py: 1.25 }}>
        Send OTP
      </Button>

      <Typography variant="caption" sx={{ color: 'text.disabled', textAlign: 'center' }}>
        We'll send a one-time verification code to confirm your email.
      </Typography>
    </InviteCard>
  )
}

export function InviteDetailsPage() {
  const { phase, pendingDetails, sendOtp, verifyOtp, editDetails, isLoading, error } = useInviteDetailsService()

  if (phase === 'otp') {
    return (
      <OtpStep
        pendingEmail={pendingDetails?.email}
        verifyOtp={verifyOtp}
        editDetails={editDetails}
        isLoading={isLoading}
        error={error}
      />
    )
  }

  return <DetailsStep sendOtp={sendOtp} isLoading={isLoading} error={error} />
}
