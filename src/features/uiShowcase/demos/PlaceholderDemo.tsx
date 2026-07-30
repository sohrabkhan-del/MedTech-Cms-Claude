import { Box, Card, Skeleton, Stack, Typography } from '@mui/material'
import { SkeletonLoader } from '@/components/common/SkeletonLoader/SkeletonLoader'
import { StatCardSkeleton } from '@/components/common/StatCard/StatCardSkeleton'
import { WidgetCardSkeleton } from '@/components/common/WidgetCard/WidgetCardSkeleton'
import { radius } from '@/theme/tokens'
import { DemoSection } from '../components/DemoSection'
import { CodeBlock } from '../components/CodeBlock'
import { PropsTable } from '../components/PropsTable'

const usageCode = `import { SkeletonLoader } from '@/components/common/SkeletonLoader/SkeletonLoader'
import { Skeleton } from '@mui/material'

<SkeletonLoader variant="text-block" rows={4} />
<SkeletonLoader variant="table-rows" rows={5} />
<SkeletonLoader variant="card" />

// Raw MUI Skeleton for avatar / image placeholders
<Skeleton variant="circular" width={48} height={48} />
<Skeleton variant="rounded" height={160} />`

export function PlaceholderDemo() {
  return (
    <Stack spacing={4}>
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        The app's shared <code>SkeletonLoader</code> covers text blocks, table rows, and simple cards; dedicated skeleton
        variants exist alongside <code>StatCard</code> and <code>WidgetCard</code> for their loading states.
      </Typography>

      <DemoSection title="Text lines" description="SkeletonLoader variant=&quot;text-block&quot; — the last line is shorter to read naturally.">
        <Box sx={{ width: '100%', maxWidth: 420, border: '1px solid', borderColor: 'divider', borderRadius: `${radius.md}px` }}>
          <SkeletonLoader variant="text-block" rows={4} />
        </Box>
      </DemoSection>

      <DemoSection title="Avatar circle" description="Raw MUI Skeleton variant=&quot;circular&quot;, paired with text lines to mimic a user row.">
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Skeleton variant="circular" width={48} height={48} />
          <Stack spacing={0.5}>
            <Skeleton variant="text" width={140} height={18} />
            <Skeleton variant="text" width={90} height={14} />
          </Stack>
        </Stack>
      </DemoSection>

      <DemoSection title="Card skeleton" description="SkeletonLoader variant=&quot;card&quot; — a title line plus a rounded content block.">
        <Box sx={{ width: '100%', maxWidth: 320, border: '1px solid', borderColor: 'divider', borderRadius: `${radius.md}px` }}>
          <SkeletonLoader variant="card" />
        </Box>
      </DemoSection>

      <DemoSection title="Table rows" description="SkeletonLoader variant=&quot;table-rows&quot; — used by CommonTable while data loads.">
        <Box sx={{ width: '100%', maxWidth: 480, border: '1px solid', borderColor: 'divider', borderRadius: `${radius.md}px` }}>
          <SkeletonLoader variant="table-rows" rows={4} />
        </Box>
      </DemoSection>

      <DemoSection title="Image skeleton" description="Raw MUI Skeleton variant=&quot;rounded&quot; sized like an image placeholder.">
        <Box sx={{ width: 240 }}>
          <Skeleton variant="rounded" height={140} sx={{ borderRadius: `${radius.lg}px` }} />
        </Box>
      </DemoSection>

      <DemoSection title="Composed: StatCard & WidgetCard skeletons" description="Purpose-built skeletons matching their loaded-state layout exactly.">
        <Box sx={{ width: 220 }}>
          <StatCardSkeleton />
        </Box>
        <Box sx={{ width: 280 }}>
          <WidgetCardSkeleton rows={3} />
        </Box>
      </DemoSection>

      <DemoSection title="Usage">
        <CodeBlock code={usageCode} />
      </DemoSection>

      <DemoSection title="Props — SkeletonLoader">
        <PropsTable
          rows={[
            { name: 'variant', type: "'text-block' | 'table-rows' | 'card'", default: 'text-block' },
            { name: 'rows', type: 'number', default: '5' },
          ]}
        />
      </DemoSection>

      <Card sx={{ p: 2 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Both StatCardSkeleton and WidgetCardSkeleton use only text/rounded/circular Skeleton variants — no wave/pulse
          animation overrides — to match this project's convention.
        </Typography>
      </Card>
    </Stack>
  )
}
