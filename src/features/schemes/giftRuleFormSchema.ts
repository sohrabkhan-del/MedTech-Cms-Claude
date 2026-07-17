import { z } from 'zod'

export const giftRuleFormSchema = z
  .object({
    rewardName: z.string().min(2, 'Reward name is required'),
    rewardTrack: z.enum(['Permanent Catalog', 'Scheme Track']),
    ruleType: z.string().min(1, 'Rule type is required'),
    coinsRequired: z.string().min(1, 'Coins required is required'),
    rewardIcon: z.string().optional(),
    availabilityStatus: z.enum(['available', 'unavailable']),
    schemeName: z.string().optional(),
  })
  .refine((data) => data.rewardTrack === 'Permanent Catalog' || !!data.schemeName, {
    message: 'Scheme name is required for Scheme Track rewards',
    path: ['schemeName'],
  })

export type GiftRuleFormValues = z.infer<typeof giftRuleFormSchema>

export const giftRuleFormDefaults: GiftRuleFormValues = {
  rewardName: '',
  rewardTrack: 'Permanent Catalog',
  ruleType: '',
  coinsRequired: '',
  rewardIcon: '🎁',
  availabilityStatus: 'available',
  schemeName: '',
}
