import type {
  AuditActionType,
  AuditChangedField,
  AuditEntityType,
  AuditLogEntry,
  AuditModule,
  AuditStatus,
  AuditTimelineEvent,
  AuditUserRole,
} from '@/types/auditLog'

const modules: AuditModule[] = [
  'Dealers',
  'Chemists',
  'Medical Representatives',
  'Products',
  'Schemes',
  'Rewards',
  'Wallet',
  'Redemptions',
  'System Users',
  'Authentication',
]

const actionsByModule: Record<AuditModule, AuditActionType[]> = {
  Dealers: ['Record Created', 'Record Updated', 'Record Deleted'],
  Chemists: ['Record Created', 'Record Updated', 'Record Deleted'],
  'Medical Representatives': ['Record Created', 'Record Updated'],
  Products: ['Record Created', 'Record Updated', 'Export'],
  Schemes: ['Record Created', 'Record Updated'],
  Rewards: ['Record Updated', 'Export'],
  Wallet: ['Record Updated', 'Export'],
  Redemptions: ['Record Created', 'Record Updated'],
  'System Users': ['Record Created', 'Record Updated', 'Record Deleted'],
  Authentication: ['Login', 'Logout'],
}

const entityByModule: Record<AuditModule, AuditEntityType> = {
  Dealers: 'Dealer',
  Chemists: 'Chemist',
  'Medical Representatives': 'MR',
  Products: 'Product',
  Schemes: 'Scheme',
  Rewards: 'Reward',
  Wallet: 'Wallet',
  Redemptions: 'Redemption',
  'System Users': 'User',
  Authentication: 'User',
}

const performers = [
  { name: 'Rajesh Kumar', role: 'Super Admin' as AuditUserRole },
  { name: 'Anita Sharma', role: 'Admin' as AuditUserRole },
  { name: 'Rohan Kapoor', role: 'MR' as AuditUserRole },
  { name: 'Neha Joshi', role: 'MR' as AuditUserRole },
  { name: 'Karan Chawla', role: 'Admin' as AuditUserRole },
  { name: 'System Scheduler', role: 'System' as AuditUserRole },
]

const entityNamesByType: Record<AuditEntityType, string[]> = {
  Dealer: ['Om Medical Godown', 'Sunrise Pharma Godown', 'Care Plus Godown', 'Wellness Godown'],
  Chemist: ['Apollo Pharma Chemist', 'Sri Sai Medical', 'National Chemist', 'Metro Chemist'],
  MR: ['Rohan Kapoor', 'Neha Joshi', 'Sanjay Iyer', 'Kavita Reddy'],
  Product: ['CardioCare 10mg', 'NeuroPlus 500mg', 'ImmunoBoost Syrup', 'GlucoBalance'],
  Scheme: ['Seasonal Booster 2026', 'General Reward Scheme', 'Volume Booster Scheme'],
  Reward: ['Gift Rule Bonus', 'Referral Reward', 'Festive Bonus Points'],
  Wallet: ['Wallet #WLT-1042', 'Wallet #WLT-1108', 'Wallet #WLT-1221'],
  Redemption: ['Redemption #RDM-2201', 'Redemption #RDM-2245', 'Redemption #RDM-2299'],
  User: ['Admin Account — Anita Sharma', 'Admin Account — Karan Chawla', 'MR Account — Rohan Kapoor'],
}

const devices = ['Windows 11 · Chrome', 'macOS · Safari', 'Android App v4.2', 'iOS App v4.2', 'Windows 10 · Edge']
const browsers = ['Chrome 126', 'Safari 17', 'Edge 125', 'Firefox 127']

const fieldNamesByModule: Record<AuditModule, string[]> = {
  Dealers: ['status', 'assignedMr', 'availableCoins', 'city'],
  Chemists: ['status', 'assignedMr', 'availableCoins', 'city'],
  'Medical Representatives': ['status', 'region', 'phone'],
  Products: ['dealerRewardPoints', 'chemistRewardPoints', 'status'],
  Schemes: ['status', 'validTill', 'rewardMultiplier'],
  Rewards: ['bonusPoints', 'status'],
  Wallet: ['availableBalance', 'status'],
  Redemptions: ['redemptionStatus', 'deliveryStatus'],
  'System Users': ['status', 'role', 'regionAccess'],
  Authentication: [],
}

