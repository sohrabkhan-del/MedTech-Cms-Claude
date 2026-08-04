import { z } from 'zod'

export const adminFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit phone number'),
  regionIds: z.array(z.string()).min(1, 'Select at least one region'),
})

export type AdminFormValues = z.infer<typeof adminFormSchema>

export const adminFormDefaults: AdminFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  regionIds: [],
}
