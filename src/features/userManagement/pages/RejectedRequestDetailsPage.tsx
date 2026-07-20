import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Chip, Stack, Typography } from '@mui/material'
import { Ban as BlockIcon, RotateCcw as RestoreOutlined, CircleCheck as CheckCircleOutlined, Trash2 as DeleteOutlined, Download as DownloadOutlined } from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { ActivityTimeline } from '@/components/common/ActivityTimeline/ActivityTimeline'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { Modal } from '@/components/common/Modal/Modal'
import { useApprovalRequestDetail } from '@/features/userManagement/hooks/useApprovalRequestDetail'
import { verificationService } from '@/features/userManagement/services/verificationService'
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
        Download
      </Button>
    ),
  },
]

export function RejectedRequestDetailsPage() {
  const navigate = useNavigate()
  const { requestId } = useParams<{ requestId: string }>()
  const { request } = useApprovalRequestDetail(requestId)
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

  const handleReopen = () => {
    verificationService.reopenRequest(request.id)
    setReopened(true)
  }

  const confirmDelete = () => {
    verificationService.deleteRequest(request.id)
    setDeleteOpen(false)
    navigate('/verification/rejected-requests')
  }

  const auditColumns: CommonTableColumn<(typeof request.auditHistory)[number]>[] = [
    { key: 'date', header: 'Date', sortable: true, render: (row) => row.date },
    { key: 'action', header: 'Action', render: (row) => row.action },
    { key: 'performedBy', header: 'Performed By', render: (row) => row.performedBy },
    { key: 'remarks', header: 'Remarks', render: (row) => row.remarks },
  ]

  const timelineEntries = reopened
    ? [...request.timeline, { id: `${request.id}-reopened`, activity: 'Reopened', dateTime: 'Moved back to Approval Requests for review' }]
    : request.timeline

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
            <BlockIcon size={20} />
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
            startIcon={<RestoreOutlined size={20} />}
            disabled={reopened}
            onClick={handleReopen}
            sx={{ fontSize: '0.75rem' }}
          >
            {reopened ? 'Reopened' : 'Reopen Request'}
          </Button>
          <Button variant="outlined" color="primary" startIcon={<CheckCircleOutlined size={20} />} disabled={reopened} sx={{ fontSize: '0.75rem' }}>
            Approve
          </Button>
          <Button variant="outlined" color="error" startIcon={<DeleteOutlined size={20} />} onClick={() => setDeleteOpen(true)} sx={{ fontSize: '0.75rem' }}>
            Delete
          </Button>
          <Button variant="outlined" startIcon={<DownloadOutlined size={20} />} sx={{ fontSize: '0.75rem' }}>
            Download Documents
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Summary">
          <DetailFieldGrid
            fields={[
              { label: 'Request ID', value: request.id },
              { label: 'Applicant Name', value: request.applicantName },
              { label: 'User Type', value: request.requestType },
              { label: 'Shop Name', value: request.storeName },
              { label: 'Owner Name', value: request.ownerName },
              { label: 'Contact Details', value: `${request.mobileNumber} · ${request.email}` },
              { label: 'Region', value: request.region },
              { label: 'Submitted Date', value: request.submittedDate },
              {
                label: 'Current Status',
                value: <Chip label={reopened ? 'Reopened (Pending)' : 'Rejected'} size="small" color={reopened ? 'warning' : 'error'} variant="filled" />,
              },
            ]}
          />
        </SectionCard>

        <SectionCard title="Rejection Information">
          <DetailFieldGrid
            fields={[
              { label: 'Rejected By', value: request.reviewedBy ?? '—' },
              { label: 'Rejection Date', value: request.decisionDate ?? '—' },
              { label: 'Rejection Reason', value: request.rejectionReason ?? '—' },
              { label: 'Admin Remarks', value: request.remarks ?? request.rejectionReason ?? '—' },
            ]}
          />
        </SectionCard>

        <SectionCard title="Supporting Documents">
          <CommonTable
            tableKey="rejected-request-documents"
            columns={documentColumns}
            rows={request.documents}
            getRowId={(row) => row.id}
            searchPlaceholder="Search documents…"
            searchKeys={(row) => row.documentName}
            defaultSortBy="uploadDate"
            emptyTitle="No documents uploaded"
          />
        </SectionCard>

        <SectionCard title="Timeline">
          <ActivityTimeline entries={timelineEntries} emptyTitle="No timeline activity yet" />
        </SectionCard>

        <SectionCard title="Verification Notes">
          <CommonTable
            tableKey="rejected-request-audit"
            columns={auditColumns}
            rows={request.auditHistory}
            getRowId={(row) => row.id}
            searchPlaceholder="Search verification notes…"
            searchKeys={(row) => `${row.action} ${row.performedBy} ${row.remarks}`}
            defaultSortBy="date"
            emptyTitle="No verification notes yet"
          />
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
    </>
  )
}
