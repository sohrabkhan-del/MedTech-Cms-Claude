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
  linkTo?: string
}

export const activityTimeline: ActivityEvent[] = [
  { id: 'evt-1', actor: 'Rahul Mehta', action: 'approved dealer', target: 'Om Medical Store', timestamp: '8 min ago', linkTo: '/partners/dealers/dealer-1' },
  { id: 'evt-2', actor: 'System', action: 'flagged security alert for', target: 'Chemist #4021', timestamp: '24 min ago', linkTo: '/field-operations/security-alerts' },
  { id: 'evt-3', actor: 'Priya Nair', action: 'uploaded factory inventory batch', target: 'BTC-88291', timestamp: '1 hr ago', linkTo: '/inventory/factory-inventory-upload' },
  { id: 'evt-4', actor: 'Amit Verma', action: 'redeemed reward for', target: 'Sunrise Pharma', timestamp: '2 hr ago', linkTo: '/rewards-wallet/reward-redemptions/redeem-req-1' },
  { id: 'evt-5', actor: 'System', action: 'closed scheme', target: 'Monsoon Bonanza 2026', timestamp: '5 hr ago', linkTo: '/scheme-management/schemes/sessional' },
]

export interface RecentScan {
  id: string
  user: string
  role: string
  business: string
  region: string
  result: BadgeStatus
  time: string
  linkTo?: string
}

export const recentScans: RecentScan[] = [
  { id: 'scn-1', user: 'Rahul Mehta', role: 'MR', business: 'Om Medical Store', region: 'North', result: 'active', time: '2 min ago', linkTo: '/reports/scan-reports/RPT-SCAN-100000' },
  { id: 'scn-2', user: 'Priya Nair', role: 'Dealer', business: 'Sunrise Pharma', region: 'West', result: 'active', time: '11 min ago', linkTo: '/reports/scan-reports/RPT-SCAN-100001' },
  { id: 'scn-3', user: 'Chemist Bot', role: 'Chemist', business: 'Wellness Chemist', region: 'South', result: 'pending', time: '32 min ago', linkTo: '/reports/scan-reports/RPT-SCAN-100002' },
  { id: 'scn-4', user: 'Amit Verma', role: 'MR', business: 'Care Plus Store', region: 'East', result: 'inactive', time: '1 hr ago', linkTo: '/reports/scan-reports/RPT-SCAN-100003' },
  { id: 'scn-5', user: 'Sanjay Kulkarni', role: 'MR', business: 'City Chemist', region: 'North', result: 'active', time: '1 hr ago', linkTo: '/reports/scan-reports/RPT-SCAN-100004' },
  { id: 'scn-6', user: 'Meena Iyer', role: 'Dealer', business: 'MedPlus Corner', region: 'West', result: 'active', time: '2 hr ago', linkTo: '/reports/scan-reports/RPT-SCAN-100005' },
  { id: 'scn-7', user: 'Vikram Singh', role: 'Chemist', business: 'Apollo Chemist', region: 'South', result: 'pending', time: '2 hr ago', linkTo: '/reports/scan-reports/RPT-SCAN-100006' },
  { id: 'scn-8', user: 'Anita Desai', role: 'MR', business: 'Wellness Traders', region: 'South', result: 'active', time: '3 hr ago', linkTo: '/reports/scan-reports/RPT-SCAN-100007' },
  { id: 'scn-9', user: 'Rohan Kapoor', role: 'Dealer', business: 'Shree Balaji Agencies', region: 'North', result: 'inactive', time: '3 hr ago', linkTo: '/reports/scan-reports/RPT-SCAN-100008' },
  { id: 'scn-10', user: 'Neha Joshi', role: 'Chemist', business: 'Sanjeevani Medicals', region: 'Central', result: 'active', time: '4 hr ago', linkTo: '/reports/scan-reports/RPT-SCAN-100009' },
  { id: 'scn-11', user: 'Arjun Rao', role: 'MR', business: 'Metro Pharma Distributors', region: 'West', result: 'pending', time: '5 hr ago', linkTo: '/reports/scan-reports/RPT-SCAN-100010' },
  { id: 'scn-12', user: 'Kavita Menon', role: 'Dealer', business: 'Ashirwad Traders', region: 'Central', result: 'active', time: '5 hr ago', linkTo: '/reports/scan-reports/RPT-SCAN-100011' },
  { id: 'scn-13', user: 'Suresh Pillai', role: 'Chemist', business: 'Lifeline Chemist', region: 'West', result: 'active', time: '6 hr ago', linkTo: '/reports/scan-reports/RPT-SCAN-100012' },
  { id: 'scn-14', user: 'Divya Nair', role: 'MR', business: 'Vinayak Medical Agencies', region: 'East', result: 'inactive', time: '7 hr ago', linkTo: '/reports/scan-reports/RPT-SCAN-100013' },
  { id: 'scn-15', user: 'Karan Malhotra', role: 'Dealer', business: 'National Health Distributors', region: 'South', result: 'active', time: '8 hr ago', linkTo: '/reports/scan-reports/RPT-SCAN-100014' },
]

export interface EntityLeaderboardEntry {
  id: string
  rank: number
  name: string
  region: string
  points: number
  linkTo?: string
}

