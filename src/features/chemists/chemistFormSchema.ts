import { z } from 'zod'

export const chemistFormSchema = z.object({
  shopName: z.string().min(2, 'Chemist shop name is required'),
  ownerName: z.string().min(2, 'Owner name is required'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  email: z.string().email('Enter a valid email address'),
  licenseNumber: z.string().min(3, 'Drug license number is required'),
  city: z.string().min(2, 'City is required'),
  zone: z.enum(['North', 'South', 'East', 'West']),
  notes: z.string().optional(),
})

export type ChemistFormValues = z.infer<typeof chemistFormSchema>

export const chemistFormDefaults: ChemistFormValues = {
  shopName: '',
  ownerName: '',
  phone: '',
  email: '',
  licenseNumber: '',
  city: '',
  zone: 'North',
  notes: '',
}
