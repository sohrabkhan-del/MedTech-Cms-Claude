import { getApiErrorMessage } from '@/utils/getApiErrorMessage'

/** Thin auth-flavored wrapper around the shared API error unwrapper. */
export function getAuthErrorMessage(err: unknown, fallback: string): string {
  return getApiErrorMessage(err, fallback)
}
