import { z } from 'zod'

export function createProfileFormSchema(requireRegion: boolean) {
  return z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Enter a valid email address'),
    phone: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit phone number'),
    regionIds: requireRegion
      ? z.array(z.string()).min(1, 'Select at least one region')
      : z.array(z.string()),
  })
}

export const profileFormSchema = createProfileFormSchema(true)

export type ProfileFormValues = z.infer<typeof profileFormSchema>
