import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Chip, Grid, MenuItem, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import {
  ListTree as ListTreeIcon,
  Package as PackageIcon,
  Layers,
  ScanLine,
  CircleCheck as CircleCheckIcon,
  Trophy as TrophyIcon,
  Table as TableIcon,
  Network,
  Circle,
} from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { HierarchyTree, type HierarchyTreeNode } from '@/components/common/HierarchyTree/HierarchyTree'
import { BubbleGraph, type BubbleGraphNode } from '@/components/common/BubbleGraph/BubbleGraph'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import {
  mockMasterScanLogs,
  masterScanLogKpis,
  productOptions,
  batchOptions,
  distributorOptions,
  dealerOptions,
  chemistOptions,
} from '@/features/audit/mockMasterScanLogs'
import type { MasterScanLogEntry, ScanStatus, WalletStatus } from '@/types/masterScanLog'

const scanStatusConfig: Record<ScanStatus, { label: string; color: 'success' | 'warning' | 'error' }> = {
  valid: { label: 'Valid', color: 'success' },
  duplicate: { label: 'Duplicate', color: 'warning' },
  invalid: { label: 'Invalid', color: 'error' },
}

const walletStatusConfig: Record<WalletStatus, { label: string; color: 'success' | 'warning' | 'error' }> = {
  credited: { label: 'Credited', color: 'success' },
  pending: { label: 'Pending', color: 'warning' },
  failed: { label: 'Failed', color: 'error' },
}

interface ScanLogFilters extends Record<string, unknown> {
  product: string | 'all'
  batch: string | 'all'
  distributor: string | 'all'
  dealer: string | 'all'
  chemist: string | 'all'
  barcodeNumber: string
  scanStatus: ScanStatus | 'all'
  fromDate: string
  toDate: string
}

