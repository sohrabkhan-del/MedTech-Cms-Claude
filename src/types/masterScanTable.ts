/** One row = one individually scanned unit, as scanned off the Master Scan Table. */
export interface ScanRow {
  category: string
  productId: string
  productName: string
  batchId: string
  containerId: string
  productUid: string
  invoiceNo: string
  distributor: string
  dealer: string
  chemist: string
}

/** The field on ScanRow that each grouping level buckets by. */
export type ScanGroupField = keyof Pick<
  ScanRow,
  | 'invoiceNo'
  | 'distributor'
  | 'dealer'
  | 'chemist'
  | 'category'
  | 'productName'
  | 'batchId'
  | 'containerId'
  | 'productUid'
>

/** Semantic level of a node in the nested tree, independent of grouping order. */
export type ScanLevel =
  | 'invoice'
  | 'distributor'
  | 'dealer'
  | 'chemist'
  | 'category'
  | 'product'
  | 'batch'
  | 'container'
  | 'unit'

export const SCAN_LEVEL_BY_GROUP_FIELD: Record<ScanGroupField, ScanLevel> = {
  invoiceNo: 'invoice',
  distributor: 'distributor',
  dealer: 'dealer',
  chemist: 'chemist',
  category: 'category',
  productName: 'product',
  batchId: 'batch',
  containerId: 'container',
  productUid: 'unit',
}

export const DEFAULT_SCAN_GROUP_BY: ScanGroupField[] = [
  'invoiceNo',
  'distributor',
  'dealer',
  'chemist',
  'category',
  'productName',
  'batchId',
  'containerId',
  'productUid',
]

export interface NestedNode {
  id: string
  label: string
  level: ScanLevel
  /** Total leaf (unit) rows under this node — 1 for leaf nodes themselves. */
  childCount: number
  children: NestedNode[]
  /** Distinct count of the next-level grouping field, for aggregate display on non-leaf rows. */
  distinctChildGroups?: number
  /** Present only on leaf ('unit') nodes — the full source row for detail display. */
  row?: ScanRow
}
