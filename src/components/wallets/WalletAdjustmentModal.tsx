import { useState } from 'react'
import { Box, Stack, TextField, Typography } from '@mui/material'
import { Modal } from '@/components/common/Modal/Modal'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'

export type AdjustmentType = 'add' | 'deduct'

interface WalletAdjustmentModalProps {
  open: boolean
  onClose: () => void
  currentBalance: number
  defaultType: AdjustmentType
  onConfirm: (payload: {
    type: AdjustmentType
    amount: number
    reason: string
  }) => void
}

export function WalletAdjustmentModal({
  open,
  onClose,
  currentBalance,
  defaultType,
  onConfirm,
}: WalletAdjustmentModalProps) {
  const [step, setStep] = useState<'form' | 'confirm'>('form')
  const type = defaultType
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')

  const numericAmount = Number(amount) || 0
  const updatedBalance =
    type === 'add'
      ? currentBalance + numericAmount
      : Math.max(0, currentBalance - numericAmount)

  const resetAndClose = () => {
    setStep('form')
    setAmount('')
    setReason('')
    onClose()
  }

  const handleContinue = () => setStep('confirm')

  const handleConfirm = () => {
    onConfirm({
      type,
      amount: numericAmount,
      reason,
    })
    resetAndClose()
  }

  if (step === 'confirm') {
    return (
      <Modal
        open={open}
        onClose={resetAndClose}
        title="Confirm Wallet Adjustment"
        description="Review the details before applying this adjustment."
        primaryActionLabel="Confirm"
        onPrimaryAction={handleConfirm}
        secondaryActionLabel="Cancel"
      >
        <DetailFieldGrid
          fields={[
            {
              label: 'Current Wallet Balance',
              value: currentBalance.toLocaleString('en-IN'),
            },
            {
              label:
                type === 'add' ? 'Points to be Added' : 'Points to be Deducted',
              value: numericAmount.toLocaleString('en-IN'),
            },
            {
              label: 'Updated Wallet Balance',
              value: updatedBalance.toLocaleString('en-IN'),
            },
            { label: 'Adjustment Reason', value: reason || '—' },
          ]}
        />
      </Modal>
    )
  }

  return (
    <Modal
      open={open}
      onClose={resetAndClose}
      title={type === 'add' ? 'Add Points' : 'Deduct Points'}
      description="Manually adjust this user's wallet balance."
      primaryActionLabel="Continue"
      onPrimaryAction={handleContinue}
      secondaryActionLabel="Cancel"
    >
      <Stack spacing={2.5} sx={{ pt: 1 }}>
        <TextField
          type="number"
          label="Point Amount"
          size="small"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <TextField
          label="Adjustment Reason"
          size="small"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <Box
          sx={{
            p: 1.5,
            borderRadius: '10px',
            backgroundColor: 'background.default',
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Current balance: {currentBalance.toLocaleString('en-IN')} Points
          </Typography>
        </Box>
      </Stack>
    </Modal>
  )
}
