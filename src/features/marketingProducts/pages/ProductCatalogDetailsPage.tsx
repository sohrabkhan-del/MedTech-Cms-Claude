import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Avatar,
  Box,
  Button,
  Chip,
  Grid,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { Ban, CircleCheck, Megaphone } from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { DetailsPageSkeleton } from '@/components/common/DetailsPageSkeleton/DetailsPageSkeleton'
import { ImageGallery } from '@/components/common/ImageGallery/ImageGallery'
import { ModularTabs } from '@/components/common/ModularTabs/ModularTabs'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { useShowcaseProductDetail } from '@/features/marketingProducts/hooks/useShowcaseProductDetail'
import { useGetShowcaseProductInterestedUsersQuery } from '@/features/marketingProducts/services/interestedUsersApi'
import { useToast } from '@/contexts/ToastContext'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import type {
  InterestedUserLead,
  LeadStatus,
} from '@/features/marketingProducts/types/marketingProducts.types'

const leadStatusConfig: Record<
  LeadStatus,
  { label: string; color: 'info' | 'warning' | 'success' }
> = {
  new: { label: 'New', color: 'info' },
  followed_up: { label: 'Followed Up', color: 'warning' },
  closed: { label: 'Closed', color: 'success' },
}

type InterestedUserTab = 'ALL' | 'CHEMIST' | 'DEALER'

