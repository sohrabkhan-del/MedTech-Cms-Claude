import { isAxiosError } from 'axios'

export function getAuthErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) return err.response?.data?.message ?? err.message
  if (err instanceof Error) return err.message
  return fallback
}
