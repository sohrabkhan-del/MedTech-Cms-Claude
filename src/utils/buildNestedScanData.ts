import {
  DEFAULT_SCAN_GROUP_BY,
  SCAN_LEVEL_BY_GROUP_FIELD,
  type NestedNode,
  type ScanGroupField,
  type ScanRow,
} from '@/types/masterScanTable'

function buildLevel(
  rows: ScanRow[],
  groupBy: ScanGroupField[],
  depth: number,
  parentId: string,
): NestedNode[] {
  const field = groupBy[depth]

  if (!field) {
    // Past the last grouping field — each remaining row is a leaf unit.
    return rows.map((row) => ({
      id: `${parentId}/unit:${row.productUid}`,
      label: row.productUid,
      level: 'unit',
      childCount: 1,
      children: [],
      row,
    }))
  }

  const level = SCAN_LEVEL_BY_GROUP_FIELD[field]
  const buckets = new Map<string, ScanRow[]>()
  for (const row of rows) {
    const key = row[field]
    const bucket = buckets.get(key)
    if (bucket) bucket.push(row)
    else buckets.set(key, [row])
  }

  const nextField = groupBy[depth + 1]

  const nodes: NestedNode[] = []
  for (const [value, bucketRows] of buckets) {
    const id = `${parentId}/${field}:${value}`
    const children = buildLevel(bucketRows, groupBy, depth + 1, id)
    const distinctChildGroups = nextField
      ? new Set(bucketRows.map((row) => row[nextField])).size
      : undefined

    nodes.push({
      id,
      label: level === 'product' ? `${value} (${bucketRows[0]!.productId})` : value,
      level,
      childCount: bucketRows.length,
      children,
      distinctChildGroups,
    })
  }

  return nodes
}

/**
 * Groups flat scan rows into a nested tree following `groupBy` order (defaults to
 * Invoice -> Distributor -> Dealer -> Chemist -> Category -> Product -> Batch -> Container -> Unit).
 * Pure function — safe to memoize on (rows, groupBy).
 */
export function buildNestedScanData(
  rows: ScanRow[],
  groupBy: ScanGroupField[] = DEFAULT_SCAN_GROUP_BY,
): NestedNode[] {
  return buildLevel(rows, groupBy, 0, '')
}
