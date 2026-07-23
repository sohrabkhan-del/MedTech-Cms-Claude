import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Alert, Button, Link, Stack, TextField, Typography } from '@mui/material'
import { FormField } from '@/components/common/FormField/FormField'
import { InviteCard } from '@/features/partnerInvite/components/InviteCard'
import { usePartnerInvite } from '@/features/partnerInvite/PartnerInviteContext'
import { useInviteDetailsService } from '@/features/partnerInvite/hooks/useInviteDetailsService'
import {
  inviteDetailsFormDefaults,
  inviteOtpFormDefaults,
  inviteOtpFormSchema,
  type InviteOtpFormValues,
} from '@/features/partnerInvite/inviteDetailsFormSchema'

const OTP_RESEND_SECONDS = 30

export function InviteDetailsPage() {
  const { invitee } = usePartnerInvite()
  const { pendingDetails, sendOtp, resendOtp, verifyOtp, isLoading, error } = useInviteDetailsService()
  const { control, handleSubmit } = useForm<InviteOtpFormValues>({
    resolver: zodResolver(inviteOtpFormSchema),
    defaultValues: inviteOtpFormDefaults,
  })
  const [secondsLeft, setSecondsLeft] = useState(OTP_RESEND_SECONDS)
  const otpTriggered = useRef(false)

  useEffect(() => {
    if (!invitee || otpTriggered.current) return
    otpTriggered.current = true
    sendOtp(invitee)
  }, [invitee, sendOtp])

  useEffect(() => {
    if (!pendingDetails || secondsLeft <= 0) return
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearInterval(timer)
  }, [pendingDetails, secondsLeft])

  function handleResend() {
    resendOtp()
    setSecondsLeft(OTP_RESEND_SECONDS)
  }

  const details = invitee ?? inviteDetailsFormDefaults

  return (
    <InviteCard
      step={1}
      title="Welcome to MedTech CMS"
      subtitle={
        pendingDetails
          ? `Enter the 6-digit code sent to ${pendingDetails.email}`
          : "Let's get your partner account set up."
      }
      onSubmit={handleSubmit((values) => verifyOtp(values.otp))}
    >
      {error && <Alert severity="error">{error}</Alert>}

      <TextField label="Full Name" value={details.name} disabled fullWidth size="small" />
      <TextField label="Email" type="email" value={details.email} disabled fullWidth size="small" />
      <TextField label="Phone Number" value={details.phone} disabled fullWidth size="small" />

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

      <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Didn't receive the code?
        </Typography>
        {secondsLeft > 0 ? (
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Resend OTP in {secondsLeft}s
          </Typography>
        ) : (
          <Link component="button" type="button" variant="body2" underline="hover" onClick={handleResend} sx={{ fontWeight: 500 }}>
            Resend OTP
          </Link>
        )}
      </Stack>
    </InviteCard>
  )
}
