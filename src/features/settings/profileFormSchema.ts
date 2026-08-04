import { z } from 'zod'

export const profileFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  regionIds: z.array(z.string()).min(1, 'Select at least one region'),
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>
