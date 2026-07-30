import { useState } from 'react'
import { Button, Stack, TextField, Typography } from '@mui/material'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { FileDropzone } from '@/components/common/FileDropzone/FileDropzone'
import { RichTextEditor } from '../components/RichTextEditor'
import { TagInput } from '../components/TagInput'
import { DemoSection } from '../components/DemoSection'
import { CodeBlock } from '../components/CodeBlock'

const usageCode = `import { RichTextEditor } from '@/features/uiShowcase/components/RichTextEditor'
import { TagInput } from '@/features/uiShowcase/components/TagInput'
import { FileDropzone } from '@/components/common/FileDropzone/FileDropzone'

<TextField label="Title" fullWidth />
<RichTextEditor content={body} onChange={setBody} />
<TagInput tags={tags} onChange={setTags} />
<FileDropzone file={image} onSelect={setImage} onRemove={() => setImage(null)} accept="image/*" />`

export function EditPostDemo() {
  const [title, setTitle] = useState('How AI-Assisted Scan Verification Cuts Counterfeit Reports by 40%')
  const [body, setBody] = useState(
    '<p>Our field-operations team has been piloting an AI-assisted verification layer on top of the existing scan pipeline.</p>',
  )
  const [tags, setTags] = useState<string[]>(['Field Operations', 'Security'])
  const [image, setImage] = useState<File | null>(null)
  const [saved, setSaved] = useState<'draft' | 'published' | null>(null)

  return (
    <Stack spacing={4}>
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        A blog post editor composed from a new lightweight Tiptap-based <code>RichTextEditor</code>, a new <code>TagInput</code>,
        and the existing <code>FileDropzone</code> for the featured image — no post-editing UI existed in the codebase before this.
      </Typography>

      {saved && (
        <Typography variant="body1" sx={{ color: 'success.main', fontWeight: 600 }}>
          {saved === 'draft' ? 'Draft saved.' : 'Post published.'}
        </Typography>
      )}

      <DemoSection title="Editor">
        <Stack spacing={2.5} sx={{ width: '100%' }}>
          <SectionCard title="Post Details">
            <Stack spacing={2}>
              <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
              <RichTextEditor content={body} onChange={setBody} />
            </Stack>
          </SectionCard>

          <SectionCard title="Tags">
            <TagInput tags={tags} onChange={setTags} />
          </SectionCard>

          <SectionCard title="Featured Image">
            <FileDropzone
              file={image}
              onSelect={setImage}
              onRemove={() => setImage(null)}
              accept="image/*"
              helperText="PNG or JPG, up to 2MB"
            />
          </SectionCard>

          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" onClick={() => setSaved('draft')}>
              Save Draft
            </Button>
            <Button variant="contained" onClick={() => setSaved('published')}>
              Publish
            </Button>
          </Stack>
        </Stack>
      </DemoSection>

      <DemoSection title="Usage">
        <CodeBlock code={usageCode} />
      </DemoSection>
    </Stack>
  )
}
