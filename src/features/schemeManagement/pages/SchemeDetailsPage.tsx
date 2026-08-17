import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Button,
  Chip,
  Grid,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import {
  Target,
  Sparkle,
  Pencil,
  Copy,
  Trash2,
  Users,
  Gift as GiftIcon,
  MapPin,
  Power,
  PowerOff,
} from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { StatCardSkeleton } from '@/components/common/StatCard/StatCardSkeleton'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { Modal } from '@/components/common/Modal/Modal'
import { DetailsPageSkeleton } from '@/components/common/DetailsPageSkeleton/DetailsPageSkeleton'
import { useSchemeDetail } from '@/features/schemeManagement/hooks/useSchemeDetail'
import { getGiftById } from '@/features/schemeManagement/mockGifts'
import { getProductById } from '@/features/inventoryManagement/mockProducts'
import {
  schemeDealerTotal,
  schemeChemistTotal,
} from '@/features/schemeManagement/mockSchemes'
import { useToast } from '@/contexts/ToastContext'
import type {
  Scheme,
  SchemeApplicableProduct,
  SchemeGiftRule,
  SchemePartnerEntry,
  SchemePartnerStatus,
} from '@/features/schemeManagement/types/schemeManagement.types'

const partnerStatusConfig: Record<
  SchemePartnerStatus,
  { label: string; color: 'success' | 'default' | 'info' }
> = {
  interested: { label: 'Interested', color: 'info' },
  enrolled: { label: 'Enrolled', color: 'default' },
  redeemed: { label: 'Redeemed', color: 'success' },
}

const LIST_PATH = '/scheme-management/schemes'

function applicableProductColumns(): CommonTableColumn<SchemeApplicableProduct>[] {
  return [
    {
      key: 'productName',
      header: 'Product',
      minWidth: 200,
      render: (row) => (
        <>
          <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
            {row.productName ??
              getProductById(row.productId)?.productName ??
              row.productId}
          </Typography>
          {(row.productCode ?? getProductById(row.productId)?.productCode) && (
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
              {row.productCode ?? getProductById(row.productId)?.productCode}
            </Typography>
          )}
        </>
      ),
    },
    {
      key: 'dealerBasePointValue',
      header: 'Dealer Base Point Value',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.dealerBasePointValue ?? 0,
      render: (row) => row.dealerBasePointValue?.toLocaleString('en-IN') ?? '—',
    },
    {
      key: 'chemistBasePointValue',
      header: 'Chemist Base Point Value',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.chemistBasePointValue ?? 0,
      render: (row) =>
        row.chemistBasePointValue?.toLocaleString('en-IN') ?? '—',
    },
    {
      key: 'dealerRegionMultipliers',
      header: 'Dealer Region Multipliers',
      minWidth: 220,
      render: (row) => (
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ flexWrap: 'wrap', gap: 0.5 }}
        >
          {Object.entries(row.dealerRegionMultipliers).map(
            ([region, multiplier]) => (
              <Chip
                key={region}
                size="small"
                variant="outlined"
                label={`${region}: ${multiplier}x`}
              />
            ),
          )}
        </Stack>
      ),
    },
    {
      key: 'chemistRegionMultipliers',
      header: 'Chemist Region Multipliers',
      minWidth: 220,
      render: (row) => (
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ flexWrap: 'wrap', gap: 0.5 }}
        >
          {Object.entries(row.chemistRegionMultipliers).map(
            ([region, multiplier]) => (
              <Chip
                key={region}
                size="small"
                variant="outlined"
                label={`${region}: ${multiplier}x`}
              />
            ),
          )}
        </Stack>
      ),
    },
  ]
}

