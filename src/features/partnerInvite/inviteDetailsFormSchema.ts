import { z } from 'zod'

export const inviteDetailsFormSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(10, 'Enter a valid 10-digit phone number'),
})

export type InviteDetailsFormValues = z.infer<typeof inviteDetailsFormSchema>

export const inviteDetailsFormDefaults: InviteDetailsFormValues = {
  name: '',
  email: '',
  phone: '',
}

export const inviteOtpFormSchema = z.object({
  otp: z.string().length(6, 'Enter the 6-digit OTP'),
})

export type InviteOtpFormValues = z.infer<typeof inviteOtpFormSchema>

export const inviteOtpFormDefaults: InviteOtpFormValues = {
  otp: '',
}
