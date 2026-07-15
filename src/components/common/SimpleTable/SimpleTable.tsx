import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'

export interface SimpleTableColumn<T> {
  key: string
  header: string
  render: (row: T) => React.ReactNode
  align?: 'left' | 'right' | 'center'
}

interface SimpleTableProps<T> {
  columns: SimpleTableColumn<T>[]
  rows: T[]
  getRowId: (row: T) => string
  emptyTitle?: string
  emptyDescription?: string
}

export function SimpleTable<T>({
  columns,
  rows,
  getRowId,
  emptyTitle = 'No records yet',
  emptyDescription,
}: SimpleTableProps<T>) {
  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.key} align={col.align}>
                {col.header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={getRowId(row)}>
              {columns.map((col) => (
                <TableCell key={col.key} align={col.align}>
                  {col.render(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
