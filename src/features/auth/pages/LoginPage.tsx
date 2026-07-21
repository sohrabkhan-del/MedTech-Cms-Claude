import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import {
  Alert,
  Button,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  Stack,
  Typography,
} from '@mui/material'
import { FormField } from '@/components/common/FormField/FormField'
import { useLoginService } from '@/features/auth/hooks/useLoginService'
import {
  loginFormDefaults,
  loginFormSchema,
  type LoginFormValues,
} from '@/features/auth/loginFormSchema'

export function LoginPage() {
  const { login, isLoading, error } = useLoginService()
  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: loginFormDefaults,
  })
  const [showPassword, setShowPassword] = useState(false)

  return (
    <Card>
      <CardContent>
        <Stack
          component="form"
          spacing={2.5}
          sx={{ p: 1 }}
          onSubmit={handleSubmit((values) => login(values))}
        >
          <Typography variant="h2" sx={{ textAlign: 'center' }}>
            Sign in to MedTech CMS
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          <FormField
            name="email"
            control={control}
            label="Email"
            type="email"
            required
          />
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
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            loading={isLoading}
          >
            Sign in
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}
