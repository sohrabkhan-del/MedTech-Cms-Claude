import { useRef, useState } from 'react'
import type { DragEvent } from 'react'
import { Box, IconButton, Stack, Typography } from '@mui/material'
import { FileUp as UploadFileOutlined, FileText as DescriptionOutlined, X as CloseOutlined, CircleCheck as CheckCircleOutlined } from 'lucide-react'
import { radius } from '@/theme/tokens'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface FileDropzoneProps {
  file: File | null
  onSelect: (file: File) => void
  onRemove: () => void
  accept: string
  helperText?: string
}

export function FileDropzone({ file, onSelect, onRemove, accept, helperText }: FileDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) onSelect(dropped)
  }

  return (
    <Box
      onDragOver={(e) => {
        e.preventDefault()
        setDragActive(true)
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      onClick={() => !file && fileInputRef.current?.click()}
      sx={{
        border: '2px dashed',
        borderColor: dragActive ? 'primary.main' : 'divider',
        borderRadius: `${radius.lg}px`,
        backgroundColor: dragActive ? 'primary.light' : 'background.default',
        py: 4,
        px: 3,
        textAlign: 'center',
        cursor: file ? 'default' : 'pointer',
        transition: 'border-color 150ms, background-color 150ms',
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => {
          const selected = e.target.files?.[0]
          if (selected) onSelect(selected)
        }}
      />

      {!file ? (
        <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box component="span" sx={{ display: 'inline-flex', color: 'text.secondary' }}>
            <UploadFileOutlined size={32} />
          </Box>
          <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Drag & drop your file here</Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {helperText ?? `or click to browse — accepts ${accept}`}
          </Typography>
        </Stack>
      ) : (
        <Stack spacing={1.5} sx={{ alignItems: 'stretch', maxWidth: 420, mx: 'auto' }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', textAlign: 'left' }}>
            <Box component="span" sx={{ display: 'inline-flex', color: 'primary.main' }}>
              <DescriptionOutlined />
            </Box>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem' }} noWrap>
                {file.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {formatFileSize(file.size)}
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                onRemove()
              }}
              aria-label="Remove file"
            >
              <CloseOutlined size={20} />
            </IconButton>
          </Stack>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: 'center',
              backgroundColor: 'success.light',
              color: 'success.dark',
              borderRadius: `${radius.md}px`,
              px: 1.5,
              py: 1,
              textAlign: 'left',
            }}
          >
            <CheckCircleOutlined size={20} />
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>File selected</Typography>
          </Stack>
        </Stack>
      )}
    </Box>
  )
}
