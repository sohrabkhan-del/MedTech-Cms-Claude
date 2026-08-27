import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Button,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material'
import { User, Trash2 as DeleteOutlined } from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { Modal } from '@/components/common/Modal/Modal'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { DetailsPageSkeleton } from '@/components/common/DetailsPageSkeleton/DetailsPageSkeleton'
import { useInterestedUserDetail } from '@/features/marketingProducts/hooks/useInterestedUserDetail'
import {
  LeadActionDialog,
  formatCloseReason,
} from '@/features/marketingProducts/components/LeadActionDialog'
import { useToast } from '@/contexts/ToastContext'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import type { LeadStatus } from '@/features/marketingProducts/types/marketingProducts.types'

const leadStatusConfig: Record<
  LeadStatus,
  { label: string; color: 'info' | 'warning' | 'success' }
> = {
  new: { label: 'New', color: 'info' },
  followed_up: { label: 'Followed Up', color: 'warning' },
  closed: { label: 'Closed', color: 'success' },
}

const leadProgress: Record<LeadStatus, number> = {
  new: 33,
  followed_up: 66,
  closed: 100,
}

export function InterestedUserDetailsPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { leadId } = useParams<{ leadId: string }>()
  const { lead, isLoading, followUp, isFollowingUp, close, isClosing, remove } =
    useInterestedUserDetail(leadId)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [actionMode, setActionMode] = useState<'follow-up' | 'close' | null>(
    null,
  )

  if (isLoading) {
    return <DetailsPageSkeleton sections={4} />
  }

  if (!lead) {
    return (
      <EmptyState
        title="Interest not found"
        description="This interest may have been removed."
        actionLabel="Back to Interested Users"
        onAction={() => navigate('/marketing-products/interested-users')}
      />
    )
  }

  const confirmDelete = async () => {
    try {
      await remove()
      setDeleteOpen(false)
      toast.success('Interest deleted successfully.')
      navigate('/marketing-products/interested-users')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete interest.'))
    }
  }

  async function handleActionSubmit(note: string) {
    try {
      if (actionMode === 'follow-up') {
        await followUp(note)
        toast.success('Interest marked as followed up.')
      } else if (actionMode === 'close') {
        await close(note)
        toast.success('Interest marked as closed.')
      }
      setActionMode(null)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update interest.'))
    }
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
          mb: 3,
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'primary.light',
              color: 'primary.main',
            }}
          >
            <User size={18} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="h1">{lead.userName}</Typography>
              <Chip
                size="small"
                label={leadStatusConfig[lead.leadStatus].label}
                color={leadStatusConfig[lead.leadStatus].color}
              />
            </Stack>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {lead.userType}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            disabled={lead.leadStatus !== 'new'}
            onClick={() => setActionMode('follow-up')}
            sx={{ fontSize: '0.75rem' }}
          >
            Mark as Followed Up
          </Button>
          <Button
            variant="outlined"
            color="success"
            disabled={lead.leadStatus === 'closed'}
            onClick={() => setActionMode('close')}
            sx={{ fontSize: '0.75rem' }}
          >
            Mark as Closed
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteOutlined size={20} />}
            onClick={() => setDeleteOpen(true)}
            sx={{ fontSize: '0.75rem' }}
          >
            Delete Interest
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Summary">
          <DetailFieldGrid
            fields={[
              { label: 'User Name', value: lead.userName },
              { label: 'Business Name', value: lead.businessName },
              { label: 'Interested Product', value: lead.interestedProduct },
              {
                label: 'Current Interest Status',
                value: (
                  <Chip
                    size="small"
                    label={leadStatusConfig[lead.leadStatus].label}
                    color={leadStatusConfig[lead.leadStatus].color}
                  />
                ),
              },
              { label: 'Requested Date', value: lead.requestedDate },
              { label: 'Assigned Executive', value: lead.handledBy || '-' },
            ]}
          />
        </SectionCard>

        <SectionCard title="Interest Information">
          <DetailFieldGrid
            fields={[
              { label: 'Customer Name', value: lead.userName },
              { label: 'Mobile Number', value: lead.mobile },
              { label: 'Product of Interest', value: lead.interestedProduct },
              { label: 'Product Category', value: lead.productCategory },
              {
                label: 'Quantity Requested',
                value: `${lead.quantityRequested} `,
              },
              { label: 'Region', value: lead.region || '-' },
              { label: 'Note', value: lead.note || '-' },
              { label: 'Requested Date', value: lead.requestedDate },
            ]}
          />
        </SectionCard>

        <SectionCard title="Follow-up & Closure">
          <Stack spacing={2}>
            <Box>
              <Stack
                direction="row"
                sx={{ justifyContent: 'space-between', mb: 0.5 }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Interest Progress
                </Typography>
                <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>
                  {leadProgress[lead.leadStatus]}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={leadProgress[lead.leadStatus]}
                color={leadStatusConfig[lead.leadStatus].color}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
            <DetailFieldGrid
              fields={[
                {
                  label: 'Current Status',
                  value: leadStatusConfig[lead.leadStatus].label,
                },
                { label: 'Assigned Executive', value: lead.handledBy || '-' },
                { label: 'Followed Up At', value: lead.followedUpAt || '-' },
                { label: 'Follow-up Note', value: lead.followUpNote || '-' },
                {
                  label: 'Close Reason',
                  value: formatCloseReason(lead.closeReason),
                },
              ]}
            />
          </Stack>
        </SectionCard>
      </Stack>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Interest"
        description={`Are you sure you want to permanently delete this interest for ${lead.userName}? This action cannot be undone.`}
        primaryActionLabel="Delete"
        primaryActionColor="error"
        onPrimaryAction={confirmDelete}
      >
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          {lead.userName} · {lead.interestedProduct}
        </Typography>
      </Modal>

      <LeadActionDialog
        open={actionMode !== null}
        mode={actionMode ?? 'follow-up'}
        onClose={() => setActionMode(null)}
        onSubmit={handleActionSubmit}
        loading={actionMode === 'follow-up' ? isFollowingUp : isClosing}
      />
    </>
  )
}
