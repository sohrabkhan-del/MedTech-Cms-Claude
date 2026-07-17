import { Fragment, useMemo, useState } from 'react'
import {
  Box,
  Card,
  Checkbox,
  IconButton,
  InputAdornment,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { Search, ChevronRight, ChevronDown, MoreVertical, Columns3 as ViewColumnIcon, SlidersHorizontal as Tune } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { useColumnVisibility } from '@/hooks/useColumnVisibility'

export interface TreeTableColumn<T> {
  key: string
  header: string
  render: (row: T) => React.ReactNode
  width?: string | number
  minWidth?: string | number
  align?: 'left' | 'right' | 'center'
  hideable?: boolean
}

export interface TreeTableNode<T> {
  id: string
  data: T
  children?: TreeTableNode<T>[]
}

export interface TreeTableAction<T> {
  label: string
  onClick: (row: T) => void
  danger?: boolean
}

interface TreeTableProps<T> {
  tableKey: string
  columns: TreeTableColumn<T>[]
  nodes: TreeTableNode<T>[]
  searchPlaceholder?: string
  searchKeys?: (row: T) => string
  actions?: TreeTableAction<T>[]
  onFilterClick?: () => void
  filterCount?: number
  emptyTitle?: string
  emptyDescription?: string
  defaultExpanded?: boolean
}

export function TreeTable<T>({
  tableKey,
  columns,
  nodes,
  searchPlaceholder = 'Search…',
  searchKeys,
  actions,
  onFilterClick,
  filterCount = 0,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your search or filters.',
  defaultExpanded = true,
}: TreeTableProps<T>) {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(defaultExpanded ? nodes.filter((n) => n.children?.length).map((n) => n.id) : []),
  )
  const [actionMenuAnchor, setActionMenuAnchor] = useState<HTMLElement | null>(null)
  const [activeRow, setActiveRow] = useState<T | null>(null)
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<HTMLElement | null>(null)
  const { hidden, toggle } = useColumnVisibility(tableKey)

  const visibleColumns = useMemo(() => columns.filter((col) => !hidden.has(col.key)), [columns, hidden])

  const filteredNodes = useMemo(() => {
    if (!search || !searchKeys) return nodes
    const query = search.toLowerCase()
    return nodes.filter((node) => {
      const parentMatch = searchKeys(node.data).toLowerCase().includes(query)
      const childMatch = node.children?.some((child) => searchKeys(child.data).toLowerCase().includes(query))
      return parentMatch || childMatch
    })
  }, [nodes, search, searchKeys])

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const openActionMenu = (event: React.MouseEvent<HTMLElement>, row: T) => {
    setActionMenuAnchor(event.currentTarget)
    setActiveRow(row)
  }

  const closeActionMenu = () => {
    setActionMenuAnchor(null)
    setActiveRow(null)
  }

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ mb: 2, alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
      >
        <TextField
          size="small"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: { xs: '100%', sm: 260 }, '& .MuiOutlinedInput-root': { height: 36, fontSize: '0.8125rem' } }}
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
          {onFilterClick && (
            <Box
              component="button"
              type="button"
              onClick={onFilterClick}
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
              <Tune size={16} />
              Filter{filterCount > 0 ? ` (${filterCount})` : ''}
            </Box>
          )}
          <Box
            component="button"
            type="button"
            onClick={(e) => setColumnMenuAnchor(e.currentTarget)}
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
            <ViewColumnIcon size={16} />
            Columns
          </Box>
          <Menu anchorEl={columnMenuAnchor} open={!!columnMenuAnchor} onClose={() => setColumnMenuAnchor(null)}>
            {columns
              .filter((col) => col.hideable !== false)
              .map((col) => (
                <MenuItem key={col.key} onClick={() => toggle(col.key)} dense sx={{ fontSize: '0.8125rem' }}>
                  <Checkbox checked={!hidden.has(col.key)} size="small" />
                  <ListItemText primary={col.header} slotProps={{ primary: { sx: { fontSize: '0.8125rem' } } }} />
                </MenuItem>
              ))}
          </Menu>
        </Stack>
      </Stack>

      <Card>
        {filteredNodes.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : (
          <TableContainer sx={{ maxHeight: 640 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow sx={{ '& th': { height: 36, py: 0 } }}>
                  {visibleColumns.map((col, i) => (
                    <TableCell
                      key={col.key}
                      align={col.align}
                      sx={{
                        width: col.width,
                        minWidth: i === 0 ? (col.minWidth ?? 220) : (col.minWidth ?? col.width ?? 120),
                        maxWidth: col.width ?? 220,
                        fontSize: '0.6875rem',
                      }}
                    >
                      <Tooltip title={col.header}>
                        <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{col.header}</Box>
                      </Tooltip>
                    </TableCell>
                  ))}
                  {actions && actions.length > 0 && (
                    <TableCell align="right" sx={{ width: 56 }}>
                      Actions
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredNodes.map((node) => (
                  <Fragment key={node.id}>
                    <TableRow>
                      {visibleColumns.map((col, i) => (
                        <TableCell key={col.key} align={col.align} sx={{ fontSize: '0.8125rem' }}>
                          {i === 0 && node.children?.length ? (
                            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                              <IconButton size="small" onClick={() => toggleExpanded(node.id)} sx={{ p: 0.25 }} aria-label="Toggle row">
                                {expanded.has(node.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                              </IconButton>
                              {col.render(node.data)}
                            </Stack>
                          ) : (
                            col.render(node.data)
                          )}
                        </TableCell>
                      ))}
                      {actions && actions.length > 0 && (
                        <TableCell align="right">
                          <IconButton size="small" onClick={(e) => openActionMenu(e, node.data)} aria-label="Row actions">
                            <MoreVertical size={16} />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                    {node.children?.length && expanded.has(node.id)
                      ? node.children.map((child) => (
                          <TableRow key={child.id} sx={{ backgroundColor: 'background.default' }}>
                            {visibleColumns.map((col, i) => (
                              <TableCell key={col.key} align={col.align} sx={{ fontSize: '0.8125rem' }}>
                                {i === 0 ? (
                                  <Box sx={{ pl: 4 }}>{col.render(child.data)}</Box>
                                ) : (
                                  col.render(child.data)
                                )}
                              </TableCell>
                            ))}
                            {actions && actions.length > 0 && (
                              <TableCell align="right">
                                <IconButton size="small" onClick={(e) => openActionMenu(e, child.data)} aria-label="Row actions">
                                  <MoreVertical size={16} />
                                </IconButton>
                              </TableCell>
                            )}
                          </TableRow>
                        ))
                      : null}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {actions && (
          <Menu anchorEl={actionMenuAnchor} open={!!actionMenuAnchor} onClose={closeActionMenu}>
            {actions.map((action) => (
              <MenuItem
                key={action.label}
                onClick={() => {
                  if (activeRow) action.onClick(activeRow)
                  closeActionMenu()
                }}
                sx={action.danger ? { color: 'error.main' } : undefined}
              >
                <Typography variant="body1" sx={{ color: 'inherit', fontSize: '0.8125rem' }}>
                  {action.label}
                </Typography>
              </MenuItem>
            ))}
          </Menu>
        )}
      </Card>
    </Box>
  )
}
