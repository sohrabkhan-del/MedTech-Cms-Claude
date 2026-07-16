import { useState } from 'react'
import { Box, Stack, Tab, Tabs, Typography } from '@mui/material'
import { Box as ViewInArOutlined } from 'lucide-react'
import { BatchListingTab } from '@/pages/inventory/productBatches/BatchListingTab'
import { BatchDetailsView } from '@/pages/inventory/productBatches/BatchDetailsView'
import { ScanningProductsTab } from '@/pages/inventory/productBatches/ScanningProductsTab'
import { ScanAnalyticsTab } from '@/pages/inventory/productBatches/ScanAnalyticsTab'
import type { ProductionBatch } from '@/types/productBatch'

const TAB_LABELS = ['Batch Listing', 'Scanning Products', 'Scan Analytics']

export function ProductBatchesPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [selectedBatch, setSelectedBatch] = useState<ProductionBatch | null>(null)

  const handleViewBatch = (batch: ProductionBatch) => setSelectedBatch(batch)
  const handleBack = () => setSelectedBatch(null)

  const handleTabChange = (_: React.SyntheticEvent, value: number) => {
    setSelectedBatch(null)
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

      {!selectedBatch && (
        <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              minHeight: 40,
              '& .MuiTab-root': {
                minHeight: 40,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.8125rem',
              },
            }}
          >
            {TAB_LABELS.map((label) => (
              <Tab key={label} label={label} />
            ))}
          </Tabs>
        </Box>
      )}

      {selectedBatch ? (
        <BatchDetailsView batch={selectedBatch} onBack={handleBack} />
      ) : (
        <>
          {activeTab === 0 && <BatchListingTab onViewBatch={handleViewBatch} />}
          {activeTab === 1 && <ScanningProductsTab />}
          {activeTab === 2 && <ScanAnalyticsTab />}
        </>
      )}
    </>
  )
}
