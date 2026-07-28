import { z } from 'zod'

const REGION_VALUES = ['East', 'West', 'North', 'South'] as const

export const giftFormSchema = z
  .object({
    giftName: z.string().min(2, 'Gift name is required'),
    category: z.string().min(1, 'Category is required'),
    brand: z.string().min(1, 'Brand is required'),
    giftImage: z.string().optional(),
    description: z.string().optional(),
    price: z.string().min(1, 'Price is required'),
    requiredCoins: z.string().min(1, 'Required coins is required'),
    availableQuantity: z.string().min(1, 'Available quantity is required'),
    status: z.enum(['active', 'inactive']),
    eligibleUserType: z.enum(['All', 'Dealer', 'Chemist']),
    partnerTypes: z.array(z.enum(['Dealer', 'Chemist'])).min(1, 'Select at least one partner type'),
    dealerRegions: z.array(z.enum(REGION_VALUES)),
    chemistRegions: z.array(z.enum(REGION_VALUES)),
    dealerBasePoints: z.string(),
    chemistBasePoints: z.string(),
  })
  .refine((data) => !data.partnerTypes.includes('Dealer') || data.dealerRegions.length > 0, {
    message: 'Select at least one region for Dealer',
    path: ['dealerRegions'],
  })
  .refine((data) => !data.partnerTypes.includes('Chemist') || data.chemistRegions.length > 0, {
    message: 'Select at least one region for Chemist',
    path: ['chemistRegions'],
  })
  .refine((data) => !data.partnerTypes.includes('Dealer') || data.dealerBasePoints.trim().length > 0, {
    message: 'Base points is required for Dealer',
    path: ['dealerBasePoints'],
  })
  .refine((data) => !data.partnerTypes.includes('Chemist') || data.chemistBasePoints.trim().length > 0, {
    message: 'Base points is required for Chemist',
    path: ['chemistBasePoints'],
  })

export type GiftFormValues = z.infer<typeof giftFormSchema>

export const giftFormDefaults: GiftFormValues = {
  giftName: '',
  category: '',
  brand: '',
  giftImage: '',
  description: '',
  price: '',
  requiredCoins: '',
  availableQuantity: '',
  status: 'active',
  eligibleUserType: 'All',
  partnerTypes: [],
  dealerRegions: [],
  chemistRegions: [],
  dealerBasePoints: '',
  chemistBasePoints: '',
}
