import { useState } from 'react'
import { Button, Card, Divider, Stack, TextField, Typography } from '@mui/material'
import { CirclePlus, CircleMinus } from 'lucide-react'
import { Modal } from '@/components/common/Modal/Modal'

interface PointsManagementCardProps {
  currentBalance: number
  onAdjust: (type: 'credit' | 'debit', points: number, reason: string) => void
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', textAlign: 'right' }}>{value}</Typography>
    </Stack>
  )
}

export function PointsManagementCard({ currentBalance, onAdjust }: PointsManagementCardProps) {
  const [mode, setMode] = useState<'credit' | 'debit' | null>(null)
  const [step, setStep] = useState<'form' | 'confirm'>('form')
  const [points, setPoints] = useState('')
  const [reason, setReason] = useState('')

  const close = () => {
    setMode(null)
    setStep('form')
    setPoints('')
    setReason('')
  }

  const value = Number(points)
  const isValid = !!mode && !!value && value > 0 && !!reason.trim()

  const reviewAdjustment = () => {
    if (!isValid) return
    setStep('confirm')
  }

  const confirmAdjustment = () => {
    if (!mode || !isValid) return
    onAdjust(mode, value, reason.trim())
    close()
  }

  const resultingBalance = mode === 'credit' ? currentBalance + (value || 0) : currentBalance - (value || 0)

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

      {step === 'form' ? (
        <Modal
          open={mode !== null}
          onClose={close}
          title={mode === 'credit' ? 'Add Points' : 'Remove Points'}
          description="This adjustment will be recorded in the points history."
          maxWidth="xs"
          primaryActionLabel="Review"
          primaryActionColor={mode === 'credit' ? 'primary' : 'error'}
          onPrimaryAction={reviewAdjustment}
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
      ) : (
        <Modal
          open={mode !== null}
          onClose={close}
          title={mode === 'credit' ? 'Confirm Add Points' : 'Confirm Remove Points'}
          description="Please review the details before confirming this adjustment."
          maxWidth="xs"
          primaryActionLabel={mode === 'credit' ? 'Confirm & Add Points' : 'Confirm & Remove Points'}
          primaryActionColor={mode === 'credit' ? 'primary' : 'error'}
          secondaryActionLabel="Back"
          onSecondaryAction={() => setStep('form')}
          onPrimaryAction={confirmAdjustment}
        >
          <Stack spacing={1.5} sx={{ py: 1 }}>
            <SummaryRow label="Adjustment Type" value={mode === 'credit' ? 'Credit (Add)' : 'Debit (Remove)'} />
            <SummaryRow label="Points" value={`${mode === 'credit' ? '+' : '-'}${value.toLocaleString('en-IN')}`} />
            <SummaryRow label="Reason" value={reason.trim()} />
            <Divider />
            <SummaryRow label="Current Balance" value={currentBalance.toLocaleString('en-IN')} />
            <SummaryRow label="Balance After" value={resultingBalance.toLocaleString('en-IN')} />
          </Stack>
        </Modal>
      )}
    </Card>
  )
}
