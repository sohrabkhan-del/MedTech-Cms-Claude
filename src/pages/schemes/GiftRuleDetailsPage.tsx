import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Chip, FormControlLabel, Grid, Stack, Switch, Typography } from '@mui/material'
import {
  ArrowLeft as ArrowBackOutlined,
  Pencil,
  Coins,
  Link2,
  Unlink,
  History,
  Trash2,
} from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { Modal } from '@/components/common/Modal/Modal'
import { getRewardRuleById } from '@/features/schemes/mockGiftRules'
import type { RewardRuleRedemptionEntry } from '@/types/giftRule'
import { Users, Clock3, CheckCheck, Boxes, Gauge } from 'lucide-react'

const redemptionColumns: CommonTableColumn<RewardRuleRedemptionEntry>[] = [
  { key: 'id', header: 'Redemption ID', minWidth: 140, render: (row) => row.id },
  { key: 'userName', header: 'User Name', minWidth: 160, sortable: true, sortValue: (row) => row.userName, render: (row) => row.userName },
  { key: 'userType', header: 'User Type', minWidth: 100, render: (row) => row.userType },
  { key: 'region', header: 'Region', minWidth: 100, render: (row) => row.region },
  { key: 'coinsRedeemed', header: 'Coins Redeemed', align: 'right', sortable: true, sortValue: (row) => row.coinsRedeemed, render: (row) => row.coinsRedeemed.toLocaleString('en-IN') },
  { key: 'redemptionDate', header: 'Redemption Date', minWidth: 140, sortable: true, render: (row) => row.redemptionDate },
  {
    key: 'deliveryStatus',
    header: 'Delivery Status',
    minWidth: 120,
    render: (row) => (
      <Chip
        size="small"
        label={row.deliveryStatus === 'delivered' ? 'Delivered' : row.deliveryStatus === 'pending' ? 'Pending' : 'Cancelled'}
        color={row.deliveryStatus === 'delivered' ? 'success' : row.deliveryStatus === 'pending' ? 'warning' : 'error'}
      />
    ),
  },
  { key: 'schemeName', header: 'Scheme Name', minWidth: 170, render: (row) => row.schemeName },
]

