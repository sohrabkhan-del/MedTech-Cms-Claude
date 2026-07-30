import { Breadcrumbs as MuiBreadcrumbs, Link, Stack, Typography } from '@mui/material'
import { ChevronRight } from 'lucide-react'
import { DemoSection } from '../components/DemoSection'
import { CodeBlock } from '../components/CodeBlock'
import { PropsTable } from '../components/PropsTable'

const usageCode = `// The app's global Breadcrumbs (src/components/layout/Breadcrumbs/Breadcrumbs.tsx)
// is route-driven and takes no props — it derives its trail from the current
// URL via routeConfig. For arbitrary/standalone breadcrumbs, build a small
// items-based version in the same visual style:

interface BreadcrumbItem { label: string; href?: string }

function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <Breadcrumbs separator={<ChevronRight size={20} />} sx={{ fontSize: '0.8rem' }}>
      {items.map((item, i) =>
        item.href && i < items.length - 1 ? (
          <Link key={item.label} href={item.href} underline="hover" color="text.secondary">
            {item.label}
          </Link>
        ) : (
          <Typography key={item.label} color="text.primary" sx={{ fontWeight: 600 }}>
            {item.label}
          </Typography>
        ),
      )}
    </Breadcrumbs>
  )
}`

interface BreadcrumbItem {
  label: string
  href?: string
}

function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <MuiBreadcrumbs separator={<ChevronRight size={20} />} sx={{ fontSize: '0.8rem' }}>
      {items.map((item, i) =>
        item.href && i < items.length - 1 ? (
          <Link key={item.label} href={item.href} underline="hover" color="text.secondary" onClick={(e) => e.preventDefault()}>
            {item.label}
          </Link>
        ) : (
          <Typography key={item.label} color="text.primary" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
            {item.label}
          </Typography>
        ),
      )}
    </MuiBreadcrumbs>
  )
}

export function BreadcrumbDemo() {
  return (
    <Stack spacing={4}>
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        The app's global <code>Breadcrumbs</code> is route-driven and takes no props — it reads the current URL. This demo
        shows a standalone, items-based version in the same visual style (ChevronRight separator, muted links, bold current
        page) for cases where you need arbitrary breadcrumbs.
      </Typography>

      <DemoSection title="2-level trail">
        <Breadcrumb items={[{ label: 'Home', href: '/dashboard' }, { label: 'Dealers' }]} />
      </DemoSection>

      <DemoSection title="4-level trail" description="Deeper trails still render every level; the current page stays non-clickable and bold.">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/dashboard' },
            { label: 'Inventory Management', href: '/inventory/product-master' },
            { label: 'Factory Inventory Upload', href: '/inventory/factory-inventory-upload' },
            { label: 'Batch #BMR-2024-0091' },
          ]}
        />
      </DemoSection>

      <DemoSection title="Current-page (non-clickable) state" description="The last item always renders as plain bold text — no href, no hover, no click.">
        <Breadcrumb items={[{ label: 'Home', href: '/dashboard' }, { label: 'Settings', href: '/settings/profile' }, { label: 'Profile' }]} />
      </DemoSection>

      <DemoSection title="Usage">
        <CodeBlock code={usageCode} />
      </DemoSection>

      <DemoSection title="Props">
        <PropsTable
          rows={[
            { name: 'items', type: '{ label: string; href?: string }[]', description: 'Last item renders as the non-clickable current page regardless of href.' },
          ]}
        />
      </DemoSection>
    </Stack>
  )
}
