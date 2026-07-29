import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  Chip,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { Coins as Points, ArrowLeft as ArrowBackOutlined } from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { Modal } from '@/components/common/Modal/Modal'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { DetailsPageSkeleton } from '@/components/common/DetailsPageSkeleton/DetailsPageSkeleton'
import { radius } from '@/theme/tokens'
import { usePointRuleDetail } from '@/features/rewardsWallet/hooks/usePointRuleDetail'
import type {
  PointRulePartnerType,
  PointValueRule,
} from '@/features/rewardsWallet/types/rewardsWallet.types'

const PARTNER_TYPE_STYLES: Record<
  PointRulePartnerType,
  { bg: string; text: string; buttonColor: 'primary' | 'warning' }
> = {
  Dealer: { bg: 'primary.light', text: 'primary.dark', buttonColor: 'primary' },
  Chemist: {
    bg: 'secondary.light',
    text: 'secondary.dark',
    buttonColor: 'warning',
  },
}

interface BasePointValueCardProps {
  partnerType: PointRulePartnerType
  rule: PointValueRule | undefined
  setBasePointValue: (value: number, targetRuleId?: string) => Promise<void>
}

function BasePointValueCard({
  partnerType,
  rule,
  setBasePointValue,
}: BasePointValueCardProps) {
  const [baseValue, setBaseValue] = useState(String(rule?.basePointValue ?? ''))
  const [confirmStep, setConfirmStep] = useState<0 | 1 | 2>(0)

  if (!rule) {
    return (
      <Card
        sx={{
          p: 3,
          backgroundColor: PARTNER_TYPE_STYLES[partnerType].bg,
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: '0.75rem',
            color: PARTNER_TYPE_STYLES[partnerType].text,
            mb: 1,
          }}
        >
          {partnerType}
        </Typography>
        <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
          No {partnerType.toLowerCase()} rule configured for this product yet.
        </Typography>
      </Card>
    )
  }

  const baseValueNext = Math.max(0, Number(baseValue) || 0)
  const unchanged = baseValueNext === rule.basePointValue

  const handleFinalConfirm = () => {
    void setBasePointValue(baseValueNext, rule.id)
    setConfirmStep(0)
  }

  return (
    <Card
      sx={{
        p: 3,
        backgroundColor: PARTNER_TYPE_STYLES[partnerType].bg,
      }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2.5,
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: '0.8125rem',
            color: PARTNER_TYPE_STYLES[partnerType].text,
          }}
        >
          {partnerType} Base Point Value
        </Typography>
        <Button
          variant="contained"
          color={PARTNER_TYPE_STYLES[partnerType].buttonColor}
          disabled={unchanged}
          onClick={() => setConfirmStep(1)}
          sx={{ fontSize: '0.8125rem' }}
        >
          Save Changes
        </Button>
      </Stack>

      <TextField
        fullWidth
        type="number"
        label={`New Base Point Value (${partnerType})`}
        size="small"
        slotProps={{ htmlInput: { step: 1, min: 0 } }}
        value={baseValue}
        onChange={(e) => setBaseValue(e.target.value)}
        sx={{
          backgroundColor: 'background.paper',
          borderRadius: `${radius.sm}px`,
        }}
      />

      <Modal
        open={confirmStep === 1}
        onClose={() => setConfirmStep(0)}
        title={`Confirm ${partnerType} Base Point Value Change`}
        description="Please review the change before continuing."
        primaryActionLabel="Continue"
        onPrimaryAction={() => setConfirmStep(2)}
        secondaryActionLabel="Back"
        onSecondaryAction={() => setConfirmStep(0)}
        maxWidth="sm"
      >
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
            This will update the base Point value ({partnerType}) for{' '}
            <strong>{rule.productName}</strong>.
          </Typography>
          <Stack
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
              Base Point Value
            </Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Chip
                size="small"
                variant="outlined"
                label={rule.basePointValue}
              />
              <Typography sx={{ fontSize: '0.75rem', color: 'text.disabled' }}>
                →
              </Typography>
              <Chip size="small" color="primary" label={baseValueNext} />
            </Stack>
          </Stack>
        </Stack>
      </Modal>

      <Modal
        open={confirmStep === 2}
        onClose={() => setConfirmStep(0)}
        title="Are you sure?"
        description="This is your final confirmation — the change is applied immediately and cannot be undone from here."
        primaryActionLabel="Confirm & Save"
        onPrimaryAction={handleFinalConfirm}
        secondaryActionLabel="Back"
        onSecondaryAction={() => setConfirmStep(1)}
        maxWidth="sm"
      >
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
              Base Point Value
            </Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Chip
                size="small"
                variant="outlined"
                label={rule.basePointValue}
              />
              <Typography sx={{ fontSize: '0.75rem', color: 'text.disabled' }}>
                →
              </Typography>
              <Chip size="small" color="primary" label={baseValueNext} />
            </Stack>
          </Stack>
          <Typography sx={{ fontSize: '0.75rem', color: 'warning.main' }}>
            This will recalculate reward Point payouts for every configured
            region of this {partnerType.toLowerCase()} rule going forward.
            Existing partner wallets are not retroactively adjusted.
          </Typography>
        </Stack>
      </Modal>
    </Card>
  )
}

