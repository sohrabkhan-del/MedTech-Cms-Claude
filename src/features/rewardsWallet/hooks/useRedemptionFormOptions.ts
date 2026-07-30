import { useGetRedemptionFormOptionsQuery } from '@/features/rewardsWallet/services/redemptionsApi'

interface FormOptions {
  rewardCategoryOptions: string[]
}

const emptyOptions: FormOptions = { rewardCategoryOptions: [] }

/** Shared static option list for the redemption request filter drawer. */
export function useRedemptionFormOptions() {
  const { data } = useGetRedemptionFormOptionsQuery()
  return data ?? emptyOptions
}
