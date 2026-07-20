import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthState, Credentials, LoginFlowData } from '@/features/auth/types/auth.types'

const initialState: AuthState = {
  token: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  pendingEmail: null,
  tempPassword: null,
  resetRequired: false,
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
    logout() {
      return { ...initialState }
    },
  },
})

export const { setPendingEmail, setLoginFlowData, setCredentials, logout } = authSlice.actions
export const authReducer = authSlice.reducer
