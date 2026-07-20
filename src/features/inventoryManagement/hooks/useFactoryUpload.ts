import { useFileUpload } from '@/hooks/useFileUpload'
import { factoryUploadService } from '@/features/inventoryManagement/services/factoryUploadService'

/** Backs both the Factory Inventory Upload and Delivery Upload flows (same batch shape). */
export function useFactoryUpload() {
  return useFileUpload({ upload: factoryUploadService.uploadFile })
}
