import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Chip, Stack, TextField, Typography } from '@mui/material'
import {
  ClipboardCheck as RuleIcon,
  CircleCheck as CheckCircleOutlined,
  XCircle as CancelOutlined,
  MapPin as PlaceOutlined,
  UserRound as MrIcon,
} from 'lucide-react'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { ActivityTimeline } from '@/components/common/ActivityTimeline/ActivityTimeline'
import { GodownDocumentsCard } from '@/components/common/GodownDocumentsCard/GodownDocumentsCard'
import { LinkedFieldValue } from '@/components/common/LinkedFieldValue/LinkedFieldValue'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { DetailsPageSkeleton } from '@/components/common/DetailsPageSkeleton/DetailsPageSkeleton'
import { Modal } from '@/components/common/Modal/Modal'
import { useApprovalRequestDetail } from '@/features/userManagement/hooks/useApprovalRequestDetail'

export function ApprovalRequestDetailsPage() {
  const navigate = useNavigate()
  const { requestId } = useParams<{ requestId: string }>()
  const { request, decide, isLoading } = useApprovalRequestDetail(requestId)
  const [dialog, setDialog] = useState<{
    open: boolean
    action: 'approve' | 'reject'
  }>({ open: false, action: 'approve' })
  const [remarks, setRemarks] = useState('')

  if (isLoading) {
    return <DetailsPageSkeleton sections={6} />
  }

  if (!request) {
    return (
      <EmptyState
        title="Approval request not found"
        description="This request may have been removed."
        actionLabel="Back to Approval Requests"
        onAction={() => navigate('/verification/approval-requests')}
      />
    )
  }

  const openDialog = (action: 'approve' | 'reject') => {
    setRemarks('')
    setDialog({ open: true, action })
  }

  const confirmDecision = () => {
    decide(dialog.action, remarks)
    setDialog({ open: false, action: 'approve' })
  }

  const partnerDetailPath =
    request.requestType === 'Chemist'
      ? `/partners/chemists/${request.id}`
      : `/partners/dealers/${request.id}`

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
            <RuleIcon size={20} />
          </Box>
          <Box>
            <Typography variant="h1">{request.applicantName}</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {request.id} · {request.requestType}
            </Typography>
          </Box>
        </Stack>
        {request.status === 'pending' && (
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              color="success"
              startIcon={<CheckCircleOutlined size={20} />}
              onClick={() => openDialog('approve')}
              sx={{ fontSize: '0.75rem' }}
            >
              Approve Request
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelOutlined size={20} />}
              onClick={() => openDialog('reject')}
              sx={{ fontSize: '0.75rem' }}
            >
              Reject Request
            </Button>
          </Stack>
        )}
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Summary">
          <DetailFieldGrid
            fields={[
              { label: 'Partner Name', value: request.applicantName },
              { label: 'Partner Type', value: request.requestType },
              {
                label: 'Current Status',
                value: <StatusBadge status={request.status} />,
              },
              { label: 'Submitted Date', value: request.submittedDate },
              { label: 'Registered By', value: request.registeredBy },
            ]}
          />
        </SectionCard>

        <SectionCard title="Applicant Information">
          <DetailFieldGrid
            fields={[
              {
                label: 'Store / Godown Name',
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
              { label: 'Email Address', value: request.email },
              { label: 'Mobile Number', value: request.mobileNumber },
              { label: 'City', value: request.city },
              { label: 'Region', value: request.region },
              { label: 'Complete Address', value: request.completeAddress },
            ]}
          />
        </SectionCard>

        <SectionCard title="Business Information">
          <DetailFieldGrid
            fields={[
              { label: 'GST Number', value: request.gstNumber ?? '—' },
              { label: 'Registration Source', value: request.registeredBy },
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

        <SectionCard
          title="Geo-Tag Information"
          action={
            <Button
              size="small"
              variant="outlined"
              startIcon={<PlaceOutlined size={20} />}
              component="a"
              href={`https://www.google.com/maps?q=${request.latitude},${request.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ fontSize: '0.75rem' }}
            >
              Open in Google Maps
            </Button>
          }
        >
          <DetailFieldGrid
            fields={[
              { label: 'Latitude', value: request.latitude.toFixed(4) },
              { label: 'Longitude', value: request.longitude.toFixed(4) },
              { label: 'Assigned Zone', value: request.assignedZone },
              {
                label: 'Geo Verification Status',
                value: (
                  <Chip
                    label={
                      request.geoVerificationStatus === 'verified'
                        ? 'Verified'
                        : request.geoVerificationStatus === 'flagged'
                          ? 'Flagged'
                          : 'Unverified'
                    }
                    size="small"
                    color={
                      request.geoVerificationStatus === 'verified'
                        ? 'success'
                        : request.geoVerificationStatus === 'flagged'
                          ? 'error'
                          : 'warning'
                    }
                    variant="filled"
                  />
                ),
              },
            ]}
          />
        </SectionCard>

        <GodownDocumentsCard
          title="Godowns & Documents"
          businesses={request.businesses}
        />

        <SectionCard title="Approval Timeline">
          <ActivityTimeline
            entries={request.timeline}
            emptyTitle="No timeline activity yet"
          />
        </SectionCard>
      </Stack>

      <Modal
        open={dialog.open}
        onClose={() => setDialog({ open: false, action: 'approve' })}
        title={
          dialog.action === 'approve' ? 'Approve Request' : 'Reject Request'
        }
        description={
          dialog.action === 'approve'
            ? 'The applicant will be activated and eligible for login and reward activities.'
            : 'Provide a reason for rejecting this request. The applicant will remain inactive.'
        }
        primaryActionLabel={dialog.action === 'approve' ? 'Approve' : 'Reject'}
        primaryActionColor={dialog.action === 'approve' ? 'primary' : 'error'}
        onPrimaryAction={confirmDecision}
      >
        <TextField
          fullWidth
          multiline
          minRows={3}
          size="small"
          label={
            dialog.action === 'approve'
              ? 'Remarks (optional)'
              : 'Rejection Reason'
          }
          required={dialog.action === 'reject'}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
      </Modal>
    </>
  )
}
