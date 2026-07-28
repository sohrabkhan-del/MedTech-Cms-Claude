import { useNavigate } from 'react-router-dom'
import { DistributorUploadTab } from '@/features/inventoryManagement/components/DistributorUploadTab'
import { useDistributors } from '@/features/inventoryManagement/hooks/useDistributors'
import type { DispatchInvoiceMeta } from '@/features/inventoryManagement/dispatchReportParser'
import type { DispatchUploadRow } from '@/types/distributorUpload'

export function DistributorUploadFormPage() {
  const navigate = useNavigate()
  const { importDispatch } = useDistributors()

  async function handleImported(
    rows: DispatchUploadRow[],
    uploadFileName: string,
    invoiceMeta: DispatchInvoiceMeta,
  ) {
    await importDispatch(rows, uploadFileName, invoiceMeta)
  }

  return (
    <DistributorUploadTab
      onImported={handleImported}
      onDone={() => navigate('/distributor-upload', { state: { imported: true } })}
    />
  )
}
