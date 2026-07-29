import { Button, Stack } from '@mui/material'
import { Trash2 } from 'lucide-react'
import { DemoSection } from '../components/DemoSection'
import { DemoLabel } from '../components/DemoLabel'
import { CodeBlock } from '../components/CodeBlock'
import { PropsTable } from '../components/PropsTable'

const usageCode = `import { Button } from '@mui/material'

<Button variant="contained" color="primary">
  Save Changes
</Button>

<Button variant="outlined" color="error" startIcon={<Trash2 size={16} />}>
  Delete
</Button>

<Button variant="contained" loading>
  Submitting...
</Button>`

export function ButtonDemo() {
  return (
    <Stack spacing={4}>
      <DemoSection title="Variants" description="MUI 'variant' prop combined with the app's themed colors.">
        <DemoLabel label="contained / primary">
          <Button variant="contained" color="primary">Primary</Button>
        </DemoLabel>
        <DemoLabel label="contained / secondary">
          <Button variant="contained" color="secondary">Secondary</Button>
        </DemoLabel>
        <DemoLabel label="outlined">
          <Button variant="outlined" color="primary">Outline</Button>
        </DemoLabel>
        <DemoLabel label="text (ghost)">
          <Button variant="text" color="primary">Ghost</Button>
        </DemoLabel>
        <DemoLabel label="contained / error (destructive)">
          <Button variant="contained" color="error">Delete</Button>
        </DemoLabel>
        <DemoLabel label="text / link-style">
          <Button variant="text" color="primary" sx={{ textDecoration: 'underline' }}>
            Learn more
          </Button>
        </DemoLabel>
      </DemoSection>

      <DemoSection title="Sizes" description="'size' prop: small, medium (default), large.">
        <DemoLabel label="small">
          <Button variant="contained" size="small">Small</Button>
        </DemoLabel>
        <DemoLabel label="medium">
          <Button variant="contained" size="medium">Medium</Button>
        </DemoLabel>
        <DemoLabel label="large">
          <Button variant="contained" size="large">Large</Button>
        </DemoLabel>
      </DemoSection>

      <DemoSection title="With icons" description="startIcon / endIcon using lucide-react icons.">
        <DemoLabel label="startIcon">
          <Button variant="outlined" color="error" startIcon={<Trash2 size={16} />}>
            Delete
          </Button>
        </DemoLabel>
      </DemoSection>

      <DemoSection title="Disabled & loading states">
        <DemoLabel label="disabled">
          <Button variant="contained" disabled>Disabled</Button>
        </DemoLabel>
        <DemoLabel label="loading">
          <Button variant="contained" loading>Submitting</Button>
        </DemoLabel>
        <DemoLabel label="loading (outlined)">
          <Button variant="outlined" loading loadingPosition="start">
            Saving
          </Button>
        </DemoLabel>
      </DemoSection>

      <DemoSection title="Usage">
        <CodeBlock code={usageCode} />
      </DemoSection>

      <DemoSection title="Props">
        <PropsTable
          rows={[
            { name: 'variant', type: "'text' | 'outlined' | 'contained'", default: 'text', description: 'Visual style.' },
            { name: 'color', type: "'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' | 'inherit'", default: 'primary', description: 'Theme color.' },
            { name: 'size', type: "'small' | 'medium' | 'large'", default: 'medium' },
            { name: 'disabled', type: 'boolean', default: 'false' },
            { name: 'loading', type: 'boolean', default: 'false', description: 'Shows a spinner and disables interaction.' },
            { name: 'startIcon / endIcon', type: 'ReactNode', description: 'Icon rendered before/after the label.' },
          ]}
        />
      </DemoSection>
    </Stack>
  )
}
