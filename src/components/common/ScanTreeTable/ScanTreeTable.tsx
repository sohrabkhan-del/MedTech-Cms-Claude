import { useMemo, useRef, useState } from 'react'
import {
  Box,
  Card,
  Chip,
  InputAdornment,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useVirtualizer } from '@tanstack/react-virtual'
import {
  Search,
  ChevronRight,
  ChevronDown,
  ChevronsDownUp,
  ChevronsUpDown,
  ArrowUpDown,
} from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { buildNestedScanData } from '@/utils/buildNestedScanData'
import {
  DEFAULT_SCAN_GROUP_BY,
  type NestedNode,
  type ScanGroupField,
  type ScanRow,
} from '@/types/masterScanTable'
import {
  LEVEL_META,
  collectAllExpandableIds,
  filterTree,
  flattenVisible,
  pluralize,
  sortTree,
  type SortMode,
} from './scanTreeTableUtils'

const SORT_OPTIONS: { mode: SortMode; label: string }[] = [
  { mode: 'label-asc', label: 'Name (A–Z)' },
  { mode: 'label-desc', label: 'Name (Z–A)' },
  { mode: 'count-desc', label: 'Unit count (high–low)' },
  { mode: 'count-asc', label: 'Unit count (low–high)' },
]

const ROW_HEIGHT = 44
const INDENT_PX = 22

interface ScanTreeTableProps {
  rows: ScanRow[]
  /** Overrides the default Invoice -> ... -> Unit grouping order. */
  groupBy?: ScanGroupField[]
  loading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  /** Max height of the scrollable/virtualized viewport, in px. */
  maxHeight?: number
}

function LevelBadge({ level }: { level: NestedNode['level'] }) {
  const meta = LEVEL_META[level]
  const Icon = meta.icon
  return (
    <Chip
      size="small"
      icon={<Icon size={12} />}
      label={meta.label}
      sx={{
        height: 20,
        fontSize: '0.6875rem',
        fontWeight: 600,
        color: meta.color,
        backgroundColor: `${meta.color}1A`,
        '& .MuiChip-icon': { color: meta.color, ml: '6px' },
      }}
    />
  )
}

function NodeRow({
  node,
  depth,
  isExpanded,
  onToggle,
}: {
  node: NestedNode
  depth: number
  isExpanded: boolean
  onToggle: () => void
}) {
  const hasChildren = node.children.length > 0
  const isLeaf = node.level === 'unit'

  return (
    <Stack
      direction="row"
      spacing={1.25}
      sx={{
        alignItems: 'center',
        height: ROW_HEIGHT,
        pl: `${depth * INDENT_PX + 12}px`,
        pr: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        cursor: hasChildren ? 'pointer' : 'default',
        '&:hover': hasChildren ? { backgroundColor: 'background.default' } : undefined,
      }}
      onClick={hasChildren ? onToggle : undefined}
    >
      <Box sx={{ width: 18, display: 'flex', flexShrink: 0 }}>
        {hasChildren ? (
          isExpanded ? (
            <ChevronDown size={16} />
          ) : (
            <ChevronRight size={16} />
          )
        ) : null}
      </Box>

      <Box sx={{ flexShrink: 0 }}>
        <LevelBadge level={node.level} />
      </Box>

      <Typography
        noWrap
        sx={{
          fontSize: '0.8125rem',
          fontWeight: isLeaf ? 500 : 600,
          color: 'text.primary',
          flexShrink: 0,
          maxWidth: 320,
        }}
        title={node.label}
      >
        {node.label}
      </Typography>

      {!isLeaf && (
        <Stack direction="row" spacing={1} sx={{ ml: 'auto', alignItems: 'center', flexShrink: 0 }}>
          {typeof node.distinctChildGroups === 'number' && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {node.distinctChildGroups}{' '}
              {pluralize(
                node.children[0] ? LEVEL_META[node.children[0].level].label.toLowerCase() : 'item',
                node.distinctChildGroups,
              )}
            </Typography>
          )}
          <Chip
            size="small"
            variant="outlined"
            label={`${node.childCount.toLocaleString()} ${pluralize('unit', node.childCount)}`}
            sx={{ height: 20, fontSize: '0.6875rem', fontWeight: 600 }}
          />
        </Stack>
      )}

      {isLeaf && node.row && (
        <Stack
          direction="row"
          spacing={2}
          sx={{ ml: 'auto', alignItems: 'center', minWidth: 0, overflow: 'hidden' }}
        >
          <DetailField label="Product ID" value={node.row.productId} />
          <DetailField label="Batch" value={node.row.batchId} />
          <DetailField label="Container" value={node.row.containerId} />
          <DetailField label="UID" value={node.row.productUid} emphasize />
        </Stack>
      )}
    </Stack>
  )
}

