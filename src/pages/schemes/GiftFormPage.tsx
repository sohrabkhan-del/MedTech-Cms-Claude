import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import { Avatar, Box, Button, Card, Grid, MenuItem, Stack, Typography } from '@mui/material'
import { Image as ImageOutlined } from 'lucide-react'
import { FormField } from '@/components/common/FormField/FormField'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { giftFormDefaults, giftFormSchema, type GiftFormValues } from '@/features/schemes/giftFormSchema'
import { getGiftById, giftCategoryOptions, giftBrandOptions } from '@/features/schemes/mockGifts'

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

export function GiftFormPage() {
  const navigate = useNavigate()
  const { giftId } = useParams<{ giftId: string }>()
  const isEdit = !!giftId
  const gift = isEdit ? getGiftById(giftId) : undefined

  const { control, handleSubmit, watch } = useForm<GiftFormValues>({
    resolver: zodResolver(giftFormSchema),
    defaultValues: gift
      ? {
          giftName: gift.giftName,
          giftCode: gift.giftCode,
          category: gift.category,
          brand: gift.brand,
          giftImage: gift.giftImage,
          description: gift.description,
          requiredCoins: String(gift.requiredCoins),
          availableQuantity: String(gift.availableQuantity),
          status: gift.status,
        }
      : giftFormDefaults,
  })

  const imageUrl = watch('giftImage')

  if (isEdit && !gift) {
    return (
      <EmptyState
        title="Gift not found"
        description="This gift may have been removed."
        actionLabel="Back to Gift Catalogue"
        onAction={() => navigate('/scheme-management/gift-catalogue')}
      />
    )
  }

  const backTo = isEdit ? `/scheme-management/gift-catalogue/${giftId}` : '/scheme-management/gift-catalogue'

  const submit = handleSubmit(() => {
    navigate(backTo)
  })

  return (
    <>
      <Stack sx={{ mb: 3, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h1">{isEdit ? 'Edit Gift' : 'Create Gift'}</Typography>
      </Stack>

      <form onSubmit={submit} noValidate>
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={sectionTitleSx}>Gift Information</Typography>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Gift Name</FieldLabel>
              <FormField name="giftName" control={control} placeholder="e.g. Smart Watch" {...fieldLabelProps} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Gift Code</FieldLabel>
              <FormField name="giftCode" control={control} placeholder="e.g. GC-20260017" {...fieldLabelProps} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Category</FieldLabel>
              <FormField name="category" control={control} select {...fieldLabelProps}>
                {giftCategoryOptions.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </FormField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Brand</FieldLabel>
              <FormField name="brand" control={control} select {...fieldLabelProps}>
                {giftBrandOptions.map((brand) => (
                  <MenuItem key={brand} value={brand}>
                    {brand}
                  </MenuItem>
                ))}
              </FormField>
            </Grid>
          </Grid>
        </Card>

        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={sectionTitleSx}>Product Images</Typography>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-end' }}>
            <Avatar
              src={imageUrl || undefined}
              variant="rounded"
              sx={{ width: 56, height: 56, flexShrink: 0, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider', color: 'text.disabled' }}
            >
              <ImageOutlined size={20} />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <FieldLabel>Gift Image URL</FieldLabel>
              <FormField name="giftImage" control={control} placeholder="https://example.com/gift-image.jpg" {...fieldLabelProps} />
            </Box>
          </Stack>
        </Card>

        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={sectionTitleSx}>Description</Typography>
          <Grid container spacing={2.5}>
            <Grid size={12}>
              <FieldLabel>Gift Description</FieldLabel>
              <FormField name="description" control={control} multiline minRows={3} {...fieldLabelProps} />
            </Grid>
          </Grid>
        </Card>

        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={sectionTitleSx}>Redemption &amp; Stock</Typography>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FieldLabel required>Required Coins</FieldLabel>
              <FormField name="requiredCoins" control={control} placeholder="e.g. 1500" {...fieldLabelProps} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FieldLabel required>Available Quantity</FieldLabel>
              <FormField name="availableQuantity" control={control} placeholder="e.g. 50" {...fieldLabelProps} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FieldLabel required>Status</FieldLabel>
              <FormField name="status" control={control} select {...fieldLabelProps}>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </FormField>
            </Grid>
          </Grid>
        </Card>

        <Stack direction="row" spacing={1.5}>
          <Button type="submit" variant="contained">
            {isEdit ? 'Save Changes' : 'Create Gift'}
          </Button>
          <Button variant="outlined" color="primary" onClick={() => navigate(backTo)}>
            Cancel
          </Button>
        </Stack>
      </form>
    </>
  )
}
