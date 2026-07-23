import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartCard } from '@/components/common/ChartCard/ChartCard'
import { ChartTooltip } from '@/components/common/ChartCard/ChartTooltip'
import type { DateRangeValue } from '@/components/common/DateRangeSelect/DateRangeSelect'
import type { SchemeProgress } from '@/features/dashboard/types/dashboard.types'

function truncateLabel(label: string, maxLength = 14): string {
  return label.length > maxLength ? `${label.slice(0, maxLength - 1)}…` : label
}

interface SchemePerformanceChartProps {
  schemePerformance: SchemeProgress[]
}

export function SchemePerformanceChart({ schemePerformance }: SchemePerformanceChartProps) {
  const navigate = useNavigate()
  const data = schemePerformance.map((s) => ({ name: s.name, Progress: s.progress }))
  const [dateRange, setDateRange] = useState<DateRangeValue>('7')

  return (
    <ChartCard
      title="Scheme Performance"
      subtitle="Redemption progress by active scheme"
      height={280}
      dateRange={dateRange}
      onDateRangeChange={setDateRange}
      onCardClick={() => navigate('/scheme-management/schemes/general')}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#4A4A4A' }}
            tickLine={false}
            axisLine={{ stroke: '#E5E5E5' }}
            tickFormatter={(value: string) => truncateLabel(value)}
            interval={0}
          />
          <YAxis tick={{ fontSize: 11, fill: '#4A4A4A' }} tickLine={false} axisLine={false} unit="%" />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(26,62,140,0.04)' }} />
          <Bar dataKey="Progress" fill="#1A3E8C" radius={[6, 6, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
