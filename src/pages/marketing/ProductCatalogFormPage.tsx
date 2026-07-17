import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import { Avatar, Box, Button, Card, FormControlLabel, Grid, MenuItem, Stack, Switch, Typography } from '@mui/material'
import { Image as ImageOutlined } from 'lucide-react'
import { FormField } from '@/components/common/FormField/FormField'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import {
  showcaseProductFormDefaults,
  showcaseProductFormSchema,
  type ShowcaseProductFormValues,
} from '@/features/marketing/showcaseProductFormSchema'
import { getShowcaseProductById, showcaseCategoryOptions } from '@/features/marketing/mockShowcaseProducts'

const sectionTitleSx = {
  fontWeight: 700,
  fontSize: '0.75rem',
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  color: 'primary.main',
  mb: 2.5,
}

const fieldLabelProps = {
  slotProps: { inputLabel: { shrink: false, sx: { display: 'none' } } },
} as const

function FieldLabel({ children, required }: { children: string; required?: boolean }) {
  return (
    <Typography sx={{ fontWeight: 700, fontSize: '0.6875rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'primary.main', mb: 0.75 }}>
      {children}
      {required ? ' *' : ''}
    </Typography>
  )
}

export function ProductCatalogFormPage() {
  const navigate = useNavigate()
  const { productId } = useParams<{ productId: string }>()
  const isEdit = !!productId
  const product = isEdit ? getShowcaseProductById(productId) : undefined

  const { control, handleSubmit, watch } = useForm<ShowcaseProductFormValues>({
    resolver: zodResolver(showcaseProductFormSchema),
    defaultValues: product
      ? {
          productName: product.productName,
          sku: product.sku,
          price: String(product.price),
          category: product.category,
          rewardPoints: String(product.rewardPoints),
          status: product.status,
          showcaseVisible: product.showcaseVisible,
          featuredProduct: product.featuredProduct,
          productImage: product.productImage,
          description: product.description,
        }
      : showcaseProductFormDefaults,
  })

  const imageUrl = watch('productImage')

  if (isEdit && !product) {
    return (
      <EmptyState
        title="Product not found"
        description="This showcase product may have been removed."
        actionLabel="Back to Products Catalog"
        onAction={() => navigate('/marketing-products/products-catelog')}
      />
    )
  }

  const backTo = '/marketing-products/products-catelog'

  const submit = handleSubmit(() => {
    navigate(backTo)
  })

  return (
    <>
      <Stack sx={{ mb: 3, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h1">{isEdit ? 'Edit Product' : 'Create Product'}</Typography>
      </Stack>

      <form onSubmit={submit} noValidate>
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={sectionTitleSx}>Basic Information</Typography>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Product Name</FieldLabel>
              <FormField name="productName" control={control} placeholder="e.g. CardioCare Wellness Kit" {...fieldLabelProps} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>SKU</FieldLabel>
              <FormField name="sku" control={control} placeholder="e.g. SKU-SC-100017" {...fieldLabelProps} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Price (₹) / MRP (₹)</FieldLabel>
              <FormField name="price" control={control} placeholder="e.g. 599" {...fieldLabelProps} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Category</FieldLabel>
              <FormField name="category" control={control} select {...fieldLabelProps}>
                {showcaseCategoryOptions.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </FormField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Reward Points</FieldLabel>
              <FormField name="rewardPoints" control={control} placeholder="e.g. 25" {...fieldLabelProps} />
            </Grid>
          </Grid>
        </Card>

        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={sectionTitleSx}>Product Settings</Typography>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FieldLabel required>Status</FieldLabel>
              <FormField name="status" control={control} select {...fieldLabelProps}>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </FormField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FieldLabel>Show in App</FieldLabel>
              <Controller
                name="showcaseVisible"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                    label={field.value ? 'Yes' : 'No'}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FieldLabel>Featured Product</FieldLabel>
              <Controller
                name="featuredProduct"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                    label={field.value ? 'Yes' : 'No'}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Card>

        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={sectionTitleSx}>Media</Typography>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-end' }}>
            <Avatar
              src={imageUrl || undefined}
              variant="rounded"
              sx={{ width: 56, height: 56, flexShrink: 0, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider', color: 'text.disabled' }}
            >
              <ImageOutlined size={20} />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <FieldLabel>Product Image URL</FieldLabel>
              <FormField name="productImage" control={control} placeholder="https://example.com/product-image.jpg" {...fieldLabelProps} />
            </Box>
          </Stack>
        </Card>

        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={sectionTitleSx}>Product Details</Typography>
          <Grid container spacing={2.5}>
            <Grid size={12}>
              <FieldLabel>Product Description</FieldLabel>
              <FormField name="description" control={control} multiline minRows={3} {...fieldLabelProps} />
            </Grid>
          </Grid>
        </Card>

        <Stack direction="row" spacing={1.5}>
          <Button type="submit" variant="contained">
            {isEdit ? 'Save Changes' : 'Create Product'}
          </Button>
          <Button variant="outlined" color="primary" onClick={() => navigate(backTo)}>
            Cancel
          </Button>
        </Stack>
      </form>
    </>
  )
}
