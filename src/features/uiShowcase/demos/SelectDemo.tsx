import { useState } from 'react'
import { MenuItem, Select, Stack, TextField } from '@mui/material'
import { DateRangeDropdown } from '@/components/common/DateRangeDropdown/DateRangeDropdown'
import { DATE_RANGE_OPTIONS, type DateRangeValue } from '@/components/common/DateRangeSelect/DateRangeSelect'
import { DemoSection } from '../components/DemoSection'
import { DemoLabel } from '../components/DemoLabel'
import { CodeBlock } from '../components/CodeBlock'
import { PropsTable } from '../components/PropsTable'

const usageCode = `import { Select, MenuItem, TextField } from '@mui/material'

<TextField select label="Region" size="small" value={region} onChange={(e) => setRegion(e.target.value)}>
  <MenuItem value="north">North</MenuItem>
  <MenuItem value="south">South</MenuItem>
</TextField>

// Compact preset dropdown (custom wrapper)
<DateRangeDropdown value={preset} onChange={setPreset} options={DATE_RANGE_OPTIONS} aria-label="Date range" />`

export function SelectDemo() {
  const [region, setRegion] = useState('north')
  const [plain, setPlain] = useState('active')
  const [preset, setPreset] = useState<DateRangeValue>('30')

  return (
    <Stack spacing={4}>
      <DemoSection title="TextField select" description="Standard labeled select, built on MUI TextField's select prop.">
        <DemoLabel label="region">
          <TextField
            select
            label="Region"
            size="small"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="north">North</MenuItem>
            <MenuItem value="south">South</MenuItem>
            <MenuItem value="east">East</MenuItem>
            <MenuItem value="west">West</MenuItem>
          </TextField>
        </DemoLabel>
      </DemoSection>

      <DemoSection title="Plain Select" description="Bare MUI Select without the TextField label chrome.">
        <DemoLabel label="status">
          <Select size="small" value={plain} onChange={(e) => setPlain(e.target.value)} sx={{ minWidth: 140 }}>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </DemoLabel>
        <DemoLabel label="disabled">
          <Select size="small" value="active" disabled sx={{ minWidth: 140 }}>
            <MenuItem value="active">Active</MenuItem>
          </Select>
        </DemoLabel>
      </DemoSection>

      <DemoSection title="DateRangeDropdown (custom)" description="Compact generic-typed dropdown used for report preset filters.">
        <DateRangeDropdown value={preset} onChange={setPreset} options={DATE_RANGE_OPTIONS} aria-label="Date range" />
      </DemoSection>

      <DemoSection title="Usage">
        <CodeBlock code={usageCode} />
      </DemoSection>

      <DemoSection title="Props (subset)">
        <PropsTable
          rows={[
            { name: 'value', type: 'string' },
            { name: 'onChange', type: '(event: SelectChangeEvent) => void' },
            { name: 'size', type: "'small' | 'medium'", default: 'medium' },
            { name: 'disabled', type: 'boolean', default: 'false' },
          ]}
        />
      </DemoSection>
    </Stack>
  )
}
