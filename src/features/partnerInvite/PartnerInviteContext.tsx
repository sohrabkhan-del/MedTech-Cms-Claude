import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { PartnerInviteBasicDetails, PartnerInviteShopDetails, PartnerInviteType } from '@/types/partnerInvite'

interface PartnerInviteContextValue {
  token: string
  inviteType: PartnerInviteType
  basicDetails: PartnerInviteBasicDetails | null
  password: string | null
  shopDetails: PartnerInviteShopDetails | null
  setBasicDetails: (details: PartnerInviteBasicDetails) => void
  setPassword: (password: string) => void
  setShopDetails: (details: PartnerInviteShopDetails) => void
}

const PartnerInviteContext = createContext<PartnerInviteContextValue | null>(null)

interface PartnerInviteProviderProps {
  token: string
  inviteType: PartnerInviteType
  children: ReactNode
}

export function PartnerInviteProvider({ token, inviteType, children }: PartnerInviteProviderProps) {
  const [basicDetails, setBasicDetails] = useState<PartnerInviteBasicDetails | null>(null)
  const [password, setPassword] = useState<string | null>(null)
  const [shopDetails, setShopDetails] = useState<PartnerInviteShopDetails | null>(null)

  const value = useMemo(
    () => ({ token, inviteType, basicDetails, password, shopDetails, setBasicDetails, setPassword, setShopDetails }),
    [token, inviteType, basicDetails, password, shopDetails],
  )

  return <PartnerInviteContext.Provider value={value}>{children}</PartnerInviteContext.Provider>
}

export function usePartnerInvite() {
  const context = useContext(PartnerInviteContext)
  if (!context) {
    throw new Error('usePartnerInvite must be used within a PartnerInviteProvider')
  }
  return context
}
