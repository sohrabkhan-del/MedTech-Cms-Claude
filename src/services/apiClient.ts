import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { env } from '@/config/env'

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

type UnauthorizedHandler = () => void

let getAccessToken: () => string | null | undefined = () => null
let getRefreshToken: () => string | null | undefined = () => null
let onTokenRefreshed: (tokens: { token: string; refreshToken: string }) => void = () => {}
let onUnauthorized: UnauthorizedHandler = () => {}

/**
 * Wires the client to the Redux store without a static import, since the store
 * itself depends on slices that may call into this client (avoids a cycle).
 */
export function configureApiClientAuth(config: {
  getAccessToken: () => string | null | undefined
  getRefreshToken: () => string | null | undefined
  onTokenRefreshed: (tokens: { token: string; refreshToken: string }) => void
  onUnauthorized: UnauthorizedHandler
}) {
  getAccessToken = config.getAccessToken
  getRefreshToken = config.getRefreshToken
  onTokenRefreshed = config.onTokenRefreshed
  onUnauthorized = config.onUnauthorized
}

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null

  try {
    const response = await axios.post<{ token: string; refreshToken: string }>(
      `${env.apiBaseUrl}/auth/refresh`,
      { refreshToken },
    )
    onTokenRefreshed(response.data)
    return response.data.token
  } catch {
    return null
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    refreshPromise ??= refreshAccessToken().finally(() => {
      refreshPromise = null
    })

    const newToken = await refreshPromise

    if (!newToken) {
      onUnauthorized()
      return Promise.reject(error)
    }

    originalRequest.headers.set('Authorization', `Bearer ${newToken}`)
    return apiClient(originalRequest)
  },
)
