import { Fragment, useState, type ReactNode } from 'react'
import {
  Box,
  Card,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'

export interface ExpandableTableColumn<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  align?: 'left' | 'right' | 'center'
  minWidth?: string | number
}

interface ExpandableTableProps<T> {
  columns: ExpandableTableColumn<T>[]
  rows: T[]
  getRowId: (row: T) => string
  renderExpanded: (row: T) => ReactNode
  defaultExpandedIds?: string[]
  emptyTitle?: string
}

export function ExpandableTable<T>({
  columns,
  rows,
  getRowId,
  renderExpanded,
  defaultExpandedIds = [],
  emptyTitle = 'No records found',
}: ExpandableTableProps<T>) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(defaultExpandedIds))

  function toggle(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (rows.length === 0) {
    return (
      <Card sx={{ p: 0 }}>
        <EmptyState title={emptyTitle} />
      </Card>
    )
  }

  return (
    <Card sx={{ p: 0, overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 520 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 40, fontWeight: 700, fontSize: '0.6875rem', textTransform: 'uppercase', color: 'text.secondary' }} />
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  align={col.align}
                  sx={{ minWidth: col.minWidth, fontWeight: 700, fontSize: '0.6875rem', textTransform: 'uppercase', color: 'text.secondary' }}
                >
                  {col.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const id = getRowId(row)
              const expanded = expandedIds.has(id)
              return (
                <Fragment key={id}>
                  <TableRow hover sx={{ '& > *': { borderBottom: expanded ? 'none' : undefined } }}>
                    <TableCell>
                      <IconButton size="small" onClick={() => toggle(id)} aria-label={expanded ? 'Collapse row' : 'Expand row'}>
                        {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </IconButton>
                    </TableCell>
                    {columns.map((col) => (
                      <TableCell key={col.key} align={col.align} sx={{ fontSize: '0.8125rem' }}>
                        {col.render(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ py: 0, border: 0 }} colSpan={columns.length + 1}>
                      <Collapse in={expanded} timeout="auto" unmountOnExit>
                        <Box sx={{ py: 2, px: 2, backgroundColor: 'background.default' }}>{renderExpanded(row)}</Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </Fragment>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  )
}
