import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePartnerInvite } from '@/features/partnerInvite/PartnerInviteContext'

export function useInvitePasswordService() {
  const navigate = useNavigate()
  const { token, basicDetails, setPassword } = usePartnerInvite()
  const [isLoading, setIsLoading] = useState(false)

  function submitPassword(password: string) {
    setIsLoading(true)
    setPassword(password)
    navigate(`/invite/${token}/shop-details`)
    setIsLoading(false)
  }

  return { submitPassword, basicDetails, isLoading }
}