export function EditBasePointValuePage() {
  const navigate = useNavigate()
  const { ruleId } = useParams<{ ruleId: string }>()
  const { rule, siblingRule, setBasePointValue, isLoading } =
    usePointRuleDetail(ruleId)

  if (isLoading) {
    return <DetailsPageSkeleton sections={2} />
  }

  if (!rule) {
    return (
      <EmptyState
        title="Point value rule not found"
        description="This rule may have been removed."
        actionLabel="Back to Point Value Rules"
        onAction={() => navigate('/rewards-wallet/point-value-rules')}
      />
    )
  }

  const dealerRule = rule.partnerType === 'Dealer' ? rule : siblingRule
  const chemistRule = rule.partnerType === 'Chemist' ? rule : siblingRule

  return (
    <>
      <Stack
        direction="row"
        sx={{
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          mb: 1.5,
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'primary.light',
              color: 'primary.main',
            }}
          >
            <Points size={20} />
          </Box>
          <Box>
            <Typography variant="h1">Edit Base Point Value</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {rule.productName} · {rule.modelCode}
            </Typography>
          </Box>
        </Stack>

        <Button
          variant="outlined"
          startIcon={<ArrowBackOutlined size={18} />}
          onClick={() =>
            navigate(`/rewards-wallet/point-value-rules/${rule.id}`)
          }
          sx={{ fontSize: '0.8125rem' }}
        >
          Back to Details
        </Button>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Overview">
          <DetailFieldGrid
            fields={[
              { label: 'Rule ID (Model Code)', value: rule.modelCode },
              { label: 'Product Category', value: rule.productCategory },
              { label: 'Default Point Value', value: rule.defaultPointValue },
              {
                label: 'Base Point Value (Dealer)',
                labelColor: 'primary.main',
                value: (
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.8125rem',
                      color: 'primary.main',
                    }}
                  >
                    {dealerRule?.basePointValue ?? '—'}
                  </Typography>
                ),
              },

              { label: 'Total Configured Regions', value: rule.regions.length },
              { label: 'Last Modified By', value: rule.lastModifiedBy },
              { label: 'Last Updated Time', value: rule.lastUpdatedTime },
              {
                label: 'Base Point Value (Chemist)',
                labelColor: 'secondary.main',
                value: (
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.8125rem',
                      color: 'secondary.main',
                    }}
                  >
                    {chemistRule?.basePointValue ?? '—'}
                  </Typography>
                ),
              },
            ]}
          />
        </SectionCard>

        <Stack spacing={3}>
          <BasePointValueCard
            key={`dealer-${dealerRule?.basePointValue ?? 'none'}`}
            partnerType="Dealer"
            rule={dealerRule}
            setBasePointValue={setBasePointValue}
          />
          <BasePointValueCard
            key={`chemist-${chemistRule?.basePointValue ?? 'none'}`}
            partnerType="Chemist"
            rule={chemistRule}
            setBasePointValue={setBasePointValue}
          />
        </Stack>
      </Stack>
    </>
  )
}
