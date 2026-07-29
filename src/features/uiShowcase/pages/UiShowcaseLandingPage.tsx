import { Card, CardActionArea, Grid, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid } from 'lucide-react'
import { ShowcasePageHeader } from '../components/ShowcasePageHeader'
import { componentDemos } from '../registry'

export function UiShowcaseLandingPage() {
  const navigate = useNavigate()

  return (
    <>
      <ShowcasePageHeader
        icon={<LayoutGrid size={20} />}
        title="UI Component Library"
        subtitle="A living reference of shared components used across the app — variants, states, and copy-paste usage snippets."
      />

      <Grid container spacing={2.5}>
        {componentDemos.map(({ slug, label, description, icon: Icon }) => (
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
