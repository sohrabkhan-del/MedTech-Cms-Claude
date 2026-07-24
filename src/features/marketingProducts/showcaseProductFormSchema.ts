import { z } from 'zod'

export const showcaseProductFormSchema = z.object({
  productName: z.string().min(2, 'Product name is required'),
  sku: z.string().min(3, 'SKU is required'),
  price: z.string().min(1, 'Price is required'),
  category: z.string().min(1, 'Category is required'),
  featuredProduct: z.boolean(),
  productImage: z.string().optional(),
  description: z.string().optional(),
})

export type ShowcaseProductFormValues = z.infer<typeof showcaseProductFormSchema>

export const showcaseProductFormDefaults: ShowcaseProductFormValues = {
  productName: '',
  sku: '',
  price: '',
  category: '',
  featuredProduct: false,
  productImage: '',
  description: '',
}
