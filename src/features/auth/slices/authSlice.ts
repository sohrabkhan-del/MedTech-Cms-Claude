import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthState, Credentials, LoginFlowData } from '@/features/auth/types/auth.types'
import type { AuthUser } from '@/types/auth'

const initialState: AuthState = {
  token: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  pendingEmail: null,
  tempPassword: null,
  resetRequired: false,
  passwordResetEmail: null,
  passwordResetToken: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setPendingEmail(state, action: PayloadAction<string>) {
      state.pendingEmail = action.payload
    },
    setLoginFlowData(state, action: PayloadAction<LoginFlowData>) {
      state.pendingEmail = action.payload.email
      state.tempPassword = action.payload.tempPassword
      state.resetRequired = action.payload.resetRequired
    },
    setCredentials(state, action: PayloadAction<Credentials>) {
      state.token = action.payload.token
      state.refreshToken = action.payload.refreshToken
      state.user = action.payload.user
      state.isAuthenticated = true
      state.tempPassword = null
      state.resetRequired = false
      state.pendingEmail = null
    },
    setPasswordResetEmail(state, action: PayloadAction<string>) {
      state.passwordResetEmail = action.payload
      state.passwordResetToken = null
    },
    setPasswordResetToken(state, action: PayloadAction<string>) {
      state.passwordResetToken = action.payload
    },
    clearPasswordReset(state) {
      state.passwordResetEmail = null
      state.passwordResetToken = null
    },
    updateUser(state, action: PayloadAction<Partial<AuthUser>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
    logout() {
      return { ...initialState }
    },
  },
})

export const {
  setPendingEmail,
  setLoginFlowData,
  setCredentials,
  setPasswordResetEmail,
  setPasswordResetToken,
  clearPasswordReset,
  updateUser,
  logout,
} = authSlice.actions
export const authReducer = authSlice.reducer
