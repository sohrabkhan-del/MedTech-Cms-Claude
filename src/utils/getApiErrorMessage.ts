import { isAxiosError } from 'axios'

/**
 * Feature-agnostic API error unwrapper. Prefers the backend-provided message
 * (axios error response body), falls back to a generic Error's message, and
 * finally falls back to a caller-supplied string when neither is available.
 */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) return err.response?.data?.message ?? err.message
  if (err instanceof Error) return err.message
  return fallback
}
