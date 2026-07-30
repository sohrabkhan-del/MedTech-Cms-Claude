// MOCK MODE — flip VITE_USE_MOCKS=false and confirm this endpoint's real backend path once integration starts.
import { baseApi } from '@/store/api/baseApi'
import type {
  PartnerInviteBasicDetails,
  PartnerInviteShopDetails,
  PartnerInviteType,
} from '@/types/partnerInvite'

export interface InviteTokenInfo {
  token: string
  inviteType: PartnerInviteType
  invitee: PartnerInviteBasicDetails
}

export interface SubmitPartnerInvitePayload {
  token: string
  basicDetails: PartnerInviteBasicDetails
  password: string
  shopDetails: PartnerInviteShopDetails
}

export interface SubmitPartnerInviteResponse {
  applicationId: string
}

async function mockResolveInviteToken(token: string | undefined): Promise<InviteTokenInfo> {
  if (!token) throw new Error('This invite link is invalid or has expired.')
  return {
    token,
    inviteType: 'Dealer',
    invitee: { name: 'Rajesh Kumar', email: 'rajesh.kumar@example.com', phone: '9876543210' },
  }
}

async function mockSendOtp(payload: PartnerInviteBasicDetails): Promise<{ email: string }> {
  return { email: payload.email }
}

async function mockVerifyOtp(otp: string): Promise<{ verified: true }> {
  if (otp !== '123456') {
    throw new Error('Invalid or expired OTP')
  }
  return { verified: true }
}

async function mockSubmitPartnerInvite(): Promise<SubmitPartnerInviteResponse> {
  return { applicationId: `PA-${Math.floor(1000 + Math.random() * 9000)}` }
}

const partnerInviteApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    resolveInviteToken: builder.query<InviteTokenInfo, string | undefined>({
      query: (token) => ({
        tag: 'PartnerInvite',
        url: `/partner-invite/${token ?? ''}`,
        mockResolver: () => mockResolveInviteToken(token),
      }),
      providesTags: (_result, _error, token) => [{ type: 'PartnerInvite', id: token ?? 'INVALID' }],
    }),

    sendOtp: builder.mutation<{ email: string }, PartnerInviteBasicDetails>({
      query: (payload) => ({
        tag: 'PartnerInvite',
        url: '/partner-invite/send-otp',
        method: 'POST',
        data: payload,
        mockResolver: () => mockSendOtp(payload),
      }),
    }),

    verifyOtp: builder.mutation<{ verified: true }, { email: string; otp: string }>({
      query: ({ email, otp }) => ({
        tag: 'PartnerInvite',
        url: '/partner-invite/verify-otp',
        method: 'POST',
        data: { email, otp },
        mockResolver: () => mockVerifyOtp(otp),
      }),
    }),

    submitPartnerInvite: builder.mutation<SubmitPartnerInviteResponse, SubmitPartnerInvitePayload>({
      query: (payload) => ({
        tag: 'PartnerInvite',
        url: '/partner-invite/submit',
        method: 'POST',
        data: payload,
        mockResolver: () => mockSubmitPartnerInvite(),
      }),
    }),
  }),
})

export const {
  useResolveInviteTokenQuery,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useSubmitPartnerInviteMutation,
} = partnerInviteApi
