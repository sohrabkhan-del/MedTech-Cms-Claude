import { useState } from 'react'
import { Stack } from '@mui/material'
import { ModularTabs } from '@/components/common/ModularTabs/ModularTabs'
import { DemoSection } from '../components/DemoSection'
import { CodeBlock } from '../components/CodeBlock'
import { PropsTable } from '../components/PropsTable'

const usageCode = `import { ModularTabs } from '@/components/common/ModularTabs/ModularTabs'

<ModularTabs
  tabs={[
    { label: 'All', value: 'all', count: 24 },
    { label: 'Pending', value: 'pending', count: 3 },
    { label: 'Approved', value: 'approved' },
  ]}
  value={tab}
  onChange={setTab}
  variant="filled"
/>`

type TabValue = 'all' | 'pending' | 'approved'

export function TabsDemo() {
  const [filled, setFilled] = useState<TabValue>('all')
  const [outlined, setOutlined] = useState<TabValue>('all')
  const [underline, setUnderline] = useState<TabValue>('all')

  const tabs = [
    { label: 'All', value: 'all' as TabValue, count: 24 },
    { label: 'Pending', value: 'pending' as TabValue, count: 3 },
    { label: 'Approved', value: 'approved' as TabValue },
  ]

  return (
    <Stack spacing={4}>
      <DemoSection title="variant: filled (default)" description="Bordered pill track with a sliding gradient indicator.">
        <ModularTabs tabs={tabs} value={filled} onChange={setFilled} variant="filled" />
      </DemoSection>

      <DemoSection title="variant: outlined" description="Bare labels; active tab gets its own border + light fill.">
        <ModularTabs tabs={tabs} value={outlined} onChange={setOutlined} variant="outlined" />
      </DemoSection>

      <DemoSection title="variant: underline" description="Bare labels over a baseline, with a sliding underline.">
        <ModularTabs tabs={tabs} value={underline} onChange={setUnderline} variant="underline" />
      </DemoSection>

      <DemoSection title="Disabled">
        <ModularTabs tabs={tabs} value="all" onChange={() => {}} disabled />
      </DemoSection>

      <DemoSection title="Full width">
        <Stack sx={{ width: '100%' }}>
          <ModularTabs tabs={tabs} value={filled} onChange={setFilled} fullWidth />
        </Stack>
      </DemoSection>

      <DemoSection title="Usage">
        <CodeBlock code={usageCode} />
      </DemoSection>

      <DemoSection title="Props">
        <PropsTable
          rows={[
            { name: 'tabs', type: '{ label: string; value: T; count?: number }[]' },
            { name: 'value', type: 'T' },
            { name: 'onChange', type: '(value: T) => void' },
            { name: 'variant', type: "'filled' | 'outlined' | 'underline'", default: 'filled' },
            { name: 'fullWidth', type: 'boolean', default: 'false' },
            { name: 'disabled', type: 'boolean', default: 'false' },
            { name: 'fontSize', type: 'string | number', default: "'1rem'" },
          ]}
        />
      </DemoSection>
    </Stack>
  )
}
