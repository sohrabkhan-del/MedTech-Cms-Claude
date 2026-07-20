import * as reduxPersistStorage from 'redux-persist/lib/storage'
import type { WebStorage, PersistConfig } from 'redux-persist'
import type { AuthState } from '@/features/auth/types/auth.types'

// Vite/Rolldown's CJS interop double-wraps this module's `exports.default`,
// so unwrap by shape (presence of `getItem`) rather than trusting the nesting.
function unwrapStorage(candidate: unknown): WebStorage {
  if (candidate && typeof (candidate as WebStorage).getItem === 'function') {
    return candidate as WebStorage
  }
  return unwrapStorage((candidate as { default: unknown }).default)
}

const storage = unwrapStorage(reduxPersistStorage)

export const authPersistConfig: PersistConfig<AuthState> = {
  key: 'auth',
  storage,
  blacklist: ['pendingEmail'],
}
