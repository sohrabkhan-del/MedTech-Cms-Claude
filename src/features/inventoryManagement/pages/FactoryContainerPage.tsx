import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Breadcrumbs,
  Link as MuiLink,
  Stack,
  Typography,
} from '@mui/material'
import {
  Package as Inventory2Outlined,
  ChevronRight as NavigateNextOutlined,
} from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { useContainerDetail } from '@/features/inventoryManagement/hooks/useContainerDetail'
import type { ContainerBox } from '@/features/inventoryManagement/types/inventoryManagement.types'

export function FactoryContainerPage() {
  const navigate = useNavigate()
  const { batchId, containerId } = useParams<{
    batchId: string
    containerId: string
  }>()
  const { batch, container, isLoading } = useContainerDetail(
    batchId,
    containerId,
  )

  if (!batch || !container) {
    return (
      <EmptyState
        title="Container not found"
        description="This container may have been removed."
        actionLabel="Back to Factory Inventory Upload"
        onAction={() => navigate('/inventory/factory-inventory-upload')}
      />
    )
  }

  const boxColumns: CommonTableColumn<ContainerBox>[] = [
    {
      key: 'boxNumber',
      header: 'Box Number',
      minWidth: 140,
      sortable: true,
      sortValue: (row) => row.boxNumber,
      render: (row) => (
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '0.8125rem',
            cursor: 'pointer',
            '&:hover': { textDecoration: 'underline' },
          }}
          onClick={() =>
            navigate(
              `/inventory/factory-inventory-upload/${batch.id}/${container.id}/${row.id}`,
            )
          }
        >
          {row.boxNumber}
        </Typography>
      ),
    },
    {
      key: 'productCount',
      header: 'Product Count',
      align: 'center',
      render: (row) => row.productCount,
    },
    { key: 'status', header: 'Status', render: (row) => row.status },
  ]

  return (
    <>
      <Breadcrumbs
        separator={<NavigateNextOutlined size={16} />}
        sx={{ mb: 1.5 }}
      >
        <MuiLink
          component="button"
          underline="hover"
          color="text.secondary"
          sx={{ fontSize: '0.8125rem' }}
          onClick={() =>
            navigate(`/inventory/factory-inventory-upload/${batch.id}`)
          }
        >
          {batch.batchName}
        </MuiLink>
        <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
          {container.containerNumber}
        </Typography>
      </Breadcrumbs>

      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 3 }}>
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
          <Inventory2Outlined size={20} />
        </Box>
        <Box>
          <Typography variant="h1">{container.containerNumber}</Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {batch.batchName} · {batch.batchNumber}
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Summary">
          <DetailFieldGrid
            fields={[
              { label: 'Container Number', value: container.containerNumber },
              { label: 'Batch Name', value: batch.batchName },
              { label: 'Batch Number', value: batch.batchNumber },
              { label: 'Total Boxes', value: container.boxCount },
              {
                label: 'Total Products',
                value: container.productCount.toLocaleString('en-IN'),
              },
              { label: 'Status', value: container.status },
            ]}
          />
        </SectionCard>

        <SectionCard title="Boxes">
          <CommonTable
            tableKey="factory-container-boxes"
            columns={boxColumns}
            rows={container.boxes}
            loading={isLoading}
            getRowId={(row) => row.id}
            searchPlaceholder="Search boxes…"
            searchKeys={(row) => row.boxNumber}
            actions={[
              {
                label: 'View Box',
                onClick: (row) =>
                  navigate(
                    `/inventory/factory-inventory-upload/${batch.id}/${container.id}/${row.id}`,
                  ),
              },
            ]}
            emptyTitle="No boxes yet"
          />
        </SectionCard>
      </Stack>
    </>
  )
}
