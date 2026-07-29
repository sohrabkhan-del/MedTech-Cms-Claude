import { Accordion, AccordionDetails, AccordionSummary, Stack, Typography } from '@mui/material'
import { ChevronDown } from 'lucide-react'
import { DemoSection } from '../components/DemoSection'
import { CodeBlock } from '../components/CodeBlock'
import { PropsTable } from '../components/PropsTable'

const usageCode = `import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import { ChevronDown } from 'lucide-react'

<Accordion>
  <AccordionSummary expandIcon={<ChevronDown size={18} />}>
    Shipping details
  </AccordionSummary>
  <AccordionDetails>
    Content revealed when expanded.
  </AccordionDetails>
</Accordion>`

export function AccordionDemo() {
  return (
    <Stack spacing={4}>
      <DemoSection title="Default" description="Expand/collapse panels; lucide ChevronDown as the expand icon to match the rest of the app.">
        <Stack sx={{ width: '100%' }}>
          <Accordion>
            <AccordionSummary expandIcon={<ChevronDown size={18} />}>
              <Typography sx={{ fontWeight: 600 }}>Shipping details</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Dispatched from the Pune factory unit via authorized distributor.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ChevronDown size={18} />}>
              <Typography sx={{ fontWeight: 600 }}>Batch information (expanded by default)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Batch #BMR-2024-0091, manufactured 2026-06-12.
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion disabled>
            <AccordionSummary expandIcon={<ChevronDown size={18} />}>
              <Typography sx={{ fontWeight: 600 }}>Disabled panel</Typography>
            </AccordionSummary>
            <AccordionDetails>Not reachable.</AccordionDetails>
          </Accordion>
        </Stack>
      </DemoSection>

      <DemoSection title="Usage">
        <CodeBlock code={usageCode} />
      </DemoSection>

      <DemoSection title="Props (subset)">
        <PropsTable
          rows={[
            { name: 'expanded', type: 'boolean', description: 'Controlled expand state.' },
            { name: 'defaultExpanded', type: 'boolean', default: 'false' },
            { name: 'disabled', type: 'boolean', default: 'false' },
            { name: 'onChange', type: '(event, expanded: boolean) => void' },
          ]}
        />
      </DemoSection>
    </Stack>
  )
}