export function GiftRuleDetailsPage() {
  const navigate = useNavigate()
  const { ruleId } = useParams<{ ruleId: string }>()
  const rule = ruleId ? getRewardRuleById(ruleId) : undefined
  const [activeOverride, setActiveOverride] = useState<boolean | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (!rule) {
    return (
      <EmptyState
        title="Reward rule not found"
        description="This reward rule may have been removed."
        actionLabel="Back to Gift Rules"
        onAction={() => navigate('/scheme-management/gift-rules')}
      />
    )
  }

  const isActive = activeOverride ?? rule.active

  const confirmDelete = () => {
    setDeleteOpen(false)
    navigate('/scheme-management/gift-rules')
  }

  return (
    <>
      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'primary.light',
              color: 'primary.main',
              fontSize: '1.25rem',
            }}
          >
            {rule.rewardIcon}
          </Box>
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="h1">{rule.rewardName}</Typography>
              <Chip
                size="small"
                label={rule.availabilityStatus === 'available' ? 'Available' : rule.availabilityStatus === 'expired' ? 'Expired' : 'Unavailable'}
                color={rule.availabilityStatus === 'available' ? 'success' : rule.availabilityStatus === 'expired' ? 'error' : 'default'}
              />
            </Stack>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {rule.id} · {rule.rewardTrack}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControlLabel
            control={<Switch checked={isActive} onChange={(e) => setActiveOverride(e.target.checked)} />}
            label={isActive ? 'Active' : 'Deactivated'}
          />
          <Button variant="outlined" startIcon={<Pencil size={20} />} onClick={() => navigate(`/scheme-management/gift-rules/${rule.id}/edit`)} sx={{ fontSize: '0.75rem' }}>
            Edit Reward
          </Button>
          <Button variant="outlined" startIcon={<Coins size={20} />} onClick={() => {}} sx={{ fontSize: '0.75rem' }}>
            Update Coin Requirement
          </Button>
          {rule.rewardTrack === 'Permanent Catalog' ? (
            <Button variant="outlined" startIcon={<Link2 size={20} />} onClick={() => {}} sx={{ fontSize: '0.75rem' }}>
              Assign to Scheme
            </Button>
          ) : (
            <Button variant="outlined" startIcon={<Unlink size={20} />} onClick={() => {}} sx={{ fontSize: '0.75rem' }}>
              Remove from Scheme
            </Button>
          )}
          <Button variant="outlined" color="error" startIcon={<Trash2 size={20} />} onClick={() => setDeleteOpen(true)} sx={{ fontSize: '0.75rem' }}>
            Delete
          </Button>
          <Button variant="outlined" startIcon={<ArrowBackOutlined size={20} />} onClick={() => navigate('/scheme-management/gift-rules')} sx={{ fontSize: '0.75rem' }}>
            Back
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Summary">
          <DetailFieldGrid
            fields={[
              { label: 'Reward ID', value: rule.id },
              { label: 'Reward Name', value: rule.rewardName },
              { label: 'Reward Type', value: rule.ruleType },
              { label: 'Reward Track', value: rule.rewardTrack },
              { label: 'Coins Required', value: rule.coinsRequired.toLocaleString('en-IN') },
              { label: 'Availability Status', value: rule.availabilityStatus === 'available' ? 'Available' : rule.availabilityStatus === 'expired' ? 'Expired' : 'Unavailable' },
            ]}
          />
        </SectionCard>

        <SectionCard title="Reward Information">
          <DetailFieldGrid
            fields={[
              { label: 'Reward Name', value: rule.rewardName },
              { label: 'Reward Icon', value: rule.rewardIcon },
              { label: 'Reward Type', value: rule.ruleType },
              { label: 'Reward Track', value: rule.rewardTrack },
              { label: 'Coins Required', value: rule.coinsRequired.toLocaleString('en-IN') },
              { label: 'Current Status', value: isActive ? 'Active' : 'Deactivated' },
            ]}
          />
        </SectionCard>

        <SectionCard title="Availability Information">
          <DetailFieldGrid
            fields={[
              { label: 'Availability Type', value: rule.availabilityType },
              { label: 'Active Scheme', value: rule.activeScheme ?? '—' },
              { label: 'Start Date', value: rule.startDate ?? '—' },
              { label: 'End Date', value: rule.endDate ?? '—' },
              { label: 'Expiry Status', value: rule.availabilityStatus === 'expired' ? 'Expired' : 'Not Expired' },
            ]}
          />
        </SectionCard>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard label="Total Redemptions" value={rule.totalRedemptions.toLocaleString('en-IN')} icon={<Users size={20} />} iconColor="primary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard label="Pending Redemptions" value={rule.pendingRedemptions} icon={<Clock3 size={20} />} iconColor="warning" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard label="Successful Deliveries" value={rule.successfulDeliveries.toLocaleString('en-IN')} icon={<CheckCheck size={20} />} iconColor="success" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard label="Remaining Inventory" value={rule.remainingInventory.toLocaleString('en-IN')} icon={<Boxes size={20} />} iconColor="secondary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <StatCard label="Redemption Rate" value={`${rule.redemptionRate}%`} icon={<Gauge size={20} />} iconColor="info" />
          </Grid>
        </Grid>

        <SectionCard title="Eligibility Rules">
          <DetailFieldGrid
            fields={[
              { label: 'Eligible User Types', value: rule.eligibleUserTypes.join(', ') },
              { label: 'Minimum Coin Requirement', value: rule.minimumCoinRequirement.toLocaleString('en-IN') },
              { label: 'Applicable Scheme', value: rule.applicableScheme ?? '—' },
              { label: 'Region Applicability', value: rule.regionApplicability },
              { label: 'Maximum Redemption Limit', value: rule.maximumRedemptionLimit },
            ]}
          />
        </SectionCard>

        <SectionCard title="Redemption History" action={<History size={16} />}>
          <CommonTable
            tableKey="reward-rule-redemption-history"
            columns={redemptionColumns}
            rows={rule.redemptionHistory}
            getRowId={(row) => row.id}
            searchPlaceholder="Search redemption history…"
            searchKeys={(row) => `${row.userName} ${row.schemeName}`}
            defaultSortBy="redemptionDate"
            defaultSortDir="desc"
            emptyTitle="No redemptions yet"
          />
        </SectionCard>
      </Stack>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete Reward"
        description={`Are you sure you want to permanently delete "${rule.rewardName}"? This action cannot be undone.`}
        primaryActionLabel="Delete"
        primaryActionColor="error"
        onPrimaryAction={confirmDelete}
      >
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          {rule.id} · {rule.rewardName}
        </Typography>
      </Modal>
    </>
  )
}
