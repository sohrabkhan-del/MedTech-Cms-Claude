import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Chip, Stack, TextField, Typography } from '@mui/material'
import {
  Ban as BlockIcon,
  RotateCcw as RestoreOutlined,
  CircleCheck as CheckCircleOutlined,
  Trash2 as DeleteOutlined,
  Download as DownloadOutlined,
  FilePlus2 as CreatedIcon,
  ShieldCheck as ApprovedIcon,
  ShieldX as RejectedIcon,
  RotateCcw as ReopenedIcon,
  MessageSquareText as RemarkIcon,
  ClipboardList as DefaultNoteIcon,
  UserRound as MrIcon,
} from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { ActivityTimeline } from '@/components/common/ActivityTimeline/ActivityTimeline'
import { GodownDocumentsCard } from '@/components/common/GodownDocumentsCard/GodownDocumentsCard'
import { LinkedFieldValue } from '@/components/common/LinkedFieldValue/LinkedFieldValue'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { DetailsPageSkeleton } from '@/components/common/DetailsPageSkeleton/DetailsPageSkeleton'
import { Modal } from '@/components/common/Modal/Modal'
import { useApprovalRequestDetail } from '@/features/userManagement/hooks/useApprovalRequestDetail'
import {
  useReopenRequestMutation,
  useDeleteRequestMutation,
} from '@/features/userManagement/services/verificationApi'
import { useToast } from '@/contexts/ToastContext'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

const actionColorMap: Record<
  string,
  'success' | 'error' | 'warning' | 'info' | 'default'
> = {
  approved: 'success',
  rejected: 'error',
  reopened: 'warning',
  created: 'info',
  submitted: 'info',
}

function getActionColor(action: string) {
  return actionColorMap[action.toLowerCase()] ?? 'default'
}

function getActionIcon(action: string) {
  const normalized = action.toLowerCase()
  if (normalized.includes('reject')) return RejectedIcon
  if (normalized.includes('approve')) return ApprovedIcon
  if (normalized.includes('reopen')) return ReopenedIcon
  if (normalized.includes('created') || normalized.includes('submit'))
    return CreatedIcon
  if (normalized.includes('remark')) return RemarkIcon
  return DefaultNoteIcon
}

