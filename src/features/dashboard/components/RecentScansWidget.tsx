import { Avatar, Stack, Typography } from '@mui/material'
import { WidgetCard } from '@/components/common/WidgetCard/WidgetCard'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import type { RecentScan } from '@/features/dashboard/types/dashboard.types'

interface RecentScansWidgetProps {
  recentScans: RecentScan[]
}

export function RecentScansWidget({ recentScans }: RecentScansWidgetProps) {
  return (
    <WidgetCard title="Recent Scans" subtitle="Live scan feed across regions" onRefresh={() => {}} onExport={() => {}}>
      <Stack spacing={2}>
        {recentScans.map((scan) => (
          <Stack key={scan.id} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.light', color: 'primary.main', fontSize: '0.8rem', fontWeight: 700 }}>
              {scan.user.slice(0, 1)}
            </Avatar>
            <Stack sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }} noWrap>
                {scan.business}
              </Typography>
              <Typography variant="caption">
                {scan.user} · {scan.role} · {scan.region}
              </Typography>
            </Stack>
            <Stack sx={{ alignItems: 'flex-end' }} spacing={0.5}>
              <StatusBadge status={scan.result} />
              <Typography variant="caption">{scan.time}</Typography>
            </Stack>
          </Stack>
        ))}
      </Stack>
    </WidgetCard>
  )
}
