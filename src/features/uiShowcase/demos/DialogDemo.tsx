import { useState } from 'react'
import { Button, Stack, TextField, Typography } from '@mui/material'
import { Modal } from '@/components/common/Modal/Modal'
import { DemoSection } from '../components/DemoSection'
import { CodeBlock } from '../components/CodeBlock'
import { PropsTable } from '../components/PropsTable'

const usageCode = `import { Modal } from '@/components/common/Modal/Modal'

<Modal
  open={open}
  onClose={() => setOpen(false)}
  title="Delete dealer"
  description="This action cannot be undone."
  primaryActionLabel="Delete"
  primaryActionColor="error"
  onPrimaryAction={handleDelete}
>
  <Typography variant="body1">
    Are you sure you want to delete this dealer?
  </Typography>
</Modal>`

export function DialogDemo() {
  const [defaultOpen, setDefaultOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [scrollOpen, setScrollOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleConfirmDelete() {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setConfirmOpen(false)
    }, 1200)
  }

  return (
    <Stack spacing={4}>
      <DemoSection title="Default" description="Basic dialog with a title, description and simple body content.">
        <Button variant="contained" onClick={() => setDefaultOpen(true)}>
          Open default dialog
        </Button>
        <Modal
          open={defaultOpen}
          onClose={() => setDefaultOpen(false)}
          title="Dealer approved"
          description="The dealer application has been approved and notified."
          secondaryActionLabel="Close"
        >
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            You can review the full approval history from the dealer's detail page at any time.
          </Typography>
        </Modal>
      </DemoSection>

      <DemoSection title="Confirmation" description="Destructive confirmation with a loading state on the primary action.">
        <Button variant="outlined" color="error" onClick={() => setConfirmOpen(true)}>
          Open confirmation dialog
        </Button>
        <Modal
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title="Delete gift item"
          description="This action cannot be undone."
          primaryActionLabel="Delete"
          primaryActionColor="error"
          onPrimaryAction={handleConfirmDelete}
          loading={loading}
        >
          <Typography variant="body1">
            Are you sure you want to remove "Premium Backpack" from the gift catalogue?
          </Typography>
        </Modal>
      </DemoSection>

      <DemoSection title="With form content" description="Dialog body hosting form fields, with Cancel/Save actions.">
        <Button variant="contained" color="secondary" onClick={() => setFormOpen(true)}>
          Open form dialog
        </Button>
        <Modal
          open={formOpen}
          onClose={() => setFormOpen(false)}
          title="Add region multiplier"
          primaryActionLabel="Save"
          onPrimaryAction={() => setFormOpen(false)}
        >
          <Stack spacing={2}>
            <TextField label="Region name" size="small" fullWidth />
            <TextField label="Multiplier" size="small" type="number" fullWidth />
          </Stack>
        </Modal>
      </DemoSection>

      <DemoSection title="Scrollable content" description="Long body content scrolls within the dialog while header/footer stay fixed.">
        <Button variant="outlined" onClick={() => setScrollOpen(true)}>
          Open scrollable dialog
        </Button>
        <Modal
          open={scrollOpen}
          onClose={() => setScrollOpen(false)}
          title="Terms & conditions"
          maxWidth="md"
          primaryActionLabel="Accept"
          onPrimaryAction={() => setScrollOpen(false)}
        >
          <Stack spacing={2}>
            {Array.from({ length: 12 }).map((_, i) => (
              <Typography key={i} variant="body1" sx={{ color: 'text.secondary' }}>
                Section {i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </Typography>
            ))}
          </Stack>
        </Modal>
      </DemoSection>

      <DemoSection title="Usage">
        <CodeBlock code={usageCode} />
      </DemoSection>

      <DemoSection title="Props">
        <PropsTable
          rows={[
            { name: 'open', type: 'boolean', description: 'Controls dialog visibility.' },
            { name: 'onClose', type: '() => void' },
            { name: 'title', type: 'string' },
            { name: 'description', type: 'string', description: 'Optional subtitle under the title.' },
            { name: 'maxWidth', type: "'xs' | 'sm' | 'md' | 'lg'", default: 'sm' },
            { name: 'primaryActionLabel', type: 'string', description: 'Omit to hide the primary button.' },
            { name: 'onPrimaryAction', type: '() => void' },
            { name: 'primaryActionColor', type: "'primary' | 'error'", default: 'primary' },
            { name: 'secondaryActionLabel', type: 'string', default: 'Cancel' },
            { name: 'onSecondaryAction', type: '() => void', description: 'Defaults to onClose.' },
            { name: 'loading', type: 'boolean', default: 'false', description: 'Disables both action buttons.' },
          ]}
        />
      </DemoSection>
    </Stack>
  )
}
