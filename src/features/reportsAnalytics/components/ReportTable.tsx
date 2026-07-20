import type { ReactNode } from 'react'
import { Grid } from '@mui/material'
import { StatCard } from '@/components/common/StatCard/StatCard'

export interface ReportKpiCard {
  key: string
  label: string
  value: string | number
  icon: ReactNode
  iconColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
}

/**
 * All 8 report list pages render an identical `Grid container spacing={3} sx={{ mb: 3 }}`
 * of 4 `StatCard`s at `size={{ xs: 12, sm: 6, lg: 3 }}` — this wrapper captures that
 * one genuinely shared layout. Detail pages use non-standard grid sizes in places
 * (e.g. 5-card `lg: 2.4` rows, 2-card summary rows) so they keep their Grid/StatCard
 * markup inline rather than being forced through this component.
 */
export function ReportKpiGrid({ cards }: { cards: ReportKpiCard[] }) {
  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {cards.map((card) => (
        <Grid key={card.key} size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label={card.label} value={card.value} icon={card.icon} iconColor={card.iconColor} />
        </Grid>
      ))}
    </Grid>
  )
}