export function MasterScanLogListPage() {
  const navigate = useNavigate()
  useRegionTopbarHeader({
    icon: <ListTreeIcon size={20} />,
    title: 'Master Scan Table Logs',
    subtitle: 'End-to-end product traceability across the supply chain — read-only.',
  })
  const [view, setView] = useState<'table' | 'tree' | 'bubble'>('table')
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<ScanLogFilters>({
    product: 'all',
    batch: 'all',
    distributor: 'all',
    dealer: 'all',
    chemist: 'all',
    barcodeNumber: '',
    scanStatus: 'all',
    fromDate: '',
    toDate: '',
  })

  const filteredLogs = useMemo(
    () =>
      mockMasterScanLogs.filter((log) => {
        const productMatch = appliedFilters.product === 'all' || log.productName === appliedFilters.product
        const batchMatch = appliedFilters.batch === 'all' || log.batchNumber === appliedFilters.batch
        const distributorMatch = appliedFilters.distributor === 'all' || log.distributor === appliedFilters.distributor
        const dealerMatch = appliedFilters.dealer === 'all' || log.dealer === appliedFilters.dealer
        const chemistMatch = appliedFilters.chemist === 'all' || log.chemist === appliedFilters.chemist
        const barcodeMatch =
          !appliedFilters.barcodeNumber || log.barcodeNumber.toLowerCase().includes(appliedFilters.barcodeNumber.toLowerCase())
        const statusMatch = appliedFilters.scanStatus === 'all' || log.scanResult === appliedFilters.scanStatus
        return productMatch && batchMatch && distributorMatch && dealerMatch && chemistMatch && barcodeMatch && statusMatch
      }),
    [appliedFilters],
  )

  const filterCount = [
    appliedFilters.product !== 'all',
    appliedFilters.batch !== 'all',
    appliedFilters.distributor !== 'all',
    appliedFilters.dealer !== 'all',
    appliedFilters.chemist !== 'all',
    !!appliedFilters.barcodeNumber,
    appliedFilters.scanStatus !== 'all',
    !!(appliedFilters.fromDate || appliedFilters.toDate),
  ].filter(Boolean).length

  const columns: CommonTableColumn<MasterScanLogEntry>[] = [
    { key: 'productCode', header: 'Product Code', minWidth: 130, render: (row) => row.productCode },
    {
      key: 'productName',
      header: 'Product Name',
      minWidth: 180,
      sortable: true,
      sortValue: (row) => row.productName,
      render: (row) => (
        <Typography
          sx={{ fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
          onClick={() => navigate(`/audit/master-scan-table-logs/${row.id}`)}
        >
          {row.productName}
        </Typography>
      ),
    },
    { key: 'batchNumber', header: 'Batch Number', minWidth: 130, sortable: true, render: (row) => row.batchNumber },
    { key: 'barcodeNumber', header: 'Barcode Number', minWidth: 140, render: (row) => row.barcodeNumber },
    { key: 'distributor', header: 'Distributor', minWidth: 170, sortable: true, render: (row) => row.distributor },
    { key: 'dealer', header: 'Dealer', minWidth: 170, render: (row) => row.dealer ?? '—' },
    { key: 'chemist', header: 'Chemist', minWidth: 170, render: (row) => row.chemist ?? '—' },
    { key: 'scanDateTime', header: 'Scan Date & Time', minWidth: 170, sortable: true, render: (row) => row.scanDateTime },
    {
      key: 'totalRewardPoints',
      header: 'Reward Points',
      align: 'right',
      sortable: true,
      sortValue: (row) => row.totalRewardPoints,
      render: (row) => row.totalRewardPoints.toLocaleString('en-IN'),
    },
    {
      key: 'walletStatus',
      header: 'Wallet Status',
      render: (row) => <Chip size="small" label={walletStatusConfig[row.walletStatus].label} color={walletStatusConfig[row.walletStatus].color} />,
    },
    {
      key: 'scanResult',
      header: 'Scan Status',
      sortable: true,
      sortValue: (row) => row.scanResult,
      render: (row) => <Chip size="small" label={scanStatusConfig[row.scanResult].label} color={scanStatusConfig[row.scanResult].color} />,
    },
  ]

  const treeNodes = useMemo<HierarchyTreeNode[]>(() => {
    const byProduct = new Map<string, MasterScanLogEntry[]>()
    for (const log of filteredLogs) {
      const arr = byProduct.get(log.productName) ?? []
      arr.push(log)
      byProduct.set(log.productName, arr)
    }

    return Array.from(byProduct.entries()).map(([productName, productLogs]) => {
      const byBatch = new Map<string, MasterScanLogEntry[]>()
      for (const log of productLogs) {
        const arr = byBatch.get(log.batchNumber) ?? []
        arr.push(log)
        byBatch.set(log.batchNumber, arr)
      }

      const batchNodes: HierarchyTreeNode[] = Array.from(byBatch.entries()).map(([batchNumber, batchLogs]) => {
        const byDistributor = new Map<string, MasterScanLogEntry[]>()
        for (const log of batchLogs) {
          const arr = byDistributor.get(log.distributor) ?? []
          arr.push(log)
          byDistributor.set(log.distributor, arr)
        }

        const distributorNodes: HierarchyTreeNode[] = Array.from(byDistributor.entries()).map(([distributor, distLogs]) => ({
          id: `${productName}-${batchNumber}-${distributor}`,
          label: distributor,
          sublabel: `${distLogs.length} record(s)`,
          children: distLogs.map((log) => {
            const partnerLabel = log.chemist ?? log.dealer ?? 'Unassigned'
            const partnerType = log.chemist ? 'Chemist' : log.dealer ? 'Dealer' : ''
            return {
              id: log.id,
              label: partnerLabel,
              sublabel: partnerType,
              children: [
                {
                  id: `${log.id}-scan`,
                  label: 'Barcode Scan',
                  sublabel: log.scanDateTime,
                  badge: { label: scanStatusConfig[log.scanResult].label, color: scanStatusConfig[log.scanResult].color },
                  onClick: () => navigate(`/audit/master-scan-table-logs/${log.id}`),
                },
                {
                  id: `${log.id}-reward`,
                  label: 'Reward Calculation',
                  sublabel: `${log.totalRewardPoints} pts`,
                  onClick: () => navigate(`/audit/master-scan-table-logs/${log.id}`),
                },
                {
                  id: `${log.id}-wallet`,
                  label: 'Wallet Credit',
                  badge: { label: walletStatusConfig[log.walletStatus].label, color: walletStatusConfig[log.walletStatus].color },
                  onClick: () => navigate(`/audit/master-scan-table-logs/${log.id}`),
                },
              ],
            }
          }),
        }))

        return {
          id: `${productName}-${batchNumber}`,
          label: batchNumber,
          sublabel: `${batchLogs.length} record(s)`,
          children: distributorNodes,
        }
      })

      return {
        id: productName,
        label: productName,
        sublabel: `${productLogs.length} record(s)`,
        children: batchNodes,
      }
    })
  }, [filteredLogs, navigate])

  const bubbleNodes = useMemo<BubbleGraphNode[]>(() => {
    const productCounts = new Map<string, { label: string; count: number }>()
    const batchCounts = new Map<string, { label: string; count: number; productId: string }>()
    const distributorCounts = new Map<string, { label: string; count: number; batchId: string }>()
    const partnerCounts = new Map<string, { label: string; count: number; distributorId: string; onClick: () => void }>()

    for (const log of filteredLogs) {
      const productId = `p-${log.productName}`
      const productEntry = productCounts.get(productId)
      productCounts.set(productId, { label: log.productName, count: (productEntry?.count ?? 0) + 1 })

      const batchId = `b-${log.productName}::${log.batchNumber}`
      const batchEntry = batchCounts.get(batchId)
      batchCounts.set(batchId, { label: log.batchNumber, count: (batchEntry?.count ?? 0) + 1, productId })

      const distributorId = `d-${batchId}::${log.distributor}`
      const distEntry = distributorCounts.get(distributorId)
      distributorCounts.set(distributorId, { label: log.distributor, count: (distEntry?.count ?? 0) + 1, batchId })

      const partnerName = log.chemist ?? log.dealer ?? `Unassigned (${log.id})`
      const partnerId = `x-${distributorId}::${partnerName}`
      const partnerEntry = partnerCounts.get(partnerId)
      partnerCounts.set(partnerId, {
        label: partnerName,
        count: (partnerEntry?.count ?? 0) + 1,
        distributorId,
        onClick: () => navigate(`/audit/master-scan-table-logs/${log.id}`),
      })
    }

    const nodes: BubbleGraphNode[] = []
    for (const [id, entry] of productCounts) {
      nodes.push({ id, label: entry.label, value: entry.count, parentId: null, color: '#1A3E8C' })
    }
    for (const [id, entry] of batchCounts) {
      nodes.push({ id, label: entry.label, value: entry.count, parentId: entry.productId, color: '#F7941D' })
    }
    for (const [id, entry] of distributorCounts) {
      nodes.push({ id, label: entry.label, value: entry.count, parentId: entry.batchId, color: '#1E9E5A' })
    }
    for (const [id, entry] of partnerCounts) {
      nodes.push({ id, label: entry.label, value: entry.count, parentId: entry.distributorId, color: '#8B5CF6', onClick: entry.onClick })
    }

    return nodes
  }, [filteredLogs, navigate])

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard label="Total Products" value={masterScanLogKpis.totalProducts} icon={<PackageIcon size={20} />} iconColor="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard label="Total Batches" value={masterScanLogKpis.totalBatches} icon={<Layers size={20} />} iconColor="secondary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard label="Total Barcode Scans" value={masterScanLogKpis.totalBarcodeScans} icon={<ScanLine size={20} />} iconColor="info" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard label="Successful Scans" value={masterScanLogKpis.successfulScans} icon={<CircleCheckIcon size={20} />} iconColor="success" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            label="Reward Points Issued"
            value={masterScanLogKpis.rewardPointsIssued.toLocaleString('en-IN')}
            icon={<TrophyIcon size={20} />}
            iconColor="warning"
          />
        </Grid>
      </Grid>

      <Stack direction="row" sx={{ justifyContent: 'flex-end', mb: 1.5 }}>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={view}
          onChange={(_, value) => value && setView(value)}
          sx={{ '& .MuiToggleButton-root': { fontSize: '0.75rem', textTransform: 'none', fontWeight: 600, px: 2, height: 34 } }}
        >
          <ToggleButton value="table">
            <TableIcon size={16} style={{ marginRight: 6 }} />
            Table View
          </ToggleButton>
          <ToggleButton value="tree">
            <Network size={16} style={{ marginRight: 6 }} />
            Tree / Hierarchy View
          </ToggleButton>
          <ToggleButton value="bubble">
            <Circle size={16} style={{ marginRight: 6 }} />
            Bubble Map
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {view === 'table' ? (
        <CommonTable
          tableKey="master-scan-logs"
          columns={columns}
          rows={filteredLogs}
          getRowId={(row) => row.id}
          searchPlaceholder="Search by product, batch, or barcode…"
          searchKeys={(row) => `${row.productName} ${row.productCode} ${row.batchNumber} ${row.barcodeNumber}`}
          onFilterClick={() => setFilterOpen(true)}
          filterCount={filterCount}
          onExportClick={() => {}}
          defaultSortBy="scanDateTime"
          defaultSortDir="desc"
          actions={[{ label: 'View', onClick: (row) => navigate(`/audit/master-scan-table-logs/${row.id}`) }]}
          emptyTitle="No scan logs found"
          emptyDescription="Try adjusting your filters or search terms."
        />
      ) : view === 'tree' ? (
        <SectionCard title="Product Journey — Tree / Hierarchy View">
          {treeNodes.length === 0 ? (
            <Typography sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>No records match the applied filters.</Typography>
          ) : (
            <HierarchyTree nodes={treeNodes} defaultExpandedDepth={1} />
          )}
        </SectionCard>
      ) : (
        <SectionCard title="Product Journey — Bubble Map">
          {bubbleNodes.length === 0 ? (
            <Typography sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>No records match the applied filters.</Typography>
          ) : (
            <>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem', mb: 1.5 }}>
                Bubble size reflects record count at each level — Product → Batch → Distributor → Dealer/Chemist. Click an
                outer bubble to open its scan record.
              </Typography>
              <BubbleGraph nodes={bubbleNodes} height={520} />
            </>
          )}
        </SectionCard>
      )}

      <FilterDrawer<ScanLogFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Scan Logs"
        value={appliedFilters}
        onApply={setAppliedFilters}
      >
        {(draft, setDraft) => (
          <Stack spacing={3}>
            <TextField
              select
              label="Product"
              size="small"
              value={draft.product}
              onChange={(e) => setDraft((prev) => ({ ...prev, product: e.target.value }))}
            >
              <MenuItem value="all">All Products</MenuItem>
              {productOptions.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Batch"
              size="small"
              value={draft.batch}
              onChange={(e) => setDraft((prev) => ({ ...prev, batch: e.target.value }))}
            >
              <MenuItem value="all">All Batches</MenuItem>
              {batchOptions.map((b) => (
                <MenuItem key={b} value={b}>
                  {b}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Distributor"
              size="small"
              value={draft.distributor}
              onChange={(e) => setDraft((prev) => ({ ...prev, distributor: e.target.value }))}
            >
              <MenuItem value="all">All Distributors</MenuItem>
              {distributorOptions.map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Dealer"
              size="small"
              value={draft.dealer}
              onChange={(e) => setDraft((prev) => ({ ...prev, dealer: e.target.value }))}
            >
              <MenuItem value="all">All Dealers</MenuItem>
              {dealerOptions.map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Chemist"
              size="small"
              value={draft.chemist}
              onChange={(e) => setDraft((prev) => ({ ...prev, chemist: e.target.value }))}
            >
              <MenuItem value="all">All Chemists</MenuItem>
              {chemistOptions.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Barcode Number"
              size="small"
              placeholder="Search barcode…"
              value={draft.barcodeNumber}
              onChange={(e) => setDraft((prev) => ({ ...prev, barcodeNumber: e.target.value }))}
            />
            <TextField
              select
              label="Scan Status"
              size="small"
              value={draft.scanStatus}
              onChange={(e) => setDraft((prev) => ({ ...prev, scanStatus: e.target.value as ScanLogFilters['scanStatus'] }))}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="valid">Valid</MenuItem>
              <MenuItem value="duplicate">Duplicate</MenuItem>
              <MenuItem value="invalid">Invalid</MenuItem>
            </TextField>
            <TextField
              type="date"
              label="Scan Date From"
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              value={draft.fromDate}
              onChange={(e) => setDraft((prev) => ({ ...prev, fromDate: e.target.value }))}
            />
            <TextField
              type="date"
              label="Scan Date To"
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              value={draft.toDate}
              onChange={(e) => setDraft((prev) => ({ ...prev, toDate: e.target.value }))}
            />
          </Stack>
        )}
      </FilterDrawer>
    </>
  )
}
