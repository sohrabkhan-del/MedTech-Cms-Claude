import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Avatar, Box, Button, Checkbox, Chip, Divider, FormControlLabel, Grid, MenuItem, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import {
  UserRound as UserRoundIcon,
  CircleCheck,
  Ban,
  Trash2,
  Store as StoreIcon,
  Pill as PillIcon,
  UserCheck as UserCheckIcon,
  Pencil,
  ArrowLeft as ArrowLeftIcon,
  Mail,
  Phone,
  MapPin,
  Clock,
  Users as UsersIcon,
} from 'lucide-react'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { Modal } from '@/components/common/Modal/Modal'
import { getMedicalRepById, getReplacementMrOptions } from '@/features/systemUsers/mockMedicalReps'
import type { MrManagedPartner, MrPartnerSource, MrPartnerType } from '@/types/medicalRep'
import type { PartnerStatus } from '@/types/partner'

interface PartnerTableFilters extends Record<string, unknown> {
  statuses: PartnerStatus[]
}

const ALL_PARTNER_STATUSES: PartnerStatus[] = ['active', 'pending', 'inactive']

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'background.default',
          color: 'text.secondary',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" sx={{ display: 'block' }}>
          {label}
        </Typography>
        <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', wordBreak: 'break-word' }}>{value}</Typography>
      </Box>
    </Stack>
  )
}