function giftRuleColumns(
  scheme: Scheme,
  navigate: ReturnType<typeof useNavigate>,
): CommonTableColumn<SchemeGiftRule>[] {
  const columns: CommonTableColumn<SchemeGiftRule>[] = [
    {
      key: 'giftName',
      header: 'Gift',
      minWidth: 200,
      render: (row) => (
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={() =>
            navigate(`/scheme-management/gift-catalogue/${row.giftId}`)
          }
        >
          {row.giftName ?? getGiftById(row.giftId)?.giftName ?? row.giftId}
        </Typography>
      ),
    },
  ]
  if (scheme.partnerTypes.includes('Dealer')) {
    columns.push(
      {
        key: 'dealerPrice',
        header: 'Dealer Price',
        align: 'center',
        render: (row) =>
          row.dealerRule ? row.dealerRule.price.toLocaleString('en-IN') : '—',
      },
      {
        key: 'dealerPoints',
        header: 'Dealer Pts',
        align: 'center',
        sortable: true,
        sortValue: (row) => row.dealerRule?.Points ?? 0,
        render: (row) =>
          row.dealerRule ? row.dealerRule.Points.toLocaleString('en-IN') : '—',
      },
      {
        key: 'dealerDiscountPrice',
        header: 'Dealer Discount Points',
        align: 'center',
        render: (row) =>
          row.dealerRule
            ? row.dealerRule.discountPrice.toLocaleString('en-IN')
            : '—',
      },
    )
  }
  if (scheme.partnerTypes.includes('Chemist')) {
    columns.push(
      {
        key: 'chemistPrice',
        header: 'Chemist Price',
        align: 'center',
        render: (row) =>
          row.chemistRule ? row.chemistRule.price.toLocaleString('en-IN') : '—',
      },
      {
        key: 'chemistPoints',
        header: 'Chemist Pts',
        align: 'center',
        sortable: true,
        sortValue: (row) => row.chemistRule?.Points ?? 0,
        render: (row) =>
          row.chemistRule
            ? row.chemistRule.Points.toLocaleString('en-IN')
            : '—',
      },
      {
        key: 'chemistDiscountPrice',
        header: 'Chemist Discount Points',
        align: 'center',
        render: (row) =>
          row.chemistRule
            ? row.chemistRule.discountPrice.toLocaleString('en-IN')
            : '—',
      },
    )
  }
  return columns
}

function partnerColumns(
  partnerType: 'Dealer' | 'Chemist',
  navigate: ReturnType<typeof useNavigate>,
): CommonTableColumn<SchemePartnerEntry>[] {
  const basePath =
    partnerType === 'Dealer' ? '/partners/dealers' : '/partners/chemists'
  return [
    {
      key: 'name',
      header: 'Name',
      minWidth: 180,
      sortable: true,
      sortValue: (row) => row.name,
      render: (row) => (
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={() => navigate(`${basePath}/${row.id}`)}
        >
          {row.name}
        </Typography>
      ),
    },
    {
      key: 'region',
      header: 'Region',
      minWidth: 120,
      render: (row) => row.region,
    },
    {
      key: 'Points',
      header: 'Current Points',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.Points,
      render: (row) => row.Points.toLocaleString('en-IN'),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Chip
          size="small"
          label={partnerStatusConfig[row.status].label}
          color={partnerStatusConfig[row.status].color}
        />
      ),
    },
  ]
}

