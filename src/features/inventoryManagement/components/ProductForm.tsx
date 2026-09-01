import { useState } from 'react'
import type {
  Control,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFormSetValue,
} from 'react-hook-form'
import {
  Box,
  Button,
  Card,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material'
import {
  ImagePlus as AddPhotoAlternateOutlined,
  Trash2 as DeleteOutlined,
} from 'lucide-react'
import { FormField } from '@/components/common/FormField/FormField'
import { FileDropzone } from '@/components/common/FileDropzone/FileDropzone'
import { useToast } from '@/contexts/ToastContext'
import { getApiErrorMessage } from '@/utils/getApiErrorMessage'
import {
  uploadFileToS3,
  deleteUploadedFile,
} from '@/features/userManagement/services/fileUploadService'
import type { ProductFormValues } from '@/features/inventoryManagement/types/inventoryManagement.types'

const sectionTitleSx = {
  fontWeight: 700,
  fontSize: '0.75rem',
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  color: 'primary.main',
  mb: 2.5,
}

const fieldLabelProps = {
  slotProps: {
    inputLabel: { shrink: false, sx: { display: 'none' } },
  },
} as const

function FieldLabel({
  children,
  required,
}: {
  children: string
  required?: boolean
}) {
  return (
    <Typography
      sx={{
        fontWeight: 700,
        fontSize: '0.6875rem',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color: 'primary.main',
        mb: 0.75,
      }}
    >
      {children}
      {required ? ' *' : ''}
    </Typography>
  )
}

interface ProductFormProps {
  control: Control<ProductFormValues>
  setValue: UseFormSetValue<ProductFormValues>
  categoryOptions: string[]
  cloneSourceCode?: string
  imageFields: { id: string }[]
  watchedImages: { url: string; path?: string }[] | undefined
  appendImage: UseFieldArrayAppend<ProductFormValues, 'productImages'>
  removeImage: UseFieldArrayRemove
}

const PRODUCT_IMAGES_FOLDER = 'products'

export function ProductForm({
  control,
  setValue,
  categoryOptions,
  cloneSourceCode,
  imageFields,
  watchedImages,
  appendImage,
  removeImage,
}: ProductFormProps) {
  const toast = useToast()
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)

  async function handleImageSelect(index: number, file: File) {
    setUploadingIndex(index)
    try {
      const uploaded = await uploadFileToS3(file, PRODUCT_IMAGES_FOLDER)
      const url =
        uploaded.viewUrl ||
        uploaded.signedViewUrl ||
        uploaded.directViewUrl ||
        uploaded.objectUrl ||
        uploaded.url ||
        ''
      setValue(`productImages.${index}.url`, url, { shouldDirty: true })
      setValue(`productImages.${index}.path`, uploaded.path, {
        shouldDirty: true,
      })
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to upload image.'))
    } finally {
      setUploadingIndex(null)
    }
  }

  async function handleImageRemoveFile(index: number) {
    const path = watchedImages?.[index]?.path
    if (path) await deleteUploadedFile(path)
    setValue(`productImages.${index}.url`, '', { shouldDirty: true })
    setValue(`productImages.${index}.path`, '', { shouldDirty: true })
  }

  return (
    <>
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography sx={sectionTitleSx}>Basic Details</Typography>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldLabel required>Product Name</FieldLabel>
            <FormField
              name="productName"
              control={control}
              placeholder="e.g. CardioCare 10mg"
              {...fieldLabelProps}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldLabel required>Product Code</FieldLabel>
            <FormField
              name="productCode"
              control={control}
              placeholder="e.g. PC-20260001"
              {...fieldLabelProps}
            />
            {cloneSourceCode && (
              <Typography
                variant="caption"
                sx={{ color: 'warning.main', display: 'block', mt: 0.5 }}
              >
                Cloned from {cloneSourceCode} — update the code before saving.
              </Typography>
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldLabel required>Product Category</FieldLabel>
            <FormField
              name="productCategory"
              control={control}
              select
              {...fieldLabelProps}
            >
              {categoryOptions.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </FormField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldLabel required>Status</FieldLabel>
            <FormField
              name="status"
              control={control}
              select
              {...fieldLabelProps}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </FormField>
          </Grid>
        </Grid>
      </Card>

      <Card sx={{ p: 3, mb: 3 }}>
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2.5,
          }}
        >
          <Typography sx={{ ...sectionTitleSx, mb: 0 }}>
            Product Images
          </Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AddPhotoAlternateOutlined size={20} />}
            onClick={() => appendImage({ url: '', path: '' })}
            sx={{ fontSize: '0.75rem' }}
          >
            Add Image
          </Button>
        </Stack>
        <Stack spacing={2}>
          {imageFields.map((field, index) => {
            const image = watchedImages?.[index]
            return (
              <Stack key={field.id} direction="row" spacing={2}>
                <Box sx={{ flexGrow: 1 }}>
                  <FieldLabel>{`Image ${index + 1}`}</FieldLabel>
                  <FileDropzone
                    file={null}
                    accept="image/png,image/jpeg,image/webp"
                    helperText="Upload JPG, PNG, or WEBP — stored in S3"
                    existingPreview={
                      image?.url
                        ? { url: image.url, name: `Image ${index + 1}` }
                        : null
                    }
                    onSelect={(file) => handleImageSelect(index, file)}
                    onRemove={() => handleImageRemoveFile(index)}
                  />
                  {uploadingIndex === index && (
                    <LinearProgress sx={{ mt: 1 }} />
                  )}
                </Box>
                <IconButton
                  aria-label="Remove image slot"
                  onClick={() => removeImage(index)}
                  disabled={imageFields.length === 1}
                >
                  <DeleteOutlined size={20} />
                </IconButton>
              </Stack>
            )
          })}
        </Stack>
      </Card>

      <Card sx={{ p: 3, mb: 3 }}>
        <Typography sx={sectionTitleSx}>Reward Configuration</Typography>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldLabel required>Dealer Reward Points</FieldLabel>
            <FormField
              name="dealerRewardPoints"
              control={control}
              placeholder="e.g. 25"
              {...fieldLabelProps}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldLabel required>Chemist Reward Points</FieldLabel>
            <FormField
              name="chemistRewardPoints"
              control={control}
              placeholder="e.g. 30"
              {...fieldLabelProps}
            />
          </Grid>
        </Grid>
      </Card>

      <Card sx={{ p: 3, mb: 3 }}>
        <Typography sx={sectionTitleSx}>Description</Typography>
        <Grid container spacing={2.5}>
          <Grid size={12}>
            <FieldLabel>Product Description</FieldLabel>
            <FormField
              name="description"
              control={control}
              multiline
              minRows={3}
              {...fieldLabelProps}
            />
          </Grid>
        </Grid>
      </Card>
    </>
  )
}
