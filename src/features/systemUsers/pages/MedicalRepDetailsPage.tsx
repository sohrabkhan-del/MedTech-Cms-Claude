import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Avatar,
  Box,
  Button,
  Divider,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import {
  UserRound as UserRoundIcon,
  CircleCheck,
  Ban,
  Trash2,
  Store as StoreIcon,
  Pill as PillIcon,
  Pencil,
  ArrowLeft as ArrowLeftIcon,
  Mail,
  Phone,
  MapPin,
  Users as UsersIcon,
} from 'lucide-react'
import {
  StatusBadge,
  type BadgeStatus,
} from '@/components/common/StatusBadge/StatusBadge'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { StatCardSkeleton } from '@/components/common/StatCard/StatCardSkeleton'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { ModularTabs } from '@/components/common/ModularTabs/ModularTabs'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { DetailsPageSkeleton } from '@/components/common/DetailsPageSkeleton/DetailsPageSkeleton'
import { Modal } from '@/components/common/Modal/Modal'
import { useMedicalRepDetail } from '@/features/systemUsers/hooks/useMedicalRepDetail'
import {
  useGetMrPartnersQuery,
  type MrPartnerRow,
} from '@/features/systemUsers/services/mrPartnersApi'
import { useGetMedicalRepOptionsQuery } from '@/features/systemUsers/services/medicalRepsApi'
import { useToast } from '@/contexts/ToastContext'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

type PartnerTab = 'CHEMIST' | 'DEALER'

const PARTNER_TABS: { label: string; value: PartnerTab }[] = [
  { label: 'Chemists', value: 'CHEMIST' },
  { label: 'Dealers', value: 'DEALER' },
]

function partnerBadgeStatus(status: string): BadgeStatus {
  const normalized = status.toLowerCase() as BadgeStatus
  const known: BadgeStatus[] = [
    'active',
    'pending',
    'inactive',
    'suspended',
    'approved',
    'rejected',
    're_rejected',
    'pending_approval',
    'expired',
    'upcoming',
  ]
  return known.includes(normalized) ? normalized : 'inactive'
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}) {
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
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '0.875rem',
            wordBreak: 'break-word',
          }}
        >
          {value}
        </Typography>
      </Box>
    </Stack>
  )
}

