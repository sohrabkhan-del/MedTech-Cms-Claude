import { useState } from 'react'
import { Button, Stack, Typography } from '@mui/material'
import { Calendar } from 'lucide-react'
import { DateRangeFilter, type DateRange } from '@/components/common/DateRangeFilter/DateRangeFilter'
import { DateRangeDropdown } from '@/components/common/DateRangeDropdown/DateRangeDropdown'
import { DATE_RANGE_OPTIONS, type DateRangeValue } from '@/components/common/DateRangeSelect/DateRangeSelect'
import { DemoSection } from '../components/DemoSection'
import { DemoLabel } from '../components/DemoLabel'
import { CodeBlock } from '../components/CodeBlock'
import { PropsTable } from '../components/PropsTable'

const usageCode = `import { DateRangeFilter, type DateRange } from '@/components/common/DateRangeFilter/DateRangeFilter'

const [range, setRange] = useState<DateRange>({
  from: null,
  to: null,
  presetLabel: 'Last 30 Days',
})

<DateRangeFilter value={range} onChange={setRange} />

// Simple preset-only dropdown variant:
<DateRangeDropdown
  value={preset}
  onChange={setPreset}
  options={DATE_RANGE_OPTIONS}
  aria-label="Date range"
/>`

export function DateRangePickerDemo() {
  const [range, setRange] = useState<DateRange>({
    from: null,
    to: null,
    presetLabel: 'Last 30 Days',
  })
  const [preset, setPreset] = useState<DateRangeValue>('30')

  return (
    <Stack spacing={4}>
      <DemoSection
        title="Default (icon trigger)"
        description="Popover menu with presets and a custom From/To range. This is the project's built-in date range component — there is no separate calendar-grid date picker library installed."
      >
        <DateRangeFilter value={range} onChange={setRange} />
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Selected: <strong>{range.presetLabel}</strong>
          {range.from && range.to ? ` (${range.from} → ${range.to})` : ''}
        </Typography>
      </DemoSection>

      <DemoSection title="With presets (Today / Last 7 days / etc.)" description="Same component — presets list: Today, Last 7 Days, Last 30 Days, Last 90 Days, This Month, This Year, Financial Year.">
        <DateRangeFilter
          value={range}
          onChange={setRange}
          renderTrigger={({ onClick, isApplied }) => (
            <Button
              variant={isApplied ? 'contained' : 'outlined'}
              size="small"
              startIcon={<Calendar size={14} />}
              onClick={onClick}
            >
              {range.presetLabel}
            </Button>
          )}
        />
      </DemoSection>

      <DemoSection title="Compact preset dropdown" description="DateRangeDropdown — a lightweight Select for simple preset-only pickers (used in report filters).">
        <DemoLabel label="preset select">
          <DateRangeDropdown
            value={preset}
            onChange={setPreset}
            options={DATE_RANGE_OPTIONS}
            aria-label="Date range"
          />
        </DemoLabel>
      </DemoSection>

      <DemoSection title="Disabled" description="Trigger disabled; no interactive date restriction API exists on this component today.">
        <Button variant="outlined" size="small" startIcon={<Calendar size={14} />} disabled>
          Last 30 Days
        </Button>
      </DemoSection>

      <DemoSection title="Usage">
        <CodeBlock code={usageCode} />
      </DemoSection>

      <DemoSection title="Props — DateRangeFilter">
        <PropsTable
          rows={[
            { name: 'value', type: 'DateRange = { from: string | null; to: string | null; presetLabel: string }' },
            { name: 'onChange', type: '(range: DateRange) => void' },
            { name: 'renderTrigger', type: '(props: { onClick, isApplied }) => ReactNode', description: 'Custom trigger; defaults to a calendar icon button.' },
          ]}
        />
      </DemoSection>

      <DemoSection title="Props — DateRangeDropdown<T>">
        <PropsTable
          rows={[
            { name: 'value', type: 'T extends string' },
            { name: 'onChange', type: '(value: T) => void' },
            { name: 'options', type: '{ value: T; label: string }[]' },
            { name: 'aria-label', type: 'string' },
            { name: 'minWidth', type: 'number', default: '100' },
          ]}
        />
      </DemoSection>
    </Stack>
  )
}
