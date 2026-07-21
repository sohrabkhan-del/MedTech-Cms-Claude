import { useRef, useState } from 'react'
import type { DragEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, IconButton, Stack, Typography } from '@mui/material'
import {
  FileUp as UploadFileOutlined,
  FileText as DescriptionOutlined,
  X as CloseOutlined,
  CircleCheck as CheckCircleOutlined,
  Download as DownloadOutlined,
  Factory as FactoryOutlined,
} from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { radius } from '@/theme/tokens'
import { useFactoryUpload } from '@/features/inventoryManagement/hooks/useFactoryUpload'

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
}

function FileDropzone({ file, onSelect, onRemove, accept }: FileDropzoneProps) {
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
            or click to browse — accepts {accept}
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

export function FactoryUploadFormPage() {
  const navigate = useNavigate()
  const [manifestFile, setManifestFile] = useState<File | null>(null)
  const [supportingFile, setSupportingFile] = useState<File | null>(null)
  const { uploadFiles, isUploading } = useFactoryUpload()

  const bothSelected = !!manifestFile && !!supportingFile

  const handleContinue = async () => {
    if (!manifestFile || !supportingFile) return
    const batch = await uploadFiles(manifestFile, supportingFile)
    if (batch) navigate(`/inventory/factory-inventory-upload/${batch.id}`)
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
          <FactoryOutlined size={20} />
        </Stack>
        <Stack>
          <Typography variant="h1">Upload Manifest</Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Import a new production batch from the factory manifest and supporting files.
          </Typography>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Manifest File">
          <FileDropzone
            file={manifestFile}
            onSelect={setManifestFile}
            onRemove={() => setManifestFile(null)}
            accept=".xls,.xlsx"
          />
        </SectionCard>

        <SectionCard title="Supporting File">
          <FileDropzone
            file={supportingFile}
            onSelect={setSupportingFile}
            onRemove={() => setSupportingFile(null)}
            accept=".xls,.xlsx,.csv"
          />
        </SectionCard>

        <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
          <Button variant="outlined" startIcon={<DownloadOutlined size={20} />} onClick={() => {}}>
            Download Upload Template
          </Button>
          <Button variant="contained" disabled={!bothSelected} loading={isUploading} onClick={handleContinue}>
            Continue
          </Button>
        </Stack>

        <SectionCard title="Upload Instructions">
          <Stack component="ul" spacing={1} sx={{ pl: 2.5, m: 0 }}>
            {[
              'Both the manifest file and the supporting file must be selected before continuing.',
              'Files must be in .xls, .xlsx, or .csv format only.',
              'The first row must contain column headers matching the manifest template.',
              'Serial number ranges must not overlap with any previously uploaded batch.',
              'Each row must include a valid container number and box number.',
              'Maximum file size: 25 MB per upload.',
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
