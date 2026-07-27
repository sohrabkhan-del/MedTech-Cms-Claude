import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Chip, Grid, Stack, Tab, Tabs, Typography } from '@mui/material'
import {
  Target,
  Sparkle,
  ArrowLeft as ArrowBackOutlined,
  Pencil,
  Copy,
  Trash2,
  Users,
  Gift as GiftIcon,
  MapPin,
} from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { StatCardSkeleton } from '@/components/common/StatCard/StatCardSkeleton'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { Modal } from '@/components/common/Modal/Modal'
import { DetailsPageSkeleton } from '@/components/common/DetailsPageSkeleton/DetailsPageSkeleton'
import { useSchemeDetail } from '@/features/schemeManagement/hooks/useSchemeDetail'
import { getGiftById } from '@/features/schemeManagement/mockGifts'
import { schemeDealerTotal, schemeChemistTotal } from '@/features/schemeManagement/mockSchemes'
import type { Scheme, SchemeProduct, SchemePartnerEntry, SchemePartnerStatus } from '@/features/schemeManagement/types/schemeManagement.types'

const partnerStatusConfig: Record<SchemePartnerStatus, { label: string; color: 'success' | 'default' | 'info' }> = {
  interested: { label: 'Interested', color: 'info' },
  enrolled: { label: 'Enrolled', color: 'default' },
  redeemed: { label: 'Redeemed', color: 'success' },
}

const LIST_PATH = '/scheme-management/schemes'

function productColumns(scheme: Scheme, navigate: ReturnType<typeof useNavigate>): CommonTableColumn<SchemeProduct>[] {
  const columns: CommonTableColumn<SchemeProduct>[] = [
    {
      key: 'productName',
      header: 'Product',
      minWidth: 200,
      render: (row) => (
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={() => navigate(`/scheme-management/gift-catalogue/${row.productId}`)}
        >
          {getGiftById(row.productId)?.giftName ?? row.productId}
        </Typography>
      ),
    },
  ]
  if (scheme.partnerTypes.includes('Dealer')) {
    columns.push({
      key: 'dealerPoints',
      header: 'Dealer Pts',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.dealerPoints,
      render: (row) => row.dealerPoints.toLocaleString('en-IN'),
    })
  }
  if (scheme.partnerTypes.includes('Chemist')) {
    columns.push({
      key: 'chemistPoints',
      header: 'Chemist Pts',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.chemistPoints,
      render: (row) => row.chemistPoints.toLocaleString('en-IN'),
    })
  }
  return columns
}

function partnerColumns(
  partnerType: 'Dealer' | 'Chemist',
  navigate: ReturnType<typeof useNavigate>,
): CommonTableColumn<SchemePartnerEntry>[] {
  const basePath = partnerType === 'Dealer' ? '/partners/dealers' : '/partners/chemists'
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
    { key: 'region', header: 'Region', minWidth: 120, render: (row) => row.region },
    {
      key: 'points',
      header: 'Current Points',
      align: 'center',
      sortable: true,
      sortValue: (row) => row.points,
      render: (row) => row.points.toLocaleString('en-IN'),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Chip size="small" label={partnerStatusConfig[row.status].label} color={partnerStatusConfig[row.status].color} />,
    },
  ]
}

