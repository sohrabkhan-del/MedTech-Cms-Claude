import { useState } from 'react'
import { Button, Stack } from '@mui/material'
import { Toast } from '@/components/common/Toast/Toast'
import { DemoSection } from '../components/DemoSection'
import { CodeBlock } from '../components/CodeBlock'
import { PropsTable } from '../components/PropsTable'

const usageCode = `import { Toast } from '@/components/common/Toast/Toast'

const [open, setOpen] = useState(false)

<Toast
  open={open}
  severity="success"
  message="Dealer application approved."
  onClose={() => setOpen(false)}
/>

// Persistent (no auto-dismiss)
<Toast
  open={open}
  severity="error"
  message="Upload failed. Please retry."
  onClose={() => setOpen(false)}
  autoHideDuration={undefined}
/>`

type Severity = 'success' | 'error' | 'warning' | 'info'

export function SnackbarDemo() {
  const [active, setActive] = useState<Severity | 'persistent' | null>(null)

  function open(kind: Severity | 'persistent') {
    setActive(kind)
  }

  const messages: Record<Severity, string> = {
    success: 'Dealer application approved successfully.',
    error: 'Upload failed. Please retry.',
    warning: 'Wallet balance is running low.',
    info: 'A new scheme has been published.',
  }

  return (
    <Stack spacing={4}>
      <DemoSection title="Variants" description="success, error, warning, info — click to trigger each toast (bottom-right).">
        <Button variant="outlined" color="success" onClick={() => open('success')}>Success</Button>
        <Button variant="outlined" color="error" onClick={() => open('error')}>Error</Button>
        <Button variant="outlined" color="warning" onClick={() => open('warning')}>Warning</Button>
        <Button variant="outlined" color="info" onClick={() => open('info')}>Info</Button>
      </DemoSection>

      <DemoSection title="Auto-dismiss vs persistent" description="Default auto-hides after 5s; pass autoHideDuration={undefined} (or a longer value) to keep it visible until dismissed.">
        <Button variant="contained" onClick={() => open('info')}>Auto-dismiss (5s)</Button>
        <Button variant="contained" color="secondary" onClick={() => open('persistent')}>
          Persistent (manual close)
        </Button>
      </DemoSection>

      {(['success', 'error', 'warning', 'info'] as Severity[]).map((severity) => (
        <Toast
          key={severity}
          open={active === severity}
          severity={severity}
          message={messages[severity]}
          onClose={() => setActive(null)}
        />
      ))}
      <Toast
        open={active === 'persistent'}
        severity="info"
        message="This toast stays until you dismiss it with the close button."
        onClose={() => setActive(null)}
        autoHideDuration={undefined}
      />

      <DemoSection title="Usage">
        <CodeBlock code={usageCode} />
      </DemoSection>

      <DemoSection title="Props">
        <PropsTable
          rows={[
            { name: 'open', type: 'boolean' },
            { name: 'title', type: 'string', description: "Defaults to 'Success' / 'Warning' / 'Error' / 'Notice' based on severity." },
            { name: 'message', type: 'string' },
            { name: 'severity', type: "'success' | 'warning' | 'error' | 'info'", default: 'success' },
            { name: 'onClose', type: '() => void' },
            { name: 'autoHideDuration', type: 'number | undefined', default: '5000', description: 'Pass undefined for a persistent toast.' },
          ]}
        />
      </DemoSection>
    </Stack>
  )
}
