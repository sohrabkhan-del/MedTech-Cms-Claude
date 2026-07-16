import type { ReactNode } from 'react'
import { Box, Button, Dialog, DialogActions, DialogContent, IconButton, Stack, Typography } from '@mui/material'
import { X } from 'lucide-react'
import { radius } from '@/theme/tokens'
import { useIsMobile } from '@/hooks/useMediaQueryBreakpoint'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg'
  primaryActionLabel?: string
  onPrimaryAction?: () => void
  primaryActionColor?: 'primary' | 'error'
  secondaryActionLabel?: string
  loading?: boolean
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  maxWidth = 'sm',
  primaryActionLabel,
  onPrimaryAction,
  primaryActionColor = 'primary',
  secondaryActionLabel = 'Cancel',
  loading = false,
}: ModalProps) {
  const isMobile = useIsMobile()

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      fullScreen={isMobile}
      maxWidth={maxWidth}
      slotProps={{
        paper: { sx: { borderRadius: isMobile ? 0 : `${radius.xl}px` } },
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', px: 3, pt: 3, pb: description ? 1 : 2 }}>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1.125rem' }}>{title}</Typography>
          {description && (
            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
              {description}
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} size="small" aria-label="Close">
          <X size={20} />
        </IconButton>
      </Stack>

      <DialogContent sx={{ px: 3 }}>{children}</DialogContent>

      {(primaryActionLabel || secondaryActionLabel) && (
        <DialogActions sx={{ px: 3, py: 2.5 }}>
          <Button variant="outlined" color="primary" onClick={onClose} disabled={loading}>
            {secondaryActionLabel}
          </Button>
          {primaryActionLabel && (
            <Button
              variant="contained"
              color={primaryActionColor}
              onClick={onPrimaryAction}
              disabled={loading}
            >
              {primaryActionLabel}
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  )
}
