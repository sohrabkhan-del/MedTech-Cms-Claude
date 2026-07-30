export interface BlogPost {
  id: string
  title: string
  excerpt: string
  body: string
  author: string
  authorInitial: string
  date: string
  tags: string[]
  thumbnailColor: string
}

export const mockBlogPosts: BlogPost[] = [
  {
    id: 'scan-fraud-detection',
    title: 'How AI-Assisted Scan Verification Cuts Counterfeit Reports by 40%',
    excerpt: 'A look inside the field-operations pipeline that flags suspicious scan patterns in real time.',
    body: 'Our field-operations team has been piloting an AI-assisted verification layer on top of the existing scan pipeline. By cross-referencing scan velocity, geo-fence boundaries, and historical dealer behavior, the system flags suspicious patterns before a security alert is even raised manually. Early results across the North and West regions show a 40% reduction in confirmed counterfeit reports quarter-over-quarter, with false positive rates staying under 3%. This post walks through the rollout, the data signals used, and what changed operationally for regional teams.',
    author: 'Aisha Khan',
    authorInitial: 'A',
    date: '2026-07-24',
    tags: ['Field Operations', 'Security', 'Product'],
    thumbnailColor: '#1A3E8C',
  },
  {
    id: 'dealer-onboarding-revamp',
    title: 'Redesigning the Dealer Onboarding Flow: What We Learned',
    excerpt: 'Cutting approval time from 6 days to under 24 hours without loosening KYC checks.',
    body: 'Dealer onboarding used to take up to six days end-to-end, mostly waiting on manual document review. We rebuilt the approval-requests workflow around parallel verification steps and clearer rejection reasons, which cut the median approval time to under 24 hours. This post covers the before/after workflow diagrams, the KYC checklist we kept unchanged, and the metrics that convinced leadership to greenlight the change.',
    author: 'Rohan Mehta',
    authorInitial: 'R',
    date: '2026-07-18',
    tags: ['Partners', 'Operations'],
    thumbnailColor: '#F7941D',
  },
  {
    id: 'reward-redemption-patterns',
    title: 'What 50,000 Reward Redemptions Told Us About Dealer Behavior',
    excerpt: 'Gift cards outperform physical merchandise 3-to-1 once wallet balances cross ₹2,000.',
    body: 'We analyzed 50,000+ reward redemptions across the last two quarters to understand what dealers actually redeem, and when. The clearest signal: gift cards outperform physical merchandise roughly 3-to-1 once a dealer\'s wallet balance crosses ₹2,000, suggesting a liquidity preference kicks in past a certain threshold. This has directly informed how we\'re restructuring the gift catalogue for the next scheme cycle.',
    author: 'Priya Nair',
    authorInitial: 'P',
    date: '2026-07-10',
    tags: ['Rewards & Wallet', 'Analytics'],
    thumbnailColor: '#1E9E5A',
  },
  {
    id: 'geo-fence-rollout',
    title: 'Rolling Out Geo-Fencing Across 12 New Territories',
    excerpt: 'Lessons from expanding boundary-based alerts beyond the original four metro regions.',
    body: 'Geo-fence management launched in four metro regions last year. This quarter we expanded to 12 additional territories, each with different terrain, connectivity, and dealer density challenges. This post covers the boundary-drawing tooling improvements, how we handled overlapping fences near territory borders, and the security-alert tuning needed to avoid alert fatigue in denser regions.',
    author: 'Vikram Singh',
    authorInitial: 'V',
    date: '2026-06-29',
    tags: ['Field Operations', 'Expansion'],
    thumbnailColor: '#E5484D',
  },
]

export function getMockBlogPostById(id: string) {
  return mockBlogPosts.find((post) => post.id === id)
}
