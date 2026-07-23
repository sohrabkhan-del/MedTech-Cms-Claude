import type {
  PartnerInviteBasicDetails,
  PartnerInviteShopDetails,
  PartnerInviteType,
} from '@/types/partnerInvite'

// TODO: swap these mock-backed implementations for apiClient calls once the
// real partner-invite API is available. Function signatures are designed to stay the same.

interface InviteTokenInfo {
  token: string
  inviteType: PartnerInviteType
  invitee: PartnerInviteBasicDetails
}

async function resolveInviteToken(token: string | undefined): Promise<InviteTokenInfo> {
  if (!token) throw new Error('This invite link is invalid or has expired.')
  return {
    token,
    inviteType: 'Dealer',
    invitee: { name: 'Rajesh Kumar', email: 'rajesh.kumar@example.com', phone: '9876543210' },
  }
}

async function sendOtp(payload: PartnerInviteBasicDetails): Promise<{ email: string }> {
  return { email: payload.email }
}

async function verifyOtp(_email: string, otp: string): Promise<{ verified: true }> {
  if (otp !== '123456') {
    throw new Error('Invalid or expired OTP')
  }
  return { verified: true }
}

interface SubmitPartnerInvitePayload {
  token: string
  basicDetails: PartnerInviteBasicDetails
  password: string
  shopDetails: PartnerInviteShopDetails
}

interface SubmitPartnerInviteResponse {
  applicationId: string
}

async function submitPartnerInvite(_payload: SubmitPartnerInvitePayload): Promise<SubmitPartnerInviteResponse> {
  return { applicationId: `PA-${Math.floor(1000 + Math.random() * 9000)}` }
}

export const partnerInviteService = {
  resolveInviteToken,
  sendOtp,
  verifyOtp,
  submitPartnerInvite,
}
