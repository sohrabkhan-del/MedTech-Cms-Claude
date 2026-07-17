import { z } from 'zod'

export const giftFormSchema = z.object({
  giftName: z.string().min(2, 'Gift name is required'),
  giftCode: z.string().min(3, 'Gift code is required'),
  category: z.string().min(1, 'Category is required'),
  brand: z.string().min(1, 'Brand is required'),
  giftImage: z.string().optional(),
  description: z.string().optional(),
  requiredCoins: z.string().min(1, 'Required coins is required'),
  availableQuantity: z.string().min(1, 'Available quantity is required'),
  status: z.enum(['active', 'inactive']),
})

export type GiftFormValues = z.infer<typeof giftFormSchema>

export const giftFormDefaults: GiftFormValues = {
  giftName: '',
  giftCode: '',
  category: '',
  brand: '',
  giftImage: '',
  description: '',
  requiredCoins: '',
  availableQuantity: '',
  status: 'active',
}
