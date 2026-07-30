import { Box, Card, Chip, Grid, Stack, Typography } from '@mui/material'
import { CalendarDays } from 'lucide-react'
import { radius } from '@/theme/tokens'
import { mockBlogPosts } from '../mockBlogPosts'
import { DemoSection } from '../components/DemoSection'
import { CodeBlock } from '../components/CodeBlock'

const usageCode = `import { getMockBlogPostById, mockBlogPosts } from '@/features/uiShowcase/mockBlogPosts'

const post = getMockBlogPostById(postId)
const related = mockBlogPosts.filter((p) => p.id !== post.id).slice(0, 3)`

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function BlogDetailsDemo() {
  const post = mockBlogPosts[0]
  const related = mockBlogPosts.slice(1)

  return (
    <Stack spacing={4}>
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        A single-post detail template — hero block, author/date meta, body content, and a related-posts section.
      </Typography>

      <DemoSection title="Post detail">
        <Card sx={{ width: '100%', overflow: 'hidden' }}>
          <Box sx={{ height: 220, backgroundColor: post.thumbnailColor }} />
          <Stack spacing={2.5} sx={{ p: { xs: 2.5, sm: 4 } }}>
            <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap' }}>
              {post.tags.map((tag) => (
                <Chip key={tag} label={tag} size="small" color="primary" variant="outlined" />
              ))}
            </Stack>

            <Typography variant="h1" sx={{ fontSize: { xs: '1.375rem', sm: '1.75rem' } }}>
              {post.title}
            </Typography>

            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'primary.light',
                  color: 'primary.main',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                }}
              >
                {post.authorInitial}
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>{post.author}</Typography>
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <CalendarDays size={12} style={{ opacity: 0.5 }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {formatDate(post.date)}
                  </Typography>
                </Stack>
              </Box>
            </Stack>

            <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.8 }}>
              {post.body}
            </Typography>
          </Stack>
        </Card>
      </DemoSection>

      <DemoSection title="Related posts">
        <Grid container spacing={2} sx={{ width: '100%' }}>
          {related.map((r) => (
            <Grid key={r.id} size={{ xs: 12, sm: 4 }}>
              <Card sx={{ p: 2, height: '100%' }}>
                <Box sx={{ height: 64, backgroundColor: r.thumbnailColor, borderRadius: `${radius.md}px`, mb: 1.5 }} />
                <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', lineHeight: 1.35, mb: 0.5 }}>
                  {r.title}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {formatDate(r.date)}
                </Typography>
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
