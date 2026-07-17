import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Chip, Grid, LinearProgress, Stack, Typography } from '@mui/material'
import { ArrowLeft as ArrowBackOutlined, User, Sparkles, Clock3, CheckCheck, Users, Trash2 as DeleteOutlined } from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { Modal } from '@/components/common/Modal/Modal'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { getInterestedUserById, interestedUserKpis } from '@/features/marketing/mockInterestedUsers'
import type { LeadStatus } from '@/types/interestedUser'

const leadStatusConfig: Record<LeadStatus, { label: string; color: 'info' | 'warning' | 'success' }> = {
  new: { label: 'New', color: 'info' },
  in_progress: { label: 'In Progress', color: 'warning' },
  closed: { label: 'Closed', color: 'success' },
}

export function InterestedUserDetailsPage() {
  const navigate = useNavigate()
  const { leadId } = useParams<{ leadId: string }>()
  const lead = leadId ? getInterestedUserById(leadId) : undefined
  const [status, setStatus] = useState<LeadStatus | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (!lead) {
    return (
      <EmptyState
        title="Lead not found"
        description="This lead may have been removed."
        actionLabel="Back to Interested Users"
        onAction={() => navigate('/marketing-products/interested-users')}
      />
    )
  }

  const currentStatus = status ?? lead.leadStatus
  const progress = currentStatus === 'closed' ? 100 : lead.progressPercentage

  const confirmDelete = () => {
    setDeleteOpen(false)
    navigate('/marketing-products/interested-users')
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
            <User size={18} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="h1">{lead.userName}</Typography>
              <Chip size="small" label={leadStatusConfig[currentStatus].label} color={leadStatusConfig[currentStatus].color} />
            </Stack>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {lead.id} · {lead.userType}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" disabled={currentStatus === 'in_progress' || currentStatus === 'closed'} onClick={() => setStatus('in_progress')} sx={{ fontSize: '0.75rem' }}>
            Mark as In Progress
          </Button>
          <Button variant="outlined" color="success" disabled={currentStatus === 'closed'} onClick={() => setStatus('closed')} sx={{ fontSize: '0.75rem' }}>
            Mark as Closed
          </Button>
          <Button variant="outlined" color="error" startIcon={<DeleteOutlined size={20} />} onClick={() => setDeleteOpen(true)} sx={{ fontSize: '0.75rem' }}>
            Delete Lead
          </Button>
          <Button variant="outlined" startIcon={<ArrowBackOutlined size={20} />} onClick={() => navigate('/marketing-products/interested-users')} sx={{ fontSize: '0.75rem' }}>
            Back to List
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Summary">
          <DetailFieldGrid
            fields={[
              { label: 'Lead ID', value: lead.id },
              { label: 'User Name', value: lead.userName },
              { label: 'Interested Product', value: lead.interestedProduct },
              { label: 'Current Lead Status', value: <Chip size="small" label={leadStatusConfig[currentStatus].label} color={leadStatusConfig[currentStatus].color} /> },
              { label: 'Requested Date', value: lead.requestedDate },
              { label: 'Assigned Executive', value: lead.handledBy },
            ]}
          />
        </SectionCard>

        <SectionCard title="Lead Information">
          <DetailFieldGrid
            fields={[
              { label: 'Customer Name', value: lead.userName },
              { label: 'Product of Interest', value: lead.interestedProduct },
              { label: 'Requested Date', value: lead.requestedDate },
              { label: 'Lead Source', value: lead.leadSource },
              { label: 'Assigned To', value: lead.handledBy },
              { label: 'Current Status', value: leadStatusConfig[currentStatus].label },
            ]}
          />
        </SectionCard>

        <SectionCard title="Lead Progress">
          <Stack spacing={2}>
            <DetailFieldGrid
              fields={[
                { label: 'Current Stage', value: leadStatusConfig[currentStatus].label },
                { label: 'Assigned Executive', value: lead.handledBy },
                { label: 'Last Activity', value: lead.lastActivity },
                { label: 'Follow-up Status', value: lead.followUpStatus },
              ]}
            />
            <Box>
              <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Progress Percentage
                </Typography>
                <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>{progress}%</Typography>
              </Stack>
              <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
            </Box>
          </Stack>
        </SectionCard>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Total Interested Users" value={interestedUserKpis.totalInterestedUsers} icon={<Users size={20} />} iconColor="primary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="New Leads" value={interestedUserKpis.newLeads} icon={<Sparkles size={20} />} iconColor="info" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="In Progress Leads" value={interestedUserKpis.inProgressLeads} icon={<Clock3 size={20} />} iconColor="warning" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Converted Leads" value={interestedUserKpis.closedLeads} icon={<CheckCheck size={20} />} iconColor="success" />
          </Grid>
        </Grid>

        <SectionCard title="Record Summary">
          <DetailFieldGrid
            fields={[
              { label: 'User Name', value: lead.userName },
              { label: 'Interested Product', value: lead.interestedProduct },
              { label: 'Lead Status', value: leadStatusConfig[currentStatus].label },
              { label: 'Requested Date', value: lead.requestedDate },
              { label: 'Assigned Executive', value: lead.handledBy },
            ]}
          />
        </SectionCard>
      </Stack>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Lead"
        description={`Are you sure you want to permanently delete this lead for ${lead.userName}? This action cannot be undone.`}
        primaryActionLabel="Delete"
        primaryActionColor="error"
        onPrimaryAction={confirmDelete}
      >
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          {lead.userName} · {lead.interestedProduct}
        </Typography>
      </Modal>
    </>
  )
}
