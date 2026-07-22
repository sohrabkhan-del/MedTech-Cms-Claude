import { Alert, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { Modal } from '@/components/common/Modal/Modal'
import type { ParsedImportFile } from '@/components/common/CommonTable/tableCsv'

interface ImportPreviewDialogProps {
  open: boolean
  onClose: () => void
  fileName: string | null
  parsed: ParsedImportFile | null
  error: string | null
  maxPreviewRows?: number
}

export function ImportPreviewDialog({
  open,
  onClose,
  fileName,
  parsed,
  error,
  maxPreviewRows = 20,
}: ImportPreviewDialogProps) {
  const previewRows = parsed?.rows.slice(0, maxPreviewRows) ?? []
  const remaining = parsed ? parsed.rows.length - previewRows.length : 0

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Import Preview"
      description={fileName ?? undefined}
      maxWidth="md"
      secondaryActionLabel="Close"
    >
      {error && <Alert severity="error">{error}</Alert>}

      {parsed && !error && (
        <Box>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1.5 }}>
            Detected {parsed.rows.length} row{parsed.rows.length === 1 ? '' : 's'} across {parsed.headers.length} column
            {parsed.headers.length === 1 ? '' : 's'}. Review the data below — nothing has been saved yet.
          </Typography>

          <TableContainer sx={{ maxHeight: 400, border: '1px solid', borderColor: 'divider', borderRadius: '8px' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  {parsed.headers.map((header) => (
                    <TableCell key={header} sx={{ fontSize: '0.6875rem' }}>
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {previewRows.map((row, i) => (
                  <TableRow key={i}>
                    {parsed.headers.map((header) => (
                      <TableCell key={header} sx={{ fontSize: '0.8125rem' }}>
                        {row[header]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {remaining > 0 && (
            <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
              +{remaining} more row{remaining === 1 ? '' : 's'} not shown in this preview.
            </Typography>
          )}
        </Box>
      )}
    </Modal>
  )
}
