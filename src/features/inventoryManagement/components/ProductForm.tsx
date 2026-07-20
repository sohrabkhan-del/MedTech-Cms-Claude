import type { Control, UseFieldArrayAppend, UseFieldArrayRemove } from 'react-hook-form'
import { Avatar, Box, Button, Card, Grid, IconButton, MenuItem, Stack, Typography } from '@mui/material'
import { Image as ImageOutlined, ImagePlus as AddPhotoAlternateOutlined, Trash2 as DeleteOutlined } from 'lucide-react'
import { FormField } from '@/components/common/FormField/FormField'
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

function FieldLabel({ children, required }: { children: string; required?: boolean }) {
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
  categoryOptions: string[]
  cloneSourceCode?: string
  imageFields: { id: string }[]
  watchedImages: { url: string }[] | undefined
  appendImage: UseFieldArrayAppend<ProductFormValues, 'productImages'>
  removeImage: UseFieldArrayRemove
}

export function ProductForm({ control, categoryOptions, cloneSourceCode, imageFields, watchedImages, appendImage, removeImage }: ProductFormProps) {
  return (
    <>
      <Card sx={{ p: 3, mb: 3 }}>
        <Typography sx={sectionTitleSx}>Basic Details</Typography>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldLabel required>Product Name</FieldLabel>
            <FormField name="productName" control={control} placeholder="e.g. CardioCare 10mg" {...fieldLabelProps} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldLabel required>Product Code</FieldLabel>
            <FormField name="productCode" control={control} placeholder="e.g. PC-20260001" {...fieldLabelProps} />
            {cloneSourceCode && (
              <Typography variant="caption" sx={{ color: 'warning.main', display: 'block', mt: 0.5 }}>
                Cloned from {cloneSourceCode} — update the code before saving.
              </Typography>
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldLabel required>Product Category</FieldLabel>
            <FormField name="productCategory" control={control} select {...fieldLabelProps}>
              {categoryOptions.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </FormField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldLabel required>Status</FieldLabel>
            <FormField name="status" control={control} select {...fieldLabelProps}>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </FormField>
          </Grid>
        </Grid>
      </Card>

      <Card sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
          <Typography sx={{ ...sectionTitleSx, mb: 0 }}>Product Images</Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AddPhotoAlternateOutlined size={20} />}
            onClick={() => appendImage({ url: '' })}
            sx={{ fontSize: '0.75rem' }}
          >
            Add Image
          </Button>
        </Stack>
        <Stack spacing={2}>
          {imageFields.map((field, index) => (
            <Stack key={field.id} direction="row" spacing={2} sx={{ alignItems: 'flex-end' }}>
              <Avatar
                src={watchedImages?.[index]?.url || undefined}
                variant="rounded"
                sx={{ width: 56, height: 56, flexShrink: 0, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider', color: 'text.disabled' }}
              >
                <ImageOutlined size={20} />
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <FieldLabel>{`Image ${index + 1} URL`}</FieldLabel>
                <FormField
                  name={`productImages.${index}.url` as const}
                  control={control}
                  placeholder="https://example.com/product-image.jpg"
                  {...fieldLabelProps}
                />
              </Box>
              <IconButton
                aria-label="Remove image"
                onClick={() => removeImage(index)}
                disabled={imageFields.length === 1}
                sx={{ mb: 0.5 }}
              >
                <DeleteOutlined size={20} />
              </IconButton>
            </Stack>
          ))}
        </Stack>
      </Card>

      <Card sx={{ p: 3, mb: 3 }}>
        <Typography sx={sectionTitleSx}>Reward Configuration</Typography>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldLabel required>Dealer Reward Points</FieldLabel>
            <FormField name="dealerRewardPoints" control={control} placeholder="e.g. 25" {...fieldLabelProps} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FieldLabel required>Chemist Reward Points</FieldLabel>
            <FormField name="chemistRewardPoints" control={control} placeholder="e.g. 30" {...fieldLabelProps} />
          </Grid>
        </Grid>
      </Card>

      <Card sx={{ p: 3, mb: 3 }}>
        <Typography sx={sectionTitleSx}>Description</Typography>
        <Grid container spacing={2.5}>
          <Grid size={12}>
            <FieldLabel>Product Description</FieldLabel>
            <FormField name="description" control={control} multiline minRows={3} {...fieldLabelProps} />
          </Grid>
        </Grid>
      </Card>
    </>
  )
}
