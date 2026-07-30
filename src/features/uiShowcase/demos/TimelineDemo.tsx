import { Box, Stack, Typography } from '@mui/material'
import { CheckCircle2, PackageCheck, ShieldCheck, Truck } from 'lucide-react'
import { ActivityTimeline, type ActivityTimelineEntry } from '@/components/common/ActivityTimeline/ActivityTimeline'
import { DemoSection } from '../components/DemoSection'
import { CodeBlock } from '../components/CodeBlock'
import { PropsTable } from '../components/PropsTable'

const usageCode = `import { ActivityTimeline } from '@/components/common/ActivityTimeline/ActivityTimeline'

<ActivityTimeline
  entries={[
    { id: '1', activity: 'Dealer application approved', dateTime: '2026-07-28 10:12 AM' },
    { id: '2', activity: 'KYC documents verified', dateTime: '2026-07-27 4:45 PM' },
  ]}
/>

// Horizontal, icon-based variant (composed for this demo, no dedicated component yet)
<HorizontalTimeline steps={steps} />`

const entries: ActivityTimelineEntry[] = [
  { id: '1', activity: 'Dealer application approved', dateTime: '2026-07-28 10:12 AM' },
  { id: '2', activity: 'KYC documents verified', dateTime: '2026-07-27 4:45 PM' },
  { id: '3', activity: 'Application submitted', dateTime: '2026-07-26 9:03 AM' },
]

interface HorizontalStep {
  label: string
  date: string
  description: string
  icon: typeof CheckCircle2
  done: boolean
}

const steps: HorizontalStep[] = [
  { label: 'Ordered', date: 'Jul 24', description: 'Order placed by dealer', icon: PackageCheck, done: true },
  { label: 'Verified', date: 'Jul 25', description: 'KYC and stock verified', icon: ShieldCheck, done: true },
  { label: 'Dispatched', date: 'Jul 27', description: 'Shipped via distributor', icon: Truck, done: true },
  { label: 'Delivered', date: 'Jul 29', description: 'Confirmed at destination', icon: CheckCircle2, done: false },
]

function HorizontalTimeline({ items }: { items: HorizontalStep[] }) {
  return (
    <Stack direction="row" sx={{ width: '100%', overflowX: 'auto', py: 1 }}>
      {items.map((step, index) => {
        const Icon = step.icon
        return (
          <Stack key={step.label} sx={{ minWidth: 160, alignItems: 'center', flex: 1 }}>
            <Stack direction="row" sx={{ alignItems: 'center', width: '100%' }}>
              <Box sx={{ flexGrow: 1, height: '1px', backgroundColor: index === 0 ? 'transparent' : 'divider' }} />
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  backgroundColor: step.done ? 'primary.main' : 'background.default',
                  color: step.done ? 'primary.contrastText' : 'text.disabled',
                  border: step.done ? 'none' : '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Icon size={16} />
              </Box>
              <Box sx={{ flexGrow: 1, height: '1px', backgroundColor: index === items.length - 1 ? 'transparent' : 'divider' }} />
            </Stack>
            <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', mt: 1 }}>{step.label}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{step.date}</Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled', textAlign: 'center', mt: 0.25 }}>
              {step.description}
            </Typography>
          </Stack>
        )
      })}
    </Stack>
  )
}

export function TimelineDemo() {
  return (
    <Stack spacing={4}>
      <DemoSection title="Vertical" description="The shared ActivityTimeline component — dot + connector line, used on dealer/chemist detail pages.">
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          <ActivityTimeline entries={entries} />
        </Box>
      </DemoSection>

      <DemoSection title="Horizontal (with icons & dates)" description="A composed step-tracker variant using icon nodes, built for this showcase — not yet a shared component.">
        <Box sx={{ width: '100%' }}>
          <HorizontalTimeline items={steps} />
        </Box>
      </DemoSection>

      <DemoSection title="Usage">
        <CodeBlock code={usageCode} />
      </DemoSection>

      <DemoSection title="Props — ActivityTimeline">
        <PropsTable
          rows={[
            { name: 'entries', type: '{ id: string; activity: string; dateTime: string }[]' },
            { name: 'emptyTitle', type: 'string', default: "'No activity yet'" },
          ]}
        />
      </DemoSection>
    </Stack>
  )
}
