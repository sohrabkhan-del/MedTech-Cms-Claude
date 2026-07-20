import type { Control } from 'react-hook-form'
import { Button, Card, Chip, Grid, MenuItem, Stack, Typography } from '@mui/material'
import { MapPin as PlaceOutlinedIcon, Map as MapOutlinedIcon } from 'lucide-react'
import { FormField } from '@/components/common/FormField/FormField'
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
            <FieldLabel required>License Number</FieldLabel>
            <FormField name="licenseNumber" control={control} placeholder="e.g. DL-2026001" {...fieldLabelProps} />
          </Grid>
        </Grid>
      </Card>

      <Card sx={{ p: 3, mb: 3 }}>
        <Typography sx={sectionTitleSx}>Geo-tagging — Godown Location</Typography>
        <Grid container spacing={2.5}>
          <Grid size={12}>
            <FieldLabel>Godown Address</FieldLabel>
            <FormField name="registeredAddress" control={control} placeholder="Full address including landmark" multiline minRows={2} {...fieldLabelProps} />
          </Grid>
          <Grid size={{ xs: 12, sm: 5 }}>
            <FieldLabel>Latitude</FieldLabel>
            <FormField name="latitude" control={control} placeholder="e.g. 19.0760" {...fieldLabelProps} />
          </Grid>
          <Grid size={{ xs: 12, sm: 5 }}>
            <FieldLabel>Longitude</FieldLabel>
            <FormField name="longitude" control={control} placeholder="e.g. 72.8777" {...fieldLabelProps} />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }} sx={{ display: 'flex', alignItems: 'flex-end' }}>
            <Button fullWidth variant="outlined" startIcon={<PlaceOutlinedIcon size={20} />} sx={{ height: 40, fontSize: '0.75rem' }} onClick={() => {}}>
              Open in Google Maps
            </Button>
          </Grid>
        </Grid>
      </Card>

      <Card sx={{ p: 3, mb: 3 }}>
        <Typography sx={sectionTitleSx}>Geo-fence &amp; Scanning Buffer</Typography>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1 }}>
          <Button variant="contained" startIcon={<MapOutlinedIcon size={20} />} sx={{ fontSize: '0.75rem' }} onClick={() => {}}>
            Mark Fence on Map
          </Button>
          <Chip label="No fence marked yet" size="small" variant="outlined" />
        </Stack>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Mark the godown boundary and set the buffer distance within which scans will be accepted.
        </Typography>
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
