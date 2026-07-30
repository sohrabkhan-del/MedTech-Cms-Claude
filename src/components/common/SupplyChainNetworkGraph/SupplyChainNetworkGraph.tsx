import { useCallback, useMemo, useRef, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import type ECharts from 'echarts-for-react'
import {
  Box,
  Card,
  InputAdornment,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { Search, RotateCcw } from 'lucide-react'
import {
  NODE_KIND_COLOR,
  NODE_KIND_LABEL,
  type SupplyChainGraph,
  type SupplyChainGraphEdge,
  type SupplyChainGraphNode,
  type SupplyChainNodeKind,
} from '@/utils/buildSupplyChainGraph'

type SizeMetric = 'units' | 'batches'

interface EchartsNode {
  id: string
  name: string
  category: number
  symbolSize: number
  value: number
  itemStyle: { color: string }
  label: { show: boolean }
  x?: number
  y?: number
}

interface EchartsEdge {
  id: string
  source: string
  target: string
  lineStyle: { width: number }
  value: number
}

const MIN_SIZE = 22
const MAX_SIZE = 70
const MIN_LABEL_SIZE = 34
const MIN_EDGE_WIDTH = 1
const MAX_EDGE_WIDTH = 8

const COLUMN_X: Record<SupplyChainNodeKind, number> = {
  distributor: 120,
  dealer: 420,
  chemist: 720,
}

const CATEGORY_INDEX: Record<SupplyChainNodeKind, number> = {
  distributor: 0,
  dealer: 1,
  chemist: 2,
}

const CATEGORIES = [
  { name: NODE_KIND_LABEL.distributor, itemStyle: { color: NODE_KIND_COLOR.distributor } },
  { name: NODE_KIND_LABEL.dealer, itemStyle: { color: NODE_KIND_COLOR.dealer } },
  { name: NODE_KIND_LABEL.chemist, itemStyle: { color: NODE_KIND_COLOR.chemist } },
]

interface SupplyChainNetworkGraphProps {
  graph: SupplyChainGraph
  height?: number
  /** Called when a Distributor/Dealer/Chemist bubble is clicked — wire this to filter other views. */
  onNodeSelect?: (node: SupplyChainGraphNode | null) => void
  /** Called when an edge between two entities is clicked — surface a detail panel with its invoice/batch list. */
  onEdgeSelect?: (edge: SupplyChainGraphEdge | null) => void
}

export function SupplyChainNetworkGraph({
  graph,
  height = 560,
  onNodeSelect,
  onEdgeSelect,
}: SupplyChainNetworkGraphProps) {
  const [sizeMetric, setSizeMetric] = useState<SizeMetric>('units')
  const [search, setSearch] = useState('')
  const [selectedEdge, setSelectedEdge] = useState<SupplyChainGraphEdge | null>(null)
  const chartRef = useRef<ECharts | null>(null)

  const nodesById = useMemo(() => new Map(graph.nodes.map((n) => [n.id, n])), [graph.nodes])
  const edgesById = useMemo(() => new Map(graph.edges.map((e) => [e.id, e])), [graph.edges])

  const maxNodeValue = useMemo(
    () => Math.max(1, ...graph.nodes.map((n) => (sizeMetric === 'units' ? n.unitCount : n.batchCount))),
    [graph.nodes, sizeMetric],
  )
  const maxEdgeValue = useMemo(() => Math.max(1, ...graph.edges.map((e) => e.unitCount)), [graph.edges])

  const { echartsNodes, echartsEdges } = useMemo(() => {
    const eNodes: EchartsNode[] = graph.nodes.map((node) => {
      const rawValue = sizeMetric === 'units' ? node.unitCount : node.batchCount
      const size = MIN_SIZE + (rawValue / maxNodeValue) * (MAX_SIZE - MIN_SIZE)
      return {
        id: node.id,
        name: node.name,
        category: CATEGORY_INDEX[node.kind],
        symbolSize: size,
        value: rawValue,
        itemStyle: { color: NODE_KIND_COLOR[node.kind] },
        label: { show: size >= MIN_LABEL_SIZE },
        x: COLUMN_X[node.kind],
      }
    })

    const eEdges: EchartsEdge[] = graph.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      value: edge.unitCount,
      lineStyle: {
        width: MIN_EDGE_WIDTH + (edge.unitCount / maxEdgeValue) * (MAX_EDGE_WIDTH - MIN_EDGE_WIDTH),
      },
    }))

    return { echartsNodes: eNodes, echartsEdges: eEdges }
  }, [graph, sizeMetric, maxNodeValue, maxEdgeValue])

  const option = useMemo(
    () => ({
      animationDurationUpdate: 600,
      tooltip: {
        formatter: (params: { dataType?: string; data?: { id?: string } }) => {
          if (params.dataType === 'edge') {
            const edge = edgesById.get(params.data?.id ?? '')
            if (!edge) return ''
            const source = nodesById.get(edge.source)
            const target = nodesById.get(edge.target)
            return `<strong>${source?.name} → ${target?.name}</strong><br/>${edge.unitCount} unit(s) across ${edge.batchNumbers.length} batch(es)<br/><em>Click for details</em>`
          }
          const node = nodesById.get(params.data?.id ?? '')
          if (!node) return ''
          return `<strong>${node.name}</strong><br/>${NODE_KIND_LABEL[node.kind]}<br/>${node.unitCount} unit(s) · ${node.batchCount} batch(es)<br/><em>Click to filter</em>`
        },
      },
      legend: [
        {
          data: CATEGORIES.map((c) => c.name),
          top: 4,
          left: 4,
          textStyle: { fontSize: 12, fontFamily: 'Inter, sans-serif' },
        },
      ],
      series: [
        {
          type: 'graph',
          layout: 'force',
          roam: true,
          draggable: true,
          categories: CATEGORIES,
          data: echartsNodes,
          links: echartsEdges,
          label: { position: 'inside', fontSize: 10, fontFamily: 'Inter, sans-serif', color: '#1A1A1A' },
          force: {
            repulsion: 220,
            edgeLength: [70, 200],
            gravity: 0.08,
            friction: 0.6,
            layoutAnimation: true,
          },
          edgeSymbol: ['none', 'none'],
          lineStyle: { color: '#C7CEDA', curveness: 0.08, opacity: 0.7 },
          emphasis: {
            focus: 'adjacency',
            lineStyle: { opacity: 1, color: '#5B6B8C' },
            label: { show: true },
          },
          blur: { itemStyle: { opacity: 0.15 }, lineStyle: { opacity: 0.08 } },
          animation: true,
        },
      ],
    }),
    [echartsNodes, echartsEdges, nodesById, edgesById],
  )

  const handleEvents = useMemo(
    () => ({
      click: (params: { dataType?: string; data?: { id?: string } }) => {
        if (params.dataType === 'edge') {
          const edge = edgesById.get(params.data?.id ?? '') ?? null
          setSelectedEdge(edge)
          onEdgeSelect?.(edge)
          return
        }
        if (params.dataType === 'node') {
          const node = nodesById.get(params.data?.id ?? '') ?? null
          setSelectedEdge(null)
          onNodeSelect?.(node)
        }
      },
    }),
    [nodesById, edgesById, onNodeSelect, onEdgeSelect],
  )

  const handleSearch = useCallback(
    (value: string) => {
      setSearch(value)
      const instance = chartRef.current?.getEchartsInstance()
      if (!instance || !value.trim()) return
      const query = value.trim().toLowerCase()
      const match = graph.nodes.find((n) => n.name.toLowerCase().includes(query))
      if (!match) return
      instance.dispatchAction({ type: 'downplay' })
      instance.dispatchAction({
        type: 'highlight',
        seriesIndex: 0,
        name: match.name,
      })
      instance.dispatchAction({
        type: 'showTip',
        seriesIndex: 0,
        name: match.name,
      })
    },
    [graph.nodes],
  )

  const handleReset = useCallback(() => {
    const instance = chartRef.current?.getEchartsInstance()
    instance?.dispatchAction({ type: 'restore' })
    setSearch('')
    setSelectedEdge(null)
    onNodeSelect?.(null)
    onEdgeSelect?.(null)
  }, [onNodeSelect, onEdgeSelect])

  if (graph.nodes.length === 0) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
          No supply chain data to visualize.
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ mb: 1.5, alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
      >
        <TextField
          size="small"
          placeholder="Search distributor, dealer, or chemist…"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          sx={{ width: { xs: '100%', sm: 320 }, '& .MuiOutlinedInput-root': { height: 36, fontSize: '0.8125rem' } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={16} style={{ opacity: 0.6 }} />
                </InputAdornment>
              ),
            },
          }}
        />
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={sizeMetric}
            onChange={(_, value) => value && setSizeMetric(value)}
            sx={{ '& .MuiToggleButton-root': { fontSize: '0.75rem', textTransform: 'none', px: 1.5, height: 34 } }}
          >
            <ToggleButton value="units">Size by units</ToggleButton>
            <ToggleButton value="batches">Size by batches</ToggleButton>
          </ToggleButtonGroup>
          <Box
            component="button"
            type="button"
            onClick={handleReset}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              height: 36,
              px: 1.5,
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'primary.main',
              border: '1px solid',
              borderColor: 'primary.main',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={14} />
            Reset View
          </Box>
        </Stack>
      </Stack>

      <ReactECharts
        ref={chartRef}
        option={option}
        style={{ height, width: '100%' }}
        onEvents={handleEvents}
        notMerge
        lazyUpdate
      />

      <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', rowGap: 0.5 }}>
        {(['distributor', 'dealer', 'chemist'] as const).map((kind) => (
          <Stack key={kind} direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: NODE_KIND_COLOR[kind] }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {NODE_KIND_LABEL[kind]}
            </Typography>
          </Stack>
        ))}
        <Typography variant="caption" sx={{ color: 'text.disabled', ml: 1 }}>
          · Bubble size = volume · Line thickness = shared units · Drag to rearrange · Scroll to zoom
        </Typography>
      </Stack>

      {selectedEdge && (
        <Card variant="outlined" sx={{ mt: 1.5, p: 2 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', mb: 0.5 }}>
            {nodesById.get(selectedEdge.source)?.name} → {nodesById.get(selectedEdge.target)?.name}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {selectedEdge.unitCount} unit(s) across {selectedEdge.batchNumbers.length} batch(es)
          </Typography>
          <Stack direction="row" spacing={0.75} sx={{ mt: 1, flexWrap: 'wrap', rowGap: 0.75 }}>
            {selectedEdge.batchNumbers.map((batch) => (
              <Box
                key={batch}
                sx={{
                  px: 1,
                  py: 0.25,
                  borderRadius: '6px',
                  backgroundColor: 'background.default',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                }}
              >
                {batch}
              </Box>
            ))}
          </Stack>
        </Card>
      )}
    </Box>
  )
}
