export type { Product, ProductStatus, RewardConfigStatus, ProductAuditEntry, ProductMovementEntry } from '@/types/product'
export { productFormSchema, productFormDefaults, type ProductFormValues } from '@/features/inventory/productFormSchema'
export type {
  FactoryBatch,
  BatchContainer,
  BatchScanEntry,
  ContainerBox,
  BoxProduct,
  ProductTraceabilityStatus,
  ScanStatus as FactoryScanStatus,
  RewardStatus,
  AllocationStatus,
} from '@/types/factoryUpload'
export type {
  ProductBatch,
  ProductionBatch,
  BatchScanStatus,
  BatchActiveStatus,
  ScanAnalyticsRow,
  DistributionJourneyEntry,
  RelatedScheme,
} from '@/types/productBatch'
