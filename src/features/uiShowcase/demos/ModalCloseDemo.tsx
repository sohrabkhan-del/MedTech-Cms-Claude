import { useState } from 'react'
import { Alert, Button, Dialog, DialogActions, DialogContent, IconButton, Stack, Typography } from '@mui/material'
import { X } from 'lucide-react'
import { Modal } from '@/components/common/Modal/Modal'
import { radius } from '@/theme/tokens'
import { DemoSection } from '../components/DemoSection'
import { CodeBlock } from '../components/CodeBlock'
import { PropsTable } from '../components/PropsTable'

const usageCode = `import { Dialog } from '@mui/material'

// MUI Dialog's onClose receives a "reason" so you can tell how it closed
<Dialog
  open={open}
  onClose={(_event, reason) => {
    if (reason === 'backdropClick') return // ignore backdrop click
    setOpen(false)
  }}
>
  ...
</Dialog>

// The project's Modal wrapper closes on X / backdrop / Escape uniformly (onClose has no reason filtering)
import { Modal } from '@/components/common/Modal/Modal'
<Modal open={open} onClose={() => setOpen(false)} title="Confirm" primaryActionLabel="Confirm" onPrimaryAction={handleConfirm} />`

export function ModalCloseDemo() {
  const [xOpen, setXOpen] = useState(false)
  const [backdropOpen, setBackdropOpen] = useState(false)
  const [escapeOpen, setEscapeOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [lastClose, setLastClose] = useState<string | null>(null)

  return (
    <Stack spacing={4}>
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        The shared <code>Modal</code> component (wrapping MUI Dialog) closes uniformly via X button, backdrop click, or Escape —
        its <code>onClose</code> prop doesn't distinguish the reason. The examples below isolate each trigger, using MUI Dialog's
        <code> onClose(event, reason)</code> signature where the reason needs to be inspected.
      </Typography>

      {lastClose && (
        <Alert severity="info" onClose={() => setLastClose(null)}>
          Last close trigger: <strong>{lastClose}</strong>
        </Alert>
      )}

      <DemoSection title="Close via X button" description="Only the header close icon dismisses the dialog; backdrop click and Escape are both disabled.">
        <Button variant="outlined" onClick={() => setXOpen(true)}>
          Open (X button only)
        </Button>
        <Dialog
          open={xOpen}
          onClose={() => {
            /* ignore backdrop click and Escape — only the X button below closes this dialog */
          }}
          slotProps={{ paper: { sx: { borderRadius: `${radius.xl}px`, minWidth: 360 } } }}
        >
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', px: 3, pt: 3, pb: 1 }}>
            <Typography sx={{ fontWeight: 700 }}>X button only</Typography>
            <IconButton
              size="small"
              aria-label="Close"
              onClick={() => {
                setLastClose('X button')
                setXOpen(false)
              }}
            >
              <X size={20} />
            </IconButton>
          </Stack>
          <DialogContent sx={{ px: 3 }}>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Try clicking the backdrop or pressing Escape — nothing happens. Only the X closes this dialog.
            </Typography>
          </DialogContent>
        </Dialog>
      </DemoSection>

      <DemoSection title="Close via backdrop click" description="Clicking outside the dialog dismisses it; the X button and Escape are disabled here to isolate the behavior.">
        <Button variant="outlined" onClick={() => setBackdropOpen(true)}>
          Open (backdrop click only)
        </Button>
        <Dialog
          open={backdropOpen}
          onClose={(_e, reason) => {
            if (reason === 'backdropClick') {
              setLastClose('Backdrop click')
              setBackdropOpen(false)
            }
            // escapeKeyDown reason is intentionally ignored to isolate backdrop-click behavior
          }}
          slotProps={{ paper: { sx: { borderRadius: `${radius.xl}px`, minWidth: 360 } } }}
        >
          <DialogContent sx={{ p: 3 }}>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>Backdrop click only</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Click anywhere outside this box to close it. There is no X button and Escape is disabled.
            </Typography>
          </DialogContent>
        </Dialog>
      </DemoSection>

      <DemoSection title="Close via Escape key" description="Pressing Escape dismisses it; backdrop click is disabled here to isolate the behavior.">
        <Button variant="outlined" onClick={() => setEscapeOpen(true)}>
          Open (Escape key only)
        </Button>
        <Dialog
          open={escapeOpen}
          onClose={(_e, reason) => {
            if (reason === 'escapeKeyDown') {
              setLastClose('Escape key')
              setEscapeOpen(false)
            }
          }}
          slotProps={{ paper: { sx: { borderRadius: `${radius.xl}px`, minWidth: 360 } } }}
        >
          <DialogContent sx={{ p: 3 }}>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>Escape key only</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Press the Escape key to close. Clicking the backdrop does nothing.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              (No close button intentionally — press Esc)
            </Typography>
          </DialogActions>
        </Dialog>
      </DemoSection>

      <DemoSection title="Close via confirm / cancel buttons" description="The standard app pattern — the shared Modal component with explicit action buttons.">
        <Button variant="contained" color="error" onClick={() => setConfirmOpen(true)}>
          Open confirm/cancel dialog
        </Button>
        <Modal
          open={confirmOpen}
          onClose={() => {
            setLastClose('Backdrop/Escape (Modal default)')
            setConfirmOpen(false)
          }}
          title="Discard changes?"
          description="Unsaved changes will be lost."
          primaryActionLabel="Discard"
          primaryActionColor="error"
          onPrimaryAction={() => {
            setLastClose('Confirm button')
            setConfirmOpen(false)
          }}
          secondaryActionLabel="Keep editing"
          onSecondaryAction={() => {
            setLastClose('Cancel button')
            setConfirmOpen(false)
          }}
        >
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            This dialog still closes via X-equivalent (none here), backdrop, or Escape — through the shared onClose — in addition
            to its two labeled buttons.
          </Typography>
        </Modal>
      </DemoSection>

      <DemoSection title="Usage">
        <CodeBlock code={usageCode} />
      </DemoSection>

      <DemoSection title="Props — Dialog onClose reason">
        <PropsTable
          rows={[
            { name: 'onClose', type: "(event, reason: 'backdropClick' | 'escapeKeyDown') => void", description: 'Inspect reason to allow/ignore a given close trigger.' },
            { name: 'disableEscapeKeyDown', type: 'boolean', default: 'false', description: 'Prevents Escape from calling onClose at all.' },
          ]}
        />
      </DemoSection>
    </Stack>
  )
}
