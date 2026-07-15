import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Card, Chip, Grid, Stack, Typography } from '@mui/material'
import BlockIcon from '@mui/icons-material/Block'
import RestoreOutlined from '@mui/icons-material/RestoreOutlined'
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined'
import DeleteOutlined from '@mui/icons-material/DeleteOutlined'
import DownloadOutlined from '@mui/icons-material/DownloadOutlined'
import { SimpleTable } from '@/components/common/SimpleTable/SimpleTable'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { Modal } from '@/components/common/Modal/Modal'
import { getApprovalRequestById } from '@/features/verification/mockApprovalRequests'
import type { DocumentVerificationStatus } from '@/types/approvalRequest'

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

export function RejectedRequestDetailsPage() {
  const navigate = useNavigate()
  const { requestId } = useParams<{ requestId: string }>()
  const request = requestId ? getApprovalRequestById(requestId) : undefined
  const [reopened, setReopened] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

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

  const confirmDelete = () => {
    setDeleteOpen(false)
    navigate('/verification/rejected-requests')
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
              backgroundColor: 'error.light',
              color: 'error.main',
            }}
          >
            <BlockIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="h1">{request.applicantName}</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {request.id} · {request.requestType}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            color="success"
            startIcon={<RestoreOutlined fontSize="small" />}
            disabled={reopened}
            onClick={() => setReopened(true)}
            sx={{ fontSize: '0.75rem' }}
          >
            {reopened ? 'Reopened' : 'Reopen Request'}
          </Button>
          <Button variant="outlined" color="primary" startIcon={<CheckCircleOutlined fontSize="small" />} disabled={reopened} sx={{ fontSize: '0.75rem' }}>
            Approve
          </Button>
          <Button variant="outlined" color="error" startIcon={<DeleteOutlined fontSize="small" />} onClick={() => setDeleteOpen(true)} sx={{ fontSize: '0.75rem' }}>
            Delete
          </Button>
          <Button variant="outlined" startIcon={<DownloadOutlined fontSize="small" />} sx={{ fontSize: '0.75rem' }}>
            Download Documents
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <Card sx={{ p: 3 }}>
          <Typography sx={sectionTitleSx}>Summary</Typography>
          <Grid container spacing={2.5}>
            <FieldRow label="Request ID" value={request.id} />
            <FieldRow label="Applicant Name" value={request.applicantName} />
            <FieldRow label="User Type" value={request.requestType} />
            <FieldRow label="Shop Name" value={request.storeName} />
            <FieldRow label="Owner Name" value={request.ownerName} />
            <FieldRow label="Contact Details" value={`${request.mobileNumber} · ${request.email}`} />
            <FieldRow label="Region" value={request.region} />
            <FieldRow label="Submitted Date" value={request.submittedDate} />
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Current Status
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip label={reopened ? 'Reopened (Pending)' : 'Rejected'} size="small" color={reopened ? 'warning' : 'error'} variant="filled" />
              </Box>
            </Grid>
          </Grid>
        </Card>

        <Card sx={{ p: 3 }}>
          <Typography sx={sectionTitleSx}>Rejection Information</Typography>
          <Grid container spacing={2.5}>
            <FieldRow label="Rejected By" value={request.reviewedBy ?? '—'} />
            <FieldRow label="Rejection Date" value={request.decisionDate ?? '—'} />
            <FieldRow label="Rejection Reason" value={request.rejectionReason ?? '—'} />
            <FieldRow label="Admin Remarks" value={request.remarks ?? request.rejectionReason ?? '—'} />
          </Grid>
        </Card>

        <Card sx={{ p: 3 }}>
          <Typography sx={sectionTitleSx}>Supporting Documents</Typography>
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
                    Download
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
          <Typography sx={sectionTitleSx}>Timeline</Typography>
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
            {reopened && (
              <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'primary.main', mt: 0.75 }} />
                <Box sx={{ pb: 2.5 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>Reopened</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Moved back to Approval Requests for review
                  </Typography>
                </Box>
              </Stack>
            )}
          </Stack>
        </Card>

        <Card sx={{ p: 3 }}>
          <Typography sx={sectionTitleSx}>Verification Notes</Typography>
          <SimpleTable
            columns={[
              { key: 'date', header: 'Date', render: (row) => row.date },
              { key: 'action', header: 'Action', render: (row) => row.action },
              { key: 'performedBy', header: 'Performed By', render: (row) => row.performedBy },
              { key: 'remarks', header: 'Remarks', render: (row) => row.remarks },
            ]}
            rows={request.auditHistory}
            getRowId={(row) => row.id}
            emptyTitle="No verification notes yet"
          />
        </Card>
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
    </>
  )
}
