import type { ReactNode } from 'react'
import { Card, CardContent, Stack, Typography } from '@mui/material'
import { InviteStepper } from '@/features/partnerInvite/components/InviteStepper'

interface InviteCardProps {
  step: number
  title: string
  subtitle?: ReactNode
  children: ReactNode
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

export function InviteCard({ step, title, subtitle, children, onSubmit }: InviteCardProps) {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0px 8px 24px rgba(16,24,40,0.08)' }}>
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Stack spacing={3.5}>
          <InviteStepper activeStep={step} />
          <Stack component="form" spacing={2.5} onSubmit={onSubmit}>
            <Stack spacing={0.75}>
              <Typography variant="h1" sx={{ fontSize: '1.375rem' }}>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {subtitle}
                </Typography>
              )}
            </Stack>
            {children}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}
