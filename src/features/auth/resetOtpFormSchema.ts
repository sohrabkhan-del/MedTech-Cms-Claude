import { z } from 'zod'

export const resetOtpFormSchema = z.object({
  otp: z.string().length(6, 'Enter the 6-digit code'),
})

export type ResetOtpFormValues = z.infer<typeof resetOtpFormSchema>

export const resetOtpFormDefaults: ResetOtpFormValues = {
  otp: '',
}
