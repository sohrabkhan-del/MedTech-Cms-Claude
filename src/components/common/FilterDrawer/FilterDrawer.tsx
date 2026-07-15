import { useState } from 'react'
import { Box, Button, Divider, Drawer, IconButton, Stack, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useIsMobile } from '@/hooks/useMediaQueryBreakpoint'

interface FilterDrawerProps<T extends Record<string, unknown>> {
  open: boolean
  onClose: () => void
  title?: string
  value: T
  onApply: (value: T) => void
  children: (draft: T, setDraft: (updater: (prev: T) => T) => void) => React.ReactNode
}

export function FilterDrawer<T extends Record<string, unknown>>({
  open,
  onClose,
  title = 'Filters',
  value,
  onApply,
  children,
}: FilterDrawerProps<T>) {
  const isMobile = useIsMobile()
  const [draft, setDraftState] = useState<T>(value)
  const [wasOpen, setWasOpen] = useState(open)

  if (open && !wasOpen) {
    setWasOpen(true)
    setDraftState(value)
  } else if (!open && wasOpen) {
    setWasOpen(false)
  }

  const setDraft = (updater: (prev: T) => T) => setDraftState(updater)

  const handleReset = () => {
    setDraftState(value)
  }

  const handleApply = () => {
    onApply(draft)
    onClose()
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 10 }}
      slotProps={{
        paper: {
          sx: {
            width: isMobile ? '100%' : 380,
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1.125rem' }}>{title}</Typography>
        <IconButton onClick={onClose} aria-label="Close filters">
          <CloseIcon />
        </IconButton>
      </Stack>
      <Divider />

      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 3, py: 2.5 }}>{children(draft, setDraft)}</Box>

      <Divider />
      <Stack direction="row" spacing={1.5} sx={{ p: 2.5 }}>
        <Button variant="outlined" color="primary" fullWidth onClick={handleReset}>
          Reset
        </Button>
        <Button variant="contained" fullWidth onClick={handleApply}>
          Apply
        </Button>
      </Stack>
    </Drawer>
  )
}
