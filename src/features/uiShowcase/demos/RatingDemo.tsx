import { useState } from 'react'
import { Rating, Stack, Typography } from '@mui/material'
import { Star } from 'lucide-react'
import { DemoSection } from '../components/DemoSection'
import { DemoLabel } from '../components/DemoLabel'
import { CodeBlock } from '../components/CodeBlock'
import { PropsTable } from '../components/PropsTable'

const usageCode = `import { Rating } from '@mui/material'

// Read-only display
<Rating value={4} readOnly />

// Interactive, selectable
<Rating value={value} onChange={(e, newValue) => setValue(newValue)} />

// Half-star precision
<Rating value={3.5} precision={0.5} readOnly />`

export function RatingDemo() {
  const [value, setValue] = useState<number | null>(3)
  const [halfValue, setHalfValue] = useState<number | null>(3.5)

  return (
    <Stack spacing={4}>
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        MUI's <code>Rating</code> component — bundled with <code>@mui/material</code> (already a project dependency) but not
        previously used anywhere in the codebase.
      </Typography>

      <DemoSection title="Read-only display" description="readOnly prevents interaction; used for showing an existing rating.">
        <DemoLabel label="value: 4">
          <Rating value={4} readOnly />
        </DemoLabel>
        <DemoLabel label="value: 2">
          <Rating value={2} readOnly />
        </DemoLabel>
      </DemoSection>

      <DemoSection title="Interactive (selectable)" description="Click a star to set the value.">
        <DemoLabel label={`selected: ${value ?? '—'}`}>
          <Rating value={value} onChange={(_e, newValue) => setValue(newValue)} />
        </DemoLabel>
      </DemoSection>

      <DemoSection title="Half-star precision" description="precision={0.5} supports half-star values, both read-only and interactive.">
        <DemoLabel label="read-only: 3.5">
          <Rating value={3.5} precision={0.5} readOnly />
        </DemoLabel>
        <DemoLabel label={`interactive: ${halfValue ?? '—'}`}>
          <Rating value={halfValue} precision={0.5} onChange={(_e, newValue) => setHalfValue(newValue)} />
        </DemoLabel>
      </DemoSection>

      <DemoSection title="Sizes">
        <DemoLabel label="small">
          <Rating value={4} readOnly size="small" />
        </DemoLabel>
        <DemoLabel label="medium (default)">
          <Rating value={4} readOnly size="medium" />
        </DemoLabel>
        <DemoLabel label="large">
          <Rating value={4} readOnly size="large" />
        </DemoLabel>
      </DemoSection>

      <DemoSection title="Custom icon" description="icon/emptyIcon accept any ReactNode — here using a lucide Star to match the app's icon set.">
        <Rating
          value={value}
          onChange={(_e, newValue) => setValue(newValue)}
          icon={<Star size={22} fill="currentColor" />}
          emptyIcon={<Star size={22} />}
          sx={{ color: 'secondary.main' }}
        />
      </DemoSection>

      <DemoSection title="Disabled">
        <Rating value={3} disabled />
      </DemoSection>

      <DemoSection title="Usage">
        <CodeBlock code={usageCode} />
      </DemoSection>

      <DemoSection title="Props (subset)">
        <PropsTable
          rows={[
            { name: 'value', type: 'number | null' },
            { name: 'onChange', type: '(event, value: number | null) => void' },
            { name: 'readOnly', type: 'boolean', default: 'false' },
            { name: 'precision', type: 'number', default: '1', description: 'Set to 0.5 for half-star selection.' },
            { name: 'size', type: "'small' | 'medium' | 'large'", default: 'medium' },
            { name: 'disabled', type: 'boolean', default: 'false' },
            { name: 'icon / emptyIcon', type: 'ReactNode', description: 'Custom filled/empty icon.' },
          ]}
        />
      </DemoSection>
    </Stack>
  )
}
