import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { Alert, Box, Button, IconButton, InputAdornment, Link, Stack } from '@mui/material'
import { FormField } from '@/components/common/FormField/FormField'
import { AuthCard } from '@/features/auth/components/AuthCard'
import { useLoginService } from '@/features/auth/hooks/useLoginService'
import {
  loginFormDefaults,
  loginFormSchema,
  type LoginFormValues,
} from '@/features/auth/loginFormSchema'

export function LoginPage() {
  const { login, isLoading, error } = useLoginService()
  const location = useLocation()
  const passwordResetSuccess = Boolean((location.state as { passwordResetSuccess?: boolean } | null)?.passwordResetSuccess)
  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: loginFormDefaults,
  })
  const [showPassword, setShowPassword] = useState(false)

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your MedTech CMS account"
      onSubmit={handleSubmit((values) => login(values))}
    >
      {passwordResetSuccess && (
        <Alert severity="success">Your password has been reset. Please sign in.</Alert>
      )}
      {error && <Alert severity="error">{error}</Alert>}

      <FormField name="email" control={control} label="Email" type="email" required autoFocus />
      <Box>
        <FormField
          name="password"
          control={control}
          label="Password"
          type={showPassword ? 'text' : 'password'}
          required
          slotProps={{
            input: {
              endAdornment: (
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
              ),
            },
          }}
        />
        <Stack direction="row" sx={{ justifyContent: 'flex-end', mt: 0.75 }}>
          <Link component={RouterLink} to="/forgot-password" variant="body2" underline="hover" sx={{ fontWeight: 500 }}>
            Forgot password?
          </Link>
        </Stack>
      </Box>

      <Button type="submit" variant="contained" size="large" loading={isLoading} sx={{ py: 1.25 }}>
        Sign in
      </Button>
    </AuthCard>
  )
}
