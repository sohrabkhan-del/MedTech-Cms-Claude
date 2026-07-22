import { Box, Stack, Typography } from '@mui/material'
import { Check } from 'lucide-react'

const steps = ['Your Details', 'Set Password', 'Shop Details']

interface InviteStepperProps {
  activeStep: number
}

export function InviteStepper({ activeStep }: InviteStepperProps) {
  return (
    <Stack direction="row" sx={{ width: '100%', alignItems: 'center' }}>
      {steps.map((label, index) => {
        const stepNumber = index + 1
        const isComplete = stepNumber < activeStep
        const isActive = stepNumber === activeStep
        return (
          <Stack key={label} direction="row" sx={{ alignItems: 'center', flex: index < steps.length - 1 ? 1 : 'none' }}>
            <Stack spacing={0.5} sx={{ alignItems: 'center', minWidth: 88 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  backgroundColor: isComplete || isActive ? 'primary.main' : 'background.paper',
                  color: isComplete || isActive ? 'primary.contrastText' : 'text.disabled',
                  border: isActive ? '2px solid' : '1px solid',
                  borderColor: isComplete || isActive ? 'primary.main' : 'divider',
                }}
              >
                {isComplete ? <Check size={16} /> : stepNumber}
              </Box>
              <Typography
                variant="caption"
                sx={{ color: isActive ? 'primary.main' : 'text.secondary', fontWeight: isActive ? 700 : 500, whiteSpace: 'nowrap' }}
              >
                {label}
              </Typography>
            </Stack>
            {index < steps.length - 1 && (
              <Box sx={{ flexGrow: 1, height: '1px', backgroundColor: isComplete ? 'primary.main' : 'divider', mx: 1, mb: 2.5 }} />
            )}
          </Stack>
        )
      })}
    </Stack>
  )
}
