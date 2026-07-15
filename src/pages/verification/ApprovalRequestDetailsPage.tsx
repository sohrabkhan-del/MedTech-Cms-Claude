import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Card, Chip, Grid, Stack, TextField, Typography } from '@mui/material'
import RuleIcon from '@mui/icons-material/Rule'
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined'
import CancelOutlined from '@mui/icons-material/CancelOutlined'
import PlaceOutlined from '@mui/icons-material/PlaceOutlined'
import DownloadOutlined from '@mui/icons-material/DownloadOutlined'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { SimpleTable } from '@/components/common/SimpleTable/SimpleTable'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { Modal } from '@/components/common/Modal/Modal'
import { getApprovalRequestById } from '@/features/verification/mockApprovalRequests'
import type { ApprovalStatus, DocumentVerificationStatus } from '@/types/approvalRequest'

const sectionTitleSx = {
  fontWeight: 700,
  fontSize: '0.75rem',
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  color: 'primary.main',
  mb: 2,
}

const DOC_STATUS_CONFIG: Record<DocumentVerificationStatus, { label: string; color: 'success' | 'warning' | 'error' }> = {
  verified: { label: 'Verified', color: 'success' },
  pending: { label: 'Pending', color: 'warning' },
  rejected: { label: 'Rejected', color: 'error' },
}

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem', mt: 0.25 }}>{value}</Typography>
    </Grid>
  )
}

