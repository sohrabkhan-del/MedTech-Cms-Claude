import { useMemo, useState } from 'react'
import {
  Box,
  Button,
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
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  MoreVertical,
  Download,
  Upload,
  SlidersHorizontal,
  Columns3,
  Plus,
} from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { SkeletonLoader } from '@/components/common/SkeletonLoader/SkeletonLoader'
import { Skeleton as Boneyard } from 'boneyard-js/react'
import { useColumnVisibility } from '@/hooks/useColumnVisibility'

export interface CommonTableCreateAction {
  label: string
  to: string
}

export interface CommonTableColumn<T> {
  key: string
  header: string
  render: (row: T) => React.ReactNode
  width?: string | number
  minWidth?: string | number
  align?: 'left' | 'right' | 'center'
  /** Enables the sortable header. Required alongside a comparable value for sorting to work. */
  sortable?: boolean
  /** Comparable value used for sorting; falls back to render() output (stringified) when omitted. */
  sortValue?: (row: T) => string | number
  /** Whether this column can be hidden via the Columns menu. Defaults to true. */
  hideable?: boolean
}

export interface CommonTableAction<T> {
  label: string
  onClick: (row: T) => void
  danger?: boolean
}

type SortDirection = 'asc' | 'desc'

interface CommonTableProps<T> {
  /** Unique per table — used as the localStorage key for column visibility preferences. */
  tableKey: string
  columns: CommonTableColumn<T>[]
  rows: T[]
  getRowId: (row: T) => string
  loading?: boolean
  searchPlaceholder?: string
  searchKeys?: (row: T) => string
  actions?: CommonTableAction<T>[]
  onFilterClick?: () => void
  filterCount?: number
  onExportClick?: () => void
  onImportClick?: () => void
  createAction?: CommonTableCreateAction
  emptyTitle?: string
  emptyDescription?: string
  rowsPerPageOptions?: number[]
  defaultSortBy?: string
  defaultSortDir?: SortDirection
}