export function ProductCatalogDetailsPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { productId } = useParams<{ productId: string }>()
  const { product, isLoading, setActive, isStatusUpdating } =
    useShowcaseProductDetail(productId)
  const [interestedUserTab, setInterestedUserTab] =
    useState<InterestedUserTab>('ALL')
  const [interestedUserSearch, setInterestedUserSearch] = useState('')
  const debouncedInterestedUserSearch = useDebouncedValue(
    interestedUserSearch,
    300,
  )

  const interestedUserTypeParam =
    interestedUserTab === 'ALL'
      ? undefined
      : interestedUserTab === 'CHEMIST'
        ? 'Chemist'
        : 'Dealer'

  const { data: interestedUsers = [], isFetching: isInterestedUsersLoading } =
    useGetShowcaseProductInterestedUsersQuery(
      {
        showcaseProductId: productId ?? '',
        search: debouncedInterestedUserSearch,
        userType: interestedUserTypeParam,
      },
      { skip: !productId },
    )
  const { data: allInterestedUsers = [] } =
    useGetShowcaseProductInterestedUsersQuery(
      { showcaseProductId: productId ?? '' },
      { skip: !productId },
    )

  const interestedUserTabs = useMemo(
    () => [
      { label: 'All', value: 'ALL' as const, count: allInterestedUsers.length },
      {
        label: 'Chemists',
        value: 'CHEMIST' as const,
        count: allInterestedUsers.filter((row) => row.userType === 'Chemist')
          .length,
      },
      {
        label: 'Dealers',
        value: 'DEALER' as const,
        count: allInterestedUsers.filter((row) => row.userType === 'Dealer')
          .length,
      },
    ],
    [allInterestedUsers],
  )

  const interestedUserColumns: CommonTableColumn<InterestedUserLead>[] = [
    {
      key: 'userName',
      header: 'User Name',
      minWidth: 160,
      render: (row) => (
        <Typography
          sx={{ fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation()
            navigate(
              `/partners/${row.userType === 'Chemist' ? 'chemists' : 'dealers'}/${row.userId}`,
            )
          }}
        >
          {row.userName}
        </Typography>
      ),
    },
    {
      key: 'businessName',
      header: 'Business Name',
      minWidth: 160,
      render: (row) => (
        <Typography
          sx={{ fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation()
            navigate(
              `/partners/${row.userType === 'Chemist' ? 'chemists' : 'dealers'}/${row.userId}`,
            )
          }}
        >
          {row.businessName}
        </Typography>
      ),
    },
    {
      key: 'userType',
      header: 'Type',
      minWidth: 100,
      align: 'center',
      render: (row) => row.userType,
    },
    {
      key: 'quantityRequested',
      header: 'Qty Requested',
      minWidth: 120,
      align: 'center',
      render: (row) => row.quantityRequested,
    },
    {
      key: 'leadStatus',
      header: 'Status',
      minWidth: 120,
      align: 'center',
      render: (row) => (
        <Chip
          size="small"
          label={leadStatusConfig[row.leadStatus].label}
          color={leadStatusConfig[row.leadStatus].color}
        />
      ),
    },
    {
      key: 'requestedDate',
      header: 'Requested Date',
      minWidth: 140,
      render: (row) => row.requestedDate,
    },
  ]

  if (isLoading) {
    return <DetailsPageSkeleton sections={4} />
  }

  if (!product) {
    return (
      <EmptyState
        title="Product not found"
        description="This showcase product may have been removed."
        actionLabel="Back to Products Catalog"
        onAction={() => navigate('/marketing-products/products-catelog')}
      />
    )
  }

  const galleryImages = [...product.images]
    .sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
    .map((image) => image.url)

  async function handleSetActive(isActive: boolean) {
    try {
      await setActive(isActive)
      toast.success(
        isActive
          ? 'Product activated successfully.'
          : 'Product deactivated successfully.',
      )
    } catch (err) {
      toast.error(
        getApiErrorMessage(
          err,
          isActive
            ? 'Failed to activate product.'
            : 'Failed to deactivate product.',
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
          <Avatar
            src={galleryImages[0]}
            variant="rounded"
            sx={{ width: 36, height: 36, borderRadius: '10px' }}
          >
            <Megaphone size={18} />
          </Avatar>
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Tooltip title={product.name}>
                <Typography
                  variant="h1"
                  sx={{
                    maxWidth: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {product.name}
                </Typography>
              </Tooltip>
              <Chip
                size="small"
                label={product.isActive ? 'Active' : 'Inactive'}
                color={product.isActive ? 'success' : 'default'}
              />
            </Stack>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {product.productCode} ·{' '}
              {product.category?.name ?? 'Uncategorized'}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1.5}>
          {product.isActive ? (
            <Button
              variant="contained"
              color="error"
              startIcon={<Ban size={18} />}
              onClick={() => handleSetActive(false)}
              loading={isStatusUpdating}
              sx={{ fontSize: '0.75rem' }}
            >
              Deactivate Product
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              startIcon={<CircleCheck size={18} />}
              onClick={() => handleSetActive(true)}
              loading={isStatusUpdating}
              sx={{ fontSize: '0.75rem' }}
            >
              Activate Product
            </Button>
          )}
          <Button
            variant="outlined"
            onClick={() =>
              navigate(
                `/marketing-products/products-catelog/${product.id}/edit`,
              )
            }
            sx={{ fontSize: '0.75rem' }}
          >
            Edit Product
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Product Overview">
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <ImageGallery
                images={galleryImages}
                alt={product.name}
                height={260}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Stack spacing={2.5} sx={{ height: '100%' }}>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Description
                  </Typography>
                  <Typography
                    sx={{ fontSize: '0.8125rem', mt: 0.5, lineHeight: 1.6 }}
                  >
                    {product.description || 'No description provided.'}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    pt: 2,
                    mt: 'auto',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <DetailFieldGrid
                    fields={[
                      { label: 'Product Code', value: product.productCode },
                      {
                        label: 'Category',
                        value: product.category?.name ?? 'Uncategorized',
                      },

                      {
                        label: 'MRP (₹)',
                        value: `₹${product.mrp.toLocaleString('en-IN')}`,
                      },
                      {
                        label: 'Dealer Price (₹)',
                        value: `₹${product.dealerPrice.toLocaleString('en-IN')}`,
                      },
                      {
                        label: 'Chemist Price (₹)',
                        value: `₹${product.chemistPrice.toLocaleString('en-IN')}`,
                      },

                      {
                        label: 'Visible To',
                        value:
                          product.visibleTo
                            .map((v) => (v === 'dealer' ? 'Dealer' : 'Chemist'))
                            .join(', ') || '-',
                      },
                    ]}
                  />
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </SectionCard>

        <SectionCard title="Interested Users">
          <Box sx={{ mb: 2 }}>
            <ModularTabs
              tabs={interestedUserTabs}
              value={interestedUserTab}
              onChange={setInterestedUserTab}
              variant="filled"
            />
          </Box>

          <CommonTable
            key={interestedUserTab}
            tableKey="showcase-product-interested-users"
            columns={interestedUserColumns}
            rows={interestedUsers}
            loading={isInterestedUsersLoading}
            getRowId={(row) => row.id}
            onRowClick={(row) =>
              navigate(
                `/partners/${row.userType === 'Chemist' ? 'chemists' : 'dealers'}/${row.userId}`,
              )
            }
            searchPlaceholder="Search by user name or business name…"
            searchValue={interestedUserSearch}
            onSearchChange={setInterestedUserSearch}
            emptyTitle="No interested users yet"
            emptyDescription="No one has expressed interest in this product yet."
          />
        </SectionCard>
      </Stack>
    </>
  )
}
