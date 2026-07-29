import { Stack, TextField } from '@mui/material'
import { DemoSection } from '../components/DemoSection'
import { DemoLabel } from '../components/DemoLabel'
import { CodeBlock } from '../components/CodeBlock'
import { PropsTable } from '../components/PropsTable'

const usageCode = `import { TextField } from '@mui/material'

<TextField label="Full Name" size="small" fullWidth />
<TextField label="Email" size="small" fullWidth error helperText="Invalid email address" />`

export function InputDemo() {
  return (
    <Stack spacing={4}>
      <DemoSection title="Sizes">
        <DemoLabel label="small">
          <TextField label="Small" size="small" />
        </DemoLabel>
        <DemoLabel label="medium (default)">
          <TextField label="Medium" size="medium" />
        </DemoLabel>
      </DemoSection>

      <DemoSection title="States">
        <DemoLabel label="default">
          <TextField label="Full Name" size="small" />
        </DemoLabel>
        <DemoLabel label="with helper text">
          <TextField label="Phone" size="small" helperText="10-digit mobile number" />
        </DemoLabel>
        <DemoLabel label="error">
          <TextField label="Email" size="small" error helperText="Invalid email address" />
        </DemoLabel>
        <DemoLabel label="disabled">
          <TextField label="Role" size="small" disabled value="Admin" />
        </DemoLabel>
      </DemoSection>

      <DemoSection title="Type: date" description="Used by DateRangeFilter for custom range inputs — no dedicated calendar-picker library is installed.">
        <DemoLabel label="date input">
          <TextField
            label="From"
            type="date"
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </DemoLabel>
      </DemoSection>

      <DemoSection title="Usage">
        <CodeBlock code={usageCode} />
      </DemoSection>

      <DemoSection title="Props (subset)">
        <PropsTable
          rows={[
            { name: 'label', type: 'string' },
            { name: 'size', type: "'small' | 'medium'", default: 'medium' },
            { name: 'error', type: 'boolean', default: 'false' },
            { name: 'helperText', type: 'ReactNode' },
            { name: 'disabled', type: 'boolean', default: 'false' },
            { name: 'fullWidth', type: 'boolean', default: 'false' },
            { name: 'type', type: "'text' | 'number' | 'date' | 'password' | ...", default: 'text' },
          ]}
        />
      </DemoSection>
    </Stack>
  )
}
