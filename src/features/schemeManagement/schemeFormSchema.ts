import { z } from 'zod'

export const schemeFormSchema = z
  .object({
    schemeName: z.string().min(2, 'Scheme name is required'),
    schemeCategory: z.enum(['general', 'seasonal']),
    schemeType: z.string().min(1, 'Scheme type is required'),
    applicableUsers: z.array(z.enum(['Dealer', 'Chemist', 'MR'])).min(1, 'Select at least one applicable user type'),

    bonusValue: z.string().min(1, 'Bonus value is required'),
    scanTarget: z.string().min(1, 'Scan target is required'),
    rewardType: z.string().min(1, 'Reward type is required'),
    maximumReward: z.string().min(1, 'Maximum reward is required'),
    rewardFrequency: z.string().min(1, 'Reward frequency is required'),
    stackable: z.boolean(),

    productCategory: z.string().min(1, 'Product category is required'),
    brand: z.string().optional(),

    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().optional(),

    description: z.string().optional(),
    status: z.enum(['draft', 'active', 'inactive']),
  })
  .refine((data) => data.schemeCategory === 'general' || !!data.endDate, {
    message: 'End date is mandatory for seasonal schemes',
    path: ['endDate'],
  })

export type SchemeFormValues = z.infer<typeof schemeFormSchema>

export const schemeFormDefaults: SchemeFormValues = {
  schemeName: '',
  schemeCategory: 'general',
  schemeType: '',
  applicableUsers: [],

  bonusValue: '',
  scanTarget: '',
  rewardType: '',
  maximumReward: '',
  rewardFrequency: '',
  stackable: false,

  productCategory: '',
  brand: '',

  startDate: '',
  endDate: '',

  description: '',
  status: 'draft',
}
