import { z } from 'zod'

export const giftFormSchema = z
  .object({
    giftName: z.string().min(2, 'Gift name is required'),
    category: z.string().min(1, 'Category is required'),
    brand: z.string().min(1, 'Brand is required'),
    giftImage: z.string().optional(),
    description: z.string().optional(),
    price: z.string().optional(),
    requiredPoints: z.string().optional(),
    availableQuantity: z.string().min(1, 'Available quantity is required'),
    status: z.enum(['active', 'inactive']),
    eligibleUserType: z.enum(['All', 'Dealer', 'Chemist']),
    partnerTypes: z
      .array(z.enum(['Dealer', 'Chemist']))
      .min(1, 'Select at least one partner type'),
    dealerRegions: z.array(z.string()),
    chemistRegions: z.array(z.string()),
    dealerBasePoints: z.string(),
    chemistBasePoints: z.string(),
  })
  .refine(
    (data) =>
      !data.partnerTypes.includes('Dealer') || data.dealerRegions.length > 0,
    {
      message: 'Select at least one region for Dealer',
      path: ['dealerRegions'],
    },
  )
  .refine(
    (data) =>
      !data.partnerTypes.includes('Chemist') || data.chemistRegions.length > 0,
    {
      message: 'Select at least one region for Chemist',
      path: ['chemistRegions'],
    },
  )
  .refine(
    (data) =>
      !data.partnerTypes.includes('Dealer') ||
      data.dealerBasePoints.trim().length > 0,
    {
      message: 'Base Points is required for Dealer',
      path: ['dealerBasePoints'],
    },
  )
  .refine(
    (data) =>
      !data.partnerTypes.includes('Chemist') ||
      data.chemistBasePoints.trim().length > 0,
    {
      message: 'Base Points is required for Chemist',
      path: ['chemistBasePoints'],
    },
  )

export type GiftFormValues = z.infer<typeof giftFormSchema>

export const giftFormDefaults: GiftFormValues = {
  giftName: '',
  category: '',
  brand: '',
  giftImage: '',
  description: '',
  price: '',
  requiredPoints: '',
  availableQuantity: '',
  status: 'active',
  eligibleUserType: 'All',
  partnerTypes: [],
  dealerRegions: [],
  chemistRegions: [],
  dealerBasePoints: '',
  chemistBasePoints: '',
}