export function SchemeDetailsPage() {
  const navigate = useNavigate()
  const { schemeId } = useParams<{ schemeId: string }>()
  const { scheme, remove, isLoading } = useSchemeDetail(schemeId)
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

  const activePartnerTab = scheme.partnerTypes.includes(partnerTab) ? partnerTab : scheme.partnerTypes[0]
  const partnerRows = activePartnerTab === 'Dealer' ? scheme.partners.dealer : scheme.partners.chemist

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
            {scheme.type === 'general' ? <Target size={18} /> : <Sparkle size={18} />}
          </Box>
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="h1">{scheme.name}</Typography>
              <Chip size="small" label={scheme.type === 'general' ? 'General' : 'Seasonal'} color={scheme.type === 'general' ? 'default' : 'info'} />
            </Stack>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {scheme.id}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
          <Button variant="outlined" startIcon={<Pencil size={20} />} onClick={() => navigate(`${LIST_PATH}/${scheme.id}/edit`)} sx={{ fontSize: '0.75rem' }}>
            Edit Scheme
          </Button>
          <Button variant="outlined" startIcon={<Copy size={20} />} onClick={() => navigate(`${LIST_PATH}/new?cloneFrom=${scheme.id}`)} sx={{ fontSize: '0.75rem' }}>
            Clone
          </Button>
          <Button variant="outlined" color="error" startIcon={<Trash2 size={20} />} onClick={() => setDeleteOpen(true)} sx={{ fontSize: '0.75rem' }}>
            Delete
          </Button>
          <Button variant="outlined" startIcon={<ArrowBackOutlined size={20} />} onClick={() => navigate(LIST_PATH)} sx={{ fontSize: '0.75rem' }}>
            Back
          </Button>
        </Stack>
      </Stack>

      {scheme.banner && (
        <Box
          component="img"
          src={scheme.banner}
          alt={`${scheme.name} banner`}
          sx={{ width: '100%', height: { xs: 140, sm: 200 }, objectFit: 'cover', borderRadius: '14px', mb: 3 }}
        />
      )}

      <Stack spacing={3}>
        <SectionCard title="Scheme Summary">
          <DetailFieldGrid
            fields={[
              { label: 'Scheme ID', value: scheme.id },
              { label: 'Type', value: scheme.type === 'general' ? 'General' : 'Seasonal' },
              { label: 'Start Date', value: scheme.startDate },
              { label: 'End Date', value: scheme.endDate ?? 'No end date' },
              { label: 'Regions', value: scheme.regions.join(', ') },
              { label: 'Partner Types', value: scheme.partnerTypes.join(', ') },
              ...(scheme.partnerTypes.includes('Dealer') ? [{ label: 'Dealer Points to Claim', value: dealerTotal.toLocaleString('en-IN') }] : []),
              ...(scheme.partnerTypes.includes('Chemist') ? [{ label: 'Chemist Points to Claim', value: chemistTotal.toLocaleString('en-IN') }] : []),
            ]}
          />
        </SectionCard>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            {isLoading ? <StatCardSkeleton /> : <StatCard label="Attached Products" value={scheme.products.length} icon={<GiftIcon size={20} />} iconColor="primary" />}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            {isLoading ? <StatCardSkeleton /> : <StatCard label="Regions Covered" value={scheme.regions.length} icon={<MapPin size={20} />} iconColor="secondary" />}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            {isLoading ? (
              <StatCardSkeleton />
            ) : (
              <StatCard
                label="Enrolled Dealers"
                value={scheme.partners.dealer.filter((p) => p.status !== 'interested').length}
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
                value={scheme.partners.chemist.filter((p) => p.status !== 'interested').length}
                icon={<Users size={20} />}
                iconColor="warning"
              />
            )}
          </Grid>
        </Grid>

        <SectionCard title="Attached Gift Products">
          <CommonTable
            tableKey="scheme-products"
            columns={productColumns(scheme, navigate)}
            rows={scheme.products}
            getRowId={(row) => row.productId}
            loading={isLoading}
            searchPlaceholder="Search products…"
            searchKeys={(row) => getGiftById(row.productId)?.giftName ?? row.productId}
            emptyTitle="No products attached yet"
          />
        </SectionCard>

        {scheme.description && (
          <SectionCard title="Description">
            <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', lineHeight: 1.6 }}>{scheme.description}</Typography>
          </SectionCard>
        )}

        {scheme.disclaimer && (
          <SectionCard title="Disclaimer">
            <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', lineHeight: 1.6 }}>{scheme.disclaimer}</Typography>
          </SectionCard>
        )}

        <SectionCard title="Interested Partners">
          <Tabs value={activePartnerTab} onChange={(_, value) => setPartnerTab(value)} sx={{ mb: 2, minHeight: 36 }}>
            {scheme.partnerTypes.includes('Dealer') && <Tab value="Dealer" label={`Dealer (${scheme.partners.dealer.length})`} sx={{ minHeight: 36, fontSize: '0.8125rem' }} />}
            {scheme.partnerTypes.includes('Chemist') && <Tab value="Chemist" label={`Chemist (${scheme.partners.chemist.length})`} sx={{ minHeight: 36, fontSize: '0.8125rem' }} />}
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
