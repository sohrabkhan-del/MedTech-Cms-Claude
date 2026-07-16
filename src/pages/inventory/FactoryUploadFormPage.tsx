import { useRef, useState } from 'react'
import type { DragEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, IconButton, Stack, Typography, LinearProgress } from '@mui/material'
import UploadFileOutlined from '@mui/icons-material/UploadFileOutlined'
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined'
import CloseOutlined from '@mui/icons-material/CloseOutlined'
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined'
import DownloadOutlined from '@mui/icons-material/DownloadOutlined'
import FactoryOutlined from '@mui/icons-material/FactoryOutlined'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { radius } from '@/theme/tokens'
import { addFactoryBatch, buildNewBatchFromUpload } from '@/features/inventory/mockFactoryUploads'

type UploadStage = 'idle' | 'selected' | 'validating' | 'validated'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FactoryUploadFormPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [stage, setStage] = useState<UploadStage>('idle')
  const [file, setFile] = useState<File | null>(null)

  const recordCount = file ? 40 + (file.name.length % 20) * 7 : 0

  const handleFile = (selected: File) => {
    setFile(selected)
    setStage('selected')
    setTimeout(() => setStage('validating'), 50)
    setTimeout(() => setStage('validated'), 1300)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) handleFile(dropped)
  }

  const handleReset = () => {
    setFile(null)
    setStage('idle')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleConfirmUpload = () => {
    if (!file) return
    const batch = buildNewBatchFromUpload(file.name)
    addFactoryBatch(batch)
    navigate(`/inventory/factory-inventory-upload/${batch.id}`)
  }

  return (
    <>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2.5 }}>
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
          <FactoryOutlined fontSize="small" />
        </Stack>
        <Stack>
          <Typography variant="h1">Upload Manifest</Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Import a new production batch from the factory manifest file.
          </Typography>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Upload Section">
          <Box
            onDragOver={(e) => {
              e.preventDefault()
              setDragActive(true)
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => stage === 'idle' && fileInputRef.current?.click()}
            sx={{
              border: '2px dashed',
              borderColor: dragActive ? 'primary.main' : 'divider',
              borderRadius: `${radius.lg}px`,
              backgroundColor: dragActive ? 'primary.light' : 'background.default',
              py: 5,
              px: 3,
              textAlign: 'center',
              cursor: stage === 'idle' ? 'pointer' : 'default',
              transition: 'border-color 150ms, background-color 150ms',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xls,.xlsx"
              hidden
              onChange={(e) => {
                const selected = e.target.files?.[0]
                if (selected) handleFile(selected)
              }}
            />

            {stage === 'idle' && (
              <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
                <UploadFileOutlined sx={{ fontSize: 40, color: 'text.secondary' }} />
                <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem' }}>
                  Drag & drop your manifest file here
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  or click to browse — accepts .xls, .xlsx
                </Typography>
              </Stack>
            )}

            {stage !== 'idle' && file && (
              <Stack spacing={2} sx={{ alignItems: 'stretch', maxWidth: 420, mx: 'auto' }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', textAlign: 'left' }}>
                  <DescriptionOutlined sx={{ color: 'primary.main' }} />
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
                      handleReset()
                    }}
                    aria-label="Remove file"
                  >
                    <CloseOutlined fontSize="small" />
                  </IconButton>
                </Stack>

                {stage === 'validating' && (
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Validating manifest…
                    </Typography>
                    <LinearProgress sx={{ mt: 0.5, borderRadius: 4 }} />
                  </Box>
                )}

                {stage === 'validated' && (
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
                    <CheckCircleOutlined fontSize="small" />
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                      {recordCount.toLocaleString('en-IN')} records validated · 0 errors
                    </Typography>
                  </Stack>
                )}
              </Stack>
            )}
          </Box>

          <Stack direction="row" spacing={1.5} sx={{ mt: 2.5, justifyContent: 'flex-end' }}>
            <Button variant="outlined" startIcon={<DownloadOutlined fontSize="small" />} onClick={() => {}}>
              Download Upload Template
            </Button>
            <Button
              variant="contained"
              disabled={stage !== 'validated'}
              onClick={handleConfirmUpload}
            >
              Confirm Upload
            </Button>
          </Stack>
        </SectionCard>

        <SectionCard title="Upload Instructions">
          <Stack component="ul" spacing={1} sx={{ pl: 2.5, m: 0 }}>
            {[
              'File must be in .xls or .xlsx format only.',
              'The first row must contain column headers matching the manifest template.',
              'Serial number ranges must not overlap with any previously uploaded batch.',
              'Each row must include a valid container number and box number.',
              'Maximum file size: 25 MB per upload.',
              'Duplicate barcode numbers within the same file will be rejected.',
            ].map((line) => (
              <Typography key={line} component="li" variant="body1" sx={{ color: 'text.secondary' }}>
                {line}
              </Typography>
            ))}
          </Stack>
        </SectionCard>
      </Stack>
    </>
  )
}
