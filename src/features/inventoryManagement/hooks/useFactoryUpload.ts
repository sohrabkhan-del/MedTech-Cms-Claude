import { useFileUpload } from '@/hooks/useFileUpload'
import { useUploadFactoryFileMutation } from '@/features/inventoryManagement/services/factoryUploadApi'

/** Backs both the Factory Inventory Upload and Delivery Upload flows (same batch shape). */
export function useFactoryUpload() {
  const [uploadFactoryFile] = useUploadFactoryFileMutation()
  return useFileUpload({
    upload: (manifestFile, supportingFile) => uploadFactoryFile({ manifestFile, supportingFile }).unwrap(),
  })
}
