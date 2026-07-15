import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { DateRange } from '@/components/common/DateRangeFilter/DateRangeFilter'

export interface RegionTopbarHeader {
  icon: ReactNode
  title: string
  subtitle?: string
  live?: boolean
}

interface RegionFilterContextValue {
  region: string
  setRegion: (region: string) => void
  dateRange: DateRange
  setDateRange: (range: DateRange) => void
  header: RegionTopbarHeader | null
  setHeader: (header: RegionTopbarHeader | null) => void
}

const RegionFilterContext = createContext<RegionFilterContextValue | undefined>(undefined)

export function RegionFilterProvider({ children }: { children: ReactNode }) {
  const [region, setRegion] = useState('All India')
  const [dateRange, setDateRange] = useState<DateRange>({ from: null, to: null, presetLabel: 'Last 30 Days' })
  const [header, setHeader] = useState<RegionTopbarHeader | null>(null)

  const value = useMemo(
    () => ({ region, setRegion, dateRange, setDateRange, header, setHeader }),
    [region, dateRange, header],
  )

  return <RegionFilterContext.Provider value={value}>{children}</RegionFilterContext.Provider>
}

export function useRegionFilter() {
  const ctx = useContext(RegionFilterContext)
  if (!ctx) throw new Error('useRegionFilter must be used within a RegionFilterProvider')
  return ctx
}
