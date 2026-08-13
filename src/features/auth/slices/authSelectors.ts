import type { RootState } from '@/app/store'

export const selectAuth = (state: RootState) => state.auth
export const selectCurrentUser = (state: RootState) => state.auth.user
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated
export const selectPendingEmail = (state: RootState) => state.auth.pendingEmail
export const selectResetRequired = (state: RootState) => state.auth.resetRequired
export const selectPasswordResetEmail = (state: RootState) => state.auth.passwordResetEmail
export const selectPasswordResetPhone = (state: RootState) => state.auth.passwordResetPhone
export const selectPasswordResetOtpId = (state: RootState) => state.auth.passwordResetOtpId
