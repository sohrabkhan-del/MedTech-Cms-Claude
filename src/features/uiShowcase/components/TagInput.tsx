import { useState } from 'react'
import { Chip, Stack, TextField } from '@mui/material'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

/** Simple Enter-to-add / click-to-remove tag input — no dedicated component exists in the codebase yet. */
export function TagInput({ tags, onChange, placeholder = 'Add a tag and press Enter' }: TagInputProps) {
  const [draft, setDraft] = useState('')

  function addTag() {
    const value = draft.trim()
    if (value && !tags.includes(value)) onChange([...tags, value])
    setDraft('')
  }

  return (
    <Stack spacing={1}>
      <TextField
        size="small"
        placeholder={placeholder}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            addTag()
          }
        }}
      />
      {tags.length > 0 && (
        <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap' }}>
          {tags.map((tag) => (
            <Chip key={tag} label={tag} size="small" onDelete={() => onChange(tags.filter((t) => t !== tag))} />
          ))}
        </Stack>
      )}
    </Stack>
  )
}
