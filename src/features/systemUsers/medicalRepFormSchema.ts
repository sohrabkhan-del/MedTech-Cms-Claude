import { z } from 'zod'

export const medicalRepFormSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  region: z.enum(['North', 'South', 'East', 'West']),
  status: z.enum(['active', 'pending', 'inactive']),
  notes: z.string().optional(),
})

export type MedicalRepFormValues = z.infer<typeof medicalRepFormSchema>

export const medicalRepFormDefaults: MedicalRepFormValues = {
  name: '',
  email: '',
  phone: '',
  region: 'North',
  status: 'pending',
  notes: '',
}
