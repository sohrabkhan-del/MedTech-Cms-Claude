import { useState } from 'react'
import { Box, Slider, Stack } from '@mui/material'
import { DemoSection } from '../components/DemoSection'
import { CodeBlock } from '../components/CodeBlock'
import { PropsTable } from '../components/PropsTable'

const usageCode = `import { Slider } from '@mui/material'

// Single value
<Slider value={value} onChange={(e, v) => setValue(v as number)} />

// Range (two-handle)
<Slider value={range} onChange={(e, v) => setRange(v as number[])} valueLabelDisplay="auto" />

// With steps
<Slider value={value} step={10} marks min={0} max={100} />`

export function SliderDemo() {
  const [single, setSingle] = useState(40)
  const [range, setRange] = useState<number[]>([20, 70])
  const [stepped, setStepped] = useState(50)

  return (
    <Stack spacing={4}>
      <DemoSection title="Single value" description="Standard single-handle slider.">
        <Box sx={{ width: 260 }}>
          <Slider
            value={single}
            onChange={(_, v) => setSingle(v as number)}
            valueLabelDisplay="auto"
          />
        </Box>
      </DemoSection>

      <DemoSection title="Range (two-handle)" description="Passing an array value renders a two-thumb range slider.">
        <Box sx={{ width: 260 }}>
          <Slider
            value={range}
            onChange={(_, v) => setRange(v as number[])}
            valueLabelDisplay="auto"
          />
        </Box>
      </DemoSection>

      <DemoSection title="With steps" description="step + marks show discrete stop points along the track.">
        <Box sx={{ width: 260 }}>
          <Slider
            value={stepped}
            onChange={(_, v) => setStepped(v as number)}
            step={10}
            marks
            min={0}
            max={100}
            valueLabelDisplay="auto"
          />
        </Box>
      </DemoSection>

      <DemoSection title="Disabled">
        <Box sx={{ width: 260 }}>
          <Slider value={35} disabled />
        </Box>
      </DemoSection>

      <DemoSection title="Usage">
        <CodeBlock code={usageCode} />
      </DemoSection>

      <DemoSection title="Props">
        <PropsTable
          rows={[
            { name: 'value', type: 'number | number[]', description: 'Array of 2 renders a range slider.' },
            { name: 'onChange', type: '(event, value: number | number[]) => void' },
            { name: 'step', type: 'number', default: '1' },
            { name: 'marks', type: 'boolean | { value: number; label?: string }[]', default: 'false' },
            { name: 'min / max', type: 'number', default: '0 / 100' },
            { name: 'valueLabelDisplay', type: "'on' | 'auto' | 'off'", default: 'off' },
            { name: 'disabled', type: 'boolean', default: 'false' },
          ]}
        />
      </DemoSection>
    </Stack>
  )
}
