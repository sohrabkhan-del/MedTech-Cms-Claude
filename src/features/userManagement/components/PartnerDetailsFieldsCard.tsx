import { useState, type ReactNode } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Box, Card, Chip, Grid, Link, Stack, Typography } from '@mui/material'
import { Store, Warehouse, MapPin } from 'lucide-react'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { OutletLocationCard } from '@/features/userManagement/components/OutletLocationCard'
import { DocumentGridCard } from '@/components/common/DocumentGridCard/DocumentGridCard'
import type { PartnerBase, PartnerBusinessDetail } from '@/types/partner'

const outletTypeConfig: Record<
  string,
  { label: string; icon: typeof Store }
> = {
  SHOP: { label: 'Shop', icon: Store },
  GODOWN: { label: 'Godown', icon: Warehouse },
  OTHER: { label: 'Other', icon: MapPin },
}

function getOutletTypeInfo(addressType?: PartnerBusinessDetail['addressType']) {
  return (addressType && outletTypeConfig[addressType]) || outletTypeConfig.OTHER
}

const NOTE_PREVIEW_LENGTH = 120

function ExpandableNote({ value }: { value: string }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = value.length > NOTE_PREVIEW_LENGTH

  return (
    <Grid size={12}>
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
          fontWeight: 600,
          fontSize: '0.8125rem',
          mt: 0.25,
          whiteSpace: 'pre-wrap',
          lineHeight: 1.5,
        }}
      >
        {isLong && !expanded
          ? `${value.slice(0, NOTE_PREVIEW_LENGTH).trimEnd()}…`
          : value}
      </Typography>
      {isLong && (
        <Typography
          component="button"
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          sx={{
            border: 'none',
            background: 'none',
            p: 0,
            mt: 0.5,
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'primary.main',
            cursor: 'pointer',
          }}
        >
          {expanded ? 'Show less' : 'Show more'}
        </Typography>
      )}
    </Grid>
  )
}

const sectionTitleSx = {
  fontWeight: 700,
  fontSize: '0.75rem',
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  color: 'primary.main',
  mb: 2,
}

function normalizeDisplayValue(value: ReactNode | null | undefined) {
  if (value === null || value === undefined || value === '') return '-'
  return value
}

function formatDisplayDate(value?: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-IN')
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
        {normalizeDisplayValue(value)}
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
        {partner.country && (
          <FieldRow label="Country" value={partner.country} />
        )}
        <FieldRow label="GSTN Number" value={partner.licenseNumber} />
        {partner.panNumber && (
          <FieldRow label="PAN Number" value={partner.panNumber} />
        )}
        {partner.drugLicenseNumber && (
          <FieldRow
            label="Drug License Number"
            value={partner.drugLicenseNumber}
          />
        )}
        {partner.drugLicenseExpiry && (
          <FieldRow
            label="Drug License Expiry"
            value={new Date(partner.drugLicenseExpiry).toLocaleDateString(
              'en-IN',
            )}
          />
        )}
        <FieldRow label="Onboarded By" value={partner.onboardedBy} />
        <FieldRow
          label="Assigned MR"
          value={
            partner.assignedMrId ? (
              <Link
                component={RouterLink}
                to={`/system-users/medical-representatives/${partner.assignedMrId}`}
                sx={{ fontWeight: 600, fontSize: '0.8125rem' }}
              >
                {partner.assignedMrCode
                  ? `${partner.assignedMr} (${partner.assignedMrCode})`
                  : partner.assignedMr}
              </Link>
            ) : partner.assignedMrCode ? (
              `${partner.assignedMr} (${partner.assignedMrCode})`
            ) : (
              partner.assignedMr
            )
          }
        />
        {(partner.assignedMrPhone || partner.assignedMrEmail) && (
          <FieldRow
            label="MR Contact"
            value={[partner.assignedMrPhone, partner.assignedMrEmail]
              .filter(Boolean)
              .join(' · ')}
          />
        )}
        {(partner.regionName || partner.regionId) && (
          <FieldRow
            label="Region"
            value={partner.regionName || partner.regionId}
          />
        )}
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
      {partner.businesses.length > 0 && (
        <Box
          sx={{
            mt: 3,
            pt: 2.5,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', mb: 2 }}
          >
            <Typography sx={{ ...sectionTitleSx, mb: 0 }}>
              Business Outlets
            </Typography>
            <Chip
              label={partner.businesses.length}
              size="small"
              color="primary"
              sx={{ height: 20, fontSize: '0.6875rem', fontWeight: 700 }}
            />
          </Stack>

          <Stack spacing={2.5}>
            {partner.businesses.map((business, index) => {
              const typeInfo = getOutletTypeInfo(business.addressType)
              const TypeIcon = typeInfo.icon

              return (
                <Box
                  key={`${business.outletName || 'outlet'}-${index}`}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    overflow: 'hidden',
                    bgcolor: 'background.paper',
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{
                      alignItems: 'center',
                      px: 2.5,
                      py: 1.75,
                      bgcolor: 'background.default',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        flexShrink: 0,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                      }}
                    >
                      <TypeIcon size={17} />
                    </Box>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        flex: 1,
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {business.outletName || `Outlet ${index + 1}`}
                    </Typography>
                    {business.addressType && (
                      <Chip
                        label={typeInfo.label}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600, fontSize: '0.6875rem' }}
                      />
                    )}
                  </Stack>

                  <Box sx={{ p: 2.5 }}>
                    <Grid container spacing={2}>
                      {business.panNumber && (
                        <FieldRow
                          label="PAN Number"
                          value={business.panNumber}
                        />
                      )}
                      {business.drugLicenseNumber && (
                        <FieldRow
                          label="Drug License Number"
                          value={business.drugLicenseNumber}
                        />
                      )}
                      {business.drugLicenseExpiry && (
                        <FieldRow
                          label="Drug License Expiry"
                          value={formatDisplayDate(
                            business.drugLicenseExpiry,
                          )}
                        />
                      )}
                      {typeof business.scanRadius === 'number' && (
                        <FieldRow
                          label="Scan Radius"
                          value={`${business.scanRadius} m`}
                        />
                      )}
                      {typeof business.bufferRadius === 'number' && (
                        <FieldRow
                          label="Buffer Radius"
                          value={`${business.bufferRadius} m`}
                        />
                      )}
                      {typeof business.geoAccuracy === 'number' && (
                        <FieldRow
                          label="Geo Accuracy"
                          value={`${business.geoAccuracy} m`}
                        />
                      )}
                      {business.notes && (
                        <ExpandableNote value={business.notes} />
                      )}
                    </Grid>

                    <Box sx={{ mt: 2.25 }}>
                      <OutletLocationCard business={business} index={index} />
                    </Box>

                    {business.documents.length > 0 && (
                      <Box sx={{ mt: 2.25 }}>
                        <DocumentGridCard
                          title="Documents"
                          documents={business.documents}
                          showMetadata={false}
                        />
                      </Box>
                    )}
                  </Box>
                </Box>
              )
            })}
          </Stack>
        </Box>
      )}
      {partner.notes && (
        <Box
          sx={{
            mt: 3,
            pt: 2.5,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
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
