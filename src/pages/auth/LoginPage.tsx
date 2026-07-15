import { useNavigate } from 'react-router-dom'
import { Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material'

export function LoginPage() {
  const navigate = useNavigate()

  return (
    <Card>
      <CardContent>
        <Stack spacing={2.5} sx={{ p: 1 }}>
          <Typography variant="h2" sx={{ textAlign: 'center' }}>
            Sign in to MedTech CMS
          </Typography>
          <TextField label="Email" type="email" fullWidth size="small" />
          <TextField label="Password" type="password" fullWidth size="small" />
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/dashboard')}
          >
            Sign in
          </Button>
          <Typography variant="caption" sx={{ textAlign: 'center' }}>
            Authentication wiring (RTK Query + interceptors) lands in Phase 4.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  )
}