export function ApprovalRequestDetailsPage() {
  const navigate = useNavigate()
  const { requestId } = useParams<{ requestId: string }>()
  const request = requestId ? getApprovalRequestById(requestId) : undefined
  const [statusOverride, setStatusOverride] = useState<ApprovalStatus | null>(null)
  const [dialog, setDialog] = useState<{ open: boolean; action: 'approve' | 'reject' }>({ open: false, action: 'approve' })
  const [remarks, setRemarks] = useState('')

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

  const status = statusOverride ?? request.status

  const openDialog = (action: 'approve' | 'reject') => {
    setRemarks('')
    setDialog({ open: true, action })
  }

  const confirmDecision = () => {
    setStatusOverride(dialog.action === 'approve' ? 'approved' : 'rejected')
    setDialog({ open: false, action: 'approve' })
  }

  return (
    <>
      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
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
            <RuleIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="h1">{request.applicantName}</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {request.id} · {request.requestType}
            </Typography>
          </Box>
        </Stack>
        {status === 'pending' && (
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              color="success"
              startIcon={<CheckCircleOutlined fontSize="small" />}
              onClick={() => openDialog('approve')}
              sx={{ fontSize: '0.75rem' }}
            >
              Approve Request
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelOutlined fontSize="small" />}
              onClick={() => openDialog('reject')}
              sx={{ fontSize: '0.75rem' }}
            >
              Reject Request
            </Button>
          </Stack>
        )}
      </Stack>

      <Stack spacing={3}>
        <Card sx={{ p: 3 }}>
          <Typography sx={sectionTitleSx}>Summary</Typography>
          <Grid container spacing={2.5}>
            <FieldRow label="Approval Request ID" value={request.id} />
            <FieldRow label="Applicant Name" value={request.applicantName} />
            <FieldRow label="Request Type" value={request.requestType} />
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Current Status
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <StatusBadge status={status} />
              </Box>
            </Grid>
            <FieldRow label="Submitted Date" value={request.submittedDate} />
            <FieldRow label="Registered By" value={request.registeredBy} />
          </Grid>
        </Card>

        <Card sx={{ p: 3 }}>
          <Typography sx={sectionTitleSx}>Applicant Information</Typography>
          <Grid container spacing={2.5}>
            <FieldRow label="Store / Godown Name" value={request.storeName} />
            <FieldRow label="Owner Name" value={request.ownerName} />
            <FieldRow label="Email Address" value={request.email} />
            <FieldRow label="Mobile Number" value={request.mobileNumber} />
            <FieldRow label="City" value={request.city} />
            <FieldRow label="Region" value={request.region} />
            <FieldRow label="Complete Address" value={request.completeAddress} />
          </Grid>
        </Card>

        <Card sx={{ p: 3 }}>
          <Typography sx={sectionTitleSx}>Business Information</Typography>
          <Grid container spacing={2.5}>
            <FieldRow label="Drug License Number" value={request.drugLicenseNumber} />
            <FieldRow label="GST Number" value={request.gstNumber ?? '—'} />
            <FieldRow label="Business Category" value={request.businessCategory} />
            <FieldRow label="Registration Source" value={request.registeredBy} />
          </Grid>
        </Card>

        <Card sx={{ p: 3 }}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography sx={{ ...sectionTitleSx, mb: 0 }}>Geo-Tag Information</Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={<PlaceOutlined fontSize="small" />}
              component="a"
              href={`https://www.google.com/maps?q=${request.latitude},${request.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ fontSize: '0.75rem' }}
            >
              Open in Google Maps
            </Button>
          </Stack>
          <Grid container spacing={2.5}>
            <FieldRow label="Latitude" value={request.latitude.toFixed(4)} />
            <FieldRow label="Longitude" value={request.longitude.toFixed(4)} />
            <FieldRow label="Geo-tag Coordinates" value={`${request.latitude.toFixed(4)}, ${request.longitude.toFixed(4)}`} />
            <FieldRow label="Assigned Zone" value={request.assignedZone} />
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Geo Verification Status
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip
                  label={request.geoVerificationStatus === 'verified' ? 'Verified' : request.geoVerificationStatus === 'flagged' ? 'Flagged' : 'Unverified'}
                  size="small"
                  color={request.geoVerificationStatus === 'verified' ? 'success' : request.geoVerificationStatus === 'flagged' ? 'error' : 'warning'}
                  variant="filled"
                />
              </Box>
            </Grid>
          </Grid>
        </Card>

        <Card sx={{ p: 3 }}>
          <Typography sx={sectionTitleSx}>Verification Documents</Typography>
          <SimpleTable
            columns={[
              { key: 'documentName', header: 'Document Name', render: (row) => row.documentName },
              { key: 'uploadDate', header: 'Upload Date', render: (row) => row.uploadDate },
              {
                key: 'verificationStatus',
                header: 'Status',
                render: (row) => (
                  <Chip label={DOC_STATUS_CONFIG[row.verificationStatus].label} size="small" color={DOC_STATUS_CONFIG[row.verificationStatus].color} variant="filled" />
                ),
              },
              {
                key: 'actions',
                header: '',
                align: 'right',
                render: () => (
                  <Button size="small" startIcon={<DownloadOutlined fontSize="small" />} sx={{ fontSize: '0.75rem' }}>
                    Preview
                  </Button>
                ),
              },
            ]}
            rows={request.documents}
            getRowId={(row) => row.id}
            emptyTitle="No documents uploaded"
          />
        </Card>

        <Card sx={{ p: 3 }}>
          <Typography sx={sectionTitleSx}>Approval Timeline</Typography>
          <Stack spacing={0}>
            {request.timeline.map((entry, index) => (
              <Stack key={entry.id} direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
                <Stack sx={{ alignItems: 'center' }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'primary.main', mt: 0.75 }} />
                  {index < request.timeline.length - 1 && <Box sx={{ width: '1px', flexGrow: 1, minHeight: 24, backgroundColor: 'divider' }} />}
                </Stack>
                <Box sx={{ pb: 2.5 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>{entry.activity}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {entry.dateTime}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Card>

        <Card sx={{ p: 3 }}>
          <Typography sx={sectionTitleSx}>Audit History</Typography>
          <SimpleTable
            columns={[
              { key: 'date', header: 'Date', render: (row) => row.date },
              { key: 'action', header: 'Action', render: (row) => row.action },
              { key: 'performedBy', header: 'Performed By', render: (row) => row.performedBy },
              { key: 'remarks', header: 'Remarks', render: (row) => row.remarks },
            ]}
            rows={request.auditHistory}
            getRowId={(row) => row.id}
            emptyTitle="No audit records yet"
          />
        </Card>
      </Stack>

      <Modal
        open={dialog.open}
        onClose={() => setDialog({ open: false, action: 'approve' })}
        title={dialog.action === 'approve' ? 'Approve Request' : 'Reject Request'}
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
          label={dialog.action === 'approve' ? 'Remarks (optional)' : 'Rejection Reason'}
          required={dialog.action === 'reject'}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
      </Modal>
    </>
  )
}
