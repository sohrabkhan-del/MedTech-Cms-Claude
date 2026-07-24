import { useNavigate } from 'react-router-dom'
import { BatchUidUploadTab } from '@/features/inventoryManagement/components/BatchUidUploadTab'
import { useFactoryUploads } from '@/features/inventoryManagement/hooks/useFactoryUploads'
import type { BmrBatchRow, MappedBatch } from '@/types/batchUidUpload'

export function BatchUidUploadPage() {
  const navigate = useNavigate()
  const { importBmrUpload } = useFactoryUploads()

  async function handleImported(
    batchRows: BmrBatchRow[],
    _mappedBatches: MappedBatch[],
    uploadFileName: string,
    containerCountByBatch: Record<string, number>,
  ) {
    await importBmrUpload(batchRows, uploadFileName, containerCountByBatch)
  }

  return (
    <BatchUidUploadTab
      onImported={handleImported}
      onDone={() => navigate('/inventory/factory-inventory-upload')}
    />
  )
}
