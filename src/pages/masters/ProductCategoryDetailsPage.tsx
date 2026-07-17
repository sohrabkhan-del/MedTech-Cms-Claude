import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Chip, Grid, Stack, Typography } from '@mui/material'
import {
  FolderTree as FolderTreeIcon,
  Pencil,
  ArrowLeft as ArrowLeftIcon,
  Package as PackageIcon,
  Trophy as TrophyIcon,
  ScanLine,
  Sparkles,
} from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { getProductCategoryById, getParentCategoryName } from '@/features/masters/mockProductCategories'
import type { CategoryProductEntry, CategorySchemeEntry } from '@/types/productCategory'

const schemeStatusConfig: Record<CategorySchemeEntry['status'], { label: string; color: 'success' | 'info' | 'error' }> = {
  active: { label: 'Active', color: 'success' },
  upcoming: { label: 'Upcoming', color: 'info' },
  expired: { label: 'Expired', color: 'error' },
}

export function ProductCategoryDetailsPage() {
  const { categoryId } = useParams<{ categoryId: string }>()
  const navigate = useNavigate()
  const category = getProductCategoryById(categoryId ?? '')

  if (!category) {
    return (
      <EmptyState
        title="Category not found"
        description="This product category may have been removed."
        actionLabel="Back to Product Categories"
        onAction={() => navigate('/masters/product-categories')}
      />
    )
  }

  const parentName = getParentCategoryName(category.parentCategoryId)

  const productColumns: CommonTableColumn<CategoryProductEntry>[] = [
    {
      key: 'productName',
      header: 'Product Name',
      minWidth: 200,
      sortable: true,
      sortValue: (row) => row.productName,
      render: (row) => (
        <Typography
          sx={{ fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          onClick={() => navigate(`/inventory/product-master/${row.id}`)}
        >
          {row.productName}
        </Typography>
      ),
    },
    { key: 'productCode', header: 'Product Code', minWidth: 140, render: (row) => row.productCode },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      sortValue: (row) => row.status,
      render: (row) => <StatusBadge status={row.status} />,
    },
  ]

  const schemeColumns: CommonTableColumn<CategorySchemeEntry>[] = [
    { key: 'schemeName', header: 'Scheme Name', minWidth: 200, sortable: true, sortValue: (row) => row.schemeName, render: (row) => row.schemeName },
    { key: 'schemeType', header: 'Scheme Type', minWidth: 160, render: (row) => row.schemeType },
    { key: 'validTill', header: 'Valid Till', minWidth: 130, sortable: true, render: (row) => row.validTill },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Chip size="small" label={schemeStatusConfig[row.status].label} color={schemeStatusConfig[row.status].color} />
      ),
    },
  ]

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
            <FolderTreeIcon size={18} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant="h1">{category.categoryName}</Typography>
              <StatusBadge status={category.status} />
            </Stack>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {category.id} · {category.categoryCode}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Pencil size={16} />}
            onClick={() => navigate(`/masters/product-categories/${category.id}/edit`)}
            sx={{ fontSize: '0.8125rem' }}
          >
            Edit Category
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ArrowLeftIcon size={18} />}
            onClick={() => navigate('/masters/product-categories')}
            sx={{ fontSize: '0.8125rem' }}
          >
            Back
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Total Products" value={category.totalProducts} icon={<PackageIcon size={20} />} iconColor="primary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Active Schemes" value={category.activeSchemesCount} icon={<Sparkles size={20} />} iconColor="secondary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Total Scans" value={category.totalScans.toLocaleString('en-IN')} icon={<ScanLine size={20} />} iconColor="info" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Reward Points Issued"
              value={category.totalRewardPointsIssued.toLocaleString('en-IN')}
              icon={<TrophyIcon size={20} />}
              iconColor="warning"
            />
          </Grid>
        </Grid>

        <SectionCard title="Category Summary">
          <DetailFieldGrid
            fields={[
              { label: 'Category Name', value: category.categoryName },
              { label: 'Category Code', value: category.categoryCode },
              { label: 'Parent Category', value: parentName ?? 'None (Top Level)' },
              { label: 'Status', value: <StatusBadge status={category.status} /> },
              { label: 'Total Products', value: category.totalProducts },
              { label: 'Created Date', value: category.createdDate },
            ]}
          />
        </SectionCard>

        <SectionCard title="Category Description">
          <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', lineHeight: 1.6 }}>
            {category.description}
          </Typography>
        </SectionCard>

        <SectionCard title="Product Performance Statistics">
          <DetailFieldGrid
            fields={[
              { label: 'Total Products', value: category.totalProducts },
              { label: 'Total Scans', value: category.totalScans.toLocaleString('en-IN') },
              { label: 'Total Reward Points Issued', value: category.totalRewardPointsIssued.toLocaleString('en-IN') },
              { label: 'Active Schemes', value: category.activeSchemesCount },
            ]}
          />
        </SectionCard>

        <SectionCard title="Products under Category">
          <CommonTable
            tableKey="category-products"
            columns={productColumns}
            rows={category.products}
            getRowId={(row) => row.id}
            searchPlaceholder="Search products…"
            searchKeys={(row) => `${row.productName} ${row.productCode}`}
            emptyTitle="No products mapped to this category yet"
          />
        </SectionCard>

        <SectionCard title="Active Schemes">
          <CommonTable
            tableKey="category-active-schemes"
            columns={schemeColumns}
            rows={category.activeSchemes}
            getRowId={(row) => row.id}
            searchPlaceholder="Search schemes…"
            searchKeys={(row) => `${row.schemeName} ${row.schemeType}`}
            emptyTitle="No schemes linked to this category"
          />
        </SectionCard>
      </Stack>
    </>
  )
}
