import type { ReactNode } from 'react'
import { Box, Grid, Typography } from '@mui/material'

export interface DetailField {
  label: string
  value: ReactNode
  labelColor?: string
}

interface DetailFieldGridProps {
  fields: DetailField[]
}

export function DetailFieldGrid({ fields }: DetailFieldGridProps) {
  const desktopColumns =
    fields.length === 1
      ? 12
      : fields.length === 2
        ? 6
        : fields.length === 3
          ? 4
          : 3

  return (
    <Grid container spacing={2.5}>
      {fields.map((field) => (
        <Grid
          key={field.label}
          size={{
            xs: 12,
            sm: fields.length <= 2 ? 6 : 4,
            md: desktopColumns,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: field.labelColor ?? 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {field.label}
          </Typography>

          <Box sx={{ mt: 0.5 }}>
            {typeof field.value === 'string' ||
            typeof field.value === 'number' ? (
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                }}
              >
                {field.value}
              </Typography>
            ) : (
              field.value
            )}
          </Box>
        </Grid>
      ))}
    </Grid>
  )
}
