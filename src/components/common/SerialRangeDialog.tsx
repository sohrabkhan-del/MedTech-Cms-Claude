import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { Check, Copy, Search, X } from 'lucide-react'

export function buildCombinedSerialRange(
  prefix: string,
  startSerial: string | number,
  endSerial: string | number,
): string[] {
  const start = Number(startSerial)
  const end = Number(endSerial)

  if (!prefix || Number.isNaN(start) || Number.isNaN(end)) {
    return []
  }

  const from = Math.min(start, end)
  const to = Math.max(start, end)

  return Array.from({ length: to - from + 1 }, (_, index) => {
    const serial = from + index
    return `${prefix}_${serial}`
  })
}

interface SerialRangeDialogProps {
  open: boolean
  onClose: () => void
  prefix: string
  startSerial: string | number
  endSerial: string | number
  title?: string
}

/** Safety cap so an accidental huge range can't freeze the tab. */
const MAX_RENDERABLE = 20000
/** Number of placeholder rows shown while the list is being generated. */
const SKELETON_ROW_COUNT = 8

export function SerialRangeDialog({
  open,
  onClose,
  prefix,
  startSerial,
  endSerial,
  title = 'Serial Range',
}: SerialRangeDialogProps) {
  const [search, setSearch] = useState('')
  const [copiedAll, setCopiedAll] = useState(false)
  const [copiedValue, setCopiedValue] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(true)
  const [values, setValues] = useState<string[]>([])
  const requestId = useRef(0)

  // Recompute whenever the dialog opens or its inputs change. The build itself
  // is cheap for normal ranges, but we defer it a tick and show a shimmer so
  // large ranges (and the dialog's own mount) never feel like a frozen click.
  useEffect(() => {
    if (!open) return

    const thisRequest = ++requestId.current
    setIsCalculating(true)
    setSearch('')

    const timer = window.setTimeout(() => {
      const next = buildCombinedSerialRange(prefix, startSerial, endSerial)
      // Ignore stale results if the dialog closed/reopened before this ran.
      if (requestId.current === thisRequest) {
        setValues(next)
        setIsCalculating(false)
      }
    }, 250)

    return () => window.clearTimeout(timer)
  }, [open, prefix, startSerial, endSerial])

  const exceedsCap = values.length > MAX_RENDERABLE

  const filteredValues = useMemo(() => {
    if (!search.trim()) return values
    const query = search.trim().toLowerCase()
    return values.filter((value) => value.toLowerCase().includes(query))
  }, [values, search])

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      return false
    }
  }

  const handleCopyAll = async () => {
    const ok = await copyText(values.join('\n'))
    if (ok) {
      setCopiedAll(true)
      window.setTimeout(() => setCopiedAll(false), 1400)
    }
  }

  const handleCopyLine = async (value: string) => {
    const ok = await copyText(value)
    if (ok) {
      setCopiedValue(value)
      window.setTimeout(() => setCopiedValue(null), 1100)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ pb: 1.5 }}>
        <Stack
          direction="row"
          sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '1.0625rem' }}>
              {title}
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              sx={{ mt: 0.75, alignItems: 'center', flexWrap: 'wrap' }}
            >
              {isCalculating ? (
                <Skeleton variant="rounded" width={120} height={22} />
              ) : (
                <>
                  <Chip
                    label={prefix}
                    size="small"
                    sx={{
                      fontFamily:
                        'ui-monospace, SFMono-Regular, Menlo, monospace',
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      height: 22,
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {startSerial} → {endSerial}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ·
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {values.length.toLocaleString('en-IN')}{' '}
                    {values.length === 1 ? 'entry' : 'entries'}
                  </Typography>
                </>
              )}
            </Stack>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ mt: -0.5 }}>
            <X size={18} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 0 }}>
        {isCalculating && (
          <>
            <Box sx={{ p: 2, pb: 1.25 }}>
              <Skeleton variant="rounded" height={40} />
            </Box>
            <Box
              sx={{
                mx: 2,
                mb: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              {Array.from({ length: SKELETON_ROW_COUNT }).map((_, index) => (
                <Stack
                  key={index}
                  direction="row"
                  sx={{
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 1.5,
                    py: 0.75,
                    backgroundColor:
                      index % 2 === 0 ? 'transparent' : 'action.hover',
                  }}
                >
                  <Skeleton
                    variant="text"
                    width={`${55 + ((index * 7) % 25)}%`}
                    height={18}
                  />
                  <Skeleton variant="circular" width={20} height={20} />
                </Stack>
              ))}
            </Box>
          </>
        )}

        {!isCalculating && values.length === 0 && (
          <Alert severity="error" sx={{ m: 2 }}>
            Can't build a range — check that the prefix and both serial numbers
            are valid.
          </Alert>
        )}

        {!isCalculating && exceedsCap && (
          <Alert severity="warning" sx={{ m: 2 }}>
            This range has {values.length.toLocaleString('en-IN')} entries, too
            many to list here. Narrow the range to view or copy it.
          </Alert>
        )}

        {!isCalculating && values.length > 0 && !exceedsCap && (
          <>
            <Box sx={{ p: 2, pb: 1.25 }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Filter entries…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search size={16} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>

            <Box
              sx={{
                mx: 2,
                mb: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                overflow: 'hidden',
                backgroundColor: 'background.default',
              }}
            >
              <Box
                sx={{
                  maxHeight: 380,
                  overflowY: 'auto',
                }}
              >
                {filteredValues.length === 0 ? (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No entries match "{search}"
                    </Typography>
                  </Box>
                ) : (
                  filteredValues.map((value, index) => {
                    const isCopied = copiedValue === value
                    return (
                      <Stack
                        key={value}
                        direction="row"
                        sx={{
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          px: 1.5,
                          py: 0.625,
                          backgroundColor:
                            index % 2 === 0 ? 'transparent' : 'action.hover',
                          '&:hover .row-copy-btn': { opacity: 1 },
                          '&:hover': { backgroundColor: 'action.selected' },
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily:
                              'ui-monospace, SFMono-Regular, Menlo, monospace',
                            fontSize: '0.75rem',
                            color: 'text.primary',
                            userSelect: 'text',
                          }}
                        >
                          {value}
                        </Typography>
                        <Tooltip title={isCopied ? 'Copied!' : 'Copy'}>
                          <IconButton
                            size="small"
                            onClick={() => handleCopyLine(value)}
                            className="row-copy-btn"
                            sx={{
                              opacity: isCopied ? 1 : 0,
                              transition: 'opacity 120ms ease',
                              color: isCopied
                                ? 'success.main'
                                : 'text.secondary',
                            }}
                          >
                            {isCopied ? (
                              <Check size={14} />
                            ) : (
                              <Copy size={14} />
                            )}
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    )
                  })
                )}
              </Box>
            </Box>
          </>
        )}
      </DialogContent>

      <Divider />
      <DialogActions sx={{ px: 2.5, py: 1.5 }}>
        <Stack
          direction="row"
          sx={{
            width: '100%',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {isCalculating ? (
              <Skeleton variant="text" width={110} />
            ) : values.length > 0 && !exceedsCap ? (
              `Showing ${filteredValues.length.toLocaleString('en-IN')} of ${values.length.toLocaleString('en-IN')}`
            ) : (
              ' '
            )}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button onClick={onClose} variant="contained">
              Close
            </Button>
          </Stack>
        </Stack>
      </DialogActions>
    </Dialog>
  )
}
