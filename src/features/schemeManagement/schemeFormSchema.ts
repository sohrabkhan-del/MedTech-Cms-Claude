import { z } from 'zod'

const schemeProductFormSchema = z.object({
  productId: z.string().min(1),
  attached: z.boolean(),
  dealerPoints: z.string(),
  chemistPoints: z.string(),
})

export const schemeFormSchema = z
  .object({
    type: z.enum(['general', 'seasonal']),
    name: z.string().min(2, 'Scheme name is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().optional(),
    regions: z.array(z.enum(['East', 'West', 'North', 'South'])).min(1, 'Select at least one region'),
    partnerTypes: z.array(z.enum(['Dealer', 'Chemist'])).min(1, 'Select at least one partner type'),
    products: z.array(schemeProductFormSchema),
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
  .refine((data) => data.products.some((p) => p.attached), {
    message: 'Attach at least one gift product',
    path: ['products'],
  })
  .refine(
    (data) =>
      !data.partnerTypes.includes('Dealer') ||
      data.products.reduce((sum, p) => sum + (p.attached ? Number(p.dealerPoints || 0) : 0), 0) > 0,
    { message: 'Dealer points allocated across products must be greater than 0', path: ['products'] },
  )
  .refine(
    (data) =>
      !data.partnerTypes.includes('Chemist') ||
      data.products.reduce((sum, p) => sum + (p.attached ? Number(p.chemistPoints || 0) : 0), 0) > 0,
    { message: 'Chemist points allocated across products must be greater than 0', path: ['products'] },
  )

export type SchemeFormValues = z.infer<typeof schemeFormSchema>
export type SchemeProductFormValues = z.infer<typeof schemeProductFormSchema>

export const schemeFormDefaults: SchemeFormValues = {
  type: 'general',
  name: '',
  startDate: '',
  endDate: '',
  regions: [],
  partnerTypes: [],
  products: [],
  description: '',
  disclaimer: '',
  image: '',
  banner: '',
}
