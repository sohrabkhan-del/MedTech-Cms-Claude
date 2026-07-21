import { useState } from 'react'
import { Button, Card, Stack, TextField, Typography } from '@mui/material'
import { CirclePlus, CircleMinus } from 'lucide-react'
import { Modal } from '@/components/common/Modal/Modal'

interface PointsManagementCardProps {
  currentBalance: number
  onAdjust: (type: 'credit' | 'debit', points: number, reason: string) => void
}

export function PointsManagementCard({ currentBalance, onAdjust }: PointsManagementCardProps) {
  const [mode, setMode] = useState<'credit' | 'debit' | null>(null)
  const [points, setPoints] = useState('')
  const [reason, setReason] = useState('')

  const close = () => {
    setMode(null)
    setPoints('')
    setReason('')
  }

  const submit = () => {
    const value = Number(points)
    if (!mode || !value || value <= 0 || !reason.trim()) return
    onAdjust(mode, value, reason.trim())
    close()
  }

  return (
    <Card sx={{ p: 3, height: '100%' }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>Points Management</Typography>
        <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: 'primary.main' }}>
          {currentBalance.toLocaleString('en-IN')}
        </Typography>
      </Stack>

      <Stack direction="row" spacing={1.5}>
        <Button variant="contained" color="primary" startIcon={<CirclePlus />} onClick={() => setMode('credit')} fullWidth>
          Add Points
        </Button>
        <Button variant="outlined" color="error" startIcon={<CircleMinus />} onClick={() => setMode('debit')} fullWidth>
          Remove Points
        </Button>
      </Stack>

      <Modal
        open={mode !== null}
        onClose={close}
        title={mode === 'credit' ? 'Add Points' : 'Remove Points'}
        description="This adjustment will be recorded in the points history."
        maxWidth="xs"
        primaryActionLabel={mode === 'credit' ? 'Add Points' : 'Remove Points'}
        primaryActionColor={mode === 'credit' ? 'primary' : 'error'}
        onPrimaryAction={submit}
      >
        <Stack spacing={2.5} sx={{ py: 1 }}>
          <TextField
            label="Points"
            type="number"
            required
            fullWidth
            size="small"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
          />
          <TextField
            label="Reason / Description"
            required
            fullWidth
            size="small"
            multiline
            minRows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Stack>
      </Modal>
    </Card>
  )
}
