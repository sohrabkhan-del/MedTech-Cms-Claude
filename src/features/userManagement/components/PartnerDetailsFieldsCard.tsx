import type { ReactNode } from 'react'
import { Box, Card, Grid, Typography } from '@mui/material'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import type { PartnerBase } from '@/types/partner'

const sectionTitleSx = {
  fontWeight: 700,
  fontSize: '0.75rem',
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  color: 'primary.main',
  mb: 2,
}

function FieldRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
      <Typography
        variant="caption"
        sx={{
          color: 'text.secondary',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem', mt: 0.25 }}>
        {value}
      </Typography>
    </Grid>
  )
}

interface PartnerDetailsFieldsCardProps {
  partner: PartnerBase
  shopLabel: string
}

export function PartnerDetailsFieldsCard({
  partner,
  shopLabel,
}: PartnerDetailsFieldsCardProps) {
  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Typography sx={sectionTitleSx}>Details</Typography>
      <Grid container spacing={2.5}>
        <FieldRow label={shopLabel} value={partner.shopName} />
        <FieldRow label="Owner Name" value={partner.ownerName} />
        <FieldRow label="Email Address" value={partner.email} />
        <FieldRow label="GSTN Number" value={partner.licenseNumber} />
        <FieldRow label="Onboarded By" value={partner.onboardedBy} />
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Status
          </Typography>
          <Box sx={{ mt: 0.5 }}>
            <StatusBadge status={partner.status} />
          </Box>
        </Grid>
      </Grid>
    </Card>
  )
}
