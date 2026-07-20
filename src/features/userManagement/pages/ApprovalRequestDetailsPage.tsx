import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Chip, Stack, TextField, Typography } from '@mui/material'
import { ClipboardCheck as RuleIcon, CircleCheck as CheckCircleOutlined, XCircle as CancelOutlined, MapPin as PlaceOutlined, Download as DownloadOutlined } from 'lucide-react'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { ActivityTimeline } from '@/components/common/ActivityTimeline/ActivityTimeline'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { Modal } from '@/components/common/Modal/Modal'
import { useApprovalRequestDetail } from '@/features/userManagement/hooks/useApprovalRequestDetail'
import type { DocumentVerificationStatus, RequestDocument } from '@/features/userManagement/types/userManagement.types'

const DOC_STATUS_CONFIG: Record<DocumentVerificationStatus, { label: string; color: 'success' | 'warning' | 'error' }> = {
  verified: { label: 'Verified', color: 'success' },
  pending: { label: 'Pending', color: 'warning' },
  rejected: { label: 'Rejected', color: 'error' },
}

const documentColumns: CommonTableColumn<RequestDocument>[] = [
  { key: 'documentName', header: 'Document Name', render: (row) => row.documentName },
  { key: 'uploadDate', header: 'Upload Date', sortable: true, render: (row) => row.uploadDate },
  {
    key: 'verificationStatus',
    header: 'Status',
    sortable: true,
    sortValue: (row) => DOC_STATUS_CONFIG[row.verificationStatus].label,
    render: (row) => (
      <Chip label={DOC_STATUS_CONFIG[row.verificationStatus].label} size="small" color={DOC_STATUS_CONFIG[row.verificationStatus].color} variant="filled" />
    ),
  },
  {
    key: 'actions',
    header: '',
    align: 'right',
    hideable: false,
    render: () => (
      <Button size="small" startIcon={<DownloadOutlined size={20} />} sx={{ fontSize: '0.75rem' }}>
        Preview
      </Button>
    ),
  },
]

export function ApprovalRequestDetailsPage() {
  const navigate = useNavigate()
  const { requestId } = useParams<{ requestId: string }>()
  const { request, decide } = useApprovalRequestDetail(requestId)
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

  const openDialog = (action: 'approve' | 'reject') => {
    setRemarks('')
    setDialog({ open: true, action })
  }

  const confirmDecision = () => {
    decide(dialog.action, remarks)
    setDialog({ open: false, action: 'approve' })
  }

  const auditColumns: CommonTableColumn<(typeof request.auditHistory)[number]>[] = [
    { key: 'date', header: 'Date', sortable: true, render: (row) => row.date },
    { key: 'action', header: 'Action', render: (row) => row.action },
    { key: 'performedBy', header: 'Performed By', render: (row) => row.performedBy },
    { key: 'remarks', header: 'Remarks', render: (row) => row.remarks },
  ]

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
              { label: 'Approval Request ID', value: request.id },
              { label: 'Applicant Name', value: request.applicantName },
              { label: 'Request Type', value: request.requestType },
              { label: 'Current Status', value: <StatusBadge status={request.status} /> },
              { label: 'Submitted Date', value: request.submittedDate },
              { label: 'Registered By', value: request.registeredBy },
            ]}
          />
        </SectionCard>

        <SectionCard title="Applicant Information">
          <DetailFieldGrid
            fields={[
              { label: 'Store / Godown Name', value: request.storeName },
              { label: 'Owner Name', value: request.ownerName },
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
              { label: 'Drug License Number', value: request.drugLicenseNumber },
              { label: 'GST Number', value: request.gstNumber ?? '—' },
              { label: 'Business Category', value: request.businessCategory },
              { label: 'Registration Source', value: request.registeredBy },
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
                    label={request.geoVerificationStatus === 'verified' ? 'Verified' : request.geoVerificationStatus === 'flagged' ? 'Flagged' : 'Unverified'}
                    size="small"
                    color={request.geoVerificationStatus === 'verified' ? 'success' : request.geoVerificationStatus === 'flagged' ? 'error' : 'warning'}
                    variant="filled"
                  />
                ),
              },
            ]}
          />
        </SectionCard>

        <SectionCard title="Verification Documents">
          <CommonTable
            tableKey="approval-request-documents"
            columns={documentColumns}
            rows={request.documents}
            getRowId={(row) => row.id}
            searchPlaceholder="Search documents…"
            searchKeys={(row) => row.documentName}
            defaultSortBy="uploadDate"
            emptyTitle="No documents uploaded"
          />
        </SectionCard>

        <SectionCard title="Approval Timeline">
          <ActivityTimeline entries={request.timeline} emptyTitle="No timeline activity yet" />
        </SectionCard>

        <SectionCard title="Audit History">
          <CommonTable
            tableKey="approval-request-audit"
            columns={auditColumns}
            rows={request.auditHistory}
            getRowId={(row) => row.id}
            searchPlaceholder="Search audit history…"
            searchKeys={(row) => `${row.action} ${row.performedBy} ${row.remarks}`}
            defaultSortBy="date"
            emptyTitle="No audit records yet"
          />
        </SectionCard>
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
