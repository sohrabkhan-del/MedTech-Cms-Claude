import { z } from 'zod'

export const productFormSchema = z.object({
  productName: z.string().min(2, 'Product name is required'),
  productCode: z.string().min(3, 'Product code is required'),
  productCategory: z.string().min(1, 'Product category is required'),
  dealerRewardPoints: z.string().min(1, 'Dealer reward points are required'),
  chemistRewardPoints: z.string().min(1, 'Chemist reward points are required'),
  status: z.enum(['active', 'inactive']),
  description: z.string().optional(),
  productImages: z.array(z.object({ url: z.string() })),
})

export type ProductFormValues = z.infer<typeof productFormSchema>

export const productFormDefaults: ProductFormValues = {
  productName: '',
  productCode: '',
  productCategory: '',
  dealerRewardPoints: '',
  chemistRewardPoints: '',
  status: 'active',
  description: '',
  productImages: [{ url: '' }],
}
