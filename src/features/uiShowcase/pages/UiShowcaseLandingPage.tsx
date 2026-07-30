import { Card, CardActionArea, Grid, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid, LayoutTemplate } from 'lucide-react'
import { ShowcasePageHeader } from '../components/ShowcasePageHeader'
import { componentDemos } from '../registry'
import type { ComponentDemoCategory } from '../types'

interface UiShowcaseLandingPageProps {
  category: ComponentDemoCategory
}

const CATEGORY_META: Record<
  ComponentDemoCategory,
  { icon: typeof LayoutGrid; title: string; subtitle: string }
> = {
  component: {
    icon: LayoutGrid,
    title: 'UI Component Library',
    subtitle:
      'A living reference of shared components used across the app — variants, states, and copy-paste usage snippets.',
  },
  'page-template': {
    icon: LayoutTemplate,
    title: 'Page Templates',
    subtitle:
      'Full page compositions built from the component library — previews you can adapt for real features.',
  },
}

export function UiShowcaseLandingPage({ category }: UiShowcaseLandingPageProps) {
  const navigate = useNavigate()
  const meta = CATEGORY_META[category]
  const demos = componentDemos.filter((demo) => demo.category === category)

  return (
    <>
      <ShowcasePageHeader icon={<meta.icon size={20} />} title={meta.title} subtitle={meta.subtitle} />

      <Grid container spacing={2.5}>
        {demos.map(({ slug, label, description, icon: Icon }) => (
          <Grid key={slug} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Card sx={{ height: '100%' }}>
              <CardActionArea
                onClick={() => navigate(`/ui/${slug}`)}
                sx={{ height: '100%', p: 2.5 }}
              >
                <Stack spacing={1.5} sx={{ height: '100%' }}>
                  <Stack
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '10px',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'primary.light',
                      color: 'primary.main',
                    }}
                  >
                    <Icon size={18} />
                  </Stack>
                  <Stack spacing={0.5}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>{label}</Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                      {description}
                    </Typography>
                  </Stack>
                </Stack>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  )
}
