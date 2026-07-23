import { useRef, useState } from 'react'
import type { DragEvent } from 'react'
import { Box, IconButton, Stack, Typography } from '@mui/material'
import { FileUp as UploadFileOutlined, FileText as DescriptionOutlined, X as CloseOutlined } from 'lucide-react'
import { radius } from '@/theme/tokens'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface MultiFileDropzoneProps {
  files: File[]
  onAdd: (files: File[]) => void
  onRemove: (index: number) => void
  accept: string
  helperText?: string
}

export function MultiFileDropzone({ files, onAdd, onRemove, accept, helperText }: MultiFileDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files?.length) onAdd(Array.from(e.dataTransfer.files))
  }

  return (
    <Stack spacing={1.5}>
      <Box
        onDragOver={(e) => {
          e.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        sx={{
          border: '2px dashed',
          borderColor: dragActive ? 'primary.main' : 'divider',
          borderRadius: `${radius.lg}px`,
          backgroundColor: dragActive ? 'primary.light' : 'background.default',
          py: 4,
          px: 3,
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'border-color 150ms, background-color 150ms',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files?.length) onAdd(Array.from(e.target.files))
            e.target.value = ''
          }}
        />

        <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box component="span" sx={{ display: 'inline-flex', color: 'text.secondary' }}>
            <UploadFileOutlined size={32} />
          </Box>
          <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Drag & drop your files here</Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {helperText ?? `or click to browse — accepts ${accept}`}
          </Typography>
        </Stack>
      </Box>

      {files.length > 0 && (
        <Stack spacing={1}>
          {files.map((file, index) => (
            <Stack
              key={`${file.name}-${file.lastModified}-${index}`}
              direction="row"
              spacing={1.5}
              sx={{
                alignItems: 'center',
                textAlign: 'left',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: `${radius.md}px`,
                px: 1.5,
                py: 1,
              }}
            >
              <Box component="span" sx={{ display: 'inline-flex', color: 'primary.main' }}>
                <DescriptionOutlined size={20} />
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
                  onRemove(index)
                }}
                aria-label={`Remove ${file.name}`}
              >
                <CloseOutlined size={18} />
              </IconButton>
            </Stack>
          ))}
        </Stack>
      )}
    </Stack>
  )
}
