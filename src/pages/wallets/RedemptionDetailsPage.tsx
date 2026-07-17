import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Chip, Grid, IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material'
import {
  Redo2,
  ArrowLeft as ArrowBackOutlined,
  CircleCheck,
  XCircle,
  PackageCheck,
  Truck,
  Home,
  Ban,
  ExternalLink,
  Wallet as WalletIcon,
  MoreVertical,
  ChevronDown,
} from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { ActivityTimeline } from '@/components/common/ActivityTimeline/ActivityTimeline'
import { CommonTable, type CommonTableColumn } from '@/components/common/CommonTable/CommonTable'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { getRedemptionRequestById } from '@/features/wallets/mockRedemptions'
import type { RedemptionDeliveryStatus, RedemptionHistoryEntry, RedemptionStatus } from '@/types/redemption'

const statusConfig: Record<RedemptionStatus, { label: string; color: 'warning' | 'info' | 'error' | 'success' }> = {
  pending: { label: 'Pending', color: 'warning' },
  approved: { label: 'Approved', color: 'info' },
  rejected: { label: 'Rejected', color: 'error' },
  completed: { label: 'Completed', color: 'success' },
}

const deliveryStatusConfig: Record<RedemptionDeliveryStatus, { label: string; color: 'default' | 'info' | 'warning' | 'success' | 'error' }> = {
  pending: { label: 'Pending', color: 'default' },
  packed: { label: 'Packed', color: 'info' },
  shipped: { label: 'Shipped', color: 'info' },
  delivered: { label: 'Delivered', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'error' },
}

const historyColumns: CommonTableColumn<RedemptionHistoryEntry>[] = [
  { key: 'id', header: 'Request ID', minWidth: 140, render: (row) => row.id },
  { key: 'rewardItem', header: 'Reward Item', minWidth: 170, render: (row) => row.rewardItem },
  { key: 'coinsUsed', header: 'Coins Used', align: 'right', render: (row) => row.coinsUsed.toLocaleString('en-IN') },
  { key: 'requestDate', header: 'Request Date', minWidth: 130, sortable: true, render: (row) => row.requestDate },
  { key: 'approvalDate', header: 'Approval Date', minWidth: 130, render: (row) => row.approvalDate ?? '—' },
  { key: 'deliveryDate', header: 'Delivery Date', minWidth: 130, render: (row) => row.deliveryDate ?? '—' },
  { key: 'status', header: 'Status', minWidth: 110, render: (row) => <Chip size="small" label={statusConfig[row.status].label} color={statusConfig[row.status].color} /> },
  { key: 'approvedBy', header: 'Approved By', minWidth: 130, render: (row) => row.approvedBy ?? '—' },
]