export function RejectedRequestDetailsPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { requestId } = useParams<{ requestId: string }>()
  const { request, decide, isLoading, isDeciding } =
    useApprovalRequestDetail(requestId)
  const [reopenRequest, { isLoading: isReopening }] = useReopenRequestMutation()
  const [deleteRequest] = useDeleteRequestMutation()
  const [reopened, setReopened] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [reopenOpen, setReopenOpen] = useState(false)
  const [reopenReason, setReopenReason] = useState('')

  if (isLoading) {
    return <DetailsPageSkeleton sections={4} />
  }

  if (!request) {
    return (
      <EmptyState
        title="Rejected request not found"
        description="This request may have been removed."
        actionLabel="Back to Rejected Requests"
        onAction={() => navigate('/verification/rejected-requests')}
      />
    )
  }

  const openReopenDialog = () => {
    setReopenReason('')
    setReopenOpen(true)
  }

  const confirmReopen = async () => {
    try {
      await reopenRequest({ id: request.id, reason: reopenReason }).unwrap()
      toast.success('Request reopened and moved back to Approval Requests.')
      setReopened(true)
      setReopenOpen(false)
      navigate('/verification/approval-requests')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to reopen request.'))
    }
  }

  const handleApprove = async () => {
    try {
      await decide('approve')
      toast.success('Request approved successfully.')
      navigate('/verification/approval-requests')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to approve request.'))
    }
  }

  const confirmDelete = () => {
    deleteRequest(request.id)
    setDeleteOpen(false)
    navigate('/verification/rejected-requests')
  }

  const partnerDetailPath =
    request.requestType === 'Chemist'
      ? `/partners/chemists/${request.id}`
      : `/partners/dealers/${request.id}`

  const timelineEntries = reopened
    ? [
        ...request.timeline,
        {
          id: `${request.id}-reopened`,
          activity: 'Reopened',
          dateTime: 'Moved back to Approval Requests for review',
        },
      ]
    : request.timeline

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
              backgroundColor: 'error.light',
              color: 'error.main',
            }}
          >
            <BlockIcon size={20} />
          </Box>
          <Box>
            <Typography variant="h1">{request.applicantName}</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {request.requestType}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            color="success"
            startIcon={<RestoreOutlined size={20} />}
            disabled={reopened || isReopening || isDeciding}
            loading={isReopening}
            onClick={openReopenDialog}
            sx={{ fontSize: '0.75rem' }}
          >
            {reopened ? 'Reopened' : 'Reopen Request'}
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<CheckCircleOutlined size={20} />}
            disabled={reopened || isReopening || isDeciding}
            loading={isDeciding}
            onClick={handleApprove}
            sx={{ fontSize: '0.75rem' }}
          >
            Approve
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteOutlined size={20} />}
            onClick={() => setDeleteOpen(true)}
            sx={{ fontSize: '0.75rem' }}
          >
            Delete
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadOutlined size={20} />}
            sx={{ fontSize: '0.75rem' }}
          >
            Download Documents
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Summary">
          <DetailFieldGrid
            fields={[
              { label: 'Applicant Name', value: request.applicantName },
              { label: 'User Type', value: request.requestType },
              {
                label: 'Shop Name',
                value: (
                  <LinkedFieldValue to={partnerDetailPath}>
                    {request.storeName}
                  </LinkedFieldValue>
                ),
              },
              {
                label: 'Owner Name',
                value: (
                  <LinkedFieldValue to={partnerDetailPath}>
                    {request.ownerName}
                  </LinkedFieldValue>
                ),
              },
              {
                label: 'Contact Details',
                value: `${request.mobileNumber} · ${request.email}`,
              },
              { label: 'Submitted Date', value: request.submittedDate },
              {
                label: 'Current Status',
                value: (
                  <Chip
                    label={reopened ? 'Reopened (Pending)' : 'Rejected'}
                    size="small"
                    color={reopened ? 'warning' : 'error'}
                    variant="filled"
                  />
                ),
              },
            ]}
          />
        </SectionCard>

        <SectionCard title="Rejection Information">
          <DetailFieldGrid
            fields={[
              { label: 'Rejected By', value: request.reviewedBy ?? '—' },
              { label: 'Rejection Date', value: request.decisionDate ?? '—' },
              {
                label: 'Rejection Reason',
                value: request.rejectionReason ?? '—',
              },
              {
                label: 'Admin Remarks',
                value: request.remarks ?? request.rejectionReason ?? '—',
              },
            ]}
          />
        </SectionCard>

        <SectionCard title="Region & Assigned MR">
          <DetailFieldGrid
            fields={[
              {
                label: 'Region',
                value: request.regionDetail ? (
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center' }}
                  >
                    <Chip
                      label={request.regionDetail.code}
                      size="small"
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.6875rem' }}
                    />
                    {!request.regionDetail.isActive && (
                      <Chip
                        label="Inactive"
                        size="small"
                        color="default"
                        variant="filled"
                      />
                    )}
                  </Stack>
                ) : (
                  request.region
                ),
              },
              {
                label: 'Assigned Medical Representative',
                value: request.assignedMr ? (
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{ alignItems: 'center' }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'primary.light',
                        color: 'primary.main',
                        flexShrink: 0,
                      }}
                    >
                      <MrIcon size={16} />
                    </Box>
                    <Box>
                      <LinkedFieldValue
                        to={`/system-users/medical-representatives/${request.assignedMr.id}`}
                      >
                        {request.assignedMr.fullName}
                      </LinkedFieldValue>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', display: 'block' }}
                      >
                        {request.assignedMr.employeeCode} ·{' '}
                        {request.assignedMr.phone}
                      </Typography>
                    </Box>
                  </Stack>
                ) : (
                  '—'
                ),
              },
            ]}
          />
        </SectionCard>

        <GodownDocumentsCard
          title="Godowns & Documents"
          businesses={request.businesses}
        />

        <SectionCard title="Timeline">
          <ActivityTimeline
            entries={timelineEntries}
            emptyTitle="No timeline activity yet"
          />
        </SectionCard>

        <SectionCard
          title="Verification Notes"
          action={
            <Chip
              label={`${request.auditHistory.length} ${request.auditHistory.length === 1 ? 'entry' : 'entries'}`}
              size="small"
              variant="outlined"
            />
          }
        >
          {request.auditHistory.length === 0 ? (
            <EmptyState
              title="No verification notes yet"
              description="Notes added during review will appear here."
            />
          ) : (
            <Stack spacing={0}>
              {request.auditHistory.map((entry, index) => {
                const isLast = index === request.auditHistory.length - 1
                const color = getActionColor(entry.action)
                const Icon = getActionIcon(entry.action)
                return (
                  <Stack key={entry.id} direction="row" spacing={2}>
                    <Stack sx={{ alignItems: 'center', flexShrink: 0 }}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          backgroundColor: `${color}.light`,
                          color: `${color}.main`,
                          border: '2px solid',
                          borderColor: 'background.paper',
                          boxShadow: '0 0 0 1px currentColor',
                        }}
                      >
                        <Icon size={16} />
                      </Box>
                      {!isLast && (
                        <Box
                          sx={{
                            width: '2px',
                            flex: 1,
                            minHeight: 24,
                            backgroundColor: 'divider',
                            my: 0.5,
                          }}
                        />
                      )}
                    </Stack>

                    <Box
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        pb: isLast ? 0 : 2.5,
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 0.5 }}
                      >
                        <Typography
                          sx={{ fontWeight: 700, fontSize: '0.8125rem' }}
                        >
                          {entry.action}
                        </Typography>
                        <Chip
                          label={entry.date}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.6875rem' }}
                        />
                      </Stack>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: '10px',
                          border: '1px solid',
                          borderColor: 'divider',
                          backgroundColor: 'background.default',
                        }}
                      >
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          {entry.remarks}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary' }}
                        >
                          By {entry.performedBy}
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                )
              })}
            </Stack>
          )}
        </SectionCard>
      </Stack>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Request"
        description={`Are you sure you want to permanently delete request ${request.id}? This action cannot be undone.`}
        primaryActionLabel="Delete"
        primaryActionColor="error"
        onPrimaryAction={confirmDelete}
      >
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          {request.applicantName} · {request.storeName}
        </Typography>
      </Modal>

      <Modal
        open={reopenOpen}
        onClose={() => setReopenOpen(false)}
        title="Reopen Request"
        description="Provide a reason for reopening this request. It will be moved back to Approval Requests for review."
        primaryActionLabel="Reopen"
        primaryActionColor="primary"
        onPrimaryAction={confirmReopen}
        loading={isReopening}
      >
        <TextField
          fullWidth
          multiline
          minRows={3}
          size="small"
          label="Reason for Reopening"
          required
          value={reopenReason}
          onChange={(e) => setReopenReason(e.target.value)}
        />
      </Modal>
    </>
  )
}
