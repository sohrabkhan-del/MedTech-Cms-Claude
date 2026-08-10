import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { Pencil, Store, Pill } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'
import { Modal } from '@/components/common/Modal/Modal'
import {
  useUpdateGeoFenceSettingByPartnerTypeMutation,
  type GeoFenceSetting,
} from '@/features/fieldOperations/services/geoFenceSettingsApi'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

const sectionTitleSx = {
  fontWeight: 700,
  fontSize: '0.75rem',
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  color: 'primary.main',
  mb: 0.5,
}

const fieldLabelSx = {
  fontWeight: 700,
  fontSize: '0.6875rem',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  color: 'text.secondary',
  mb: 0.75,
}

interface GeoFenceRuleCardProps {
  setting: GeoFenceSetting | undefined
}

export function GeoFenceRuleCard({ setting }: GeoFenceRuleCardProps) {
  const toast = useToast()
  const [updateSetting, { isLoading: isSubmitting }] =
    useUpdateGeoFenceSettingByPartnerTypeMutation()

  const [isEditing, setIsEditing] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [radius, setRadius] = useState(String(setting?.radius ?? ''))
  const [bufferDistance, setBufferDistance] = useState(
    String(setting?.bufferDistance ?? ''),
  )

  if (!setting) return null

  const label = setting.partnerType === 'DEALER' ? 'Dealer' : 'Chemist'
  const Icon = setting.partnerType === 'DEALER' ? Store : Pill

  function handleCancel() {
    setRadius(String(setting?.radius ?? ''))
    setBufferDistance(String(setting?.bufferDistance ?? ''))
    setIsEditing(false)
  }

  async function handleConfirmSave() {
    if (!setting) return
    try {
      await updateSetting({
        partnerType: setting.partnerType,
        payload: {
          radius: Number(radius),
          bufferDistance: Number(bufferDistance),
        },
      }).unwrap()
      toast.success(`${label} geo fence rule updated successfully.`)
      setIsConfirmOpen(false)
      setIsEditing(false)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update geo fence rule.'))
    }
  }

  return (
    <Card sx={{ p: 3, height: '100%' }}>
      <Stack
        direction="row"
        sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5 }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'primary.light',
              color: 'primary.main',
              flexShrink: 0,
            }}
          >
            <Icon size={18} />
          </Box>
          <Box>
            <Typography sx={sectionTitleSx}>{label} Rule</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Default geo fence for all {label.toLowerCase()}s
            </Typography>
          </Box>
        </Stack>
        {!isEditing && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<Pencil size={14} />}
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
        )}
      </Stack>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography sx={fieldLabelSx}>Radius (meters)</Typography>
          {isEditing ? (
            <TextField
              value={radius}
              onChange={(e) => setRadius(e.target.value.replace(/[^0-9]/g, ''))}
              size="small"
              fullWidth
              placeholder="e.g. 150"
            />
          ) : (
            <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
              {setting.radius} m
            </Typography>
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography sx={fieldLabelSx}>Buffer Distance (meters)</Typography>
          {isEditing ? (
            <TextField
              value={bufferDistance}
              onChange={(e) =>
                setBufferDistance(e.target.value.replace(/[^0-9]/g, ''))
              }
              size="small"
              fullWidth
              placeholder="e.g. 50"
            />
          ) : (
            <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
              {setting.bufferDistance} m
            </Typography>
          )}
        </Grid>
      </Grid>

      {isEditing && (
        <Stack direction="row" spacing={1.5} sx={{ mt: 3, justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            size="small"
            disabled={!radius || !bufferDistance}
            onClick={() => setIsConfirmOpen(true)}
          >
            Update
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="primary"
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </Stack>
      )}

      <Modal
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title={`Update ${label} Geo Fence Rule?`}
        description={`This changes the default radius and buffer distance applied to every ${label.toLowerCase()} who doesn't have their own geo fence. Existing custom geo fences are not affected.`}
        primaryActionLabel="Update"
        onPrimaryAction={handleConfirmSave}
        secondaryActionLabel="Cancel"
        onSecondaryAction={() => setIsConfirmOpen(false)}
        loading={isSubmitting}
      >
        <Stack spacing={1.5}>
          <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Radius
            </Typography>
            <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
              {setting.radius} m → {radius || 0} m
            </Typography>
          </Stack>
          <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Buffer Distance
            </Typography>
            <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
              {setting.bufferDistance} m → {bufferDistance || 0} m
            </Typography>
          </Stack>
        </Stack>
      </Modal>
    </Card>
  )
}
