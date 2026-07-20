import { z } from 'zod'

export const loginFormSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginFormValues = z.infer<typeof loginFormSchema>

// TODO: remove prefilled dev credentials once a real backend/login API is wired up.
export const loginFormDefaults: LoginFormValues = {
  email: 'superadmin@medtech.in',
  password: 'test@123',
}
