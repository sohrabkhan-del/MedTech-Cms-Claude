import { useState } from 'react'
import { Stack, Switch } from '@mui/material'
import { DemoSection } from '../components/DemoSection'
import { DemoLabel } from '../components/DemoLabel'
import { CodeBlock } from '../components/CodeBlock'
import { PropsTable } from '../components/PropsTable'

const usageCode = `import { Switch } from '@mui/material'

<Switch checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />

<Switch checked={enabled} onChange={handleChange} color="secondary" size="small" />`

export function ToggleDemo() {
  const [checked1, setChecked1] = useState(true)
  const [checked2, setChecked2] = useState(false)
  const [checked3, setChecked3] = useState(true)

  return (
    <Stack spacing={4}>
      <DemoSection title="Colors" description="Theme colors applied to the checked state.">
        <DemoLabel label="primary">
          <Switch checked={checked1} onChange={(e) => setChecked1(e.target.checked)} color="primary" />
        </DemoLabel>
        <DemoLabel label="secondary">
          <Switch checked={checked2} onChange={(e) => setChecked2(e.target.checked)} color="secondary" />
        </DemoLabel>
        <DemoLabel label="success">
          <Switch checked={checked3} onChange={(e) => setChecked3(e.target.checked)} color="success" />
        </DemoLabel>
      </DemoSection>

      <DemoSection title="Sizes">
        <DemoLabel label="small">
          <Switch checked size="small" />
        </DemoLabel>
        <DemoLabel label="medium (default)">
          <Switch checked size="medium" />
        </DemoLabel>
      </DemoSection>

      <DemoSection title="States">
        <DemoLabel label="unchecked">
          <Switch checked={false} onChange={() => {}} />
        </DemoLabel>
        <DemoLabel label="checked">
          <Switch checked onChange={() => {}} />
        </DemoLabel>
        <DemoLabel label="disabled (off)">
          <Switch checked={false} disabled />
        </DemoLabel>
        <DemoLabel label="disabled (on)">
          <Switch checked disabled />
        </DemoLabel>
      </DemoSection>

      <DemoSection title="Usage">
        <CodeBlock code={usageCode} />
      </DemoSection>

      <DemoSection title="Props">
        <PropsTable
          rows={[
            { name: 'checked', type: 'boolean' },
            { name: 'onChange', type: '(event, checked: boolean) => void' },
            { name: 'color', type: "'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' | 'default'", default: 'primary' },
            { name: 'size', type: "'small' | 'medium'", default: 'medium' },
            { name: 'disabled', type: 'boolean', default: 'false' },
          ]}
        />
      </DemoSection>
    </Stack>
  )
}
