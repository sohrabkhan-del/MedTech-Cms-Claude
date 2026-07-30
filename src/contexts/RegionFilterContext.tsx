import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { DateRange } from '@/components/common/DateRangeFilter/DateRangeFilter'

export interface RegionOption {
  id: string
  code: string
  name: string
  isActive: boolean
}

export interface RegionTopbarHeader {
  icon: ReactNode
  title: string
  subtitle?: string
  live?: boolean
  lastUpdated?: Date
}

interface RegionFilterContextValue {
  region: string
  regionId: string | null
  setRegion: (region: string) => void
  setRegionSelection: (region: RegionOption) => void
  dateRange: DateRange
  setDateRange: (range: DateRange) => void
  header: RegionTopbarHeader | null
  setHeader: (header: RegionTopbarHeader | null) => void
}

const RegionFilterContext = createContext<RegionFilterContextValue | undefined>(
  undefined,
)

export function RegionFilterProvider({ children }: { children: ReactNode }) {
  const [region, setRegion] = useState('All India')
  const [regionId, setRegionId] = useState<string | null>(
    '86709472-1e05-4c9d-9c91-7e7ce5c037d2',
  )
  const [dateRange, setDateRange] = useState<DateRange>({
    from: null,
    to: null,
    presetLabel: 'Last 30 Days',
  })
  const [header, setHeader] = useState<RegionTopbarHeader | null>(null)

  const setRegionSelection = (nextRegion: RegionOption) => {
    setRegion(nextRegion.name)
    setRegionId(nextRegion.id)
  }

  const value = useMemo(
    () => ({
      region,
      regionId,
      setRegion,
      setRegionSelection,
      dateRange,
      setDateRange,
      header,
      setHeader,
    }),
    [region, regionId, dateRange, header],
  )

  return (
    <RegionFilterContext.Provider value={value}>
      {children}
    </RegionFilterContext.Provider>
  )
}

export function useRegionFilter() {
  const ctx = useContext(RegionFilterContext)
  if (!ctx)
    throw new Error(
      'useRegionFilter must be used within a RegionFilterProvider',
    )
  return ctx
}
