import { Chip, Stack } from '@mui/material'
import { StatusBadge, type BadgeStatus } from '@/components/common/StatusBadge/StatusBadge'
import { DemoSection } from '../components/DemoSection'
import { DemoLabel } from '../components/DemoLabel'
import { CodeBlock } from '../components/CodeBlock'
import { PropsTable } from '../components/PropsTable'

const usageCode = `import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'

<StatusBadge status="active" />
<StatusBadge status="pending" />
<StatusBadge status="rejected" />`

const statuses: BadgeStatus[] = [
  'active',
  'pending',
  'inactive',
  'approved',
  'rejected',
  'expired',
  'upcoming',
]

export function BadgeDemo() {
  return (
    <Stack spacing={4}>
      <DemoSection title="Status variants" description="Each status maps to a fixed label + color (success/warning/error/info).">
        {statuses.map((status) => (
          <DemoLabel key={status} label={status}>
            <StatusBadge status={status} />
          </DemoLabel>
        ))}
      </DemoSection>

      <DemoSection title="Plain Chip (MUI)" description="Raw MUI Chip, used elsewhere for freeform labels (e.g. profile role chip).">
        <DemoLabel label="filled">
          <Chip label="Admin" color="primary" size="small" />
        </DemoLabel>
        <DemoLabel label="outlined">
          <Chip label="Region Manager" color="primary" variant="outlined" size="small" />
        </DemoLabel>
      </DemoSection>

      <DemoSection title="Usage">
        <CodeBlock code={usageCode} />
      </DemoSection>

      <DemoSection title="Props">
        <PropsTable
          rows={[
            {
              name: 'status',
              type: "'active' | 'pending' | 'inactive' | 'approved' | 'rejected' | 'expired' | 'upcoming'",
            },
          ]}
        />
      </DemoSection>
    </Stack>
  )
}
