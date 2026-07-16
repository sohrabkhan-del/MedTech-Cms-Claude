import { Divider, Stack, Typography } from '@mui/material'
import { Modal } from '@/components/common/Modal/Modal'
import { DetailFieldGrid } from '@/components/common/DetailFieldGrid/DetailFieldGrid'
import { sectionTitleSx } from '@/components/common/SectionCard/SectionCard'
import type { BoxProduct } from '@/types/factoryUpload'

interface ProductTraceabilityModalProps {
  open: boolean
  onClose: () => void
  product: BoxProduct | null
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Stack spacing={1.5}>
      <Typography sx={sectionTitleSx}>{title}</Typography>
      {children}
    </Stack>
  )
}

export function ProductTraceabilityModal({ open, onClose, product }: ProductTraceabilityModalProps) {
  if (!product) return null

  return (
    <Modal open={open} onClose={onClose} title={`Product ${product.serialNumber}`} description={product.barcodeNumber} maxWidth="md">
      <Stack spacing={3} sx={{ py: 1 }}>
        <Group title="Identity">
          <DetailFieldGrid
            fields={[
              { label: 'Serial No', value: product.serialNumber },
              { label: 'Barcode', value: product.barcodeNumber },
            ]}
          />
        </Group>

        <Divider />

        <Group title="Dealer Allocation">
          <DetailFieldGrid
            fields={[
              { label: 'Allocated Dealer', value: product.allocatedDealer },
              { label: 'Dealer Allocation Date', value: product.dealerAllocationDate },
              { label: 'Dealer Code', value: product.dealerCode },
              { label: 'Allocation Status', value: product.dealerAllocationStatus === 'allocated' ? 'Allocated' : 'Pending' },
            ]}
          />
        </Group>

        <Divider />

        <Group title="Chemist Allocation">
          <DetailFieldGrid
            fields={[
              { label: 'Allocated Chemist', value: product.allocatedChemist },
              { label: 'Chemist Allocation Date', value: product.chemistAllocationDate },
              { label: 'Chemist Code', value: product.chemistCode },
              { label: 'Current Holder', value: product.currentHolder },
            ]}
          />
        </Group>

        <Divider />

        <Group title="Status & Activity">
          <DetailFieldGrid
            fields={[
              { label: 'Current Status', value: product.currentStatus },
              { label: 'Scan Status', value: product.scanStatus.replace('_', ' ') },
              { label: 'Reward Points', value: product.rewardPoints },
              { label: 'Last Scan Date', value: product.lastScanDate },
            ]}
          />
        </Group>

        <Divider />

        <Group title="Scan Information">
          <DetailFieldGrid
            fields={[
              { label: 'Scan Date', value: product.scanDate },
              { label: 'Scan Time', value: product.scanTime },
              { label: 'Scan By', value: product.scanBy },
              { label: 'Scan Location', value: product.scanLocation },
              { label: 'Geo-fence Status', value: product.geoFenceStatus },
              { label: 'Scan Result', value: product.scanResult },
              { label: 'Reward Points Earned', value: product.rewardPointsEarned },
            ]}
          />
        </Group>

        <Divider />

        <Group title="Reward Information">
          <DetailFieldGrid
            fields={[
              { label: 'Dealer Reward Points', value: product.dealerRewardPoints },
              { label: 'Chemist Reward Points', value: product.chemistRewardPoints },
              { label: 'Reward Scheme', value: product.rewardScheme },
              { label: 'Wallet Transaction ID', value: product.walletTransactionId },
              { label: 'Redemption Status', value: product.redemptionStatus },
            ]}
          />
        </Group>
      </Stack>
    </Modal>
  )
}
