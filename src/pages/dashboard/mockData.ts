import type { BadgeStatus } from '@/components/common/StatusBadge/StatusBadge'

export interface ScanActivityPoint {
  day: string
  scans: number
  rewards: number
}

export const scanActivityTrend: ScanActivityPoint[] = [
  { day: 'Mon', scans: 820, rewards: 210 },
  { day: 'Tue', scans: 932, rewards: 260 },
  { day: 'Wed', scans: 901, rewards: 240 },
  { day: 'Thu', scans: 1120, rewards: 310 },
  { day: 'Fri', scans: 1284, rewards: 340 },
  { day: 'Sat', scans: 980, rewards: 280 },
  { day: 'Sun', scans: 760, rewards: 190 },
]

export interface RewardMixSlice {
  name: string
  value: number
}

export const rewardMix: RewardMixSlice[] = [
  { name: 'Gift Catalogue', value: 42 },
  { name: 'Wallet Coins', value: 33 },
  { name: 'Scheme Bonus', value: 25 },
]

export interface ActivityEvent {
  id: string
  actor: string
  action: string
  target: string
  timestamp: string
}

export const activityTimeline: ActivityEvent[] = [
  { id: 'evt-1', actor: 'Rahul Mehta', action: 'approved dealer', target: 'Om Medical Store', timestamp: '8 min ago' },
  { id: 'evt-2', actor: 'System', action: 'flagged security alert for', target: 'Chemist #4021', timestamp: '24 min ago' },
  { id: 'evt-3', actor: 'Priya Nair', action: 'uploaded factory inventory batch', target: 'BTC-88291', timestamp: '1 hr ago' },
  { id: 'evt-4', actor: 'Amit Verma', action: 'redeemed reward for', target: 'Sunrise Pharma', timestamp: '2 hr ago' },
  { id: 'evt-5', actor: 'System', action: 'closed scheme', target: 'Monsoon Bonanza 2026', timestamp: '5 hr ago' },
]

export interface RecentScan {
  id: string
  user: string
  role: string
  business: string
  region: string
  result: BadgeStatus
  time: string
}

export const recentScans: RecentScan[] = [
  { id: 'scn-1', user: 'Rahul Mehta', role: 'MR', business: 'Om Medical Store', region: 'North', result: 'active', time: '2 min ago' },
  { id: 'scn-2', user: 'Priya Nair', role: 'Dealer', business: 'Sunrise Pharma', region: 'West', result: 'active', time: '11 min ago' },
  { id: 'scn-3', user: 'Chemist Bot', role: 'Chemist', business: 'Wellness Chemist', region: 'South', result: 'pending', time: '32 min ago' },
  { id: 'scn-4', user: 'Amit Verma', role: 'MR', business: 'Care Plus Store', region: 'East', result: 'inactive', time: '1 hr ago' },
]

export interface TopEntity {
  id: string
  name: string
  metricLabel: string
  metricValue: string
  region: string
}

export const topDealers: TopEntity[] = [
  { id: 'd1', name: 'Om Medical Store', metricLabel: 'Scans', metricValue: '1,204', region: 'North' },
  { id: 'd2', name: 'Sunrise Pharma', metricLabel: 'Scans', metricValue: '1,088', region: 'West' },
  { id: 'd3', name: 'Care Plus Distributors', metricLabel: 'Scans', metricValue: '962', region: 'East' },
  { id: 'd4', name: 'Wellness Traders', metricLabel: 'Scans', metricValue: '845', region: 'South' },
]

export const topChemists: TopEntity[] = [
  { id: 'c1', name: 'City Chemist', metricLabel: 'Redemptions', metricValue: '318', region: 'North' },
  { id: 'c2', name: 'MedPlus Corner', metricLabel: 'Redemptions', metricValue: '276', region: 'West' },
  { id: 'c3', name: 'Apollo Chemist', metricLabel: 'Redemptions', metricValue: '241', region: 'South' },
]

export const topProducts: TopEntity[] = [
  { id: 'p1', name: 'CardioCare 10mg', metricLabel: 'Units scanned', metricValue: '9,842', region: 'All India' },
  { id: 'p2', name: 'NeuroPlus 500mg', metricLabel: 'Units scanned', metricValue: '7,120', region: 'All India' },
  { id: 'p3', name: 'ImmunoBoost Syrup', metricLabel: 'Units scanned', metricValue: '6,004', region: 'All India' },
]

export interface Redemption {
  id: string
  requester: string
  reward: string
  points: number
  status: BadgeStatus
  date: string
}

export const recentRedemptions: Redemption[] = [
  { id: 'r1', requester: 'Om Medical Store', reward: 'Wireless Earbuds', points: 1200, status: 'approved', date: '13 Jul 2026' },
  { id: 'r2', requester: 'City Chemist', reward: 'Amazon Voucher ₹2000', points: 2000, status: 'pending', date: '12 Jul 2026' },
  { id: 'r3', requester: 'Sunrise Pharma', reward: 'Steel Cookware Set', points: 850, status: 'approved', date: '11 Jul 2026' },
  { id: 'r4', requester: 'Wellness Chemist', reward: 'Smart Watch', points: 3200, status: 'rejected', date: '10 Jul 2026' },
]

export interface SchemeProgress {
  id: string
  name: string
  category: 'General' | 'Seasonal'
  progress: number
  endsIn: string
}

export const schemePerformance: SchemeProgress[] = [
  { id: 's1', name: 'Monsoon Bonanza 2026', category: 'Seasonal', progress: 78, endsIn: '12 days' },
  { id: 's2', name: 'Loyalty Booster Q3', category: 'General', progress: 54, endsIn: '41 days' },
  { id: 's3', name: 'Festive Rewards Drive', category: 'Seasonal', progress: 22, endsIn: '68 days' },
]

export interface LeaderboardEntry {
  id: string
  rank: number
  name: string
  region: string
  points: number
}

export const leaderboard: LeaderboardEntry[] = [
  { id: 'l1', rank: 1, name: 'Om Medical Store', region: 'North', points: 18420 },
  { id: 'l2', rank: 2, name: 'Sunrise Pharma', region: 'West', points: 16980 },
  { id: 'l3', rank: 3, name: 'City Chemist', region: 'North', points: 15230 },
  { id: 'l4', rank: 4, name: 'Care Plus Distributors', region: 'East', points: 13860 },
]

export interface NotificationItem {
  id: string
  title: string
  description: string
  time: string
  read: boolean
}

export const notifications: NotificationItem[] = [
  { id: 'n1', title: 'New approval requests', description: '3 dealer applications are awaiting review.', time: '10 min ago', read: false },
  { id: 'n2', title: 'Factory upload completed', description: 'Batch BTC-88291 processed successfully.', time: '1 hr ago', read: false },
  { id: 'n3', title: 'Scheme ending soon', description: 'Monsoon Bonanza 2026 ends in 12 days.', time: '3 hr ago', read: true },
]

export const revenueSummary = {
  totalRewardValue: '₹42.8L',
  totalRedemptions: 1842,
  avgOrderValue: '₹2,324',
  monthlyGrowth: '+12.4%',
}
