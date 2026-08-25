import { isAxiosError } from 'axios'

/**
 * Feature-agnostic API error unwrapper. Prefers the backend-provided message
 * (axios error response body), falls back to a generic Error's message, and
 * finally falls back to a caller-supplied string when neither is available.
 */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) return err.response?.data?.message ?? err.message

  // RTK Query / fetch / serialized error shapes sometimes come through as
  // plain objects: { data: { message: '...' }, status: ... }
  if (err && typeof err === 'object') {
    const anyErr = err as any
    if (anyErr.response?.data?.message) return anyErr.response.data.message
    if (anyErr.data?.message) return anyErr.data.message
    if (typeof anyErr.message === 'string') return anyErr.message
  }

  if (err instanceof Error) return err.message
  return fallback
}
