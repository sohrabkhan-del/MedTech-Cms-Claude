import { useNavigate } from 'react-router-dom'
import { BatchUidUploadTab } from '@/features/inventoryManagement/components/BatchUidUploadTab'

export function BatchUidUploadPage() {
  const navigate = useNavigate()

  return (
    <BatchUidUploadTab
      onDone={() => navigate('/inventory/factory-inventory-upload')}
    />
  )
}
