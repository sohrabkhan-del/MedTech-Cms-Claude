import { Button, Stack, Tooltip } from '@mui/material'
import { DemoSection } from '../components/DemoSection'
import { DemoLabel } from '../components/DemoLabel'
import { CodeBlock } from '../components/CodeBlock'
import { PropsTable } from '../components/PropsTable'

const usageCode = `import { Tooltip } from '@mui/material'

<Tooltip title="Scan Activity">
  <Button variant="outlined">Hover me</Button>
</Tooltip>`

export function TooltipDemo() {
  return (
    <Stack spacing={4}>
      <DemoSection title="Placements" description="MUI Tooltip used directly wherever a truncated label or icon-only control needs a hint (e.g. StatCard labels, sidebar rail icons).">
        <DemoLabel label="top">
          <Tooltip title="Scan Activity" placement="top">
            <Button variant="outlined">Top</Button>
          </Tooltip>
        </DemoLabel>
        <DemoLabel label="right">
          <Tooltip title="Scan Activity" placement="right">
            <Button variant="outlined">Right</Button>
          </Tooltip>
        </DemoLabel>
        <DemoLabel label="bottom">
          <Tooltip title="Scan Activity" placement="bottom">
            <Button variant="outlined">Bottom</Button>
          </Tooltip>
        </DemoLabel>
        <DemoLabel label="left">
          <Tooltip title="Scan Activity" placement="left">
            <Button variant="outlined">Left</Button>
          </Tooltip>
        </DemoLabel>
      </DemoSection>

      <DemoSection title="Usage">
        <CodeBlock code={usageCode} />
      </DemoSection>

      <DemoSection title="Props (subset)">
        <PropsTable
          rows={[
            { name: 'title', type: 'ReactNode', description: 'Tooltip content; empty/undefined suppresses it.' },
            { name: 'placement', type: "'top' | 'right' | 'bottom' | 'left' | ...", default: 'bottom' },
            { name: 'children', type: 'ReactElement', description: 'A single focusable/hoverable child element.' },
          ]}
        />
      </DemoSection>
    </Stack>
  )
}
