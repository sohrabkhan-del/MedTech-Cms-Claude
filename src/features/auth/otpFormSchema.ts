import { z } from 'zod'

export const otpFormSchema = z.object({
  otp: z.string().length(6, 'Enter the 6-digit OTP'),
})

export type OtpFormValues = z.infer<typeof otpFormSchema>

export const otpFormDefaults: OtpFormValues = {
  otp: '',
}
