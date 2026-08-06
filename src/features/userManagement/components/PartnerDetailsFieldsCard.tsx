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
        {partner.referenceId && (
          <FieldRow label="Reference ID" value={partner.referenceId} />
        )}
        <FieldRow label={shopLabel} value={partner.shopName} />
        <FieldRow label="Owner Name" value={partner.ownerName} />
        <FieldRow label="Email Address" value={partner.email} />
        <FieldRow label="Phone Number" value={partner.phone} />
        <FieldRow label="GSTN Number" value={partner.licenseNumber} />
        {partner.panNumber && (
          <FieldRow label="PAN Number" value={partner.panNumber} />
        )}
        {partner.drugLicenseNumber && (
          <FieldRow label="Drug License Number" value={partner.drugLicenseNumber} />
        )}
        {partner.drugLicenseExpiry && (
          <FieldRow
            label="Drug License Expiry"
            value={new Date(partner.drugLicenseExpiry).toLocaleDateString('en-IN')}
          />
        )}
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
        {partner.approvalStatus && (
          <FieldRow
            label="Approval Status"
            value={partner.approvalStatus.replace(/_/g, ' ')}
          />
        )}
      </Grid>
      {partner.notes && (
        <Box sx={{ mt: 3, pt: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Notes
          </Typography>
          <Typography
            sx={{
              fontSize: '0.8125rem',
              mt: 0.5,
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6,
            }}
          >
            {partner.notes}
          </Typography>
        </Box>
      )}
    </Card>
  )
}
