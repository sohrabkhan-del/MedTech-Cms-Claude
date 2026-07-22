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
      phone: '+91 98765 43210',
      designation: 'Platform Administrator',
      department: 'Corporate IT',
      location: 'Mumbai, Maharashtra',
      joinedOn: '2023-04-10',
    },
  },
}

export function findMockAccount(email: string): MockAuthAccount | undefined {
  return mockAuthAccounts[email.toLowerCase()]
}
