import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Chip,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import {
  Sparkles,
  Award,
  CalendarRange,
  Layers,
  Flame,
  Plus,
  Search,
} from 'lucide-react'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import {
  CommonTable,
  type CommonTableColumn,
} from '@/components/common/CommonTable/CommonTable'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import { useGiftRules } from '@/features/schemeManagement/hooks/useGiftRules'
import { useGiftRuleFormOptions } from '@/features/schemeManagement/hooks/useGiftRuleFormOptions'
import type { RewardRule, RuleType } from '@/features/schemeManagement/types/schemeManagement.types'

export function GiftRulesListPage() {
  const navigate = useNavigate()
  useRegionTopbarHeader({
    icon: <Sparkles size={20} />,
    title: 'Gifting Rules Engine',
    subtitle:
      'Manage permanent catalog rewards and limited-time scheme rewards.',
  })
  const { permanentCatalogRewards, schemeTrackRewards, dashboard } = useGiftRules()
  const { ruleTypeOptions } = useGiftRuleFormOptions()
  const [search, setSearch] = useState('')
  const [ruleType, setRuleType] = useState<RuleType | 'all'>('all')

  const giftRulesDashboard = dashboard ?? {
    permanentCatalogRewards: 0,
    activeSchemeRewards: 0,
    currentActiveScheme: '—',
    standardTrackRewards: 0,
    highOutgoSchemeRewards: 0,
  }

  const matchesFilters = (rule: RewardRule) => {
    const searchMatch = !search || rule.rewardName.toLowerCase().includes(search.toLowerCase())
    const typeMatch = ruleType === 'all' || rule.ruleType === ruleType
    return searchMatch && typeMatch
  }

  const filteredPermanent = permanentCatalogRewards.filter(matchesFilters)
  const filteredScheme = schemeTrackRewards.filter(matchesFilters)

  const handleView = (rule: RewardRule) =>
    navigate(`/scheme-management/gift-rules/${rule.id}`)
  const handleEdit = (rule: RewardRule) =>
    navigate(`/scheme-management/gift-rules/${rule.id}/edit`)

  const columns: CommonTableColumn<RewardRule>[] = [
    {
      key: 'rewardName',
      header: 'Reward Name',
      minWidth: 240,
      sortable: true,
      sortValue: (row) => row.rewardName,
      render: (row) => (
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
          {row.rewardImages && row.rewardImages.length > 0 ? (
            <AvatarGroup
              max={3}
              sx={{
                '& .MuiAvatar-root': {
                  width: 28,
                  height: 28,
                  fontSize: '0.75rem',
                  border: '2px solid',
                  borderColor: 'background.paper',
                },
              }}
            >
              {row.rewardImages.map((img, idx) => (
                <Avatar
                  key={idx}
                  src={img}
                  variant="rounded"
                  alt={`${row.rewardName} ${idx + 1}`}
                />
              ))}
            </AvatarGroup>
          ) : null}
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
            onClick={() => handleView(row)}
          >
            {row.rewardName}
          </Typography>
        </Stack>
      ),
    },
    {
      key: 'rewardTrack',
      header: 'Reward Track',
      minWidth: 150,
      render: (row) => row.rewardTrack,
    },
    {
      key: 'ruleType',
      header: 'Reward Type',
      minWidth: 180,
      render: (row) => row.ruleType,
    },
    {
      key: 'coinsRequired',
      header: 'Coins Required',
      align: 'right',
      sortable: true,
      sortValue: (row) => row.coinsRequired,
      render: (row) => row.coinsRequired.toLocaleString('en-IN'),
    },
    {
      key: 'availabilityStatus',
      header: 'Availability Status',
      minWidth: 140,
      render: (row) => (
        <Chip
          size="small"
          label={
            row.availabilityStatus === 'available'
              ? 'Available'
              : row.availabilityStatus === 'expired'
                ? 'Expired'
                : 'Unavailable'
          }
          color={
            row.availabilityStatus === 'available'
              ? 'success'
              : row.availabilityStatus === 'expired'
                ? 'error'
                : 'default'
          }
        />
      ),
    },
  ]

  return (
    <>
      <Stack
        direction="row"
        sx={{
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ flexGrow: 1, maxWidth: 420 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search rewards…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <Search size={16} style={{ marginRight: 8, opacity: 0.6 }} />
                ),
              },
            }}
          />
        </Box>
        <Stack direction="row" spacing={1.5}>
          <TextField
            select
            size="small"
            label="Rule Type"
            value={ruleType}
            onChange={(e) => setRuleType(e.target.value as RuleType | 'all')}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="all">All Types</MenuItem>
            {ruleTypeOptions.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
          <Button variant="outlined" onClick={() => {}}>
            Export Catalog
          </Button>
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => navigate('/scheme-management/gift-rules/new')}
          >
            Create Reward Rule
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            label="Permanent Catalog Rewards"
            value={giftRulesDashboard.permanentCatalogRewards}
            icon={<Award size={20} />}
            iconColor="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            label="Active Scheme Rewards"
            value={giftRulesDashboard.activeSchemeRewards}
            icon={<Sparkles size={20} />}
            iconColor="secondary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            label="Current Active Scheme"
            value={giftRulesDashboard.currentActiveScheme}
            icon={<CalendarRange size={20} />}
            iconColor="info"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            label="Standard Track Rewards"
            value={giftRulesDashboard.standardTrackRewards}
            icon={<Layers size={20} />}
            iconColor="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <StatCard
            label="High-Outgo Scheme Rewards"
            value={giftRulesDashboard.highOutgoSchemeRewards}
            icon={<Flame size={20} />}
            iconColor="warning"
          />
        </Grid>
      </Grid>

      <Stack spacing={3}>
        <SectionCard title="Permanent Catalog">
          <CommonTable
            tableKey="gift-rules-permanent-catalog"
            columns={columns}
            rows={filteredPermanent}
            getRowId={(row) => row.id}
            searchKeys={(row) => `${row.rewardName} ${row.ruleType}`}
            defaultSortBy="rewardName"
            actions={[
              { label: 'View', onClick: (row) => handleView(row) },
              { label: 'Edit', onClick: (row) => handleEdit(row) },
              { label: 'Delete', onClick: () => {}, danger: true },
            ]}
            emptyTitle="No permanent catalog rewards found"
            emptyDescription="Try adjusting your search or filters."
          />
        </SectionCard>

        <SectionCard
          title={`Current Active Scheme — ${giftRulesDashboard.currentActiveScheme}`}
        >
          <CommonTable
            tableKey="gift-rules-active-scheme"
            columns={columns}
            rows={filteredScheme}
            getRowId={(row) => row.id}
            searchKeys={(row) => `${row.rewardName} ${row.ruleType}`}
            defaultSortBy="rewardName"
            actions={[
              { label: 'View', onClick: (row) => handleView(row) },
              { label: 'Edit', onClick: (row) => handleEdit(row) },
              { label: 'Delete', onClick: () => {}, danger: true },
            ]}
            emptyTitle="No active scheme rewards found"
            emptyDescription="Try adjusting your search or filters."
          />
        </SectionCard>
      </Stack>
    </>
  )
}
