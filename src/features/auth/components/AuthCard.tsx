import type { ReactNode } from 'react'
import { Box, Card, CardContent, Stack, Typography } from '@mui/material'

interface AuthCardProps {
  title: string
  subtitle?: ReactNode
  children: ReactNode
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

export function AuthCard({ title, subtitle, children, onSubmit }: AuthCardProps) {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0px 8px 24px rgba(16,24,40,0.08)' }}>
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Stack component="form" spacing={2.5} onSubmit={onSubmit}>
          <Stack spacing={2} sx={{ alignItems: 'center' }}>
            <Box component="img" src="/images/logo/logo.png" alt="MedTech" sx={{ height: 48, width: 'auto' }} />
            <Stack spacing={0.75} sx={{ alignItems: 'center', textAlign: 'center' }}>
              <Typography variant="h1" sx={{ fontSize: '1.375rem' }}>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {subtitle}
                </Typography>
              )}
            </Stack>
          </Stack>
          {children}
        </Stack>
      </CardContent>
    </Card>
  )
}
