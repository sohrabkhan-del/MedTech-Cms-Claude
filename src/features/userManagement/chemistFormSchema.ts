import { z } from 'zod'

export const chemistLocationSchema = z.object({
  address: z.string().min(5, 'Shop address is required'),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  scanRadius: z.string().optional(),
  bufferRadius: z.string().optional(),
})

export type ChemistLocationValues = z.infer<typeof chemistLocationSchema>

export const chemistFormSchema = z.object({
  shopName: z.string().min(2, 'Chemist shop name is required'),
  ownerName: z.string().min(2, 'Owner name is required'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  email: z.string().email('Enter a valid email address'),
  licenseNumber: z.string().min(3, 'GSTN number is required'),
  city: z.string().min(2, 'City is required'),
  zone: z.enum(['North', 'South', 'East', 'West']),
  locations: z.array(chemistLocationSchema).min(1, 'Add at least one shop location'),
  assignedMr: z.string().optional(),
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
  locations: [{ address: '', latitude: '', longitude: '', scanRadius: '', bufferRadius: '' }],
  assignedMr: '',
  notes: '',
}
