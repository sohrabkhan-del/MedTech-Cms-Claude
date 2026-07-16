import { Card, CardContent, Stack, Typography } from '@mui/material'
import { Construction } from 'lucide-react'

interface PlaceholderPageProps {
  title: string
  pending?: boolean
}

export function PlaceholderPage({ title, pending }: PlaceholderPageProps) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={1.5} sx={{ alignItems: 'flex-start', py: 6, px: 2, color: 'text.disabled' }}>
          <Construction size={40} />
          <Typography variant="h2">{title}</Typography>
          <Typography variant="body1" color="text.secondary">
            {pending
              ? 'Field-level requirements for this screen are pending from the product owner. This route is scaffolded and ready to be built out.'
              : 'This module will be implemented in a later phase.'}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  )
}
