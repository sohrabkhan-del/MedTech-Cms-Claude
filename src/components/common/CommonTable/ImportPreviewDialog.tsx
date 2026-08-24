import {
  Alert,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { Modal } from '@/components/common/Modal/Modal'
import type { ParsedImportFile } from '@/components/common/CommonTable/tableCsv'

interface ImportPreviewDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  fileName: string | null
  parsed: ParsedImportFile | null
  error: string | null
  confirming?: boolean
}

/** Returns a Set of row indices that have a duplicate value for the given field. */
function findDuplicateIndices(
  rows: Record<string, string>[],
  field: string,
): Set<number> {
  const seen = new Map<string, number>() // value → first-seen index
  const dupes = new Set<number>()
  rows.forEach((row, i) => {
    const val = row[field]?.trim().toLowerCase()
    if (!val) return
    if (seen.has(val)) {
      dupes.add(seen.get(val)!) // mark original too
      dupes.add(i)
    } else {
      seen.set(val, i)
    }
  })
  return dupes
}

export function ImportPreviewDialog({
  open,
  onClose,
  onConfirm,
  fileName,
  parsed,
  error,
  confirming = false,
}: ImportPreviewDialogProps) {
  const rows = parsed?.rows ?? []

  // Detect duplicates by email (primary unique key for partner imports)
  const duplicateIndices = parsed?.headers.includes('email')
    ? findDuplicateIndices(rows, 'email')
    : new Set<number>()

  const hasDuplicates = duplicateIndices.size > 0

  const canConfirm = parsed != null && !error && !hasDuplicates

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Import Preview"
      description={fileName ?? undefined}
      maxWidth="md"
      secondaryActionLabel="Cancel"
      primaryActionLabel={parsed && !error ? 'Confirm' : undefined}
      primaryActionDisabled={!canConfirm}
      onPrimaryAction={onConfirm}
      loading={confirming}
    >
      {error && <Alert severity="error">{error}</Alert>}

      {parsed && !error && (
        <Box>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1.5 }}>
            Detected {parsed.rows.length} row{parsed.rows.length === 1 ? '' : 's'} across{' '}
            {parsed.headers.length} column{parsed.headers.length === 1 ? '' : 's'}. Review the
            data below, then confirm to add it to your listing.
          </Typography>

          {hasDuplicates && (
            <Alert severity="warning" sx={{ mb: 1.5 }}>
              {duplicateIndices.size} row(s) with duplicate email addresses were found. Fix
              duplicates in your file and re-upload before confirming.
            </Alert>
          )}

          <TableContainer
            sx={{ maxHeight: 400, border: '1px solid', borderColor: 'divider', borderRadius: '8px' }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  {parsed.headers.map((header) => (
                    <TableCell key={header} sx={{ fontSize: '0.6875rem' }}>
                      {header}
                    </TableCell>
                  ))}
                  {hasDuplicates && (
                    <TableCell sx={{ fontSize: '0.6875rem' }}>Status</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, i) => {
                  const isDupe = duplicateIndices.has(i)
                  return (
                    <TableRow
                      key={i}
                      sx={
                        isDupe
                          ? {
                              bgcolor: 'rgba(245, 158, 11, 0.08)',
                              '&:hover': { bgcolor: 'rgba(245, 158, 11, 0.14)' },
                            }
                          : undefined
                      }
                    >
                      {parsed.headers.map((header) => (
                        <TableCell key={header} sx={{ fontSize: '0.8125rem' }}>
                          {row[header]}
                        </TableCell>
                      ))}
                      {hasDuplicates && (
                        <TableCell>
                          {isDupe ? (
                            <Chip label="Duplicate" size="small" color="warning" variant="filled" />
                          ) : (
                            <Chip label="OK" size="small" color="success" variant="filled" />
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Modal>
  )
}
