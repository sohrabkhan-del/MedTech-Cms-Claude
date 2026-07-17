import type { Admin, AdminActivityEntry, AdminRegionAccess, AdminRole, AdminStatus } from '@/types/admin'

const names = [
  'Rajesh Kumar', 'Anita Sharma', 'Vivek Malhotra', 'Deepa Krishnan', 'Arjun Nair',
  'Meera Pillai', 'Karan Chawla', 'Shreya Ghosh', 'Nikhil Bansal', 'Pooja Iyer',
]
const regions: AdminRegionAccess[] = ['Pan India', 'North', 'South', 'East', 'West']
const roles: AdminRole[] = ['Super Admin', 'Admin']
const statuses: AdminStatus[] = ['active', 'pending', 'inactive']
const actionTypes = [
  { action: 'Activated Dealer Account', target: 'Dealer' },
  { action: 'Approved KYC Request', target: 'Verification' },
  { action: 'Updated Coin Value Rule', target: 'Coin Rule' },
  { action: 'Created Gift Scheme', target: 'Scheme' },
  { action: 'Deactivated MR Account', target: 'Medical Representative' },
]

function seededNumber(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000
  const frac = x - Math.floor(x)
  return Math.floor(min + frac * (max - min))
}

function buildActivity(seed: number, adminId: string): AdminActivityEntry[] {
  return Array.from({ length: 5 }).map((_, i) => {
    const entry = actionTypes[(seed + i) % actionTypes.length]!
    return {
      id: `${adminId}-activity-${i}`,
      actionPerformed: entry.action,
      targetRecord: `${entry.target} #${1000 + seededNumber(seed + i, 0, 900)}`,
      timestamp: `${((seed + i) % 27) + 1} Jul 2026, ${9 + (i % 8)}:${(seed * 3 + i) % 60 < 10 ? '0' : ''}${(seed * 3 + i) % 60} ${(seed + i) % 2 === 0 ? 'AM' : 'PM'}`,
      ipAddress: `192.168.${(seed + i) % 255}.${(seed * 3 + i) % 255}`,
    }
  })
}

export const mockAdmins: Admin[] = Array.from({ length: 18 }).map((_, index) => {
  const seed = index + 1
  const id = `ADM-${1000 + index}`
  return {
    id,
    name: names[index % names.length]!,
    email: `${names[index % names.length]!.toLowerCase().replace(' ', '.')}@medtechcms.in`,
    phone: `+91 98${(20000000 + index * 173).toString().slice(0, 8)}`,
    regionAccess: regions[index % regions.length]!,
    role: index % 5 === 0 ? 'Super Admin' : roles[index % roles.length]!,
    status: statuses[index % statuses.length]!,
    totalActionsLogged: seededNumber(seed, 20, 400),
    createdDate: `${((seed * 2) % 27) + 1} Jan 2026`,
    recentActivity: buildActivity(seed, id),
  }
})

export function getAdminById(id: string): Admin | undefined {
  return mockAdmins.find((admin) => admin.id === id)
}

export const adminKpis = {
  totalAdmins: mockAdmins.length,
  activeAdmins: mockAdmins.filter((a) => a.status === 'active').length,
  pendingAdmins: mockAdmins.filter((a) => a.status === 'pending').length,
  inactiveAdmins: mockAdmins.filter((a) => a.status === 'inactive').length,
}
