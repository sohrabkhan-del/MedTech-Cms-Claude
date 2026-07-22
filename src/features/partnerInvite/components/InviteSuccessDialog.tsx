import { Box, Button, Dialog, DialogContent, Stack, Typography } from '@mui/material'
import { CheckCircle2, Smartphone } from 'lucide-react'
import { radius } from '@/theme/tokens'
import { useIsMobile } from '@/hooks/useMediaQueryBreakpoint'

interface InviteSuccessDialogProps {
  open: boolean
  applicationId: string
  contactEmail: string
}

export function InviteSuccessDialog({ open, applicationId, contactEmail }: InviteSuccessDialogProps) {
  const isMobile = useIsMobile()

  return (
    <Dialog
      open={open}
      fullScreen={isMobile}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: isMobile ? 0 : `${radius.xl}px` } } }}
    >
      <DialogContent sx={{ p: 4, textAlign: 'center' }}>
        <Stack spacing={2.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'success.light',
              color: 'success.main',
            }}
          >
            <CheckCircle2 size={34} />
          </Box>

          <Stack spacing={1}>
            <Typography sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
              Application submitted successfully!
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Thank you for registering with MedTech. Your application
              {' '}<Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>{applicationId}</Box>{' '}
              has been sent to our team for verification and approval. This usually takes 1–2 business days.
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              We'll notify you at <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>{contactEmail}</Box> as soon as your
              account is approved and ready to use.
            </Typography>
          </Stack>

          <Stack
            spacing={1.25}
            sx={{
              width: '100%',
              p: 2,
              borderRadius: `${radius.lg}px`,
              backgroundColor: 'primary.light',
              alignItems: 'center',
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: 'primary.main' }}>
              <Smartphone size={18} />
              <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Get the MedTech Partner App</Typography>
            </Stack>
            <Typography variant="body1" sx={{ color: 'text.secondary', textAlign: 'center' }}>
              Download the app to scan products, track rewards, and manage your account on the go once your account is approved.
            </Typography>
            <Stack direction="row" spacing={1.5}>
              <Button variant="contained" size="small" sx={{ fontSize: '0.75rem' }}>
                Download for Android
              </Button>
              <Button variant="outlined" size="small" sx={{ fontSize: '0.75rem' }}>
                Download for iOS
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
