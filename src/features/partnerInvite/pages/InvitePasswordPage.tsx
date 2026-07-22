import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Navigate } from 'react-router-dom'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { Button, IconButton, InputAdornment, Stack, Typography } from '@mui/material'
import { Check } from 'lucide-react'
import { FormField } from '@/components/common/FormField/FormField'
import { InviteCard } from '@/features/partnerInvite/components/InviteCard'
import { usePartnerInvite } from '@/features/partnerInvite/PartnerInviteContext'
import { useInvitePasswordService } from '@/features/partnerInvite/hooks/useInvitePasswordService'
import {
  invitePasswordFormDefaults,
  invitePasswordFormSchema,
  type InvitePasswordFormValues,
} from '@/features/partnerInvite/invitePasswordFormSchema'

const passwordRules = [
  { test: (value: string) => value.length >= 8, label: 'At least 8 characters' },
  { test: (value: string) => /[A-Z]/.test(value), label: 'One uppercase letter' },
  { test: (value: string) => /[0-9]/.test(value), label: 'One number' },
]

export function InvitePasswordPage() {
  const { token, basicDetails } = usePartnerInvite()
  const { submitPassword, isLoading } = useInvitePasswordService()
  const { control, handleSubmit, watch } = useForm<InvitePasswordFormValues>({
    resolver: zodResolver(invitePasswordFormSchema),
    defaultValues: invitePasswordFormDefaults,
  })
  const [showPassword, setShowPassword] = useState(false)
  const password = watch('password')

  if (!basicDetails) {
    return <Navigate to={`/invite/${token}`} replace />
  }

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
    <InviteCard
      step={2}
      title="Set your password"
      subtitle={`Create a password for ${basicDetails.email}`}
      onSubmit={handleSubmit((values) => submitPassword(values.password))}
    >
      <FormField
        name="password"
        control={control}
        label="Password"
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

      <Stack spacing={0.5}>
        {passwordRules.map((rule) => {
          const met = rule.test(password ?? '')
          return (
            <Stack key={rule.label} direction="row" spacing={0.75} sx={{ alignItems: 'center', color: met ? 'success.main' : 'text.disabled' }}>
              <Check size={14} />
              <Typography variant="caption" sx={{ color: 'inherit' }}>
                {rule.label}
              </Typography>
            </Stack>
          )
        })}
      </Stack>

      <Button type="submit" variant="contained" size="large" loading={isLoading} sx={{ py: 1.25 }}>
        Continue
      </Button>
    </InviteCard>
  )
}
