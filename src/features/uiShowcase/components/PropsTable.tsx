import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
} from '@mui/material'

export interface PropRow {
  name: string
  type: string
  default?: string
  description?: string
}

interface PropsTableProps {
  rows: PropRow[]
}

export function PropsTable({ rows }: PropsTableProps) {
  return (
    <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '10px' }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Prop</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Default</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.name}>
              <TableCell>
                <Box component="code" sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'primary.main' }}>
                  {row.name}
                </Box>
              </TableCell>
              <TableCell>
                <Box
                  component="code"
                  sx={{
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
                  }}
                >
                  {row.type}
                </Box>
              </TableCell>
              <TableCell sx={{ color: 'text.secondary' }}>{row.default ?? '—'}</TableCell>
              <TableCell sx={{ color: 'text.secondary' }}>{row.description ?? '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
