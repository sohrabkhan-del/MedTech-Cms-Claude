import type { Control } from 'react-hook-form'
import { Card, Grid, Typography } from '@mui/material'
import { FormField } from '@/components/common/FormField/FormField'
import type { GeoFenceFormValues } from '@/features/fieldOperations/types/fieldOperations.types'

const sectionTitleSx = {
  fontWeight: 700,
  fontSize: '0.75rem',
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  color: 'primary.main',
  mb: 2.5,
}

const fieldLabelProps = {
  slotProps: {
    inputLabel: { shrink: false, sx: { display: 'none' } },
  },
} as const

function FieldLabel({ children, required }: { children: string; required?: boolean }) {
  return (
    <Typography
      sx={{
        fontWeight: 700,
        fontSize: '0.6875rem',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color: 'primary.main',
        mb: 0.75,
      }}
    >
      {children}
      {required ? ' *' : ''}
    </Typography>
  )
}

interface GeoFenceFormProps {
  control: Control<GeoFenceFormValues>
}

export function GeoFenceForm({ control }: GeoFenceFormProps) {
  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Typography sx={sectionTitleSx}>Location Configuration</Typography>
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FieldLabel required>Radius (meters)</FieldLabel>
          <FormField
            name="radiusMeters"
            control={control}
            type="number"
            placeholder="e.g. 150"
            {...fieldLabelProps}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FieldLabel required>Buffer Distance (meters)</FieldLabel>
          <FormField
            name="bufferDistanceMeters"
            control={control}
            type="number"
            placeholder="e.g. 50"
            {...fieldLabelProps}
          />
        </Grid>
      </Grid>
    </Card>
  )
}
