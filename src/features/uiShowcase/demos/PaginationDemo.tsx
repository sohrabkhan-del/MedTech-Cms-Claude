import { useState } from 'react'
import { Pagination, Stack } from '@mui/material'
import { DemoSection } from '../components/DemoSection'
import { DemoLabel } from '../components/DemoLabel'
import { CodeBlock } from '../components/CodeBlock'
import { PropsTable } from '../components/PropsTable'

const usageCode = `import { Pagination } from '@mui/material'

<Pagination count={10} page={page} onChange={(e, p) => setPage(p)} color="primary" />`

export function PaginationDemo() {
  const [page, setPage] = useState(1)

  return (
    <Stack spacing={4}>
      <DemoSection title="Default" description="Raw MUI Pagination — used inline within CommonTable/ExpandableTable/TreeTable footers.">
        <Pagination count={10} page={page} onChange={(_, p) => setPage(p)} color="primary" />
      </DemoSection>

      <DemoSection title="Sizes">
        <DemoLabel label="small">
          <Pagination count={5} size="small" />
        </DemoLabel>
        <DemoLabel label="medium (default)">
          <Pagination count={5} size="medium" />
        </DemoLabel>
        <DemoLabel label="large">
          <Pagination count={5} size="large" />
        </DemoLabel>
      </DemoSection>

      <DemoSection title="Variants">
        <DemoLabel label="outlined">
          <Pagination count={5} variant="outlined" />
        </DemoLabel>
        <DemoLabel label="text (default)">
          <Pagination count={5} variant="text" />
        </DemoLabel>
      </DemoSection>

      <DemoSection title="Disabled">
        <Pagination count={5} disabled />
      </DemoSection>

      <DemoSection title="Usage">
        <CodeBlock code={usageCode} />
      </DemoSection>

      <DemoSection title="Props (subset)">
        <PropsTable
          rows={[
            { name: 'count', type: 'number', description: 'Total number of pages.' },
            { name: 'page', type: 'number' },
            { name: 'onChange', type: '(event, page: number) => void' },
            { name: 'size', type: "'small' | 'medium' | 'large'", default: 'medium' },
            { name: 'variant', type: "'text' | 'outlined'", default: 'text' },
            { name: 'color', type: "'primary' | 'secondary' | 'standard'", default: 'standard' },
            { name: 'disabled', type: 'boolean', default: 'false' },
          ]}
        />
      </DemoSection>
    </Stack>
  )
}
