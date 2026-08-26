import { useState } from 'react'
import { skipToken } from '@reduxjs/toolkit/query/react'
import {
  Chip,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Box,
} from '@mui/material'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { Plus } from 'lucide-react'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useGetPartnerScanHistoryQuery } from '@/features/userManagement/services/partnerActivityApi'
import type { PartnerScanHistoryRow } from '@/features/userManagement/services/partnerActivityApi'
import { useAppDispatch } from '@/app/store/hooks'
import { baseApi } from '@/store/api/baseApi'
import { useToast } from '@/contexts/ToastContext'
import { apiClient } from '@/services/apiClient'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import { useDealerDetail } from '@/features/userManagement/hooks/useDealerDetail'
import { useChemistDetail } from '@/features/userManagement/hooks/useChemistDetail'

const resultColor: Record<string, 'success' | 'warning' | 'error' | 'default'> =
  {
    SUCCESS: 'success',
    DUPLICATE: 'warning',
    FAILED: 'error',
  }

const columns: CommonTableColumn<PartnerScanHistoryRow>[] = [
  {
    key: 'scannedAt',
    header: 'Scan Date',
    sortable: true,
    render: (row) => new Date(row.scannedAt).toLocaleString('en-IN'),
  },
  {
    key: 'scannedCode',
    header: 'Scan Code',
    render: (row) => row.scannedCode,
  },
  {
    key: 'productCode',
    header: 'Product Code',
    render: (row) => row.productCode,
  },
  {
    key: 'rewardPointsEarned',
    header: 'Reward Points',
    align: 'center',
    sortable: true,
    render: (row) => (
      <Typography
        component="span"
        sx={{ fontWeight: 700, fontSize: 'inherit', color: 'success.main' }}
      >
        +{row.rewardPointsEarned.toLocaleString('en-IN')}
      </Typography>
    ),
  },
  {
    key: 'scanResult',
    header: 'Scan Result',
    render: (row) => (
      <Chip
        label={row.scanResult}
        size="small"
        color={resultColor[row.scanResult] ?? 'default'}
      />
    ),
  },
]

export function ScanHistoryCard({
  partnerId,
}: {
  partnerId: string | undefined
}) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const [sortBy, setSortBy] = useState('scannedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [businessFocused, setBusinessFocused] = useState(false)

  const result = useGetPartnerScanHistoryQuery(
    partnerId
      ? {
          partnerId,
          page: page + 1,
          limit: rowsPerPage,
          search: debouncedSearch || undefined,
          sortBy,
          sortOrder,
        }
      : skipToken,
  )

  const { data, isFetching, refetch } = result
  const toast = useToast()
  const dispatch = useAppDispatch()

  // determine user type and load partner details for businesses
  const userType = window.location.pathname.toLowerCase().includes('/chemists')
    ? 'chemist'
    : 'dealer'
  const dealerDetail = useDealerDetail(
    userType === 'dealer' ? partnerId : undefined,
  )
  const chemistDetail = useChemistDetail(
    userType === 'chemist' ? partnerId : undefined,
  )
  const businesses =
    (userType === 'dealer'
      ? dealerDetail.dealer?.businesses
      : chemistDetail.chemist?.businesses) ?? []

  const partnerName =
    (userType === 'dealer'
      ? dealerDetail.dealer?.shopName
      : chemistDetail.chemist?.shopName) ?? ''

  const [manualOpen, setManualOpen] = useState(false)
  // start with empty code — user will enter it manually
  const [code, setCode] = useState('')
  // don't preselect business; let user choose
  const [selectedBusiness, setSelectedBusiness] = useState<string | undefined>(
    undefined,
  )
  const [submitting, setSubmitting] = useState(false)

  function openManual() {
    setSelectedBusiness(undefined)
    setCode('')
    setManualOpen(true)
  }

  async function submitManual() {
    if (!selectedBusiness) {
      toast.error('Please select a business')
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        code: code.trim(),
        partnerId: partnerId,
        userType: userType === 'dealer' ? 'DEALER' : 'CHEMIST',
        businessId: selectedBusiness,
      }
      await apiClient.post('/product-scan/manual', payload)
      toast.success('Scan added manually')
      setManualOpen(false)
      refetch()
      // A manual scan credits reward points, so the partner's Points History
      // (a sibling card subscribed to the Wallets tag) is now stale — invalidate
      // it so it refetches alongside the scan history above.
      if (partnerId) {
        dispatch(
          baseApi.util.invalidateTags([
            { type: 'Wallets', id: `PARTNER_${partnerId}` },
          ]),
        )
      }
    } catch (err) {
      const msg = getApiErrorMessage(err, 'Failed to add scan')
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SectionCard
      title="Scan History"
      action={
        <Button
          variant="contained"
          size="small"
          onClick={openManual}
          disabled={!partnerId}
          startIcon={<Plus size={14} />}
        >
          Add Scan Manually
        </Button>
      }
    >
      <CommonTable
        tableKey="partner-scan-history"
        columns={columns}
        rows={data?.items ?? []}
        getRowId={(row) => row.id}
        loading={isFetching}
        searchPlaceholder="Search scans…"
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(0)
        }}
        onSortChange={(columnKey, dir) => {
          setSortBy(columnKey)
          setSortOrder(dir)
        }}
        defaultSortBy="scannedAt"
        defaultSortDir="desc"
        totalCount={data?.totalItems ?? 0}
        page={page}
        onPageChange={setPage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(next) => {
          setRowsPerPage(next)
          setPage(0)
        }}
        emptyTitle="No scans recorded"
      />
      <Dialog
        open={manualOpen}
        onClose={() => setManualOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add Scan Manually</DialogTitle>


        <DialogContent>
          <Box sx={{ mt: 2, display: 'grid', gap: 2 }}>
            <TextField
              label="Code"
              placeholder="Enter scan code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              fullWidth
              size="small"
              autoFocus
              helperText="Enter the scanned code (manually input)"
            />

            <FormControl fullWidth size="small">
              <InputLabel
                id="business-select-label"
                shrink={businessFocused || Boolean(selectedBusiness)}
              >
                Business
              </InputLabel>
              <Select
                labelId="business-select-label"
                value={selectedBusiness}
                label={businessFocused || selectedBusiness ? 'Business' : ''}
                onFocus={() => setBusinessFocused(true)}
                onBlur={() => setBusinessFocused(false)}
                onChange={(e) => setSelectedBusiness(String(e.target.value))}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected) {
                    return ''
                  }
                  const match = businesses.find(
                    (b) => (b.id ?? b.outletName) === selected,
                  )
                  return match?.outletName ?? String(selected)
                }}
              >
                {businesses.map((b) => (
                  <MenuItem
                    key={b.id ?? b.outletName}
                    value={b.id ?? b.outletName}
                  >
                    {b.outletName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Partner"
              value={partnerName}
              fullWidth
              size="small"
              disabled
            />
            <TextField
              label="User Type"
              value={userType.toUpperCase()}
              fullWidth
              size="small"
              disabled
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setManualOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={submitManual}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} /> : null}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </SectionCard>
  )
}
