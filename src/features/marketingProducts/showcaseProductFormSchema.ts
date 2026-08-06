import { z } from 'zod'

const productImageSchema = z.object({
  url: z.string().min(1, 'Image URL is required'),
  alt: z.string().optional(),
})

export const showcaseProductFormSchema = z.object({
  productCode: z.string().optional(),
  name: z.string().min(2, 'Product name is required'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  categoryName: z.string().optional(),
  brand: z.string().optional(),
  mrp: z.string().min(1, 'MRP is required'),
  dealerPrice: z.string().min(1, 'Dealer price is required'),
  chemistPrice: z.string().min(1, 'Chemist price is required'),
  availableStock: z.string().optional(),
  stockUnit: z.string().optional(),
  lowStockThreshold: z.string().optional(),
  visibleToDealer: z.boolean(),
  visibleToChemist: z.boolean(),
  isActive: z.boolean(),
  images: z.array(productImageSchema),
})

export type ShowcaseProductFormValues = z.infer<typeof showcaseProductFormSchema>

export const showcaseProductFormDefaults: ShowcaseProductFormValues = {
  productCode: '',
  name: '',
  description: '',
  categoryId: '',
  categoryName: '',
  brand: '',
  mrp: '',
  dealerPrice: '',
  chemistPrice: '',
  availableStock: '',
  stockUnit: '',
  lowStockThreshold: '',
  visibleToDealer: true,
  visibleToChemist: true,
  isActive: true,
  images: [],
}

export interface ShowcaseProductApiPayload {
  productCode?: string
  name: string
  description?: string
  categoryId: string
  images: { url: string; alt?: string }[]
  mrp: number
  dealerPrice: number
  chemistPrice: number
  availableStock?: number
  stockUnit?: string
  lowStockThreshold?: number
  visibleTo: ('dealer' | 'chemist')[]
}

/** `productCode` is backend-generated on create; only sent back on update, where it's read-only in the UI. */
export function toShowcaseProductApiPayload(
  values: ShowcaseProductFormValues,
  isEdit: boolean,
): ShowcaseProductApiPayload {
  const visibleTo: ('dealer' | 'chemist')[] = []
  if (values.visibleToDealer) visibleTo.push('dealer')
  if (values.visibleToChemist) visibleTo.push('chemist')

  return {
    productCode: isEdit ? values.productCode : undefined,
    name: values.name,
    description: values.description || undefined,
    categoryId: values.categoryId,
    images: values.images
      .filter((image) => image.url.trim())
      .map((image) => ({ url: image.url, alt: image.alt || undefined })),
    mrp: Number(values.mrp),
    dealerPrice: Number(values.dealerPrice),
    chemistPrice: Number(values.chemistPrice),
    availableStock: values.availableStock ? Number(values.availableStock) : undefined,
    stockUnit: values.stockUnit || undefined,
    lowStockThreshold: values.lowStockThreshold ? Number(values.lowStockThreshold) : undefined,
    visibleTo,
  }
}
