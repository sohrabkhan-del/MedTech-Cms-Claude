import type { MasterScanLogEntry } from '@/features/audit/types/audit.types'

export type SupplyChainNodeKind = 'distributor' | 'dealer' | 'chemist'

export const NODE_KIND_COLOR: Record<SupplyChainNodeKind, string> = {
  distributor: '#1E9E5A',
  dealer: '#8B5CF6',
  chemist: '#E5484D',
}

export const NODE_KIND_LABEL: Record<SupplyChainNodeKind, string> = {
  distributor: 'Distributor',
  dealer: 'Dealer',
  chemist: 'Chemist',
}

export interface SupplyChainGraphNode {
  id: string
  name: string
  kind: SupplyChainNodeKind
  /** Count of scanned units (barcodes) that passed through this entity. */
  unitCount: number
  /** Count of distinct batches that passed through this entity — used as the "invoice count" sizing metric. */
  batchCount: number
}

export interface SupplyChainGraphEdge {
  id: string
  source: string
  target: string
  sourceKind: Extract<SupplyChainNodeKind, 'distributor' | 'dealer'>
  targetKind: Extract<SupplyChainNodeKind, 'dealer' | 'chemist'>
  unitCount: number
  batchNumbers: string[]
}

export interface SupplyChainGraph {
  nodes: SupplyChainGraphNode[]
  edges: SupplyChainGraphEdge[]
}

function nodeId(kind: SupplyChainNodeKind, name: string): string {
  return `${kind}:${name}`
}

/**
 * Derives a many-to-many Distributor -> Dealer -> Chemist network from flat scan
 * log entries. Unlike a hierarchy, the same Dealer can appear under multiple
 * Distributors and the same Chemist under multiple Dealers — every distinct pair
 * observed in the data becomes its own edge, weighted by shared unit count.
 */
export function buildSupplyChainGraph(logs: MasterScanLogEntry[]): SupplyChainGraph {
  const nodes = new Map<string, SupplyChainGraphNode>()
  const nodeBatches = new Map<string, Set<string>>()
  const edges = new Map<string, SupplyChainGraphEdge>()

  const touchNode = (kind: SupplyChainNodeKind, name: string, batchNumber: string) => {
    const id = nodeId(kind, name)
    const existing = nodes.get(id)
    if (existing) {
      existing.unitCount += 1
    } else {
      nodes.set(id, { id, name, kind, unitCount: 1, batchCount: 0 })
    }
    const batches = nodeBatches.get(id) ?? new Set<string>()
    batches.add(batchNumber)
    nodeBatches.set(id, batches)
  }

  const touchEdge = (
    sourceId: string,
    sourceKind: SupplyChainGraphEdge['sourceKind'],
    targetId: string,
    targetKind: SupplyChainGraphEdge['targetKind'],
    batchNumber: string,
  ) => {
    const id = `${sourceId}->${targetId}`
    const existing = edges.get(id)
    if (existing) {
      existing.unitCount += 1
      if (!existing.batchNumbers.includes(batchNumber)) existing.batchNumbers.push(batchNumber)
    } else {
      edges.set(id, {
        id,
        source: sourceId,
        target: targetId,
        sourceKind,
        targetKind,
        unitCount: 1,
        batchNumbers: [batchNumber],
      })
    }
  }

  for (const log of logs) {
    if (!log.distributor) continue
    touchNode('distributor', log.distributor, log.batchNumber)
    const distributorId = nodeId('distributor', log.distributor)

    if (log.dealer) {
      touchNode('dealer', log.dealer, log.batchNumber)
      const dealerId = nodeId('dealer', log.dealer)
      touchEdge(distributorId, 'distributor', dealerId, 'dealer', log.batchNumber)

      if (log.chemist) {
        touchNode('chemist', log.chemist, log.batchNumber)
        const chemistId = nodeId('chemist', log.chemist)
        touchEdge(dealerId, 'dealer', chemistId, 'chemist', log.batchNumber)
      }
    } else if (log.chemist) {
      // Chemist supplied directly by the distributor, with no dealer in between.
      touchNode('chemist', log.chemist, log.batchNumber)
      const chemistId = nodeId('chemist', log.chemist)
      touchEdge(distributorId, 'distributor', chemistId, 'chemist', log.batchNumber)
    }
  }

  for (const node of nodes.values()) {
    node.batchCount = nodeBatches.get(node.id)?.size ?? 0
  }

  return { nodes: [...nodes.values()], edges: [...edges.values()] }
}