export function MedicalRepDetailsPage() {
  const { mrId } = useParams<{ mrId: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const {
    mr,
    setStatus,
    remove,
    isLoading,
    isStatusUpdating,
    isDeleting,
  } = useMedicalRepDetail(mrId)
  const [partnerTab, setPartnerTab] = useState<PartnerTab>('CHEMIST')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [replacementMrId, setReplacementMrId] = useState('')
  const { data: mrOptions = [], isFetching: isMrOptionsLoading } =
    useGetMedicalRepOptionsQuery(undefined, { skip: !deleteOpen })

  const { data: partnersResult, isFetching: isPartnersLoading } =
    useGetMrPartnersQuery(
      mrId
        ? {
            assignedMedicalRepresentativeId: mrId,
            type: partnerTab,
            page: 1,
            limit: 100,
            sortOrder: 'desc',
          }
        : { assignedMedicalRepresentativeId: '', type: partnerTab },
      { skip: !mrId },
    )
  const partners = partnersResult?.items ?? []
  const replacementOptions = mrOptions.filter((option) => option.id !== mrId)

  if (isLoading) {
    return <DetailsPageSkeleton sections={3} />
  }

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

  const partnerColumns: CommonTableColumn<MrPartnerRow>[] = [
    {
      key: 'businessName',
      header: 'Outlet / Business Name',
      minWidth: 200,
      sortable: true,
      sortValue: (row) => row.businessName,
      render: (row) => row.businessName,
    },
    {
      key: 'ownerName',
      header: 'Owner Name',
      sortable: true,
      sortValue: (row) => row.ownerName,
      render: (row) => row.ownerName,
    },
    { key: 'city', header: 'City', sortable: true, render: (row) => row.city },
    {
      key: 'phone',
      header: 'Phone',
      render: (row) => row.phone,
    },
    {
      key: 'status',
      header: 'Current Status',
      sortable: true,
      sortValue: (row) => row.status,
      render: (row) => <StatusBadge status={partnerBadgeStatus(row.status)} />,
    },
  ]

  const handleDelete = async () => {
    const success = await remove(replacementMrId)
    if (success) {
      setDeleteOpen(false)
      setReplacementMrId('')
      navigate('/system-users/medical-representatives')
    }
  }

  function handleDeleteModalClose() {
    setDeleteOpen(false)
    setReplacementMrId('')
  }

  async function handleSetStatus(status: 'active' | 'inactive') {
    try {
      await setStatus(status)
      toast.success(
        status === 'active'
          ? 'MR activated successfully.'
          : 'MR deactivated successfully.',
      )
    } catch (err) {
      toast.error(
        getApiErrorMessage(
          err,
          status === 'active'
            ? 'Failed to activate MR.'
            : 'Failed to deactivate MR.',
        ),
      )
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
              flexShrink: 0,
            }}
          >
            <UserRoundIcon size={18} />
          </Box>
          <Box>
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', flexWrap: 'wrap' }}
            >
              <Typography variant="h1">{mr.name}</Typography>
              <StatusBadge status={mr.status} />
            </Stack>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Medical Representative · {mr.region}
            </Typography>
          </Box>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', flexWrap: 'wrap' }}
        >
          {!isActive ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<CircleCheck size={18} />}
              onClick={() => handleSetStatus('active')}
              loading={isStatusUpdating}
              sx={{ fontSize: '0.8125rem' }}
            >
              Activate MR
            </Button>
          ) : (
            <Button
              variant="contained"
              color="error"
              startIcon={<Ban size={18} />}
              onClick={() => handleSetStatus('inactive')}
              loading={isStatusUpdating}
              sx={{ fontSize: '0.8125rem' }}
            >
              Deactivate MR
            </Button>
          )}
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Pencil size={16} />}
            onClick={() =>
              navigate(`/system-users/medical-representatives/${mr.id}/edit`)
            }
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
            {isLoading ? (
              <StatCardSkeleton />
            ) : (
              <StatCard
                label="Partners Managed"
                value={mr.totalPartnersManaged}
                icon={<UsersIcon size={20} />}
                iconColor="primary"
              />
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            {isLoading ? (
              <StatCardSkeleton />
            ) : (
              <StatCard
                label="Dealers Onboarded"
                value={mr.totalDealersOnboarded}
                icon={<StoreIcon size={20} />}
                iconColor="secondary"
              />
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            {isLoading ? (
              <StatCardSkeleton />
            ) : (
              <StatCard
                label="Chemists Onboarded"
                value={mr.totalChemistsOnboarded}
                icon={<PillIcon size={20} />}
                iconColor="info"
              />
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            {isLoading ? (
              <StatCardSkeleton />
            ) : (
              <StatCard
                label="Current Status"
                value={mr.status.charAt(0).toUpperCase() + mr.status.slice(1)}
                icon={isActive ? <CircleCheck size={20} /> : <Ban size={20} />}
                iconColor={isActive ? 'success' : 'error'}
              />
            )}
          </Grid>
        </Grid>

        <SectionCard title="Summary">
          <Stack
            direction="row"
            spacing={2.5}
            sx={{ mb: 3, alignItems: 'center' }}
          >
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: 'primary.main',
                fontSize: '1.25rem',
                fontWeight: 700,
              }}
            >
              {mr.name.slice(0, 1)}
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1.0625rem' }}>
                {mr.name}
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Field Representative · {mr.region} Region
              </Typography>
            </Box>
          </Stack>

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoItem
                icon={<Mail size={16} />}
                label="Email Address"
                value={mr.email}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoItem
                icon={<Phone size={16} />}
                label="Contact Number"
                value={mr.phone}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <InfoItem
                icon={<MapPin size={16} />}
                label="Region"
                value={mr.region}
              />
            </Grid>
          </Grid>

          {mr.notes && (
            <>
              <Divider sx={{ my: 2.5 }} />
              <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                Notes
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.8125rem',
                  color: 'text.secondary',
                  lineHeight: 1.6,
                }}
              >
                {mr.notes}
              </Typography>
            </>
          )}
        </SectionCard>

        <SectionCard title="Partner Management">
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 6, sm: 3 }}>
              {isLoading ? (
                <StatCardSkeleton />
              ) : (
                <StatCard
                  label="Dealers"
                  value={mr.totalDealersOnboarded}
                  icon={<StoreIcon size={20} />}
                  iconColor="primary"
                />
              )}
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              {isLoading ? (
                <StatCardSkeleton />
              ) : (
                <StatCard
                  label="Chemists"
                  value={mr.totalChemistsOnboarded}
                  icon={<PillIcon size={20} />}
                  iconColor="secondary"
                />
              )}
            </Grid>
          </Grid>

          <Divider sx={{ mb: 2.5 }} />

          <Box sx={{ mb: 2.5 }}>
            <ModularTabs
              tabs={PARTNER_TABS}
              value={partnerTab}
              onChange={setPartnerTab}
            />
          </Box>

          <CommonTable
            key={partnerTab}
            tableKey="mr-partner-management"
            columns={partnerColumns}
            rows={partners}
            getRowId={(row) => row.id}
            loading={isPartnersLoading}
            searchPlaceholder={
              partnerTab === 'CHEMIST' ? 'Search chemists…' : 'Search dealers…'
            }
            searchKeys={(row) =>
              `${row.businessName} ${row.ownerName} ${row.city}`
            }
            emptyTitle={
              partnerTab === 'CHEMIST'
                ? 'No chemists found'
                : 'No dealers found'
            }
            emptyDescription="This MR has no partners of this type yet."
          />
        </SectionCard>
      </Stack>

      <Modal
        open={deleteOpen}
        onClose={handleDeleteModalClose}
        title="Delete Medical Representative"
        description="All dealers, chemists, and active locations managed by this MR must be reassigned to another MR from the same region before deletion."
        primaryActionLabel="Confirm Delete & Reassign"
        primaryActionColor="error"
        onPrimaryAction={replacementMrId ? handleDelete : undefined}
        loading={isDeleting}
      >
        {isMrOptionsLoading ? (
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Loading medical representatives...
          </Typography>
        ) : replacementOptions.length === 0 ? (
          <Typography variant="body1" sx={{ color: 'error.main' }}>
            No other MR is available. Deletion is blocked until a replacement
            MR exists.
          </Typography>
        ) : (
          <Stack spacing={2}>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Reassigning {mr.totalDealersOnboarded} dealer(s),{' '}
              {mr.totalChemistsOnboarded} chemist(s), and all active locations
              currently managed by {mr.name}.
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
                  {option.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        )}
      </Modal>
    </>
  )
}
