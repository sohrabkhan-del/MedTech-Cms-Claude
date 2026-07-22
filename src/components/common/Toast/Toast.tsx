import { Box, IconButton, Snackbar, Stack, Typography } from '@mui/material'
import { CircleCheck, TriangleAlert, CircleX, Info, X as CloseOutlined } from 'lucide-react'
import { radius, shadows } from '@/theme/tokens'

type ToastSeverity = 'success' | 'warning' | 'error' | 'info'

interface ToastProps {
  open: boolean
  title?: string
  message: string
  severity?: ToastSeverity
  onClose: () => void
  autoHideDuration?: number
}

const SEVERITY_CONFIG: Record<ToastSeverity, { icon: React.ReactNode; color: string; bg: string }> = {
  success: { icon: <CircleCheck size={20} />, color: 'success.main', bg: 'success.light' },
  warning: { icon: <TriangleAlert size={20} />, color: 'warning.main', bg: 'warning.light' },
  error: { icon: <CircleX size={20} />, color: 'error.main', bg: 'error.light' },
  info: { icon: <Info size={20} />, color: 'info.main', bg: 'info.light' },
}

const DEFAULT_TITLES: Record<ToastSeverity, string> = {
  success: 'Success',
  warning: 'Warning',
  error: 'Error',
  info: 'Notice',
}

export function Toast({ open, title, message, severity = 'success', onClose, autoHideDuration = 5000 }: ToastProps) {
  const config = SEVERITY_CONFIG[severity]

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
          minWidth: 320,
          maxWidth: 400,
          p: 2,
          borderRadius: `${radius.lg}px`,
          backgroundColor: 'background.paper',
          boxShadow: shadows.dropdown,
          borderLeft: '4px solid',
          borderLeftColor: config.color,
        }}
      >
        <Stack
          sx={{
            width: 32,
            height: 32,
            flexShrink: 0,
            borderRadius: '50%',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: config.bg,
            color: config.color,
          }}
        >
          {config.icon}
        </Stack>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>{title ?? DEFAULT_TITLES[severity]}</Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.25 }}>
            {message}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} aria-label="Dismiss notification" sx={{ mt: -0.5, mr: -0.5 }}>
          <CloseOutlined size={16} />
        </IconButton>
      </Box>
    </Snackbar>
  )
}
