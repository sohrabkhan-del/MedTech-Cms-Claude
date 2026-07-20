import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Stack, Tab, Tabs, Typography } from '@mui/material'
import { Box as ViewInArOutlined } from 'lucide-react'
import { BatchListingTab } from '@/features/inventoryManagement/components/BatchListingTab'
import { ScanningProductsTab } from '@/features/inventoryManagement/components/ScanningProductsTab'
import { ScanAnalyticsTab } from '@/features/inventoryManagement/components/ScanAnalyticsTab'
import type { ProductionBatch } from '@/features/inventoryManagement/types/inventoryManagement.types'

const TAB_LABELS = ['Batch Listing', 'Scanning Products', 'Scan Analytics']

export function ProductBatchesPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)

  const handleViewBatch = (batch: ProductionBatch) => {
    navigate(`/inventory/product-batches/${batch.id}`)
  }

  const handleTabChange = (_: React.SyntheticEvent, value: number) => {
    setActiveTab(value)
  }

  return (
    <>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2.5 }}>
        <Stack
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'primary.light',
            color: 'primary.main',
          }}
        >
          <ViewInArOutlined size={20} />
        </Stack>
        <Stack>
          <Typography variant="h1">Product Batches</Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Manufactured batches, QR/barcode generation, traceability, loyalty scanning, and reward allocation.
          </Typography>
        </Stack>
      </Stack>

      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40, textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem' } }}
        >
          {TAB_LABELS.map((label) => (
            <Tab key={label} label={label} />
          ))}
        </Tabs>
      </Box>

      {activeTab === 0 && <BatchListingTab onViewBatch={handleViewBatch} />}
      {activeTab === 1 && <ScanningProductsTab />}
      {activeTab === 2 && <ScanAnalyticsTab />}
    </>
  )
}
