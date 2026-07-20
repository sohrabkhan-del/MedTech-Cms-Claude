import type { AuthUser } from '@/types/auth'

interface MockAuthAccount {
  password: string
  user: AuthUser
}

export const mockAuthAccounts: Record<string, MockAuthAccount> = {
  'superadmin@medtech.in': {
    password: 'test@123',
    user: {
      id: 'usr-1',
      name: 'Super Admin',
      email: 'superadmin@medtech.in',
      role: 'super_admin',
      avatarInitial: 'S',
    },
  },
}

export function findMockAccount(email: string): MockAuthAccount | undefined {
  return mockAuthAccounts[email.toLowerCase()]
}
