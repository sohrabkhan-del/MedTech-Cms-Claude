import { useState } from 'react'
import { MenuItem, Stack, TextField } from '@mui/material'
import { Modal } from '@/components/common/Modal/Modal'

export type CloseReason = 'order_placed' | 'no_stock' | 'partner_declined' | 'other'

const closeReasonOptions: { value: CloseReason; label: string }[] = [
  { value: 'order_placed', label: 'Order Placed' },
  { value: 'no_stock', label: 'No Stock' },
  { value: 'partner_declined', label: 'Partner Declined' },
  { value: 'other', label: 'Other' },
]

interface LeadActionDialogProps {
  open: boolean
  mode: 'follow-up' | 'close'
  onClose: () => void
  onSubmit: (value: string) => Promise<void> | void
  loading?: boolean
}

export function LeadActionDialog({ open, mode, onClose, onSubmit, loading }: LeadActionDialogProps) {
  const [note, setNote] = useState('')
  const [closeReason, setCloseReason] = useState<CloseReason | ''>('')

  if (mode === 'close') {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title="Mark as Closed"
        description="Select a reason for closing this lead."
        primaryActionLabel="Mark as Closed"
        onPrimaryAction={() => closeReason && onSubmit(closeReason)}
        loading={loading}
      >
        <Stack spacing={2}>
          <TextField
            select
            label="Close Reason"
            value={closeReason}
            onChange={(e) => setCloseReason(e.target.value as CloseReason)}
            fullWidth
            autoFocus
          >
            {closeReasonOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Modal>
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Mark as Followed Up"
      description="Add a note about the follow-up you performed for this lead."
      primaryActionLabel="Mark as Followed Up"
      onPrimaryAction={() => onSubmit(note)}
      loading={loading}
    >
      <Stack spacing={2}>
        <TextField
          label="Follow-up Note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          multiline
          minRows={3}
          fullWidth
          autoFocus
        />
      </Stack>
    </Modal>
  )
}