function seededNumber(seed: number, min: number, max: number): number {
  const x = Math.sin(seed) * 10000
  const frac = x - Math.floor(x)
  return Math.floor(min + frac * (max - min))
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`
}

function dateTimeFromSeed(seed: number, month = 'Jul'): string {
  const day = (seed % 27) + 1
  const hour = 8 + (seed % 12)
  const minute = (seed * 7) % 60
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour > 12 ? hour - 12 : hour
  return `${pad(day)} ${month} 2026, ${hour12}:${pad(minute)} ${ampm}`
}

function resolveStatus(seed: number): AuditStatus {
  return seed % 13 === 0 ? 'failed' : 'success'
}

function buildChangedData(seed: number, module: AuditModule, action: AuditActionType, logId: string): AuditChangedField[] {
  if (action !== 'Record Updated') return []
  const fields = fieldNamesByModule[module]
  if (fields.length === 0) return []
  const count = seededNumber(seed, 1, Math.min(3, fields.length) + 1)
  return Array.from({ length: count }).map((_, i) => {
    const field = fields[(seed + i) % fields.length]!
    return {
      id: `${logId}-change-${i}`,
      fieldName: field,
      oldValue: field.toLowerCase().includes('status')
        ? 'pending'
        : field.toLowerCase().includes('points') || field.toLowerCase().includes('balance')
          ? `${seededNumber(seed + i, 100, 900)}`
          : 'North',
      newValue: field.toLowerCase().includes('status')
        ? 'active'
        : field.toLowerCase().includes('points') || field.toLowerCase().includes('balance')
          ? `${seededNumber(seed + i + 5, 900, 2000)}`
          : 'South',
    }
  })
}

function buildTimeline(seed: number, action: AuditActionType, status: AuditStatus, logId: string): AuditTimelineEvent[] {
  const timeline: AuditTimelineEvent[] = [{ id: `${logId}-tl-0`, activity: 'Login', dateTime: dateTimeFromSeed(seed - 1) }]
  if (action !== 'Login' && action !== 'Logout') {
    timeline.push({ id: `${logId}-tl-1`, activity: action, dateTime: dateTimeFromSeed(seed) })
  }
  if (status === 'success' && seed % 4 === 0) {
    timeline.push({ id: `${logId}-tl-2`, activity: 'Export', dateTime: dateTimeFromSeed(seed + 1) })
  }
  timeline.push({ id: `${logId}-tl-3`, activity: 'Logout', dateTime: dateTimeFromSeed(seed + 2) })
  return timeline
}

function buildLog(index: number): AuditLogEntry {
  const seed = index + 1
  const id = `LOG-${500000 + index}`
  const module = modules[index % modules.length]!
  const actionPool = actionsByModule[module]
  const action = actionPool[seed % actionPool.length]!
  const entity = entityByModule[module]
  const entityNames = entityNamesByType[entity]
  const entityName = entityNames[seed % entityNames.length]!
  const performer = performers[seed % performers.length]!
  const status = resolveStatus(seed)

  return {
    id,
    module,
    action,
    entity,
    entityId: `${entity.slice(0, 3).toUpperCase()}-${1000 + (seed % 40)}`,
    entityName,
    performedBy: performer.name,
    userRole: performer.role,
    dateTime: dateTimeFromSeed(seed + 15),
    ipAddress: `192.168.${seed % 255}.${(seed * 5) % 255}`,
    device: devices[seed % devices.length]!,
    browser: browsers[seed % browsers.length]!,
    status,

    changedData: buildChangedData(seed, module, action, id),
    timeline: buildTimeline(seed, action, status, id),
  }
}

export const mockAuditLogs: AuditLogEntry[] = Array.from({ length: 80 }).map((_, index) => buildLog(index))

export function getAuditLogById(id: string): AuditLogEntry | undefined {
  return mockAuditLogs.find((log) => log.id === id)
}

export const auditLogKpis = {
  totalEntries: mockAuditLogs.length,
  loginActivities: mockAuditLogs.filter((l) => l.action === 'Login').length,
  recordUpdates: mockAuditLogs.filter((l) => l.action === 'Record Updated').length,
  exportActivities: mockAuditLogs.filter((l) => l.action === 'Export').length,
}

export const auditModuleOptions = modules
export const auditActionOptions: AuditActionType[] = ['Login', 'Record Created', 'Record Updated', 'Record Deleted', 'Export', 'Logout']
export const auditEntityOptions: AuditEntityType[] = ['Dealer', 'Chemist', 'MR', 'Product', 'Scheme', 'Reward', 'Wallet', 'Redemption', 'User']
export const auditUserRoleOptions: AuditUserRole[] = ['Super Admin', 'Admin', 'MR', 'System']