export function CommonTable<T>({
  tableKey,
  columns,
  rows,
  getRowId,
  loading = false,
  searchPlaceholder = 'Search…',
  searchKeys,
  actions,
  onFilterClick,
  filterCount = 0,
  onExportClick,
  onImportClick,
  createAction,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your search or filters.',
  rowsPerPageOptions = [10, 25, 50],
  defaultSortBy,
  defaultSortDir = 'asc',
}: CommonTableProps<T>) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0] ?? 10)
  const [sortBy, setSortBy] = useState<string | undefined>(defaultSortBy)
  const [sortDir, setSortDir] = useState<SortDirection>(defaultSortDir)
  const [actionMenuAnchor, setActionMenuAnchor] = useState<HTMLElement | null>(
    null,
  )
  const [activeRow, setActiveRow] = useState<T | null>(null)
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<HTMLElement | null>(
    null,
  )
  const { hidden, toggle } = useColumnVisibility(tableKey)

  const visibleColumns = useMemo(
    () => columns.filter((col) => !hidden.has(col.key)),
    [columns, hidden],
  )

  const filteredRows = useMemo(() => {
    if (!search || !searchKeys) return rows
    const query = search.toLowerCase()
    return rows.filter((row) => searchKeys(row).toLowerCase().includes(query))
  }, [rows, search, searchKeys])

  const sortedRows = useMemo(() => {
    if (!sortBy) return filteredRows
    const column = columns.find((col) => col.key === sortBy)
    if (!column) return filteredRows

    const getValue = (row: T): string | number => {
      if (column.sortValue) return column.sortValue(row)
      const rendered = column.render(row)
      return typeof rendered === 'string' || typeof rendered === 'number'
        ? rendered
        : ''
    }

    return [...filteredRows].sort((a, b) => {
      const valueA = getValue(a)
      const valueB = getValue(b)
      const comparison =
        typeof valueA === 'number' && typeof valueB === 'number'
          ? valueA - valueB
          : String(valueA).localeCompare(String(valueB))
      return sortDir === 'asc' ? comparison : -comparison
    })
  }, [filteredRows, sortBy, sortDir, columns])

  const pagedRows = useMemo(
    () =>
      sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [sortedRows, page, rowsPerPage],
  )

  const handleSort = (columnKey: string) => {
    if (sortBy === columnKey) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(columnKey)
      setSortDir('asc')
    }
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
        sx={{
          mb: 2,
          alignItems: { sm: 'center' },
          justifyContent: 'space-between',
        }}
      >
        <TextField
          size="small"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(0)
          }}
          sx={{
            width: { xs: '100%', sm: 260 },
            '& .MuiOutlinedInput-root': { height: 36, fontSize: '0.8125rem' },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment
                  position="start"
                  sx={{ color: 'text.disabled' }}
                >
                  <Search size={20} />
                </InputAdornment>
              ),
            },
          }}
        />
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
          {onFilterClick && (
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<SlidersHorizontal size={20} />}
              onClick={onFilterClick}
              sx={{ height: 36, fontSize: '0.75rem' }}
            >
              Filter{filterCount > 0 ? ` (${filterCount})` : ''}
            </Button>
          )}
          <Button
            variant="outlined"
            color="primary"
            size="small"
            startIcon={<Columns3 size={20} />}
            onClick={(e) => setColumnMenuAnchor(e.currentTarget)}
            sx={{ height: 36, fontSize: '0.75rem' }}
          >
            Columns
          </Button>
          <Menu
            anchorEl={columnMenuAnchor}
            open={!!columnMenuAnchor}
            onClose={() => setColumnMenuAnchor(null)}
          >
            {columns
              .filter((col) => col.hideable !== false)
              .map((col) => (
                <MenuItem
                  key={col.key}
                  onClick={() => toggle(col.key)}
                  dense
                  sx={{ fontSize: '0.8125rem' }}
                >
                  <Checkbox checked={!hidden.has(col.key)} size="small" />
                  <ListItemText
                    primary={col.header}
                    slotProps={{ primary: { sx: { fontSize: '0.8125rem' } } }}
                  />
                </MenuItem>
              ))}
          </Menu>
          {onImportClick && (
            <IconButton
              onClick={onImportClick}
              aria-label="Import CSV"
              size="small"
              sx={{
                border: '1px solid',
                borderColor: 'secondary.main',
                color: 'secondary.main',
                borderRadius: '8px',
                paddingX: 2,
              }}
            >
              <Upload size={15} />
            </IconButton>
          )}
          {onExportClick && (
            <IconButton
              onClick={onExportClick}
              aria-label="Export CSV"
              size="small"
              sx={{
                border: '1px solid',
                borderColor: 'success.main',
                color: 'success.main',
                paddingX: 2,
                borderRadius: '8px',
              }}
            >
              <Download size={15} />
            </IconButton>
          )}
          {createAction && (
            <Button
              variant="contained"
              size="small"
              startIcon={<Plus size={20} />}
              onClick={() => navigate(createAction.to)}
              sx={{ height: 36, fontSize: '0.75rem' }}
            >
              {createAction.label}
            </Button>
          )}
        </Stack>
      </Stack>

      <Card>
        {!loading && sortedRows.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : (
          <Boneyard
            name={`common-table-${tableKey}`}
            loading={loading}
            fallback={<SkeletonLoader variant="table-rows" rows={6} />}
          >
            <TableContainer sx={{ maxHeight: 560 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { height: 36, py: 0 } }}>
                    {visibleColumns.map((col) => (
                      <TableCell
                        key={col.key}
                        align={col.align}
                        sx={{
                          width: col.width,
                          minWidth: col.minWidth ?? col.width ?? 120,
                          maxWidth: col.width ?? 200,
                          fontSize: '0.6875rem',
                        }}
                      >
                        <Tooltip title={col.header}>
                          <Box
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              display: 'block',
                            }}
                          >
                            {col.sortable ? (
                              <TableSortLabel
                                active={sortBy === col.key}
                                direction={sortBy === col.key ? sortDir : 'asc'}
                                onClick={() => handleSort(col.key)}
                              >
                                {col.header}
                              </TableSortLabel>
                            ) : (
                              col.header
                            )}
                          </Box>
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
                  {pagedRows.map((row) => (
                    <TableRow key={getRowId(row)}>
                      {visibleColumns.map((col) => (
                        <TableCell
                          key={col.key}
                          align={col.align}
                          sx={{ fontSize: '0.8125rem' }}
                        >
                          {col.render(row)}
                        </TableCell>
                      ))}
                      {actions && actions.length > 0 && (
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={(e) => openActionMenu(e, row)}
                            aria-label="Row actions"
                          >
                            <MoreVertical size={20} />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
              <TablePagination
                component="div"
                count={sortedRows.length}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(Number(e.target.value))
                  setPage(0)
                }}
                rowsPerPageOptions={rowsPerPageOptions}
                sx={{
                  '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows':
                    { fontSize: '0.75rem' },
                }}
              />
            </Box>
          </Boneyard>
        )}

        {actions && (
          <Menu
            anchorEl={actionMenuAnchor}
            open={!!actionMenuAnchor}
            onClose={closeActionMenu}
          >
            {actions.map((action) => (
              <MenuItem
                key={action.label}
                onClick={() => {
                  if (activeRow) action.onClick(activeRow)
                  closeActionMenu()
                }}
                sx={action.danger ? { color: 'error.main' } : undefined}
              >
                <Typography
                  variant="body1"
                  sx={{ color: 'inherit', fontSize: '0.8125rem' }}
                >
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
