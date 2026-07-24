import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import { Box as ViewInArOutlined, UploadCloud, X } from 'lucide-react'
import { useIsMobile } from '@/hooks/useMediaQueryBreakpoint'
import { radius } from '@/theme/tokens'
import { BatchListingTab } from '@/features/inventoryManagement/components/BatchListingTab'
import { BatchUidUploadTab } from '@/features/inventoryManagement/components/BatchUidUploadTab'
import { ScanningProductsTab } from '@/features/inventoryManagement/components/ScanningProductsTab'
import { ScanAnalyticsTab } from '@/features/inventoryManagement/components/ScanAnalyticsTab'
import { useProductBatches } from '@/features/inventoryManagement/hooks/useProductBatches'
import type { ProductionBatch } from '@/features/inventoryManagement/types/inventoryManagement.types'
import type { BmrBatchRow, MappedBatch } from '@/types/batchUidUpload'

const TAB_LABELS = ['Batch Listing', 'Scanning Products', 'Scan Analytics']

export function ProductBatchesPage() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useState(0)
  const [uploadOpen, setUploadOpen] = useState(false)
  const { batches, kpis, isLoading, importManifest } = useProductBatches()

  const handleViewBatch = (batch: ProductionBatch) => {
    navigate(`/inventory/product-batches/${batch.id}`)
  }

  const handleTabChange = (_: React.SyntheticEvent, value: number) => {
    setActiveTab(value)
  }

  async function handleImported(
    _batchRows: BmrBatchRow[],
    mappedBatches: MappedBatch[],
    uploadFileName: string,
  ) {
    await importManifest(mappedBatches, uploadFileName)
  }

  return (
    <>
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          mb: 2.5,
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
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
              Manufactured batches, QR/barcode generation, traceability, loyalty
              scanning, and reward allocation.
            </Typography>
          </Stack>
        </Stack>

        <Button
          variant="contained"
          startIcon={<UploadCloud size={18} />}
          onClick={() => setUploadOpen(true)}
        >
          Upload Manifest
        </Button>
      </Stack>

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

      {activeTab === 0 && (
        <BatchListingTab
          batches={batches}
          kpis={kpis}
          isLoading={isLoading}
          onViewBatch={handleViewBatch}
        />
      )}
      {activeTab === 1 && <ScanningProductsTab />}
      {activeTab === 2 && <ScanAnalyticsTab />}

      <Dialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        fullWidth
        fullScreen={isMobile}
        maxWidth="lg"
        slotProps={{
          paper: { sx: { borderRadius: isMobile ? 0 : `${radius.xl}px` } },
        }}
      >
        <Stack
          direction="row"
          sx={{
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            px: 3,
            pt: 3,
            pb: 1,
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: '1.125rem' }}>
            Upload Manifest
          </Typography>
          <IconButton
            onClick={() => setUploadOpen(false)}
            size="small"
            aria-label="Close"
          >
            <X size={20} />
          </IconButton>
        </Stack>
        <DialogContent sx={{ px: 3, pb: 3 }}>
          <BatchUidUploadTab
            onImported={handleImported}
            onDone={() => setUploadOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
