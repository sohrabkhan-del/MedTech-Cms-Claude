import { zodResolver } from '@hookform/resolvers/zod'
import { useController, useForm } from 'react-hook-form'
import { Navigate } from 'react-router-dom'
import { Alert, Button, FormHelperText, Grid, MenuItem, Stack, Typography } from '@mui/material'
import { LocateFixed, MapPin } from 'lucide-react'
import { FormField } from '@/components/common/FormField/FormField'
import { MultiFileDropzone } from '@/components/common/FileDropzone/MultiFileDropzone'
import { InviteCard } from '@/features/partnerInvite/components/InviteCard'
import { InviteSuccessDialog } from '@/features/partnerInvite/components/InviteSuccessDialog'
import { usePartnerInvite } from '@/features/partnerInvite/PartnerInviteContext'
import { useInviteShopDetailsService } from '@/features/partnerInvite/hooks/useInviteShopDetailsService'
import { useGeolocationCapture } from '@/features/partnerInvite/hooks/useGeolocationCapture'
import {
  inviteShopDetailsFormDefaults,
  inviteShopDetailsFormSchema,
  SHOP_DOCUMENT_ACCEPT,
  type InviteShopDetailsFormValues,
} from '@/features/partnerInvite/inviteShopDetailsFormSchema'

const zones: InviteShopDetailsFormValues['zone'][] = ['North', 'South', 'East', 'West']

export function InviteShopDetailsPage() {
  const { token, basicDetails, inviteType } = usePartnerInvite()
  const { submitShopDetails, applicationId, isLoading, error } = useInviteShopDetailsService()
  const { captureLocation, isCapturing, error: geoError } = useGeolocationCapture()
  const { control, handleSubmit, setValue, watch } = useForm<InviteShopDetailsFormValues>({
    resolver: zodResolver(inviteShopDetailsFormSchema),
    defaultValues: inviteShopDetailsFormDefaults,
  })
  const latitude = watch('latitude')
  const longitude = watch('longitude')
  const {
    field: { value: documents, onChange: setDocuments },
    fieldState: { error: documentsError },
  } = useController({ name: 'documents', control })

  if (!basicDetails) {
    return <Navigate to={`/invite/${token}`} replace />
  }

  function handleCaptureLocation() {
    captureLocation(({ latitude, longitude }) => {
      setValue('latitude', latitude, { shouldValidate: true })
      setValue('longitude', longitude, { shouldValidate: true })
    })
  }

  return (
    <>
      <InviteCard
        step={3}
        title={`${inviteType} / Shop Details`}
        subtitle="Tell us about your shop or godown so we can verify and onboard you."
        onSubmit={handleSubmit((values) => submitShopDetails(values))}
      >
        {error && <Alert severity="error">{error}</Alert>}

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField name="shopName" control={control} label="Shop / Godown Name" required />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField name="gstNumber" control={control} label="GST Number" required placeholder="22AAAAA0000A1Z5" />
          </Grid>
          <Grid size={12}>
            <FormField
              name="registeredAddress"
              control={control}
              label="Shop / Godown Address"
              required
              multiline
              minRows={2}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField name="city" control={control} label="City" required />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormField name="zone" control={control} label="Region" required select>
              {zones.map((zone) => (
                <MenuItem key={zone} value={zone}>
                  {zone}
                </MenuItem>
              ))}
            </FormField>
          </Grid>
        </Grid>

        <Stack spacing={1}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>Shop / Dealer Documents</Typography>
          <MultiFileDropzone
            files={documents}
            accept={SHOP_DOCUMENT_ACCEPT}
            helperText="or click to browse — accepts PDF, PNG, JPG"
            onAdd={(newFiles) => setDocuments([...documents, ...newFiles])}
            onRemove={(index) => setDocuments(documents.filter((_, i) => i !== index))}
          />
          {documentsError && <FormHelperText error>{documentsError.message}</FormHelperText>}
        </Stack>

        <Stack
          spacing={1.5}
          sx={{ p: 2, borderRadius: '12px', border: '1px dashed', borderColor: 'divider' }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: 'primary.main' }}>
            <MapPin size={18} />
            <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', color: 'text.primary' }}>Geo-tag your shop location</Typography>
          </Stack>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            We use your location to verify scans happen at your registered shop. Please enable location access when prompted.
          </Typography>

          {geoError && <Alert severity="warning">{geoError}</Alert>}

          <Button
            variant="outlined"
            startIcon={<LocateFixed size={18} />}
            onClick={handleCaptureLocation}
            loading={isCapturing}
            sx={{ alignSelf: 'flex-start', fontSize: '0.75rem' }}
          >
            Use My Current Location
          </Button>

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField name="latitude" control={control} label="Latitude" required disabled />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormField name="longitude" control={control} label="Longitude" required disabled />
            </Grid>
          </Grid>

          {latitude && longitude && (
            <Typography variant="body1">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View captured location on Google Maps ↗
              </a>
            </Typography>
          )}
        </Stack>

        <Button type="submit" variant="contained" size="large" loading={isLoading} sx={{ py: 1.25 }}>
          Submit for Approval
        </Button>
      </InviteCard>

      {applicationId && (
        <InviteSuccessDialog open applicationId={applicationId} contactEmail={basicDetails.email} />
      )}
    </>
  )
}
