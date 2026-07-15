import { z } from 'zod'

export const dealerFormSchema = z.object({
  shopName: z.string().min(2, 'Godown name is required'),
  ownerName: z.string().min(2, 'Owner name is required'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  email: z.string().email('Enter a valid email address'),
  licenseNumber: z.string().min(3, 'License number is required'),
  city: z.string().min(2, 'City is required'),
  zone: z.enum(['North', 'South', 'East', 'West']),
  notes: z.string().optional(),
})

export type DealerFormValues = z.infer<typeof dealerFormSchema>

export const dealerFormDefaults: DealerFormValues = {
  shopName: '',
  ownerName: '',
  phone: '',
  email: '',
  licenseNumber: '',
  city: '',
  zone: 'North',
  notes: '',
}
