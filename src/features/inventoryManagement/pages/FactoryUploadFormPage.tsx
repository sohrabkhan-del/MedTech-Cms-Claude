import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Stack, Typography } from '@mui/material'
import { Download as DownloadOutlined, Factory as FactoryOutlined } from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { FileDropzone } from '@/components/common/FileDropzone/FileDropzone'
import { useFactoryUpload } from '@/features/inventoryManagement/hooks/useFactoryUpload'

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
