import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard } from '@/components/common/ChartCard/ChartCard'
import { ChartTooltip } from '@/components/common/ChartCard/ChartTooltip'
import type { ScanActivityPoint } from '@/features/dashboard/types/dashboard.types'

interface ScanActivityChartProps {
  scanActivityTrend: ScanActivityPoint[]
}

export function ScanActivityChart({ scanActivityTrend }: ScanActivityChartProps) {
  return (
    <ChartCard title="Scan Activity" subtitle="Scans vs. rewards issued, last 7 days" height={320} onRefresh={() => {}} onExport={() => {}}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={scanActivityTrend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="scansGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1A3E8C" stopOpacity={0.28} />
              <stop offset="95%" stopColor="#1A3E8C" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="rewardsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F7941D" stopOpacity={0.28} />
              <stop offset="95%" stopColor="#F7941D" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
          <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#4A4A4A' }} tickLine={false} axisLine={{ stroke: '#E5E5E5' }} />
          <YAxis tick={{ fontSize: 12, fill: '#4A4A4A' }} tickLine={false} axisLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 12, color: '#4A4A4A' }}
          />
          <Area type="monotone" dataKey="scans" name="Scans" stroke="#1A3E8C" strokeWidth={2} fill="url(#scansGradient)" />
          <Area type="monotone" dataKey="rewards" name="Rewards" stroke="#F7941D" strokeWidth={2} fill="url(#rewardsGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