function DetailField({
  label,
  value,
  emphasize,
}: {
  label: string
  value: string
  emphasize?: boolean
}) {
  return (
    <Stack sx={{ minWidth: 0 }}>
      <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.625rem', lineHeight: 1.2 }}>
        {label}
      </Typography>
      <Typography
        noWrap
        sx={{
          fontSize: '0.75rem',
          fontWeight: emphasize ? 700 : 500,
          color: emphasize ? 'primary.main' : 'text.primary',
        }}
        title={value}
      >
        {value}
      </Typography>
    </Stack>
  )
}

export function ScanTreeTable({
  rows,
  groupBy = DEFAULT_SCAN_GROUP_BY,
  loading = false,
  emptyTitle = 'No scanned units found',
  emptyDescription = 'Try adjusting your search.',
  maxHeight = 640,
}: ScanTreeTableProps) {
  const [search, setSearch] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('label-asc')
  const [sortMenuAnchor, setSortMenuAnchor] = useState<HTMLElement | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const tree = useMemo(() => buildNestedScanData(rows, groupBy), [rows, groupBy])

  const query = search.trim().toLowerCase()

  const { visibleTree, searchExpandIds } = useMemo(() => {
    if (!query) return { visibleTree: tree, searchExpandIds: new Set<string>() }
    const { filtered, expandIds } = filterTree(tree, query)
    return { visibleTree: filtered, searchExpandIds: expandIds }
  }, [tree, query])

  const sortedTree = useMemo(() => sortTree(visibleTree, sortMode), [visibleTree, sortMode])

  const effectiveExpanded = useMemo(() => {
    if (!query) return expanded
    const merged = new Set(expanded)
    for (const id of searchExpandIds) merged.add(id)
    return merged
  }, [expanded, query, searchExpandIds])

  const flatRows = useMemo(
    () => flattenVisible(sortedTree, effectiveExpanded),
    [sortedTree, effectiveExpanded],
  )

  const virtualizer = useVirtualizer({
    count: flatRows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
  })

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const expandAll = () => setExpanded(collectAllExpandableIds(tree))
  const collapseAll = () => setExpanded(new Set())

  const totalUnits = rows.length

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ mb: 2, alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
      >
        <TextField
          size="small"
          placeholder="Search invoice, distributor, dealer, chemist, product, batch, container, UID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            width: { xs: '100%', sm: 420 },
            '& .MuiOutlinedInput-root': { height: 36, fontSize: '0.8125rem' },
          }}
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
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', alignSelf: 'center', mr: 0.5 }}>
            {totalUnits.toLocaleString()} total units
          </Typography>
          <Tooltip title="Sort">
            <Box
              component="button"
              type="button"
              onClick={(e) => setSortMenuAnchor(e.currentTarget)}
              sx={sortButtonSx}
            >
              <ArrowUpDown size={14} />
              Sort
            </Box>
          </Tooltip>
          <Menu anchorEl={sortMenuAnchor} open={!!sortMenuAnchor} onClose={() => setSortMenuAnchor(null)}>
            {SORT_OPTIONS.map((opt) => (
              <MenuItem
                key={opt.mode}
                dense
                selected={sortMode === opt.mode}
                sx={{ fontSize: '0.8125rem' }}
                onClick={() => {
                  setSortMode(opt.mode)
                  setSortMenuAnchor(null)
                }}
              >
                {opt.label}
              </MenuItem>
            ))}
          </Menu>
          <Box component="button" type="button" onClick={expandAll} sx={sortButtonSx}>
            <ChevronsUpDown size={14} />
            Expand All
          </Box>
          <Box component="button" type="button" onClick={collapseAll} sx={sortButtonSx}>
            <ChevronsDownUp size={14} />
            Collapse All
          </Box>
        </Stack>
      </Stack>

      <Card>
        {loading ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>Loading…</Typography>
          </Box>
        ) : flatRows.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : (
          <Box ref={scrollRef} sx={{ maxHeight, overflow: 'auto' }}>
            <Box sx={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const flatRow = flatRows[virtualRow.index]
                if (!flatRow) return null
                const { node, depth } = flatRow
                return (
                  <Box
                    key={node.id}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: virtualRow.size,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <NodeRow
                      node={node}
                      depth={depth}
                      isExpanded={effectiveExpanded.has(node.id)}
                      onToggle={() => toggle(node.id)}
                    />
                  </Box>
                )
              })}
            </Box>
          </Box>
        )}
      </Card>
    </Box>
  )
}

const sortButtonSx = {
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
} as const