export function SchemeDetailsPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { schemeId } = useParams<{ schemeId: string }>()
  const { scheme, remove, setStatus, isLoading } = useSchemeDetail(schemeId)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [partnerTab, setPartnerTab] = useState<'Dealer' | 'Chemist'>('Dealer')

  if (isLoading) {
    return <DetailsPageSkeleton sections={5} />
  }

  if (!scheme) {
    return (
      <EmptyState
        title="Scheme not found"
        description="This scheme may have been removed."
        actionLabel="Back to Schemes"
        onAction={() => navigate(LIST_PATH)}
      />
    )
  }

  const dealerTotal = schemeDealerTotal(scheme)
  const chemistTotal = schemeChemistTotal(scheme)

  const confirmDelete = () => {
    remove()
    setDeleteOpen(false)
    navigate(LIST_PATH)
  }

  const toggleStatus = async () => {
    const nextStatus = scheme.status === 'active' ? 'inactive' : 'active'
    await setStatus(nextStatus)
    toast.success(
      `Scheme ${nextStatus === 'active' ? 'activated' : 'deactivated'} successfully.`,
    )
  }

  const activePartnerTab = scheme.partnerTypes.includes(partnerTab)
    ? partnerTab
    : scheme.partnerTypes[0]
  const partnerRows =
    activePartnerTab === 'Dealer'
      ? scheme.partners.dealer
      : scheme.partners.chemist

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
            }}
          >
            {scheme.type === 'general' ? (
              <Target size={18} />
            ) : (
              <Sparkle size={18} />
            )}
          </Box>
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="h1">{scheme.name}</Typography>
              <Chip
                size="small"
                label={scheme.type === 'general' ? 'General' : 'Seasonal'}
                color={scheme.type === 'general' ? 'default' : 'info'}
              />
              <Chip
                size="small"
                label={scheme.status === 'active' ? 'Active' : 'Inactive'}
                color={scheme.status === 'active' ? 'success' : 'default'}
              />
            </Stack>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            color={scheme.status === 'active' ? 'error' : 'success'}
            startIcon={
              scheme.status === 'active' ? (
                <PowerOff size={20} />
              ) : (
                <Power size={20} />
              )
            }
            onClick={toggleStatus}
            sx={{ fontSize: '0.75rem' }}
          >
            {scheme.status === 'active' ? 'Deactivate' : 'Activate'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Pencil size={20} />}
            onClick={() => navigate(`${LIST_PATH}/${scheme.id}/edit`)}
            sx={{ fontSize: '0.75rem' }}
          >
            Edit Scheme
          </Button>
          <Button
            variant="outlined"
            startIcon={<Copy size={20} />}
            onClick={() => navigate(`${LIST_PATH}/new?cloneFrom=${scheme.id}`)}
            sx={{ fontSize: '0.75rem' }}
          >
            Clone
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Trash2 size={20} />}
            onClick={() => setDeleteOpen(true)}
            sx={{ fontSize: '0.75rem' }}
          >
            Delete
          </Button>
        </Stack>
      </Stack>

      {scheme.banner && (
        <Box
          component="img"
          src={scheme.banner}
          alt={`${scheme.name} banner`}
          sx={{
            width: '100%',
            height: { xs: 140, sm: 200 },
            objectFit: 'cover',
            borderRadius: '14px',
            mb: 3,
          }}
        />
      )}

      <Stack spacing={3}>
        <SectionCard title="Scheme Summary">
          <DetailFieldGrid
            fields={[
              {
                label: 'Scheme Code',
                value: scheme.schemeCode ?? scheme.code ?? '—',
              },
              {
                label: 'Type',
                value: scheme.type === 'general' ? 'General' : 'Seasonal',
              },
              {
                label: 'Status',
                value: (
                  <Chip
                    size="small"
                    label={scheme.status === 'active' ? 'Active' : 'Inactive'}
                    color={scheme.status === 'active' ? 'success' : 'default'}
                  />
                ),
              },
              {
                label: 'Priority',
                value:
                  scheme.priority != null ? scheme.priority.toString() : '—',
              },
              { label: 'Start Date', value: scheme.startDate },
              { label: 'End Date', value: scheme.endDate ?? 'No end date' },
              {
                label: 'Dealer Points',
                value: (
                  scheme.totalDealerPoints ??
                  dealerTotal ??
                  0
                ).toLocaleString('en-IN'),
              },
              {
                label: 'Chemist Points',
                value: (
                  scheme.totalChemistPoints ??
                  chemistTotal ??
                  0
                ).toLocaleString('en-IN'),
              },
              {
                label: 'Applicable to All Products',
                value: scheme.applicableToAllProducts ? 'Yes' : 'No',
              },
              {
                label: 'Auto Enroll',
                value: scheme.autoEnroll ? 'Yes' : 'No',
              },
              {
                label: 'Redemption Type',
                value: scheme.redemptionType ?? '—',
              },
              {
                label: 'Point Calculation',
                value: scheme.pointCalculationType ?? '—',
              },
            ]}
          />
        </SectionCard>

        <SectionCard title="Partner Coverage">
          <DetailFieldGrid
            fields={[
              { label: 'Partner Types', value: scheme.partnerTypes.join(', ') },
              ...(scheme.partnerTypes.includes('Dealer')
                ? [
                    {
                      label: 'Dealer Regions',
                      value: scheme.dealerRegions.join(', ') || '—',
                    },
                  ]
                : []),
              ...(scheme.partnerTypes.includes('Chemist')
                ? [
                    {
                      label: 'Chemist Regions',
                      value: scheme.chemistRegions.join(', ') || '—',
                    },
                  ]
                : []),
              ...(scheme.partnerTypes.includes('Dealer')
                ? [
                    {
                      label: 'Dealer Points to Claim',
                      value: dealerTotal.toLocaleString('en-IN'),
                    },
                  ]
                : []),
              ...(scheme.partnerTypes.includes('Chemist')
                ? [
                    {
                      label: 'Chemist Points to Claim',
                      value: chemistTotal.toLocaleString('en-IN'),
                    },
                  ]
                : []),
            ]}
          />
        </SectionCard>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            {isLoading ? (
              <StatCardSkeleton />
            ) : (
              <StatCard
                label="Attached Gifts"
                value={scheme.giftRules.length}
                icon={<GiftIcon size={20} />}
                iconColor="primary"
              />
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            {isLoading ? (
              <StatCardSkeleton />
            ) : (
              <StatCard
                label="Regions Covered"
                value={scheme.regions.length}
                icon={<MapPin size={20} />}
                iconColor="secondary"
              />
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            {isLoading ? (
              <StatCardSkeleton />
            ) : (
              <StatCard
                label="Enrolled Dealers"
                value={
                  scheme.partners.dealer.filter(
                    (p) => p.status !== 'interested',
                  ).length
                }
                icon={<Users size={20} />}
                iconColor="success"
              />
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            {isLoading ? (
              <StatCardSkeleton />
            ) : (
              <StatCard
                label="Enrolled Chemists"
                value={
                  scheme.partners.chemist.filter(
                    (p) => p.status !== 'interested',
                  ).length
                }
                icon={<Users size={20} />}
                iconColor="warning"
              />
            )}
          </Grid>
        </Grid>

        <SectionCard title="Applicable Products">
          <CommonTable
            tableKey="scheme-applicable-products"
            columns={applicableProductColumns()}
            rows={scheme.applicableProducts}
            getRowId={(row) => row.productId}
            loading={isLoading}
            searchPlaceholder="Search products…"
            searchKeys={(row) =>
              getProductById(row.productId)?.productName ?? row.productId
            }
            emptyTitle="No products attached yet"
          />
        </SectionCard>

        <SectionCard title="Attached Gift Products">
          <CommonTable
            tableKey="scheme-gift-rules"
            columns={giftRuleColumns(scheme, navigate)}
            rows={scheme.giftRules}
            getRowId={(row) => row.giftId}
            loading={isLoading}
            searchPlaceholder="Search gifts…"
            searchKeys={(row) =>
              getGiftById(row.giftId)?.giftName ?? row.giftId
            }
            emptyTitle="No gifts attached yet"
          />
        </SectionCard>

        {scheme.description && (
          <SectionCard title="Description">
            <Typography
              sx={{
                fontSize: '0.8125rem',
                color: 'text.secondary',
                lineHeight: 1.6,
              }}
            >
              {scheme.description}
            </Typography>
          </SectionCard>
        )}

        {scheme.disclaimer && (
          <SectionCard title="Disclaimer">
            <Typography
              sx={{
                fontSize: '0.8125rem',
                color: 'text.secondary',
                lineHeight: 1.6,
              }}
            >
              {scheme.disclaimer}
            </Typography>
          </SectionCard>
        )}

        <SectionCard title="Interested Partners">
          <Tabs
            value={activePartnerTab}
            onChange={(_, value) => setPartnerTab(value)}
            sx={{ mb: 2, minHeight: 36 }}
          >
            {scheme.partnerTypes.includes('Dealer') && (
              <Tab
                value="Dealer"
                label={`Dealer (${scheme.partners.dealer.length})`}
                sx={{ minHeight: 36, fontSize: '0.8125rem' }}
              />
            )}
            {scheme.partnerTypes.includes('Chemist') && (
              <Tab
                value="Chemist"
                label={`Chemist (${scheme.partners.chemist.length})`}
                sx={{ minHeight: 36, fontSize: '0.8125rem' }}
              />
            )}
          </Tabs>
          <CommonTable
            tableKey={`scheme-partners-${activePartnerTab}`}
            columns={partnerColumns(activePartnerTab, navigate)}
            rows={partnerRows}
            getRowId={(row) => row.id}
            searchPlaceholder="Search partners…"
            searchKeys={(row) => `${row.name} ${row.region}`}
            emptyTitle="No partners yet"
          />
        </SectionCard>
      </Stack>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Scheme"
        description={`Are you sure you want to permanently delete "${scheme.name}"? This action cannot be undone.`}
        primaryActionLabel="Delete"
        primaryActionColor="error"
        onPrimaryAction={confirmDelete}
      >
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          {scheme.id} · {scheme.name}
        </Typography>
      </Modal>
    </>
  )
}
