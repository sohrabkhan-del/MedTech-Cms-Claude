import { useState } from 'react'
import { Checkbox, FormControlLabel, Stack } from '@mui/material'
import { DemoSection } from '../components/DemoSection'
import { DemoLabel } from '../components/DemoLabel'
import { CodeBlock } from '../components/CodeBlock'
import { PropsTable } from '../components/PropsTable'

const usageCode = `import { Checkbox, FormControlLabel } from '@mui/material'

<FormControlLabel
  control={<Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} />}
  label="Notify dealer via SMS"
/>`

export function CheckboxDemo() {
  const [checked, setChecked] = useState(true)

  return (
    <Stack spacing={4}>
      <DemoSection title="States">
        <DemoLabel label="unchecked">
          <Checkbox checked={false} onChange={() => {}} />
        </DemoLabel>
        <DemoLabel label="checked">
          <Checkbox checked onChange={() => {}} />
        </DemoLabel>
        <DemoLabel label="indeterminate">
          <Checkbox indeterminate />
        </DemoLabel>
        <DemoLabel label="disabled">
          <Checkbox disabled />
        </DemoLabel>
        <DemoLabel label="disabled + checked">
          <Checkbox checked disabled />
        </DemoLabel>
      </DemoSection>

      <DemoSection title="Colors">
        <DemoLabel label="primary">
          <Checkbox checked color="primary" />
        </DemoLabel>
        <DemoLabel label="secondary">
          <Checkbox checked color="secondary" />
        </DemoLabel>
      </DemoSection>

      <DemoSection title="With label">
        <FormControlLabel
          control={<Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} />}
          label="Notify dealer via SMS"
        />
      </DemoSection>

      <DemoSection title="Usage">
        <CodeBlock code={usageCode} />
      </DemoSection>

      <DemoSection title="Props (subset)">
        <PropsTable
          rows={[
            { name: 'checked', type: 'boolean' },
            { name: 'onChange', type: '(event, checked: boolean) => void' },
            { name: 'indeterminate', type: 'boolean', default: 'false' },
            { name: 'disabled', type: 'boolean', default: 'false' },
            { name: 'color', type: "'primary' | 'secondary' | ...", default: 'primary' },
          ]}
        />
      </DemoSection>
    </Stack>
  )
}
