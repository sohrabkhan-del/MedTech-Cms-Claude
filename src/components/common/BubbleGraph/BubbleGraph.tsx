import { useCallback, useMemo, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import { Box, Typography } from '@mui/material'

export interface BubbleGraphNode {
  id: string
  label: string
  value?: number
  color?: string
  parentId?: string | null
}

interface BubbleGraphProps {
  nodes: BubbleGraphNode[]
  height?: number
  minSize?: number
  maxSize?: number
}

interface EchartsGraphNode {
  id: string
  name: string
  value?: number
  symbolSize: number
  itemStyle: { color: string }
  label: { show: boolean; fontSize: number; fontWeight: 'bold'; color: string }
}

interface EchartsGraphLink {
  source: string
  target: string
}

const palette = ['#1A3E8C', '#F7941D', '#1E9E5A', '#0EA5E9', '#8B5CF6', '#E5484D']

function buildDepthMap(nodes: BubbleGraphNode[]): Map<string, number> {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const depth = new Map<string, number>()
  const resolve = (id: string): number => {
    if (depth.has(id)) return depth.get(id)!
    const node = byId.get(id)
    if (!node?.parentId) {
      depth.set(id, 0)
      return 0
    }
    const d = resolve(node.parentId) + 1
    depth.set(id, d)
    return d
  }
  nodes.forEach((n) => resolve(n.id))
  return depth
}

function hasChildren(nodes: BubbleGraphNode[], id: string): boolean {
  return nodes.some((n) => n.parentId === id)
}

export function BubbleGraph({ nodes, height = 520, minSize = 28, maxSize = 90 }: BubbleGraphProps) {
  const depthMap = useMemo(() => buildDepthMap(nodes), [nodes])
  const rootIds = useMemo(() => nodes.filter((n) => !n.parentId).map((n) => n.id), [nodes])
  const defaultCollapsed = useMemo(() => new Set(nodes.filter((n) => hasChildren(nodes, n.id)).map((n) => n.id)), [nodes])
  const [collapsed, setCollapsed] = useState<Set<string>>(defaultCollapsed)
  const [prevNodes, setPrevNodes] = useState(nodes)
  if (nodes !== prevNodes) {
    setPrevNodes(nodes)
    setCollapsed(defaultCollapsed)
  }

  const maxValue = useMemo(() => Math.max(1, ...nodes.map((n) => n.value ?? 1)), [nodes])

  const isVisible = useCallback(
    (node: BubbleGraphNode): boolean => {
      let current = node
      while (current.parentId) {
        if (collapsed.has(current.parentId)) return false
        const parent = nodes.find((n) => n.id === current.parentId)
        if (!parent) break
        current = parent
      }
      return true
    },
    [nodes, collapsed],
  )

  const visibleNodes = useMemo(() => nodes.filter(isVisible), [nodes, isVisible])

  const { graphNodes, graphLinks } = useMemo(() => {
    const gNodes: EchartsGraphNode[] = visibleNodes.map((node) => {
      const depth = depthMap.get(node.id) ?? 0
      const ratio = (node.value ?? 1) / maxValue
      const size = minSize + ratio * (maxSize - minSize)
      const color = node.color ?? palette[depth % palette.length]!
      return {
        id: node.id,
        name: node.value !== undefined ? `${node.label}\n${node.value}` : node.label,
        value: node.value,
        symbolSize: size,
        itemStyle: { color },
        label: { show: true, fontSize: 11, fontWeight: 'bold', color: '#1A1A1A' },
      }
    })

    const visibleIds = new Set(visibleNodes.map((n) => n.id))
    const gLinks: EchartsGraphLink[] = visibleNodes
      .filter((n) => n.parentId && visibleIds.has(n.parentId))
      .map((n) => ({ source: n.parentId!, target: n.id }))

    return { graphNodes: gNodes, graphLinks: gLinks }
  }, [visibleNodes, depthMap, maxValue, minSize, maxSize])

  const option = useMemo(
    () => ({
      animationDurationUpdate: 800,
      animationEasingUpdate: 'quarticInOut',
      tooltip: {
        formatter: (params: { data?: { id?: string } }) => {
          const node = nodes.find((n) => n.id === params.data?.id)
          if (!node) return ''
          const expandable = hasChildren(nodes, node.id) ? '<br/><em>Click to expand / collapse</em>' : ''
          return `<strong>${node.label}</strong>${node.value !== undefined ? `<br/>Records: ${node.value}` : ''}${expandable}`
        },
      },
      series: [
        {
          type: 'graph',
          layout: 'force',
          roam: true,
          draggable: true,
          label: { show: true, position: 'inside', fontFamily: 'Inter, sans-serif' },
          force: {
            repulsion: 260,
            edgeLength: [60, 140],
            gravity: 0.15,
            friction: 0.6,
            layoutAnimation: true,
          },
          edgeSymbol: ['none', 'arrow'],
          edgeSymbolSize: 6,
          data: graphNodes,
          links: graphLinks,
          lineStyle: { color: '#C7CEDA', width: 1.5, curveness: 0.05 },
          emphasis: { focus: 'adjacency', lineStyle: { width: 2.5 } },
          animation: true,
          animationDuration: 800,
        },
      ],
    }),
    [nodes, graphNodes, graphLinks],
  )

  const handleClick = useCallback(
    (params: { dataType?: string; data?: { id?: string } }) => {
      const id = params.data?.id
      if (!id) return
      const node = nodes.find((n) => n.id === id)
      if (!node) return

      if (!hasChildren(nodes, id)) return

      setCollapsed((prev) => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })
    },
    [nodes],
  )

  if (graphNodes.length === 0) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>No data to visualize.</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <ReactECharts
        option={option}
        style={{ height, width: '100%' }}
        onEvents={{ click: handleClick }}
        notMerge
        lazyUpdate
      />
      {rootIds.length > 0 && (
        <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem', mt: 1 }}>
          Drag bubbles to rearrange · click a bubble to expand or collapse its children.
        </Typography>
      )}
    </Box>
  )
}
