import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  Chip,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { Coins as Points, ArrowLeft as ArrowBackOutlined } from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { Modal } from '@/components/common/Modal/Modal'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { useToast } from '@/contexts/ToastContext'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import {
  useGetProductRegionMultipliersQuery,
  useUpdateProductBasePointsMutation,
} from '@/features/rewardsWallet/services/pointValueRulesApi'

export function EditBasePointValuePage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { ruleId: productId } = useParams<{ ruleId: string }>()
  const { data: detail, isFetching: isLoading } =
    useGetProductRegionMultipliersQuery(productId ?? '', { skip: !productId })
  const [updateBasePoints, { isLoading: isSaving }] =
    useUpdateProductBasePointsMutation()

  const [dealerValue, setDealerValue] = useState('')
  const [chemistValue, setChemistValue] = useState('')
  const [confirmStep, setConfirmStep] = useState<0 | 1 | 2>(0)

  useEffect(() => {
    if (!detail) return
    setDealerValue(String(detail.dealerProductPoints))
    setChemistValue(String(detail.chemistProductPoints))
  }, [detail])

  if (!isLoading && !detail) {
    return (
      <EmptyState
        title="Point value rule not found"
        description="This product may have been removed."
        actionLabel="Back to Point Value Rules"
        onAction={() => navigate('/rewards-wallet/point-value-rules/all')}
      />
    )
  }

  const dealerInput = dealerValue
  const chemistInput = chemistValue
  const dealerNext = Math.max(0, Number(dealerInput) || 0)
  const chemistNext = Math.max(0, Number(chemistInput) || 0)
  const dealerDirty = !!detail && dealerNext !== detail.dealerProductPoints
  const chemistDirty = !!detail && chemistNext !== detail.chemistProductPoints

  const handleFinalConfirm = async () => {
    if (!productId) return
    try {
      await updateBasePoints({
        id: productId,
        dealerProductPoints: dealerNext,
        chemistProductPoints: chemistNext,
      }).unwrap()
      toast.success('Base point values updated successfully.')
      setDealerValue(String(dealerNext))
      setChemistValue(String(chemistNext))
    } catch (err) {
      toast.error(
        getApiErrorMessage(err, 'Failed to update base point values.'),
      )
    }
    setConfirmStep(0)
  }

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
            {detail ? (
              <>
                <Typography variant="h1">Edit Base Point Value</Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  {detail.productName} · {detail.productCode}
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="h1">Edit Base Point Value</Typography>
                <Skeleton variant="text" width={160} height={24} />
              </>
            )}
          </Box>
        </Stack>

        <Button
          variant="outlined"
          startIcon={<ArrowBackOutlined size={18} />}
          onClick={() =>
            navigate(`/rewards-wallet/point-value-rules/${productId}`)
          }
          sx={{ fontSize: '0.8125rem' }}
        >
          Back to Details
        </Button>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Overview">
          {detail ? (
            <DetailFieldGrid
              fields={[
                { label: 'Product Code', value: detail.productCode },
                {
                  label: 'Product Category',
                  value: detail.categoryName ?? '-',
                },
                {
                  label: 'Base Point Value (Dealer)',
                  labelColor: 'primary.main',
                  value: detail.dealerProductPoints,
                },
                {
                  label: 'Base Point Value (Chemist)',
                  labelColor: 'secondary.main',
                  value: detail.chemistProductPoints,
                },
                {
                  label: 'Total Configured Regions',
                  value: detail.regions.length,
                },
                {
                  label: 'Last Updated Time',
                  value: detail.updatedAt
                    ? new Date(detail.updatedAt).toLocaleString('en-IN')
                    : '-',
                },
              ]}
            />
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 2,
              }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <Box key={i}>
                  <Skeleton variant="text" width="60%" height={16} />
                  <Skeleton variant="rounded" width="90%" height={24} />
                </Box>
              ))}
            </Box>
          )}
        </SectionCard>

        <Stack spacing={3}>
          <Card sx={{ p: 3, backgroundColor: 'primary.light' }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '0.8125rem',
                color: 'primary.dark',
                mb: 2.5,
              }}
            >
              Dealer Base Point Value
            </Typography>
            <TextField
              fullWidth
              type="number"
              label="New Base Point Value (Dealer)"
              size="small"
              disabled={!detail}
              slotProps={{ htmlInput: { step: 1, min: 0 } }}
              value={dealerInput}
              onChange={(e) => setDealerValue(e.target.value)}
              sx={{ backgroundColor: 'background.paper', borderRadius: '10px' }}
            />
            {dealerDirty && (
              <Stack direction="row" sx={{ mt: 2.5 }}>
                <Button
                  variant="contained"
                  onClick={() => setConfirmStep(1)}
                  sx={{ fontSize: '0.8125rem' }}
                >
                  Save Changes
                </Button>
              </Stack>
            )}
          </Card>

          <Card sx={{ p: 3, backgroundColor: 'secondary.light' }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '0.8125rem',
                color: 'secondary.dark',
                mb: 2.5,
              }}
            >
              Chemist Base Point Value
            </Typography>
            <TextField
              fullWidth
              type="number"
              label="New Base Point Value (Chemist)"
              size="small"
              disabled={!detail}
              slotProps={{ htmlInput: { step: 1, min: 0 } }}
              value={chemistInput}
              onChange={(e) => setChemistValue(e.target.value)}
              sx={{ backgroundColor: 'background.paper', borderRadius: '10px' }}
            />
            {chemistDirty && (
              <Stack direction="row" sx={{ mt: 2.5 }}>
                <Button
                  variant="contained"
                  color="warning"
                  onClick={() => setConfirmStep(1)}
                  sx={{ fontSize: '0.8125rem' }}
                >
                  Save Changes
                </Button>
              </Stack>
            )}
          </Card>
        </Stack>
      </Stack>

      <Modal
        open={confirmStep === 1}
        onClose={() => setConfirmStep(0)}
        title="Confirm Base Point Value Change"
        description="Please review the change before continuing."
        primaryActionLabel="Continue"
        onPrimaryAction={() => setConfirmStep(2)}
        secondaryActionLabel="Back"
        onSecondaryAction={() => setConfirmStep(0)}
        maxWidth="sm"
      >
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
            This will update the base Point values for{' '}
            <strong>{detail?.productName}</strong>.
          </Typography>
          <Stack
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
              Dealer
            </Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Chip
                size="small"
                variant="outlined"
                label={detail?.dealerProductPoints ?? 0}
              />
              <Typography sx={{ fontSize: '0.75rem', color: 'text.disabled' }}>
                →
              </Typography>
              <Chip size="small" color="primary" label={dealerNext} />
            </Stack>
          </Stack>
          <Stack
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
              Chemist
            </Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Chip
                size="small"
                variant="outlined"
                label={detail?.chemistProductPoints ?? 0}
              />
              <Typography sx={{ fontSize: '0.75rem', color: 'text.disabled' }}>
                →
              </Typography>
              <Chip size="small" color="primary" label={chemistNext} />
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
        onPrimaryAction={() => void handleFinalConfirm()}
        secondaryActionLabel="Back"
        onSecondaryAction={() => setConfirmStep(1)}
        loading={isSaving}
        maxWidth="sm"
      >
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
              Dealer
            </Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Chip
                size="small"
                variant="outlined"
                label={detail?.dealerProductPoints ?? 0}
              />
              <Typography sx={{ fontSize: '0.75rem', color: 'text.disabled' }}>
                →
              </Typography>
              <Chip size="small" color="primary" label={dealerNext} />
            </Stack>
          </Stack>
          <Stack
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
              Chemist
            </Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Chip
                size="small"
                variant="outlined"
                label={detail?.chemistProductPoints ?? 0}
              />
              <Typography sx={{ fontSize: '0.75rem', color: 'text.disabled' }}>
                →
              </Typography>
              <Chip size="small" color="primary" label={chemistNext} />
            </Stack>
          </Stack>
          <Typography sx={{ fontSize: '0.75rem', color: 'warning.main' }}>
            This will recalculate reward Point payouts for every configured
            region of this product going forward. Existing partner wallets are
            not retroactively adjusted.
          </Typography>
        </Stack>
      </Modal>
    </>
  )
}
