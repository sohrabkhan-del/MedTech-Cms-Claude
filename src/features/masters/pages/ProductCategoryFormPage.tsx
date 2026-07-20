import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button, Card, Grid, MenuItem, Stack, Typography } from '@mui/material'
import { FormField } from '@/components/common/FormField/FormField'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { useProductCategoryForm } from '@/features/masters/hooks/useProductCategoryForm'
import {
  productCategoryFormDefaults,
  productCategoryFormSchema,
  type ProductCategoryFormValues,
} from '@/features/masters/types/masters.types'

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

export function ProductCategoryFormPage() {
  const navigate = useNavigate()
  const { categoryId } = useParams<{ categoryId: string }>()
  const { isEdit, category, options, isLoading, isSubmitting, submit } = useProductCategoryForm(categoryId)

  const { control, handleSubmit, reset } = useForm<ProductCategoryFormValues>({
    resolver: zodResolver(productCategoryFormSchema),
    defaultValues: productCategoryFormDefaults,
  })

  useEffect(() => {
    if (!category) return
    reset({
      categoryName: category.categoryName,
      categoryCode: category.categoryCode,
      parentCategoryId: category.parentCategoryId ?? '',
      description: category.description,
      status: category.status,
    })
  }, [category, reset])

  if (isEdit && !isLoading && !category) {
    return (
      <EmptyState
        title="Category not found"
        description="This product category may have been removed."
        actionLabel="Back to Product Categories"
        onAction={() => navigate('/masters/product-categories')}
      />
    )
  }

  const backTo = isEdit ? `/masters/product-categories/${categoryId}` : '/masters/product-categories'

  const onSubmit = handleSubmit(async (values) => {
    const success = await submit(values)
    if (success) navigate(backTo)
  })

  return (
    <>
      <Stack sx={{ mb: 3, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h1">{isEdit ? 'Edit Category' : 'Create Category'}</Typography>
      </Stack>

      <form onSubmit={onSubmit} noValidate>
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography sx={sectionTitleSx}>Category Details</Typography>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Category Name</FieldLabel>
              <FormField name="categoryName" control={control} placeholder="e.g. Cardiac Care" {...fieldLabelProps} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel required>Category Code</FieldLabel>
              <FormField name="categoryCode" control={control} placeholder="e.g. CAT-20260001" {...fieldLabelProps} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel>Parent Category</FieldLabel>
              <FormField name="parentCategoryId" control={control} select {...fieldLabelProps}>
                <MenuItem value="">
                  <em>None (Top Level)</em>
                </MenuItem>
                {(options?.parentCategoryOptions ?? []).map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.categoryName}
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
            <Grid size={12}>
              <FieldLabel>Category Description</FieldLabel>
              <FormField name="description" control={control} multiline minRows={3} {...fieldLabelProps} />
            </Grid>
          </Grid>
        </Card>

        <Stack direction="row" spacing={1.5}>
          <Button type="submit" variant="contained" loading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Create Category'}
          </Button>
          <Button variant="outlined" color="primary" onClick={() => navigate(backTo)}>
            Cancel
          </Button>
        </Stack>
      </form>
    </>
  )
}
