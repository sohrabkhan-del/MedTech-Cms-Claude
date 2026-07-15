import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar, Checkbox, Chip, FormControlLabel, Grid, Stack, Typography } from '@mui/material'
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy'
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined'
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined'
import ShoppingBasketOutlinedIcon from '@mui/icons-material/ShoppingBasketOutlined'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { FilterDrawer } from '@/components/common/FilterDrawer/FilterDrawer'
import { useRegionFilter } from '@/contexts/RegionFilterContext'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import { mockChemists, chemistKpis } from '@/features/chemists/mockChemists'
import type { Chemist } from '@/types/chemist'
import type { PartnerZone, PartnerStatus } from '@/types/partner'

interface ChemistFilters extends Record<string, unknown> {
  zones: PartnerZone[]
  statuses: PartnerStatus[]
}

const ALL_ZONES: PartnerZone[] = ['North', 'South', 'East', 'West']
const ALL_STATUSES: PartnerStatus[] = ['active', 'pending', 'inactive']

export function ChemistListPage() {
  const navigate = useNavigate()
  const { region } = useRegionFilter()
  useRegionTopbarHeader({
    icon: <LocalPharmacyIcon fontSize="small" />,
    title: 'Chemists',
    subtitle: 'Registered chemist partners with geo-tagged shops.',
  })
  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState<ChemistFilters>({ zones: [], statuses: [] })

  const regionZone = region === 'All India' ? null : (region as PartnerZone)

  const filteredChemists = mockChemists.filter((chemist) => {
    const regionMatch = !regionZone || chemist.zone === regionZone
    const zoneMatch = appliedFilters.zones.length === 0 || appliedFilters.zones.includes(chemist.zone)
    const statusMatch = appliedFilters.statuses.length === 0 || appliedFilters.statuses.includes(chemist.status)
    return regionMatch && zoneMatch && statusMatch
  })

  const columns: CommonTableColumn<Chemist>[] = [
    {
      key: 'shopName',
      header: 'Chemist Shop Name',
      sortable: true,
      sortValue: (row) => row.shopName,
      render: (row) => (
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.75rem', fontWeight: 700 }}>
            {row.shopName.slice(0, 1)}
          </Avatar>
          <Typography
            sx={{ fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            onClick={() => navigate(`/partners/chemists/${row.id}`)}
          >
            {row.shopName}
          </Typography>
        </Stack>
      ),
    },
    { key: 'ownerName', header: 'Owner Name', sortable: true, render: (row) => row.ownerName },
    { key: 'email', header: 'Email Address', sortable: true, render: (row) => row.email },
    { key: 'phone', header: 'Phone Number', minWidth: 160, render: (row) => row.phone },
    { key: 'city', header: 'Location (City)', sortable: true, render: (row) => row.city },
    { key: 'zone', header: 'Zone', sortable: true, render: (row) => row.zone },
    { key: 'status', header: 'Status', sortable: true, sortValue: (row) => row.status, render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'geoLock',
      header: 'Geo-lock Status',
      sortable: true,
      sortValue: (row) => (row.geoLock.active ? 1 : 0),
      render: (row) => (
        <Chip
          label={row.geoLock.active ? 'Locked' : 'Unlocked'}
          size="small"
          color={row.geoLock.active ? 'success' : 'warning'}
          variant="filled"
        />
      ),
    },
    { key: 'licenseNumber', header: 'License Number', render: (row) => row.licenseNumber },
    { key: 'onboardedBy', header: 'Onboarded', sortable: true, render: (row) => row.onboardedBy },
    {
      key: 'availableCoins',
      header: 'Available Coins',
      align: 'right',
      sortable: true,
      sortValue: (row) => row.availableCoins,
      render: (row) => row.availableCoins.toLocaleString('en-IN'),
    },
  ]

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Chemist Network"
            value={chemistKpis.chemistNetwork}
            icon={<LocalPharmacyIcon fontSize="small" />}
            iconColor="primary"
            trend={{ direction: 'up', value: '+4.2%', caption: 'vs last period' }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Stock Refill"
            value={chemistKpis.stockRefill}
            icon={<InventoryOutlinedIcon fontSize="small" />}
            iconColor="secondary"
            trend={{ direction: 'up', value: '+1.8%', caption: 'vs last period' }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Pending Outreach"
            value={chemistKpis.pendingOutreach}
            icon={<CampaignOutlinedIcon fontSize="small" />}
            iconColor="warning"
            trend={{ direction: 'down', value: '-2.1%', caption: 'vs last period' }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Average Basket"
            value={`₹${chemistKpis.averageBasket.toLocaleString('en-IN')}`}
            icon={<ShoppingBasketOutlinedIcon fontSize="small" />}
            iconColor="success"
            trend={{ direction: 'up', value: '+6.5%', caption: 'vs last period' }}
          />
        </Grid>
      </Grid>

      <CommonTable
        tableKey="chemists-list"
        columns={columns}
        rows={filteredChemists}
        getRowId={(row) => row.id}
        searchPlaceholder="Search chemists…"
        searchKeys={(row) => `${row.shopName} ${row.ownerName} ${row.email} ${row.city}`}
        onFilterClick={() => setFilterOpen(true)}
        filterCount={appliedFilters.zones.length + appliedFilters.statuses.length}
        onExportClick={() => {}}
        onImportClick={() => {}}
        createAction={{ label: 'Create Chemist', to: '/partners/chemists/new' }}
        defaultSortBy="shopName"
        actions={[
          { label: 'View Chemist', onClick: (row) => navigate(`/partners/chemists/${row.id}`) },
          { label: 'Edit Chemist', onClick: (row) => navigate(`/partners/chemists/${row.id}/edit`) },
          { label: 'Activate Chemist', onClick: () => {} },
          { label: 'Deactivate Chemist', onClick: () => {}, danger: true },
        ]}
        emptyTitle="No chemists found"
        emptyDescription="Try adjusting your filters or search terms."
      />

      <FilterDrawer<ChemistFilters>
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Chemists"
        value={appliedFilters}
        onApply={setAppliedFilters}
      >
        {(draft, setDraft) => (
          <Stack spacing={3}>
            <Stack spacing={1}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>Zone</Typography>
              {ALL_ZONES.map((zone) => (
                <FormControlLabel
                  key={zone}
                  control={
                    <Checkbox
                      checked={draft.zones.includes(zone)}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          zones: e.target.checked ? [...prev.zones, zone] : prev.zones.filter((z) => z !== zone),
                        }))
                      }
                    />
                  }
                  label={zone}
                />
              ))}
            </Stack>
            <Stack spacing={1}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>Status</Typography>
              {ALL_STATUSES.map((status) => (
                <FormControlLabel
                  key={status}
                  control={
                    <Checkbox
                      checked={draft.statuses.includes(status)}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          statuses: e.target.checked
                            ? [...prev.statuses, status]
                            : prev.statuses.filter((s) => s !== status),
                        }))
                      }
                    />
                  }
                  label={status.charAt(0).toUpperCase() + status.slice(1)}
                />
              ))}
            </Stack>
          </Stack>
        )}
      </FilterDrawer>
    </>
  )
}
