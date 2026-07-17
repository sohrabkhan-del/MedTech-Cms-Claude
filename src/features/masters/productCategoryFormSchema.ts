import { z } from 'zod'

export const productCategoryFormSchema = z.object({
  categoryName: z.string().min(2, 'Category name is required'),
  categoryCode: z.string().min(3, 'Category code is required'),
  parentCategoryId: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']),
})

export type ProductCategoryFormValues = z.infer<typeof productCategoryFormSchema>

export const productCategoryFormDefaults: ProductCategoryFormValues = {
  categoryName: '',
  categoryCode: '',
  parentCategoryId: '',
  description: '',
  status: 'active',
}
