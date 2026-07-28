import { useEffect } from 'react'
import { Box, Dialog, DialogContent, Stack, Typography } from '@mui/material'
import { alpha, styled } from '@mui/material/styles'
import { AlertCircle, CircleCheck, CircleX, Info } from 'lucide-react'
import { radius } from '@/theme/tokens'

type DialogVariant = 'success' | 'warning' | 'error' | 'info'

interface SuccessDialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  autoCloseMs?: number
  variant?: DialogVariant
}

const AnimatedIconWrap = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'variant',
})<{ variant: DialogVariant }>(({ theme, variant }) => {
  const palette = theme.palette[variant] ?? theme.palette.success
  const color = palette.main

  return {
    position: 'relative',
    width: 72,
    height: 72,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `linear-gradient(135deg, ${alpha(color, 0.2)}, ${alpha(color, 0.06)})`,
    color,
    border: `1px solid ${alpha(color, 0.24)}`,
    boxShadow: `0 14px 34px -16px ${alpha(color, 0.45)}`,
    animation: 'dialog-pop 0.6s cubic-bezier(0.2, 0.9, 0.2, 1)',
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: -8,
      borderRadius: '50%',
      border: `2px solid ${alpha(color, 0.16)}`,
      animation: 'dialog-ring 1.4s ease-out infinite',
    },
    '@keyframes dialog-pop': {
      '0%': { transform: 'scale(0.88)', opacity: 0 },
      '60%': { transform: 'scale(1.04)', opacity: 1 },
      '100%': { transform: 'scale(1)', opacity: 1 },
    },
    '@keyframes dialog-ring': {
      '0%': { transform: 'scale(0.96)', opacity: 0.9 },
      '100%': { transform: 'scale(1.18)', opacity: 0 },
    },
  }
})

const iconMap: Record<DialogVariant, typeof CircleCheck> = {
  success: CircleCheck,
  warning: AlertCircle,
  error: CircleX,
  info: Info,
}

export function SuccessDialog({
  open,
  onClose,
  title,
  description,
  autoCloseMs = 2500,
  variant = 'success',
}: SuccessDialogProps) {
  useEffect(() => {
    if (!open) return
    const timer = setTimeout(onClose, autoCloseMs)
    return () => clearTimeout(timer)
  }, [open, autoCloseMs, onClose])

  const Icon = iconMap[variant]

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth

      slotProps={{
        paper: {
          sx: {
            borderRadius: `${radius.xl}px`,
            boxShadow: '0 24px 80px -24px rgba(15, 23, 42, 0.35)',
          },
        },
      }}
    >
      <DialogContent sx={{ px: 3.5, pt: 4.25, pb: 3.25 }}>
        <Stack spacing={2.2} sx={{ alignItems: 'center', textAlign: 'center' }}>
          <AnimatedIconWrap variant={variant}>
            <Icon size={30} strokeWidth={2.2} />
          </AnimatedIconWrap>

          <Stack spacing={0.5} sx={{ alignItems: 'center' }}>
            <Typography
              sx={{ fontWeight: 700, fontSize: '1.0625rem', lineHeight: 1.3 }}
            >
              {title}
            </Typography>
            {description && (
              <Typography
                variant="body1"
                sx={{ color: 'text.secondary', lineHeight: 1.6 }}
              >
                {description}
              </Typography>
            )}
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
