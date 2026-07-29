import { Grid, Stack, Typography } from '@mui/material'
import { ScanLine } from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { StatCard } from '@/components/common/StatCard/StatCard'
import { DemoSection } from '../components/DemoSection'
import { CodeBlock } from '../components/CodeBlock'
import { PropsTable } from '../components/PropsTable'

const usageCode = `import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { StatCard } from '@/components/common/StatCard/StatCard'

<SectionCard title="Personal Information">
  ...form fields...
</SectionCard>

<StatCard
  label="Scan Activity"
  value="8,942"
  icon={<ScanLine size={20} />}
  iconColor="primary"
  trend={{ direction: 'up', value: '+8.3%', caption: 'since last week' }}
/>`

export function CardDemo() {
  return (
    <Stack spacing={4}>
      <DemoSection title="SectionCard" description="Generic titled card wrapper used for grouping form sections and content blocks.">
        <Grid container spacing={2} sx={{ width: '100%' }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <SectionCard title="Account Details">
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Card body content goes here — any children are accepted.
              </Typography>
            </SectionCard>
          </Grid>
        </Grid>
      </DemoSection>

      <DemoSection title="StatCard" description="Metric tile with icon, value, label and an optional trend indicator.">
        <Grid container spacing={2} sx={{ width: '100%' }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label="Scan Activity"
              value="8,942"
              icon={<ScanLine size={20} />}
              iconColor="primary"
              trend={{ direction: 'up', value: '+8.3%', caption: 'since last week' }}
            />
          </Grid>
        </Grid>
      </DemoSection>

      <DemoSection title="Usage">
        <CodeBlock code={usageCode} />
      </DemoSection>

      <DemoSection title="Props — SectionCard">
        <PropsTable
          rows={[
            { name: 'title', type: 'string' },
            { name: 'action', type: 'ReactNode', description: 'Optional element rendered top-right of the title.' },
            { name: 'children', type: 'ReactNode' },
          ]}
        />
      </DemoSection>

      <DemoSection title="Props — StatCard">
        <PropsTable
          rows={[
            { name: 'label', type: 'string' },
            { name: 'value', type: 'string | number' },
            { name: 'icon', type: 'ReactNode' },
            { name: 'iconColor', type: "'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning'" },
            { name: 'trend', type: "{ direction: 'up' | 'down'; value: string; caption: string }", description: 'Optional trend row under the value.' },
          ]}
        />
      </DemoSection>
    </Stack>
  )
}
