import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button, Stack } from '@mui/material'
import { Truck, UploadCloud } from 'lucide-react'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import { SuccessDialog } from '@/components/common/SuccessDialog/SuccessDialog'
import { DistributorListingTab } from '@/features/inventoryManagement/components/DistributorListingTab'
import { useDistributors } from '@/features/inventoryManagement/hooks/useDistributors'

export function DistributorUploadPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { invoices, isLoading } = useDistributors()
  const [importDone, setImportDone] = useState(
    Boolean((location.state as { imported?: boolean } | null)?.imported),
  )

  useEffect(() => {
    if ((location.state as { imported?: boolean } | null)?.imported) {
      navigate(location.pathname, { replace: true, state: {} })
    }
    // Only needs to run once on mount to consume the one-time "just imported" flag.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useRegionTopbarHeader({
    icon: <Truck size={20} />,
    title: 'Distributor Upload',
    subtitle:
      'Import dispatch loading reports via Excel and track shipments to distributors.',
    isLoading,
  })

  return (
    <>
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'flex-end',
          flexWrap: 'wrap',
          gap: 2,
          mb: 2.5,
        }}
      >
        <Button
          variant="contained"
          startIcon={<UploadCloud size={18} />}
          onClick={() => navigate('/distributor-upload/new')}
        >
          Upload Distributor Batches
        </Button>
      </Stack>

      <DistributorListingTab
        distributors={invoices}
        isLoading={isLoading}
      />

      <SuccessDialog
        open={importDone}
        onClose={() => setImportDone(false)}
        title="Dispatch Data Imported Successfully"
        description="Your dispatch loading report has been imported and is now available in Distributor Upload."
      />
    </>
  )
}