export function RedemptionDetailsPage() {
  const navigate = useNavigate()
  const { requestId } = useParams<{ requestId: string }>()
  const request = requestId ? getRedemptionRequestById(requestId) : undefined
  const [statusOverride, setStatusOverride] = useState<RedemptionStatus | null>(null)
  const [deliveryOverride, setDeliveryOverride] = useState<RedemptionDeliveryStatus | null>(null)
  const [deliveryMenuAnchor, setDeliveryMenuAnchor] = useState<HTMLElement | null>(null)
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<HTMLElement | null>(null)

  if (!request) {
    return (
      <EmptyState
        title="Redemption request not found"
        description="This redemption request may have been removed."
        actionLabel="Back to Redemption Requests"
        onAction={() => navigate('/rewards-wallet/reward-redemptions')}
      />
    )
  }

  const currentStatus = statusOverride ?? request.redemptionStatus
  const currentDelivery = deliveryOverride ?? request.deliveryStatus

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
            }}
          >
            <Redo2 size={18} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Typography variant="h1">{request.rewardItem}</Typography>
              <Chip size="small" label={statusConfig[currentStatus].label} color={statusConfig[currentStatus].color} />
            </Stack>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {request.id} · {request.userName}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          {currentStatus === 'pending' && (
            <>
              <Button variant="contained" color="success" startIcon={<CircleCheck size={18} />} onClick={() => setStatusOverride('approved')} sx={{ fontSize: '0.8125rem' }}>
                Approve
              </Button>
              <Button variant="contained" color="error" startIcon={<XCircle size={18} />} onClick={() => setStatusOverride('rejected')} sx={{ fontSize: '0.8125rem' }}>
                Reject
              </Button>
            </>
          )}
          <Button
            variant="outlined"
            endIcon={<ChevronDown size={16} />}
            onClick={(e) => setDeliveryMenuAnchor(e.currentTarget)}
            sx={{ fontSize: '0.8125rem' }}
          >
            Delivery Status
          </Button>
          <Menu anchorEl={deliveryMenuAnchor} open={!!deliveryMenuAnchor} onClose={() => setDeliveryMenuAnchor(null)}>
            <MenuItem
              onClick={() => {
                setDeliveryOverride('packed')
                setDeliveryMenuAnchor(null)
              }}
            >
              <PackageCheck size={18} style={{ marginRight: 12 }} />
              Mark as Packed
            </MenuItem>
            <MenuItem
              onClick={() => {
                setDeliveryOverride('shipped')
                setDeliveryMenuAnchor(null)
              }}
            >
              <Truck size={18} style={{ marginRight: 12 }} />
              Mark as Shipped
            </MenuItem>
            <MenuItem
              onClick={() => {
                setDeliveryOverride('delivered')
                setStatusOverride('completed')
                setDeliveryMenuAnchor(null)
              }}
            >
              <Home size={18} style={{ marginRight: 12 }} />
              Mark as Delivered
            </MenuItem>
            <MenuItem
              onClick={() => {
                setDeliveryOverride('cancelled')
                setDeliveryMenuAnchor(null)
              }}
              sx={{ color: 'error.main' }}
            >
              <Ban size={18} style={{ marginRight: 12 }} />
              Cancel
            </MenuItem>
          </Menu>
          <Button variant="outlined" startIcon={<ArrowBackOutlined size={18} />} onClick={() => navigate('/rewards-wallet/reward-redemptions')} sx={{ fontSize: '0.8125rem' }}>
            Back
          </Button>
          <IconButton onClick={(e) => setMoreMenuAnchor(e.currentTarget)} sx={{ border: '1px solid', borderColor: 'divider' }} aria-label="More actions">
            <MoreVertical size={18} />
          </IconButton>
          <Menu anchorEl={moreMenuAnchor} open={!!moreMenuAnchor} onClose={() => setMoreMenuAnchor(null)}>
            <MenuItem
              onClick={() => {
                setMoreMenuAnchor(null)
                navigate('/rewards-wallet/wallet-management')
              }}
            >
              <WalletIcon size={18} style={{ marginRight: 12 }} />
              View Wallet
            </MenuItem>
            <MenuItem
              onClick={() => {
                setMoreMenuAnchor(null)
                navigate(request.userType === 'Dealer' ? `/partners/dealers/${request.userId}` : `/partners/chemists/${request.userId}`)
              }}
            >
              <ExternalLink size={18} style={{ marginRight: 12 }} />
              View {request.userType} Profile
            </MenuItem>
          </Menu>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Summary">
          <DetailFieldGrid
            fields={[
              { label: 'Request ID', value: request.id },
              { label: 'User Name', value: request.userName },
              { label: 'User Type', value: request.userType },
              { label: 'Mobile Number', value: request.mobileNumber },
              { label: 'Reward Item', value: request.rewardItem },
              { label: 'Reward Category', value: request.rewardCategory },
              { label: 'Coins Used', value: request.coinsUsed.toLocaleString('en-IN') },
              { label: 'Current Wallet Balance', value: request.currentWalletBalance.toLocaleString('en-IN') },
              { label: 'Request Date', value: request.requestDate },
              { label: 'Redemption Status', value: <Chip size="small" label={statusConfig[currentStatus].label} color={statusConfig[currentStatus].color} /> },
            ]}
          />
        </SectionCard>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Coins Redeemed" value={request.coinsUsed.toLocaleString('en-IN')} icon={<Redo2 size={20} />} iconColor="primary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Wallet Balance After Redemption" value={request.walletBalanceAfterRedemption.toLocaleString('en-IN')} icon={<WalletIcon size={20} />} iconColor="secondary" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Approval Status" value={statusConfig[currentStatus].label} icon={<CircleCheck size={20} />} iconColor={currentStatus === 'rejected' ? 'error' : 'success'} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard label="Delivery Status" value={deliveryStatusConfig[currentDelivery].label} icon={<Truck size={20} />} iconColor="warning" />
          </Grid>
        </Grid>

        <SectionCard title="Redemption Information">
          <DetailFieldGrid
            fields={[
              { label: 'Reward Item Name', value: request.rewardItem },
              { label: 'Reward Category', value: request.rewardCategory },
              { label: 'Quantity', value: request.quantity },
              { label: 'Coins Redeemed', value: request.coinsUsed.toLocaleString('en-IN') },
              { label: 'Current Wallet Balance', value: request.currentWalletBalance.toLocaleString('en-IN') },
              { label: 'Wallet Balance After Redemption', value: request.walletBalanceAfterRedemption.toLocaleString('en-IN') },
              { label: 'Redemption Date', value: request.requestDate },
              { label: 'Expected Delivery Date', value: request.expectedDeliveryDate },
            ]}
          />
        </SectionCard>

        <SectionCard title="User Information">
          <DetailFieldGrid
            fields={[
              { label: 'User Name', value: request.userName },
              { label: 'User Type', value: request.userType },
              { label: 'Mobile Number', value: request.mobileNumber },
              { label: 'Email Address', value: request.email },
              { label: 'Region', value: request.region },
              { label: 'Dealer / Chemist Name', value: request.userName },
              { label: 'Registration Date', value: request.registrationDate },
            ]}
          />
        </SectionCard>

        <SectionCard title="Wallet Transaction Details">
          <DetailFieldGrid
            fields={[
              { label: 'Transaction ID', value: request.transactionId },
              { label: 'Previous Wallet Balance', value: request.currentWalletBalance.toLocaleString('en-IN') },
              { label: 'Coins Redeemed', value: request.coinsUsed.toLocaleString('en-IN') },
              { label: 'Remaining Balance', value: request.walletBalanceAfterRedemption.toLocaleString('en-IN') },
              { label: 'Transaction Date', value: request.transactionDate },
              { label: 'Transaction Status', value: request.transactionStatus.charAt(0).toUpperCase() + request.transactionStatus.slice(1) },
            ]}
          />
        </SectionCard>

        <SectionCard title="Redemption Timeline">
          <ActivityTimeline entries={request.timeline} emptyTitle="No timeline activity yet" />
        </SectionCard>

        <SectionCard title="Redemption History">
          <CommonTable
            tableKey="redemption-request-history"
            columns={historyColumns}
            rows={request.history}
            getRowId={(row) => row.id}
            searchPlaceholder="Search redemption history…"
            searchKeys={(row) => `${row.rewardItem} ${row.id}`}
            defaultSortBy="requestDate"
            defaultSortDir="desc"
            emptyTitle="No prior redemptions"
          />
        </SectionCard>

        <SectionCard title="Internal Notes">
          <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary', lineHeight: 1.6 }}>{request.internalNotes}</Typography>
        </SectionCard>
      </Stack>
    </>
  )
}
