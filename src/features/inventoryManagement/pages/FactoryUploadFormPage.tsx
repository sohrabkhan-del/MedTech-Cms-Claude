import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Dialog, DialogContent, Stack, Typography } from '@mui/material'
import { CircleCheck, Download as DownloadOutlined, Factory as FactoryOutlined } from 'lucide-react'
import { SectionCard } from '@/components/common/SectionCard/SectionCard'
import { FileDropzone } from '@/components/common/FileDropzone/FileDropzone'
import { radius } from '@/theme/tokens'
import { useFactoryProductionUpload } from '@/features/inventoryManagement/hooks/useFactoryProductionUpload'
import { downloadFactoryProductionUploadTemplate } from '@/features/inventoryManagement/factoryProductionUploadParser'
import type { FactoryProductionUploadBatch } from '@/types/factoryProductionUpload'

export function FactoryUploadFormPage() {
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [uploadedBatch, setUploadedBatch] = useState<FactoryProductionUploadBatch | null>(null)
  const { uploadFile, isUploading } = useFactoryProductionUpload()

  const handleContinue = async () => {
    if (!file) return
    const batch = await uploadFile(file)
    if (batch) setUploadedBatch(batch)
  }

  const handleViewBatch = () => {
    if (uploadedBatch) navigate(`/inventory/factory-inventory-upload/upload/${uploadedBatch.id}`)
  }

  const handleUploadAnother = () => {
    setUploadedBatch(null)
    setFile(null)
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
            Import a new production batch from a single Excel manifest file.
          </Typography>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <SectionCard title="Manifest File">
          <FileDropzone
            file={file}
            onSelect={setFile}
            onRemove={() => setFile(null)}
            accept=".xls,.xlsx"
          />
        </SectionCard>

        <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<DownloadOutlined size={20} />}
            onClick={downloadFactoryProductionUploadTemplate}
          >
            Download Upload Template
          </Button>
          <Button variant="contained" disabled={!file} loading={isUploading} onClick={handleContinue}>
            Continue
          </Button>
        </Stack>

        <SectionCard title="Upload Instructions">
          <Stack component="ul" spacing={1} sx={{ pl: 2.5, m: 0 }}>
            {[
              'Only .xls or .xlsx files are accepted.',
              'The first row must contain column headers matching the upload template.',
              'Each row corresponds to one production batch entry.',
              'If a product code does not exist in the Product Master, it is created automatically.',
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
                  <strong>{uploadedBatch.uploadFileName}</strong> was imported
                  with {uploadedBatch.totalRows.toLocaleString('en-IN')} row(s).
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