export function MedicalRepDetailsPage() {
  const { mrId } = useParams<{ mrId: string }>()
  const navigate = useNavigate()
  const mr = getMedicalRepById(mrId ?? '')
  const [, forceRerender] = useState(0)
  const [partnerType, setPartnerType] = useState<'All' | MrPartnerType>('All')
  const [source, setSource] = useState<'All' | MrPartnerSource>('All')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [replacementMrId, setReplacementMrId] = useState('')
  const [partnerFilterOpen, setPartnerFilterOpen] = useState(false)
  const [appliedPartnerFilters, setAppliedPartnerFilters] = useState<PartnerTableFilters>({ statuses: [] })

  const replacementOptions = useMemo(
    () => (mr ? getReplacementMrOptions(mr.region, mr.id) : []),
    [mr],
  )

  if (!mr) {
    return (
      <EmptyState
        title="Medical Representative not found"
        description="This MR account may have been removed."
        actionLabel="Back to MR List"
        onAction={() => navigate('/system-users/medical-representatives')}
      />
    )
  }

  const isActive = mr.status === 'active'

  const filteredPartners = mr.managedPartners.filter((partner) => {
    const typeMatch = partnerType === 'All' || partner.partnerType === partnerType
    const sourceMatch = source === 'All' || partner.source === source
    const statusMatch =
      appliedPartnerFilters.statuses.length === 0 || appliedPartnerFilters.statuses.includes(partner.status)
    return typeMatch && sourceMatch && statusMatch
  })

  const dealerCount = mr.managedPartners.filter((p) => p.partnerType === 'Dealer').length
  const chemistCount = mr.managedPartners.filter((p) => p.partnerType === 'Chemist').length
  const onboardedCount = mr.managedPartners.filter((p) => p.source === 'Onboarded').length
  const assignedCount = mr.managedPartners.filter((p) => p.source === 'Assigned').length

  const partnerColumns: CommonTableColumn<MrManagedPartner>[] = [
    { key: 'partnerName', header: 'Partner Name', minWidth: 200, sortable: true, sortValue: (row) => row.partnerName, render: (row) => row.partnerName },
    { key: 'partnerType', header: 'Partner Type', sortable: true, render: (row) => row.partnerType },
    { key: 'city', header: 'City', sortable: true, render: (row) => row.city },
    { key: 'region', header: 'Region', sortable: true, render: (row) => row.region },
    { key: 'source', header: 'Source', sortable: true, render: (row) => row.source },
    {
      key: 'status',
      header: 'Current Status',
      sortable: true,
      sortValue: (row) => row.status,
      render: (row) => <StatusBadge status={row.status} />,
    },
  ]

  const handleDelete = () => {
    setDeleteOpen(false)
    navigate('/system-users/medical-representatives')
  }

  return (
    <>
      <Stack
        direction="row"
        sx={{ alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}
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
              flexShrink: 0,
            }}
          >
            <UserRoundIcon size={18} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant="h1">{mr.name}</Typography>
              <StatusBadge status={mr.status} />
            </Stack>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {mr.id} · Medical Representative · {mr.region}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          {!isActive ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<CircleCheck size={18} />}
              onClick={() => forceRerender((n) => n + 1)}
              sx={{ fontSize: '0.8125rem' }}
            >
              Activate MR
            </Button>
          ) : (
            <Button
              variant="contained"
              color="error"
              startIcon={<Ban size={18} />}
              onClick={() => forceRerender((n) => n + 1)}
              sx={{ fontSize: '0.8125rem' }}
            >
              Deactivate MR
            </Button>
          )}
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Pencil size={16} />}
            onClick={() => navigate(`/system-users/medical-representatives/${mr.id}/edit`)}
            sx={{ fontSize: '0.8125rem' }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Trash2 size={16} />}
            onClick={() => setDeleteOpen(true)}
            sx={{ fontSize: '0.8125rem' }}
          >
            Delete
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ArrowLeftIcon size={18} />}
            onClick={() => navigate('/system-users/medical-representatives')}
            sx={{ fontSize: '0.8125rem' }}
          >
            Back
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Partners Managed" value={mr.totalPartnersManaged} icon={<UsersIcon size={20} />} iconColor="primary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Dealers Onboarded" value={mr.totalDealersOnboarded} icon={<StoreIcon size={20} />} iconColor="secondary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Chemists Onboarded" value={mr.totalChemistsOnboarded} icon={<PillIcon size={20} />} iconColor="info" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Current Status"
              value={mr.status.charAt(0).toUpperCase() + mr.status.slice(1)}
              icon={isActive ? <CircleCheck size={20} /> : <Ban size={20} />}
              iconColor={isActive ? 'success' : 'error'}
            />
          </Grid>
        </Grid>

        <SectionCard
          title="Summary"
          action={<Chip size="small" label={`MR ID: ${mr.id}`} variant="outlined" sx={{ fontWeight: 600, fontSize: '0.75rem' }} />}
        >
          <Stack direction="row" spacing={2.5} sx={{ mb: 3, alignItems: 'center' }}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: '1.25rem', fontWeight: 700 }}>
              {mr.name.slice(0, 1)}
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1.0625rem' }}>{mr.name}</Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Field Representative · {mr.region} Region
              </Typography>
            </Box>
          </Stack>

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <InfoItem icon={<Mail size={16} />} label="Email Address" value={mr.email} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <InfoItem icon={<Phone size={16} />} label="Contact Number" value={mr.phone} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <InfoItem icon={<MapPin size={16} />} label="Region" value={mr.region} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <InfoItem icon={<Clock size={16} />} label="Last Login" value={mr.lastLogin} />
            </Grid>
          </Grid>

          {mr.notes && (
            <>
              <Divider sx={{ my: 2.5 }} />
              <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                Notes
              </Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', lineHeight: 1.6 }}>{mr.notes}</Typography>
            </>
          )}
        </SectionCard>

        <SectionCard title="Partner Management">
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard label="Dealers" value={dealerCount} icon={<StoreIcon size={20} />} iconColor="primary" />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard label="Chemists" value={chemistCount} icon={<PillIcon size={20} />} iconColor="secondary" />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard label="Onboarded" value={onboardedCount} icon={<UserCheckIcon size={20} />} iconColor="success" />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard label="Assigned" value={assignedCount} icon={<UserRoundIcon size={20} />} iconColor="warning" />
            </Grid>
          </Grid>

          <Divider sx={{ mb: 2.5 }} />

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 2, sm: 4 }}
            sx={{ mb: 2.5, flexWrap: 'wrap', rowGap: 2 }}
          >
            <Stack spacing={0.75}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.6875rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'text.secondary' }}>
                Partner Type
              </Typography>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={partnerType}
                onChange={(_, value) => value && setPartnerType(value)}
                sx={{
                  '& .MuiToggleButton-root': {
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 2,
                    height: 34,
                  },
                }}
              >
                <ToggleButton value="All">All</ToggleButton>
                <ToggleButton value="Dealer">Dealers</ToggleButton>
                <ToggleButton value="Chemist">Chemists</ToggleButton>
              </ToggleButtonGroup>
            </Stack>

            <Stack spacing={0.75}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.6875rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'text.secondary' }}>
                Source
              </Typography>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={source}
                onChange={(_, value) => value && setSource(value)}
                sx={{
                  '& .MuiToggleButton-root': {
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 2,
                    height: 34,
                  },
                }}
              >
                <ToggleButton value="All">All</ToggleButton>
                <ToggleButton value="Onboarded">Onboarded</ToggleButton>
                <ToggleButton value="Assigned">Assigned</ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Stack>

          <CommonTable
            tableKey="mr-partner-management"
            columns={partnerColumns}
            rows={filteredPartners}
            getRowId={(row) => row.id}
            searchPlaceholder="Search partners…"
            searchKeys={(row) => `${row.partnerName} ${row.city}`}
            onFilterClick={() => setPartnerFilterOpen(true)}
            filterCount={appliedPartnerFilters.statuses.length}
            emptyTitle="No partners found"
            emptyDescription="Try adjusting the filters above."
          />
        </SectionCard>
      </Stack>

      <FilterDrawer<PartnerTableFilters>
        open={partnerFilterOpen}
        onClose={() => setPartnerFilterOpen(false)}
        title="Filter Partners"
        value={appliedPartnerFilters}
        onApply={setAppliedPartnerFilters}
      >
        {(draft, setDraft) => (
          <Stack spacing={1}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>Current Status</Typography>
            {ALL_PARTNER_STATUSES.map((status) => (
              <FormControlLabel
                key={status}
                control={
                  <Checkbox
                    checked={draft.statuses.includes(status)}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        statuses: e.target.checked
                          ? [...prev.statuses, status]
                          : prev.statuses.filter((s) => s !== status),
                      }))
                    }
                  />
                }
                label={status.charAt(0).toUpperCase() + status.slice(1)}
              />
            ))}
          </Stack>
        )}
      </FilterDrawer>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Medical Representative"
        description="All dealers, chemists, and active locations managed by this MR must be reassigned to another MR from the same region before deletion."
        primaryActionLabel="Confirm Delete & Reassign"
        primaryActionColor="error"
        onPrimaryAction={replacementMrId ? handleDelete : undefined}
      >
        {replacementOptions.length === 0 ? (
          <Typography variant="body1" sx={{ color: 'error.main' }}>
            No other MR is available in the {mr.region} region. Deletion is blocked until a replacement MR exists.
          </Typography>
        ) : (
          <Stack spacing={2}>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Reassigning {mr.totalDealersOnboarded} dealer(s), {mr.totalChemistsOnboarded} chemist(s), and all active
              locations currently managed by {mr.name}.
            </Typography>
            <TextField
              select
              fullWidth
              size="small"
              label="Replacement MR"
              value={replacementMrId}
              onChange={(e) => setReplacementMrId(e.target.value)}
            >
              {replacementOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.name} ({option.region})
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        )}
      </Modal>
    </>
  )
}
