import { useState } from 'react'
import { FormControlLabel, Radio, RadioGroup, Stack } from '@mui/material'
import { DemoSection } from '../components/DemoSection'
import { DemoLabel } from '../components/DemoLabel'
import { CodeBlock } from '../components/CodeBlock'
import { PropsTable } from '../components/PropsTable'

const usageCode = `import { Radio, RadioGroup, FormControlLabel } from '@mui/material'

<RadioGroup value={value} onChange={(e) => setValue(e.target.value)}>
  <FormControlLabel value="dealer" control={<Radio />} label="Dealer" />
  <FormControlLabel value="chemist" control={<Radio />} label="Chemist" />
</RadioGroup>`

export function RadioDemo() {
  const [value, setValue] = useState('dealer')

  return (
    <Stack spacing={4}>
      <DemoSection title="States">
        <DemoLabel label="unselected">
          <Radio checked={false} onChange={() => {}} />
        </DemoLabel>
        <DemoLabel label="selected">
          <Radio checked onChange={() => {}} />
        </DemoLabel>
        <DemoLabel label="disabled">
          <Radio disabled />
        </DemoLabel>
      </DemoSection>

      <DemoSection title="Group" description="RadioGroup coordinating mutually-exclusive options.">
        <RadioGroup row value={value} onChange={(e) => setValue(e.target.value)}>
          <FormControlLabel value="dealer" control={<Radio />} label="Dealer" />
          <FormControlLabel value="chemist" control={<Radio />} label="Chemist" />
        </RadioGroup>
      </DemoSection>

      <DemoSection title="Usage">
        <CodeBlock code={usageCode} />
      </DemoSection>

      <DemoSection title="Props (subset)">
        <PropsTable
          rows={[
            { name: 'checked', type: 'boolean' },
            { name: 'onChange', type: '(event, value: string) => void' },
            { name: 'disabled', type: 'boolean', default: 'false' },
            { name: 'value', type: 'string', description: 'Set on RadioGroup to control the selected option.' },
          ]}
        />
      </DemoSection>
    </Stack>
  )
}
