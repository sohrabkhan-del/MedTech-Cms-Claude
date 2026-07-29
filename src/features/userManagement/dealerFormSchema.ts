import { z } from 'zod'

export const dealerLocationSchema = z.object({
  address: z.string().min(5, 'Godown address is required'),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  scanRadius: z.string().optional(),
  bufferRadius: z.string().optional(),
})

export type DealerLocationValues = z.infer<typeof dealerLocationSchema>

export const dealerFormSchema = z.object({
  shopName: z.string().min(2, 'Godown name is required'),
  ownerName: z.string().min(2, 'Owner name is required'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  email: z.string().email('Enter a valid email address'),
  licenseNumber: z.string().min(3, 'GSTN number is required'),
  city: z.string().min(2, 'City is required'),
  zone: z.enum(['North', 'South', 'East', 'West']),
  locations: z.array(dealerLocationSchema).min(1, 'Add at least one godown location'),
  assignedMr: z.string().optional(),
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
  locations: [{ address: '', latitude: '', longitude: '', scanRadius: '', bufferRadius: '' }],
  assignedMr: '',
  notes: '',
}
