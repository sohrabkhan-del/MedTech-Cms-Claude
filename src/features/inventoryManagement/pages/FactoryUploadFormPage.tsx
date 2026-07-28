import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Dialog, DialogContent, Stack, Typography } from '@mui/material'
import { CircleCheck, Download as DownloadOutlined, Factory as FactoryOutlined } from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { FileDropzone } from '@/components/common/FileDropzone/FileDropzone'
import { radius } from '@/theme/tokens'
import { useFactoryUpload } from '@/features/inventoryManagement/hooks/useFactoryUpload'
import type { FactoryBatch } from '@/types/factoryUpload'

export function FactoryUploadFormPage() {
  const navigate = useNavigate()
  const [manifestFile, setManifestFile] = useState<File | null>(null)
  const [supportingFile, setSupportingFile] = useState<File | null>(null)
  const [uploadedBatch, setUploadedBatch] = useState<FactoryBatch | null>(null)
  const { uploadFiles, isUploading } = useFactoryUpload()

  const bothSelected = !!manifestFile && !!supportingFile

  const handleContinue = async () => {
    if (!manifestFile || !supportingFile) return
    const batch = await uploadFiles(manifestFile, supportingFile)
    if (batch) setUploadedBatch(batch)
  }

  const handleViewBatch = () => {
    if (uploadedBatch) navigate(`/inventory/factory-inventory-upload/${uploadedBatch.id}`)
  }

  const handleUploadAnother = () => {
    setUploadedBatch(null)
    setManifestFile(null)
    setSupportingFile(null)
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

      <Dialog
        open={!!uploadedBatch}
        onClose={handleUploadAnother}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: `${radius.xl}px` } },
        }}
      >
        <DialogContent sx={{ px: 3, pt: 4, pb: 3 }}>
          <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'success.light',
                color: 'success.main',
              }}
            >
              <CircleCheck size={30} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1.0625rem' }}>
              Manifest Uploaded Successfully
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {uploadedBatch && (
                <>
                  Batch <strong>{uploadedBatch.batchNumber}</strong> has been
                  created with {uploadedBatch.totalProducts.toLocaleString('en-IN')}{' '}
                  product(s).
                </>
              )}
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ width: '100%' }}>
              <Button variant="outlined" fullWidth onClick={handleUploadAnother}>
                Upload Another
              </Button>
              <Button variant="contained" fullWidth onClick={handleViewBatch}>
                View Batch
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  )
}
