import { Box, Divider, Stack, ToggleButton } from '@mui/material'
import { Bold, Italic, List, ListOrdered, Quote, Redo, Strikethrough, Undo } from 'lucide-react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { radius } from '@/theme/tokens'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  minHeight?: number
}

/** Minimal Tiptap-based WYSIWYG editor for the Edit Post showcase — toolbar covers bold/italic/strike/lists/quote/undo-redo. */
export function RichTextEditor({ content, onChange, minHeight = 220 }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
  })

  if (!editor) return null

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: `${radius.md}px`, overflow: 'hidden' }}>
      <Stack direction="row" spacing={0.5} sx={{ p: 1, flexWrap: 'wrap', borderBottom: '1px solid', borderColor: 'divider' }}>
        <ToggleButton
          value="bold"
          size="small"
          selected={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold size={14} />
        </ToggleButton>
        <ToggleButton
          value="italic"
          size="small"
          selected={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic size={14} />
        </ToggleButton>
        <ToggleButton
          value="strike"
          size="small"
          selected={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough size={14} />
        </ToggleButton>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        <ToggleButton
          value="bulletList"
          size="small"
          selected={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List size={14} />
        </ToggleButton>
        <ToggleButton
          value="orderedList"
          size="small"
          selected={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered size={14} />
        </ToggleButton>
        <ToggleButton
          value="blockquote"
          size="small"
          selected={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote size={14} />
        </ToggleButton>
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        <ToggleButton value="undo" size="small" onClick={() => editor.chain().focus().undo().run()}>
          <Undo size={14} />
        </ToggleButton>
        <ToggleButton value="redo" size="small" onClick={() => editor.chain().focus().redo().run()}>
          <Redo size={14} />
        </ToggleButton>
      </Stack>
      <Box
        sx={{
          p: 2,
          minHeight,
          fontSize: '0.875rem',
          '& .ProseMirror': { outline: 'none', minHeight },
          '& p': { margin: '0 0 8px' },
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Box>
  )
}
