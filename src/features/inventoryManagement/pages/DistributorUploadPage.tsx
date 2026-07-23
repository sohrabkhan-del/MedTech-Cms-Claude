import { useState } from 'react'
import {
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import { Truck, UploadCloud, X } from 'lucide-react'
import { useIsMobile } from '@/hooks/useMediaQueryBreakpoint'
import { radius } from '@/theme/tokens'
import { DistributorUploadTab } from '@/features/inventoryManagement/components/DistributorUploadTab'
import { DistributorListingTab } from '@/features/inventoryManagement/components/DistributorListingTab'
import { useDistributors } from '@/features/inventoryManagement/hooks/useDistributors'
import type { DistributorUploadRow } from '@/types/distributorUpload'

export function DistributorUploadPage() {
  const isMobile = useIsMobile()
  const [uploadOpen, setUploadOpen] = useState(false)
  const { distributors, isLoading, importDistributors } = useDistributors()

  async function handleImported(
    rows: DistributorUploadRow[],
    uploadFileName: string,
  ) {
    await importDistributors(rows, uploadFileName)
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
            <Truck size={20} />
          </Stack>
          <Stack>
            <Typography variant="h1">Distributor Upload</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Import distributor master data via Excel and manage the
              distributor directory.
            </Typography>
          </Stack>
        </Stack>

        <Button
          variant="contained"
          startIcon={<UploadCloud size={18} />}
          onClick={() => setUploadOpen(true)}
        >
          Upload Distributor Batches
        </Button>
      </Stack>

      <DistributorListingTab
        distributors={distributors}
        isLoading={isLoading}
      />

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
            Upload Distributor Data
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
          <DistributorUploadTab onImported={handleImported} />
        </DialogContent>
      </Dialog>
    </>
  )
}
