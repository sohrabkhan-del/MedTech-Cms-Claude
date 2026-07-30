import { useMemo } from 'react'
import { Stack } from '@mui/material'
import { ScanTreeTable } from '@/components/common/ScanTreeTable/ScanTreeTable'
import { generateMockScanRows } from '../mockMasterScanData'
import { DemoSection } from '../components/DemoSection'
import { CodeBlock } from '../components/CodeBlock'
import { PropsTable } from '../components/PropsTable'

const usageCode = `import { ScanTreeTable } from '@/components/common/ScanTreeTable/ScanTreeTable'

<ScanTreeTable rows={masterScanRows} />

// Reorder the hierarchy without touching the component:
<ScanTreeTable
  rows={masterScanRows}
  groupBy={['category', 'productName', 'invoiceNo', 'distributor', 'dealer', 'chemist', 'batchId', 'containerId', 'productUid']}
/>`

export function ScanTreeTableDemo() {
  const rows = useMemo(() => generateMockScanRows(6), [])

  return (
    <Stack spacing={4}>
      <DemoSection
        title="Master Scan Table — nested tree"
        description={`Flat, per-unit scan rows (${rows.length.toLocaleString()} in this demo) grouped into Invoice → Distributor → Dealer → Chemist → Category → Product → Batch → Container → Unit. Rows are virtualized, so expanding a branch with thousands of units stays smooth. Try searching a product name, batch, container, or UID — matching branches auto-expand.`}
      >
        <ScanTreeTable rows={rows} maxHeight={560} />
      </DemoSection>

      <DemoSection title="Usage">
        <CodeBlock code={usageCode} />
      </DemoSection>

      <DemoSection title="Props">
        <PropsTable
          rows={[
            { name: 'rows', type: 'ScanRow[]', description: 'Flat per-unit scan rows — wire this to your real data source.' },
            {
              name: 'groupBy',
              type: 'ScanGroupField[]',
              default: 'DEFAULT_SCAN_GROUP_BY',
              description: 'Grouping order, e.g. invoiceNo -> distributor -> ... -> productUid. Reorder to change the hierarchy.',
            },
            { name: 'loading', type: 'boolean', default: 'false' },
            { name: 'maxHeight', type: 'number', default: '640', description: 'Height of the virtualized scroll viewport, in px.' },
            { name: 'emptyTitle', type: 'string' },
            { name: 'emptyDescription', type: 'string' },
          ]}
        />
      </DemoSection>
    </Stack>
  )
}
