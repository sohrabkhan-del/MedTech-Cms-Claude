import { z } from 'zod'

const REGION_VALUES = ['East', 'West', 'North', 'South'] as const

const schemeApplicableProductFormSchema = z.object({
  productId: z.string().min(1),
  dealerBaseCoinValue: z.string(),
  chemistBaseCoinValue: z.string(),
  dealerRegionMultipliers: z.record(z.enum(REGION_VALUES), z.string()),
  chemistRegionMultipliers: z.record(z.enum(REGION_VALUES), z.string()),
})

const schemeGiftPartnerRuleFormSchema = z.object({
  price: z.string(),
  points: z.string(),
  discountPrice: z.string(),
})

const schemeGiftRuleFormSchema = z.object({
  giftId: z.string().min(1),
  dealerRule: schemeGiftPartnerRuleFormSchema.nullable(),
  chemistRule: schemeGiftPartnerRuleFormSchema.nullable(),
})

export const schemeFormSchema = z
  .object({
    type: z.enum(['general', 'seasonal']),
    name: z.string().min(2, 'Scheme name is required'),
    status: z.enum(['active', 'inactive']),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().optional(),
    partnerTypes: z.array(z.enum(['Dealer', 'Chemist'])).min(1, 'Select at least one partner type'),
    dealerRegions: z.array(z.enum(REGION_VALUES)),
    chemistRegions: z.array(z.enum(REGION_VALUES)),
    applicableProducts: z.array(schemeApplicableProductFormSchema),
    giftRules: z.array(schemeGiftRuleFormSchema),
    description: z.string().optional(),
    disclaimer: z.string().optional(),
    image: z.string().optional(),
    banner: z.string().optional(),
  })
  .refine((data) => data.type === 'general' || !!data.endDate, {
    message: 'End date is mandatory for seasonal schemes',
    path: ['endDate'],
  })
  .refine((data) => !data.endDate || !data.startDate || data.endDate >= data.startDate, {
    message: 'End date must be on or after the start date',
    path: ['endDate'],
  })
  .refine((data) => !data.partnerTypes.includes('Dealer') || data.dealerRegions.length > 0, {
    message: 'Select at least one region for Dealer',
    path: ['dealerRegions'],
  })
  .refine((data) => !data.partnerTypes.includes('Chemist') || data.chemistRegions.length > 0, {
    message: 'Select at least one region for Chemist',
    path: ['chemistRegions'],
  })
  .refine((data) => data.applicableProducts.length > 0, {
    message: 'Attach at least one applicable product',
    path: ['applicableProducts'],
  })
  .refine((data) => data.giftRules.length > 0, {
    message: 'Attach at least one gift product',
    path: ['giftRules'],
  })
  .refine(
    (data) => !data.partnerTypes.includes('Dealer') || data.giftRules.some((rule) => rule.dealerRule),
    { message: 'Configure a Dealer rule for at least one gift', path: ['giftRules'] },
  )
  .refine(
    (data) => !data.partnerTypes.includes('Chemist') || data.giftRules.some((rule) => rule.chemistRule),
    { message: 'Configure a Chemist rule for at least one gift', path: ['giftRules'] },
  )

export type SchemeFormValues = z.infer<typeof schemeFormSchema>
export type SchemeApplicableProductFormValues = z.infer<typeof schemeApplicableProductFormSchema>
export type SchemeGiftRuleFormValues = z.infer<typeof schemeGiftRuleFormSchema>
export type SchemeGiftPartnerRuleFormValues = z.infer<typeof schemeGiftPartnerRuleFormSchema>

export const schemeFormDefaults: SchemeFormValues = {
  type: 'general',
  name: '',
  status: 'active',
  startDate: '',
  endDate: '',
  partnerTypes: [],
  dealerRegions: [],
  chemistRegions: [],
  applicableProducts: [],
  giftRules: [],
  description: '',
  disclaimer: '',
  image: '',
  banner: '',
}
