import { z } from 'zod'

export const firstLoginResetFormSchema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type FirstLoginResetFormValues = z.infer<typeof firstLoginResetFormSchema>

export const firstLoginResetFormDefaults: FirstLoginResetFormValues = {
  newPassword: '',
  confirmPassword: '',
}
