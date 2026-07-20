export type {
  AuditModule,
  AuditActionType,
  AuditEntityType,
  AuditStatus,
  AuditUserRole,
  AuditChangedField,
  AuditTimelineEvent,
  AuditLogEntry,
} from '@/types/auditLog'

// `ScanStatus` and `WalletStatus` also exist (with different meanings) in
// src/types/factoryUpload.ts and src/types/wallet.ts respectively, so they
// are re-exported here under aliases to avoid ambiguity for consumers that
// import from multiple feature type barrels.
export type {
  ScanStatus as ScanLogStatus,
  WalletStatus as ScanLogWalletStatus,
  PartnerKind as ScanLogPartnerKind,
  ScanHistoryEntry,
  OwnershipTimelineEntry,
  AuditTimelineEntry as ScanLogAuditTimelineEntry,
  MasterScanLogEntry,
} from '@/types/masterScanLog'
