import { useState } from 'react'
import { Box, FormControlLabel, MenuItem, Stack, Switch, TextField, Typography } from '@mui/material'
import { Modal } from '@/components/common/Modal/Modal'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'

export type AdjustmentType = 'add' | 'deduct'

interface WalletAdjustmentModalProps {
  open: boolean
  onClose: () => void
  currentBalance: number
  defaultType: AdjustmentType
  onConfirm: (payload: { type: AdjustmentType; amount: number; reason: string; referenceNumber: string; remarks: string; requireApproval: boolean }) => void
}

export function WalletAdjustmentModal({ open, onClose, currentBalance, defaultType, onConfirm }: WalletAdjustmentModalProps) {
  const [step, setStep] = useState<'form' | 'confirm'>('form')
  const [type, setType] = useState<AdjustmentType>(defaultType)
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [remarks, setRemarks] = useState('')
  const [requireApproval, setRequireApproval] = useState(true)

  const numericAmount = Number(amount) || 0
  const updatedBalance = type === 'add' ? currentBalance + numericAmount : Math.max(0, currentBalance - numericAmount)

  const resetAndClose = () => {
    setStep('form')
    setType(defaultType)
    setAmount('')
    setReason('')
    setReferenceNumber('')
    setRemarks('')
    setRequireApproval(true)
    onClose()
  }

  const handleContinue = () => setStep('confirm')

  const handleConfirm = () => {
    onConfirm({ type, amount: numericAmount, reason, referenceNumber, remarks, requireApproval })
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
            { label: 'Current Wallet Balance', value: currentBalance.toLocaleString('en-IN') },
            { label: type === 'add' ? 'Coins to be Added' : 'Coins to be Deducted', value: numericAmount.toLocaleString('en-IN') },
            { label: 'Updated Wallet Balance', value: updatedBalance.toLocaleString('en-IN') },
            { label: 'Adjustment Reason', value: reason || '—' },
            { label: 'Remarks', value: remarks || '—' },
          ]}
        />
      </Modal>
    )
  }

  return (
    <Modal
      open={open}
      onClose={resetAndClose}
      title={type === 'add' ? 'Add Coins' : 'Deduct Coins'}
      description="Manually adjust this user's wallet balance."
      primaryActionLabel="Continue"
      onPrimaryAction={handleContinue}
      secondaryActionLabel="Cancel"
    >
      <Stack spacing={2.5} sx={{ pt: 1 }}>
        <TextField select label="Adjustment Type" size="small" value={type} onChange={(e) => setType(e.target.value as AdjustmentType)}>
          <MenuItem value="add">Add Coins</MenuItem>
          <MenuItem value="deduct">Deduct Coins</MenuItem>
        </TextField>
        <TextField type="number" label="Coin Amount" size="small" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <TextField label="Adjustment Reason" size="small" value={reason} onChange={(e) => setReason(e.target.value)} />
        <TextField label="Reference Number (Optional)" size="small" value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} />
        <TextField label="Remarks" size="small" multiline minRows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
        <FormControlLabel
          control={<Switch checked={requireApproval} onChange={(e) => setRequireApproval(e.target.checked)} />}
          label="Require Approval"
        />
        <Box sx={{ p: 1.5, borderRadius: '10px', backgroundColor: 'background.default' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Current balance: {currentBalance.toLocaleString('en-IN')} coins
          </Typography>
        </Box>
      </Stack>
    </Modal>
  )
}
