import { useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { Button, Stack, Typography } from '@mui/material'
import { EmptyState } from '@/components/common/EmptyState/EmptyState'
import { ProductForm } from '@/features/inventoryManagement/components/ProductForm'
import { useProductForm } from '@/features/inventoryManagement/hooks/useProductForm'
import { productFormDefaults, productFormSchema, type ProductFormValues } from '@/features/inventoryManagement/types/inventoryManagement.types'

export function ProductFormPage() {
  const navigate = useNavigate()
  const { productId } = useParams<{ productId: string }>()
  const [searchParams] = useSearchParams()
  const cloneFromId = !productId ? searchParams.get('cloneFrom') : null

  const { isEdit, product, cloneSource, categoryOptions, isLoading, isSubmitting, submit } = useProductForm(productId, cloneFromId)

  const { control, handleSubmit, reset } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: productFormDefaults,
  })

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({ control, name: 'productImages' })
  const watchedImages = useWatch({ control, name: 'productImages' })

  useEffect(() => {
    const prefillSource = product ?? cloneSource
    if (!prefillSource) return
    reset({
      productName: prefillSource.productName,
      productCode: prefillSource.productCode,
      productCategory: prefillSource.productCategory,
      dealerRewardPoints: String(prefillSource.dealerRewardPoints),
      chemistRewardPoints: String(prefillSource.chemistRewardPoints),
      status: prefillSource.status,
      description: prefillSource.description,
      productImages:
        prefillSource.productImages.length > 0 ? prefillSource.productImages.map((url) => ({ url })) : [{ url: '' }],
    })
  }, [product, cloneSource, reset])

  if (isEdit && !isLoading && !product) {
    return (
      <EmptyState
        title="Product not found"
        description="This product may have been removed."
        actionLabel="Back to Product Master"
        onAction={() => navigate('/inventory/product-master')}
      />
    )
  }

  const backTo = isEdit ? `/inventory/product-master/${productId}` : '/inventory/product-master'

  const onSubmit = handleSubmit(async (values) => {
    const success = await submit(values)
    if (success) navigate(backTo)
  })

  return (
    <>
      <Stack sx={{ mb: 3, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h1">{isEdit ? 'Edit Product' : 'Add Product'}</Typography>
      </Stack>

      <form onSubmit={onSubmit} noValidate>
        <ProductForm
          control={control}
          categoryOptions={categoryOptions}
          cloneSourceCode={cloneSource?.productCode}
          imageFields={imageFields}
          watchedImages={watchedImages}
          appendImage={appendImage}
          removeImage={removeImage}
        />

        <Stack direction="row" spacing={1.5}>
          <Button type="submit" variant="contained" loading={isSubmitting}>
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
