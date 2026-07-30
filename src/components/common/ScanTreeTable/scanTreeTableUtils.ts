import {
  FileText,
  Truck,
  Store,
  Stethoscope,
  Tag,
  Package,
  Layers,
  Box as BoxIcon,
  ScanLine,
  type LucideIcon,
} from 'lucide-react'
import type { NestedNode, ScanLevel } from '@/types/masterScanTable'

export function pluralize(word: string, count: number): string {
  if (count === 1) return word
  if (word.endsWith('y') && !/[aeiou]y$/i.test(word)) return `${word.slice(0, -1)}ies`
  return `${word}s`
}

export const LEVEL_META: Record<
  ScanLevel,
  { label: string; icon: LucideIcon; color: string }
> = {
  invoice: { label: 'Invoice', icon: FileText, color: '#6366F1' },
  distributor: { label: 'Distributor', icon: Truck, color: '#0EA5E9' },
  dealer: { label: 'Dealer', icon: Store, color: '#14B8A6' },
  chemist: { label: 'Chemist', icon: Stethoscope, color: '#22C55E' },
  category: { label: 'Category', icon: Tag, color: '#EAB308' },
  product: { label: 'Product', icon: Package, color: '#F97316' },
  batch: { label: 'Batch', icon: Layers, color: '#EC4899' },
  container: { label: 'Container', icon: BoxIcon, color: '#8B5CF6' },
  unit: { label: 'Unit', icon: ScanLine, color: '#64748B' },
}

/** A tree node flattened into a single displayable row, with its depth and ancestor chain. */
export interface FlatRow {
  node: NestedNode
  depth: number
  parentIds: string[]
}

/**
 * Flattens the visible portion of the tree (respecting `expanded`) into a row list
 * for virtualization. Only descends into a node's children when it is expanded.
 */
export function flattenVisible(
  nodes: NestedNode[],
  expanded: Set<string>,
  depth = 0,
  parentIds: string[] = [],
  out: FlatRow[] = [],
): FlatRow[] {
  for (const node of nodes) {
    out.push({ node, depth, parentIds })
    if (node.children.length && expanded.has(node.id)) {
      flattenVisible(node.children, expanded, depth + 1, [...parentIds, node.id], out)
    }
  }
  return out
}

export function collectAllExpandableIds(nodes: NestedNode[], acc: Set<string> = new Set()): Set<string> {
  for (const node of nodes) {
    if (node.children.length) {
      acc.add(node.id)
      collectAllExpandableIds(node.children, acc)
    }
  }
  return acc
}

function rowMatchesQuery(node: NestedNode, query: string): boolean {
  if (node.label.toLowerCase().includes(query)) return true
  const row = node.row
  if (!row) return false
  return (
    row.invoiceNo.toLowerCase().includes(query) ||
    row.distributor.toLowerCase().includes(query) ||
    row.dealer.toLowerCase().includes(query) ||
    row.chemist.toLowerCase().includes(query) ||
    row.productName.toLowerCase().includes(query) ||
    row.productId.toLowerCase().includes(query) ||
    row.batchId.toLowerCase().includes(query) ||
    row.containerId.toLowerCase().includes(query) ||
    row.productUid.toLowerCase().includes(query)
  )
}

/**
 * Filters the tree to only branches containing a match, and returns the set of
 * ancestor ids that must be expanded to reveal every match.
 */
export function filterTree(
  nodes: NestedNode[],
  query: string,
): { filtered: NestedNode[]; expandIds: Set<string> } {
  const expandIds = new Set<string>()

  function walk(list: NestedNode[], ancestors: string[]): NestedNode[] {
    const result: NestedNode[] = []
    for (const node of list) {
      const selfMatch = rowMatchesQuery(node, query)
      const filteredChildren = node.children.length ? walk(node.children, [...ancestors, node.id]) : []
      if (selfMatch || filteredChildren.length) {
        if (filteredChildren.length) {
          for (const id of ancestors) expandIds.add(id)
          expandIds.add(node.id)
        }
        result.push(
          filteredChildren.length && !selfMatch
            ? { ...node, children: filteredChildren }
            : node,
        )
      }
    }
    return result
  }

  return { filtered: walk(nodes, []), expandIds }
}

export type SortMode = 'label-asc' | 'label-desc' | 'count-asc' | 'count-desc'

export function sortTree(nodes: NestedNode[], mode: SortMode): NestedNode[] {
  const sorted = [...nodes].sort((a, b) => {
    switch (mode) {
      case 'label-asc':
        return a.label.localeCompare(b.label)
      case 'label-desc':
        return b.label.localeCompare(a.label)
      case 'count-asc':
        return a.childCount - b.childCount
      case 'count-desc':
        return b.childCount - a.childCount
    }
  })
  return sorted.map((node) =>
    node.children.length ? { ...node, children: sortTree(node.children, mode) } : node,
  )
}
