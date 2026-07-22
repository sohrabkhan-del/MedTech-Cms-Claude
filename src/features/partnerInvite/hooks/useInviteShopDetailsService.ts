import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { partnerInviteService } from '@/features/partnerInvite/services/partnerInviteService'
import { getAuthErrorMessage } from '@/features/auth/getAuthErrorMessage'
import { usePartnerInvite } from '@/features/partnerInvite/PartnerInviteContext'
import type { PartnerInviteShopDetails } from '@/types/partnerInvite'

export function useInviteShopDetailsService() {
  const navigate = useNavigate()
  const { token, basicDetails, password, setShopDetails } = usePartnerInvite()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [applicationId, setApplicationId] = useState<string | null>(null)

  async function submitShopDetails(shopDetails: PartnerInviteShopDetails) {
    if (!basicDetails || !password) {
      setError('Your session has expired. Please start again.')
      navigate(`/invite/${token}`)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const response = await partnerInviteService.submitPartnerInvite({
        token,
        basicDetails,
        password,
        shopDetails,
      })
      setShopDetails(shopDetails)
      setApplicationId(response.applicationId)
    } catch (err) {
      setError(getAuthErrorMessage(err, 'Unable to submit your details. Please try again.'))
    } finally {
      setIsLoading(false)
    }
  }

  return { submitShopDetails, applicationId, isLoading, error }
}
