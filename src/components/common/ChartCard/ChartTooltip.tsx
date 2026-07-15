import { Box, Stack, Typography } from '@mui/material'
import { radius, shadows } from '@/theme/tokens'

interface ChartTooltipProps {
  active?: boolean
  label?: string
  payload?: { name: string; value: number | string; color?: string }[]
}

export function ChartTooltip({ active, label, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null

  return (
    <Box
      sx={{
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: `${radius.md}px`,
        boxShadow: shadows.dropdown,
        px: 1.75,
        py: 1.25,
        minWidth: 140,
      }}
    >
      {label && (
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
          {label}
        </Typography>
      )}
      <Stack spacing={0.5}>
        {payload.map((entry) => (
          <Stack key={entry.name} direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: entry.color ?? 'primary.main' }} />
              <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{entry.name}</Typography>
            </Stack>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.primary' }}>{entry.value}</Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  )
}
