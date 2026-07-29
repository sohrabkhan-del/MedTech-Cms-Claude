import { useFieldArray, type Control } from 'react-hook-form'
import { Box, Button, Card, Grid, IconButton, MenuItem, Stack, Tooltip, Typography } from '@mui/material'
import { MapPin as PlaceOutlinedIcon, Plus, Trash2 } from 'lucide-react'
import { FormField } from '@/components/common/FormField/FormField'
import { radius } from '@/theme/tokens'
import type { DealerFormValues } from '@/features/userManagement/types/userManagement.types'

const zones: DealerFormValues['zone'][] = ['North', 'South', 'East', 'West']

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

interface DealerFormProps {
  control: Control<DealerFormValues>
  mrOptions: string[]
}

export function DealerForm({ control, mrOptions }: DealerFormProps) {
  const { fields, append, remove } = useFieldArray({ control, name: 'locations' })

  return (
    <>
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography sx={sectionTitleSx}>Basic Details</Typography>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FieldLabel required>Dealer / Shop Name</FieldLabel>
            <FormField name="shopName" control={control} placeholder="e.g. Shree Pharma Agency" {...fieldLabelProps} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FieldLabel required>Owner Name</FieldLabel>
            <FormField name="ownerName" control={control} placeholder="Full name" {...fieldLabelProps} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FieldLabel required>Contact Number</FieldLabel>
            <FormField name="phone" control={control} placeholder="98xxx xxxxx" {...fieldLabelProps} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FieldLabel required>Email</FieldLabel>
            <FormField name="email" control={control} type="email" placeholder="name@example.com" {...fieldLabelProps} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FieldLabel required>City</FieldLabel>
            <FormField name="city" control={control} placeholder="e.g. Mumbai" {...fieldLabelProps} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FieldLabel required>Region</FieldLabel>
            <FormField name="zone" control={control} select {...fieldLabelProps}>
              {zones.map((zone) => (
                <MenuItem key={zone} value={zone}>
                  {zone}
                </MenuItem>
              ))}
            </FormField>
          </Grid>
          <Grid size={12}>
            <FieldLabel required>GSTN Number</FieldLabel>
            <FormField name="licenseNumber" control={control} placeholder="e.g. 22AAAAA0000A1Z5" {...fieldLabelProps} />
          </Grid>
        </Grid>
      </Card>

      <Card sx={{ p: 3, mb: 3 }}>
        <Typography sx={sectionTitleSx}>Geo-tagging &amp; Scanning Range</Typography>
        <Stack spacing={2.5}>
          {fields.map((field, index) => (
            <Box
              key={field.id}
              sx={{
                p: 2,
                borderRadius: `${radius.lg}px`,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>
                  Godown Location {index + 1}
                </Typography>
                {fields.length > 1 && (
                  <Tooltip title="Remove location">
                    <IconButton size="small" color="error" onClick={() => remove(index)} aria-label="Remove location">
                      <Trash2 size={18} />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
              <Grid container spacing={2.5}>
                <Grid size={12}>
                  <FieldLabel required>Godown Address</FieldLabel>
                  <FormField
                    name={`locations.${index}.address`}
                    control={control}
                    placeholder="Full address including landmark"
                    multiline
                    minRows={2}
                    {...fieldLabelProps}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 5 }}>
                  <FieldLabel>Latitude</FieldLabel>
                  <FormField name={`locations.${index}.latitude`} control={control} placeholder="e.g. 19.0760" {...fieldLabelProps} />
                </Grid>
                <Grid size={{ xs: 12, sm: 5 }}>
                  <FieldLabel>Longitude</FieldLabel>
                  <FormField name={`locations.${index}.longitude`} control={control} placeholder="e.g. 72.8777" {...fieldLabelProps} />
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }} sx={{ display: 'flex', alignItems: 'flex-end' }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<PlaceOutlinedIcon size={20} />}
                    sx={{ height: 40, fontSize: '0.75rem' }}
                    onClick={() => {}}
                  >
                    Open in Maps
                  </Button>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel>Scan Radius</FieldLabel>
                  <FormField name={`locations.${index}.scanRadius`} control={control} placeholder="e.g. 200" {...fieldLabelProps} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel>Buffer Radius (in meters)</FieldLabel>
                  <FormField name={`locations.${index}.bufferRadius`} control={control} placeholder="e.g. 50" {...fieldLabelProps} />
                </Grid>
              </Grid>
            </Box>
          ))}
          <Button
            variant="outlined"
            startIcon={<Plus size={18} />}
            sx={{ alignSelf: 'flex-start', fontSize: '0.75rem' }}
            onClick={() => append({ address: '', latitude: '', longitude: '', scanRadius: '', bufferRadius: '' })}
          >
            Add Another Location
          </Button>
        </Stack>
      </Card>

      <Card sx={{ p: 3, mb: 3 }}>
        <Typography sx={sectionTitleSx}>Assignment</Typography>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldLabel>Assign to MR</FieldLabel>
            <FormField name="assignedMr" control={control} select {...fieldLabelProps}>
              <MenuItem value="">
                <em>Select an MR</em>
              </MenuItem>
              {mrOptions.map((mr) => (
                <MenuItem key={mr} value={mr}>
                  {mr}
                </MenuItem>
              ))}
            </FormField>
          </Grid>
          <Grid size={12}>
            <FieldLabel>Notes</FieldLabel>
            <FormField name="notes" control={control} multiline minRows={3} {...fieldLabelProps} />
          </Grid>
        </Grid>
      </Card>
    </>
  )
}
