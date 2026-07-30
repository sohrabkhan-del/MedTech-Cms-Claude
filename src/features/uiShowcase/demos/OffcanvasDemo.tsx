import { useState } from 'react'
import { Box, Button, Drawer, IconButton, Stack, Typography } from '@mui/material'
import { X } from 'lucide-react'
import { radius } from '@/theme/tokens'
import { DemoSection } from '../components/DemoSection'
import { CodeBlock } from '../components/CodeBlock'
import { PropsTable } from '../components/PropsTable'

const usageCode = `import { Drawer } from '@mui/material'

// Same primitive used by FilterDrawer (src/components/common/FilterDrawer/FilterDrawer.tsx)
<Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
  <Box sx={{ width: 320, p: 3 }}>
    ...panel content...
  </Box>
</Drawer>`

type Anchor = 'left' | 'right' | 'top' | 'bottom'

function PanelContent({ anchor, onClose }: { anchor: Anchor; onClose: () => void }) {
  const isHorizontal = anchor === 'top' || anchor === 'bottom'
  return (
    <Box sx={{ width: isHorizontal ? '100%' : 320, p: 3 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography sx={{ fontWeight: 700, textTransform: 'capitalize' }}>{anchor} panel</Typography>
        <IconButton size="small" onClick={onClose} aria-label="Close">
          <X size={18} />
        </IconButton>
      </Stack>
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        Slide-in panel anchored from the {anchor}. The overlay behind it (MUI's Backdrop) dismisses it on click, same as
        the app's FilterDrawer.
      </Typography>
    </Box>
  )
}

export function OffcanvasDemo() {
  const [open, setOpen] = useState<Anchor | null>(null)

  return (
    <Stack spacing={4}>
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        Built on MUI <code>Drawer</code> — the same primitive behind{' '}
        <code>FilterDrawer</code> (src/components/common/FilterDrawer/FilterDrawer.tsx), generalized here to all four anchors.
      </Typography>

      <DemoSection title="Anchors">
        <Button variant="outlined" onClick={() => setOpen('left')}>From left</Button>
        <Button variant="outlined" onClick={() => setOpen('right')}>From right</Button>
        <Button variant="outlined" onClick={() => setOpen('top')}>From top</Button>
        <Button variant="outlined" onClick={() => setOpen('bottom')}>From bottom</Button>
      </DemoSection>

      {(['left', 'right', 'top', 'bottom'] as Anchor[]).map((anchor) => (
        <Drawer
          key={anchor}
          anchor={anchor}
          open={open === anchor}
          onClose={() => setOpen(null)}
        >
          <PanelContent anchor={anchor} onClose={() => setOpen(null)} />
        </Drawer>
      ))}

      <DemoSection title="Usage">
        <CodeBlock code={usageCode} />
      </DemoSection>

      <DemoSection title="Props (subset)">
        <PropsTable
          rows={[
            { name: 'anchor', type: "'left' | 'right' | 'top' | 'bottom'", default: 'left' },
            { name: 'open', type: 'boolean' },
            { name: 'onClose', type: '() => void', description: 'Called on backdrop click or Escape.' },
            { name: 'variant', type: "'temporary' | 'persistent' | 'permanent'", default: 'temporary' },
          ]}
        />
      </DemoSection>

      <DemoSection title={`Style reference — radius.${'lg'}`}>
        <Box
          sx={{
            width: 240,
            p: 2,
            borderRadius: `${radius.lg}px`,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            FilterDrawer uses this same radius token for its panel content blocks.
          </Typography>
        </Box>
      </DemoSection>
    </Stack>
  )
}