export const dealerLeaderboard: EntityLeaderboardEntry[] = [
  { id: 'd1', rank: 1, name: 'Om Medical Store', region: 'North', points: 1204, linkTo: '/partners/dealers/dealer-1' },
  { id: 'd2', rank: 2, name: 'Sunrise Pharma', region: 'West', points: 1088, linkTo: '/partners/dealers/dealer-2' },
  { id: 'd3', rank: 3, name: 'Care Plus Distributors', region: 'East', points: 962, linkTo: '/partners/dealers/dealer-3' },
  { id: 'd4', rank: 4, name: 'Wellness Traders', region: 'South', points: 845, linkTo: '/partners/dealers/dealer-4' },
  { id: 'd5', rank: 5, name: 'Shree Balaji Agencies', region: 'North', points: 812, linkTo: '/partners/dealers/dealer-5' },
  { id: 'd6', rank: 6, name: 'Metro Pharma Distributors', region: 'West', points: 774, linkTo: '/partners/dealers/dealer-6' },
  { id: 'd7', rank: 7, name: 'Ashirwad Traders', region: 'Central', points: 731, linkTo: '/partners/dealers/dealer-7' },
  { id: 'd8', rank: 8, name: 'Vinayak Medical Agencies', region: 'East', points: 698, linkTo: '/partners/dealers/dealer-8' },
  { id: 'd9', rank: 9, name: 'National Health Distributors', region: 'South', points: 652, linkTo: '/partners/dealers/dealer-9' },
  { id: 'd10', rank: 10, name: 'Green Cross Pharma', region: 'North', points: 610, linkTo: '/partners/dealers/dealer-10' },
]

export const chemistLeaderboard: EntityLeaderboardEntry[] = [
  { id: 'c1', rank: 1, name: 'City Chemist', region: 'North', points: 318, linkTo: '/partners/chemists/chemist-1' },
  { id: 'c2', rank: 2, name: 'MedPlus Corner', region: 'West', points: 276, linkTo: '/partners/chemists/chemist-2' },
  { id: 'c3', rank: 3, name: 'Apollo Chemist', region: 'South', points: 241, linkTo: '/partners/chemists/chemist-3' },
  { id: 'c4', rank: 4, name: 'Wellness Chemist', region: 'East', points: 219, linkTo: '/partners/chemists/chemist-4' },
  { id: 'c5', rank: 5, name: 'Care Plus Store', region: 'North', points: 198, linkTo: '/partners/chemists/chemist-5' },
  { id: 'c6', rank: 6, name: 'Sanjeevani Medicals', region: 'Central', points: 176, linkTo: '/partners/chemists/chemist-6' },
  { id: 'c7', rank: 7, name: 'Lifeline Chemist', region: 'West', points: 152, linkTo: '/partners/chemists/chemist-7' },
  { id: 'c8', rank: 8, name: 'Trust Pharmacy', region: 'South', points: 134, linkTo: '/partners/chemists/chemist-8' },
  { id: 'c9', rank: 9, name: 'Om Sai Medicals', region: 'East', points: 121, linkTo: '/partners/chemists/chemist-9' },
  { id: 'c10', rank: 10, name: 'Shivam Chemist', region: 'North', points: 108, linkTo: '/partners/chemists/chemist-10' },
]

export interface Redemption {
  id: string
  requester: string
  reward: string
  points: number
  status: BadgeStatus
  date: string
  linkTo?: string
}

export const recentRedemptions: Redemption[] = [
  { id: 'r1', requester: 'Om Medical Store', reward: 'Wireless Earbuds', points: 1200, status: 'approved', date: '13 Jul 2026', linkTo: '/rewards-wallet/reward-redemptions/redeem-req-1' },
  { id: 'r2', requester: 'City Chemist', reward: 'Amazon Voucher ₹2000', points: 2000, status: 'pending', date: '12 Jul 2026', linkTo: '/rewards-wallet/reward-redemptions/redeem-req-2' },
  { id: 'r3', requester: 'Sunrise Pharma', reward: 'Steel Cookware Set', points: 850, status: 'approved', date: '11 Jul 2026', linkTo: '/rewards-wallet/reward-redemptions/redeem-req-3' },
  { id: 'r4', requester: 'Wellness Chemist', reward: 'Smart Watch', points: 3200, status: 'rejected', date: '10 Jul 2026', linkTo: '/rewards-wallet/reward-redemptions/redeem-req-4' },
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
  linkTo?: string
}

export const leaderboard: LeaderboardEntry[] = [
  { id: 'l1', rank: 1, name: 'Om Medical Store', region: 'North', points: 18420, linkTo: '/partners/dealers/dealer-1' },
  { id: 'l2', rank: 2, name: 'Sunrise Pharma', region: 'West', points: 16980, linkTo: '/partners/dealers/dealer-2' },
  { id: 'l3', rank: 3, name: 'City Chemist', region: 'North', points: 15230, linkTo: '/partners/chemists/chemist-1' },
  { id: 'l4', rank: 4, name: 'Care Plus Distributors', region: 'East', points: 13860, linkTo: '/partners/dealers/dealer-3' },
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

export const pointsSummary = {
  totalPointsEarned: 428600,
  totalPointsClaimed: 184200,
  totalRewardPoints: 244400,
  monthlyGrowth: '+12.4%',
}
