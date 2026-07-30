import { Box, Card, CardActionArea, Chip, Grid, Stack, Typography } from '@mui/material'
import { CalendarDays } from 'lucide-react'
import { radius } from '@/theme/tokens'
import { mockBlogPosts } from '../mockBlogPosts'
import { DemoSection } from '../components/DemoSection'
import { CodeBlock } from '../components/CodeBlock'

const usageCode = `import { mockBlogPosts } from '@/features/uiShowcase/mockBlogPosts'

<Grid container spacing={3}>
  {mockBlogPosts.map((post) => (
    <Grid key={post.id} size={{ xs: 12, sm: 6, lg: 4 }}>
      <BlogPostCard post={post} />
    </Grid>
  ))}
</Grid>`

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function BlogDemo() {
  return (
    <Stack spacing={4}>
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        A blog listing page composed from existing primitives — Card, Chip, Avatar-style thumbnail block — with mock post
        data. Click a card to see the matching Blog Details template.
      </Typography>

      <DemoSection title="Post grid" description="Thumbnail, title, excerpt, author, date, and tags — each card links to /ui/blog-details.">
        <Grid container spacing={3} sx={{ width: '100%' }}>
          {mockBlogPosts.map((post) => (
            <Grid key={post.id} size={{ xs: 12, sm: 6, lg: 3 }}>
              <Card sx={{ height: '100%' }}>
                <CardActionArea sx={{ height: '100%' }}>
                  <Box
                    sx={{
                      height: 120,
                      backgroundColor: post.thumbnailColor,
                      borderTopLeftRadius: `${radius.lg}px`,
                      borderTopRightRadius: `${radius.lg}px`,
                    }}
                  />
                  <Stack spacing={1.25} sx={{ p: 2 }}>
                    <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap' }}>
                      {post.tags.slice(0, 2).map((tag) => (
                        <Chip key={tag} label={tag} size="small" variant="outlined" />
                      ))}
                    </Stack>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', lineHeight: 1.35 }}>
                      {post.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                      {post.excerpt}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', pt: 0.5 }}>
                      <Box
                        sx={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'primary.light',
                          color: 'primary.main',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                        }}
                      >
                        {post.authorInitial}
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>{post.author}</Typography>
                      <CalendarDays size={12} style={{ opacity: 0.5, marginLeft: 4 }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {formatDate(post.date)}
                      </Typography>
                    </Stack>
                  </Stack>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </DemoSection>

      <DemoSection title="Usage">
        <CodeBlock code={usageCode} />
      </DemoSection>
    </Stack>
  )
}
