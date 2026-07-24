import { Avatar, Button, Card, Grid, Stack, Typography } from '@mui/material'
import { CircleCheck, Ban } from 'lucide-react'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import type { PartnerBase } from '@/types/partner'

interface PartnerSummaryHeaderProps {
  partner: PartnerBase
  shopLabel?: string
  onActivate: () => void
  onDeactivate: () => void
}

export function PartnerSummaryHeader({
  partner,
  shopLabel = 'Shop Name',
  onActivate,
  onDeactivate,
}: PartnerSummaryHeaderProps) {
  const isActive = partner.status === 'active'

  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={2}>
          <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: '1.25rem', fontWeight: 700 }}>
            {partner.shopName.slice(0, 1)}
          </Avatar>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography sx={{ fontWeight: 700, fontSize: '1.25rem' }}>{partner.shopName}</Typography>
              <StatusBadge status={partner.status} />
            </Stack>
            <Typography variant="caption">ID: {partner.id}</Typography>

            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant="caption" sx={{ display: 'block' }}>
                  {shopLabel}
                </Typography>
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{partner.shopName}</Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant="caption" sx={{ display: 'block' }}>
                  City / Region
                </Typography>
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  {partner.city} · {partner.zone}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant="caption" sx={{ display: 'block' }}>
                  Contact Number
                </Typography>
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{partner.phone}</Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant="caption" sx={{ display: 'block' }}>
                  Assigned MR
                </Typography>
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>{partner.assignedMr}</Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant="caption" sx={{ display: 'block' }}>
                  Geo-tag Status
                </Typography>
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  {partner.geoLock.active ? 'Tagged' : 'Pending'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant="caption" sx={{ display: 'block' }}>
                  Points Earned
                </Typography>
                <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: 'primary.main' }}>
                  {partner.availableCoins.toLocaleString('en-IN')}
                </Typography>
              </Grid>
            </Grid>
          </Stack>
        </Stack>

        <Stack spacing={1} sx={{ minWidth: 220 }}>
          <Typography variant="caption" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>
            Account Actions
          </Typography>
          <Stack direction="row" spacing={1.5}>
            <Button
              variant={isActive ? 'outlined' : 'contained'}
              color="primary"
              startIcon={<CircleCheck />}
              onClick={onActivate}
              disabled={isActive}
              fullWidth
            >
              Activate
            </Button>
            <Button
              variant={isActive ? 'contained' : 'outlined'}
              color="error"
              startIcon={<Ban />}
              onClick={onDeactivate}
              disabled={!isActive}
              fullWidth
            >
              Deactivate
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  )
}
