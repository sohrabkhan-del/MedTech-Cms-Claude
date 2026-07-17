import { z } from 'zod'

export const adminFormSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  regionAccess: z.enum(['Pan India', 'North', 'South', 'East', 'West']),
  role: z.enum(['Super Admin', 'Admin']),
  status: z.enum(['active', 'pending', 'inactive']),
})

export type AdminFormValues = z.infer<typeof adminFormSchema>

export const adminFormDefaults: AdminFormValues = {
  name: '',
  email: '',
  phone: '',
  regionAccess: 'Pan India',
  role: 'Admin',
  status: 'pending',
}
