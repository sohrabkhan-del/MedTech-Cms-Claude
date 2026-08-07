import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Avatar,
  Button,
  Card,
  Grid,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { CircleCheck, Ban, Pencil, Trash2 } from 'lucide-react'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { Modal } from '@/components/common/Modal/Modal'
import type { PartnerBase } from '@/types/partner'

interface PartnerSummaryHeaderProps {
  partner: PartnerBase
  shopLabel?: string
  onActivate: () => void
  onDeactivate: () => void
  isUpdatingStatus?: boolean
  onDelete?: () => Promise<boolean | void> | boolean | void
  isDeleting?: boolean
  editPath?: string
}

export function PartnerSummaryHeader({
  partner,
  shopLabel = 'Shop Name',
  onActivate,
  onDeactivate,
  isUpdatingStatus = false,
  onDelete,
  isDeleting = false,
  editPath,
}: PartnerSummaryHeaderProps) {
  const navigate = useNavigate()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const isActive = partner.status === 'active'
  const assignedMrLabel = partner.assignedMrName ?? partner.assignedMr
  const assignedMrMeta = [partner.assignedMrCode, partner.assignedMrPhone]
    .filter(Boolean)
    .join(' · ')

  return (
    <>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{
          justifyContent: 'space-between',
          alignItems: { md: 'center' },
          mb: 2,
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
            {partner.shopName}
          </Typography>
          <StatusBadge status={partner.status} />
        </Stack>

        <Stack
          direction="row"
          spacing={1.5}
          sx={{ flexWrap: 'nowrap', flexShrink: 0 }}
        >
          {isActive ? (
            <Button
              variant="contained"
              color="error"
              startIcon={<Ban size={18} />}
              onClick={onDeactivate}
              loading={isUpdatingStatus}
              sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}
            >
              Deactivate
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              startIcon={<CircleCheck size={18} />}
              onClick={onActivate}
              loading={isUpdatingStatus}
              sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}
            >
              Activate
            </Button>
          )}
          {editPath && (
            <Button
              variant="outlined"
              startIcon={<Pencil size={16} />}
              onClick={() => navigate(editPath)}
              sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}
            >
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<Trash2 size={16} />}
              onClick={() => setDeleteDialogOpen(true)}
              sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}
            >
              Delete
            </Button>
          )}
        </Stack>
      </Stack>

      <Card sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: 'primary.main',
              fontSize: '1.25rem',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {partner.shopName.slice(0, 1)}
          </Avatar>
          <Stack spacing={1.5} sx={{ justifyContent: 'center', flex: 1, minWidth: 0 }}>
              <Grid
                container
                spacing={2}
                sx={{ alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
              >
                <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                  <Typography variant="caption" sx={{ display: 'block' }}>
                    {shopLabel}
                  </Typography>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    {partner.shopName}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                  <Typography variant="caption" sx={{ display: 'block' }}>
                    City / Region
                  </Typography>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    {partner.city} · {partner.zone}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                  <Typography variant="caption" sx={{ display: 'block' }}>
                    Contact Number
                  </Typography>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    {partner.phone}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                  <Typography variant="caption" sx={{ display: 'block' }}>
                    Assigned MR
                  </Typography>
                  <Tooltip title={partner.assignedMrEmail ?? ''}>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      {assignedMrLabel}
                    </Typography>
                  </Tooltip>
                  {assignedMrMeta && (
                    <Typography
                      variant="caption"
                      sx={{ display: 'block', color: 'text.secondary' }}
                    >
                      {assignedMrMeta}
                    </Typography>
                  )}
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                  <Typography variant="caption" sx={{ display: 'block' }}>
                    Geo-tag Status
                  </Typography>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                    {partner.geoLock.active ? 'Tagged' : 'Pending'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 4, md: 2 }}>
                  <Typography variant="caption" sx={{ display: 'block' }}>
                    Points Earned
                  </Typography>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      color: 'primary.main',
                    }}
                  >
                    {partner.availablePoints.toLocaleString('en-IN')}
                  </Typography>
                </Grid>
              </Grid>
          </Stack>
        </Stack>
      </Card>

      {onDelete && (
        <Modal
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          title="Delete Partner"
          description={`Are you sure you want to delete "${partner.shopName}"? This action cannot be undone.`}
          primaryActionLabel="Delete"
          primaryActionColor="error"
          loading={isDeleting}
          onPrimaryAction={async () => {
            const result = await onDelete()
            if (result !== false) {
              setDeleteDialogOpen(false)
            }
          }}
        >
          <span />
        </Modal>
      )}
    </>
  )
}
