import { z } from 'zod'

export const forgotPasswordFormSchema = z.object({
  email: z.string().email('Enter a valid email address'),
})

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>

export const forgotPasswordFormDefaults: ForgotPasswordFormValues = {
  email: '',
}
