export type { ScanReportResult, ScanReportUserType, ScanReportWalletStatus, ScanReportTimelineEntry, ScanReportEntry } from '@/types/scanReport'

export type {
  RewardReportUserType,
  RewardReportType,
  RewardReportStatus,
  RewardReportTimelineEntry,
  RewardReportEntry,
} from '@/types/rewardReport'

export type {
  WalletStatus,
  WalletUserType,
  WalletTransaction,
  WalletTimelineEntry,
  FraudAdjustmentEntry,
  WalletReportRow,
  WalletReportManualAdjustment,
  WalletReportDetails,
  // Also re-exported (identically) from dealerReport.ts — aliased there to avoid a duplicate export.
  WalletRedemptionEntry,
} from '@/types/walletReport'

export type {
  PartnerStatus,
  PartnerZone,
  ScanHistoryEntry,
  PointsHistoryEntry,
  InterestedProductEntry,
  DealerReportRow,
  DealerReportPerformanceSummary,
  DealerReportDetails,
  // walletReport.ts already re-exports WalletRedemptionEntry (same underlying @/types/wallet type) — alias here.
  WalletRedemptionEntry as DealerReportWalletRedemptionEntry,
} from '@/types/dealerReport'

export type { ChemistReportRow, ChemistPerformanceSummary } from '@/types/chemistReport'

export type {
  MrMonthlyActivity,
  MrPerformanceReportRow,
  MrPerformanceAnalytics,
  MrScanContribution,
  MrPerformanceDetails,
} from '@/types/mrPerformanceReport'

export type { ProductReportEntry } from '@/types/productReport'

export type { SchemeReportEntry } from '@/types/schemeReport'
