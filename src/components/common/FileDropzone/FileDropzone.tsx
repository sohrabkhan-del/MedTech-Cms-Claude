import { useEffect, useMemo, useRef, useState } from 'react'
import type { DragEvent } from 'react'
import { Box, IconButton, Stack, Typography } from '@mui/material'
import { FileUp as UploadFileOutlined, FileText as DescriptionOutlined, Trash2, CircleCheck as CheckCircleOutlined } from 'lucide-react'
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
  /** Preview to show when a file was already selected but only its URL/name is known (e.g. edit mode, no raw File). Ignored once a new file is dropped. */
  existingPreview?: { url: string; name: string } | null
}

export function FileDropzone({ file, onSelect, onRemove, accept, helperText, existingPreview }: FileDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  const isImage = file ? file.type.startsWith('image/') : accept.includes('image')

  const objectUrl = useMemo(() => {
    if (!file || !isImage) return null
    return URL.createObjectURL(file)
  }, [file, isImage])

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [objectUrl])

  const previewUrl = objectUrl ?? (!file ? existingPreview?.url ?? null : null)
  const displayName = file?.name ?? existingPreview?.name ?? ''
  const hasSelection = Boolean(file || existingPreview)

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) onSelect(dropped)
  }

  return (
    <Box
      onDragOver={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(true)
      }}
      onDragEnter={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(true)
      }}
      onDragLeave={(e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.currentTarget.contains(e.relatedTarget as Node)) return
        setDragActive(false)
      }}
      onDrop={handleDrop}
      onClick={() => !hasSelection && fileInputRef.current?.click()}
      sx={{
        border: '2px dashed',
        borderColor: dragActive ? 'primary.main' : hasSelection ? 'success.main' : 'divider',
        borderRadius: `${radius.lg}px`,
        backgroundColor: dragActive ? 'primary.light' : 'background.default',
        py: hasSelection ? 2.5 : 4,
        px: 3,
        textAlign: 'center',
        cursor: hasSelection ? 'default' : 'pointer',
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
          e.target.value = ''
        }}
      />

      {!hasSelection ? (
        <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            component="span"
            sx={{
              display: 'inline-flex',
              color: dragActive ? 'primary.main' : 'text.secondary',
              transition: 'color 150ms, transform 150ms',
              transform: dragActive ? 'scale(1.1)' : 'none',
            }}
          >
            <UploadFileOutlined size={32} />
          </Box>
          <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
            {dragActive ? 'Drop your file here' : 'Drag & drop your file here'}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {helperText ?? `or click to browse — accepts ${accept}`}
          </Typography>
        </Stack>
      ) : (
        <Stack spacing={1.5} sx={{ alignItems: 'stretch', maxWidth: 420, mx: 'auto' }}>
          {isImage && previewUrl ? (
            <Box
              sx={{
                position: 'relative',
                borderRadius: `${radius.md}px`,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                backgroundImage:
                  'linear-gradient(45deg, rgba(0,0,0,0.04) 25%, transparent 25%), linear-gradient(-45deg, rgba(0,0,0,0.04) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.04) 75%), linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.04) 75%)',
                backgroundSize: '16px 16px',
                backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
              }}
            >
              <Box
                component="img"
                src={previewUrl}
                alt={displayName}
                sx={{
                  display: 'block',
                  width: '100%',
                  maxHeight: 220,
                  objectFit: 'contain',
                }}
              />
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove()
                }}
                aria-label="Remove file"
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  color: 'error.main',
                  backgroundColor: 'background.paper',
                  boxShadow: 1,
                  '&:hover': { backgroundColor: 'background.paper' },
                }}
              >
                <Trash2 size={16} />
              </IconButton>
            </Box>
          ) : null}

          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', textAlign: 'left' }}>
            {!isImage && (
              <Box component="span" sx={{ display: 'inline-flex', color: 'primary.main' }}>
                <DescriptionOutlined />
              </Box>
            )}
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.8125rem' }} noWrap>
                {displayName}
              </Typography>
              {file && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {formatFileSize(file.size)}
                </Typography>
              )}
            </Box>
            {!isImage && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove()
                }}
                aria-label="Remove file"
                sx={{ color: 'error.main' }}
              >
                <Trash2 size={20} />
              </IconButton>
            )}
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
