import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { DateRange } from '@/components/common/DateRangeFilter/DateRangeFilter'
import { getRegions, fallbackRegions } from '@/services/regionsService'

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

const STORAGE_KEY = 'medtech-cms.region-filter'

interface PersistedRegionFilter {
  region: string
  regionId: string | null
  dateRange: DateRange
}

function loadPersisted(): PersistedRegionFilter | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PersistedRegionFilter
  } catch {
    return null
  }
}

const defaultRegion = 'All India'
const defaultDateRange: DateRange = {
  from: null,
  to: null,
  presetLabel: 'Last 30 Days',
}

export function RegionFilterProvider({ children }: { children: ReactNode }) {
  const persisted = loadPersisted()
  const [region, setRegion] = useState(persisted?.region ?? defaultRegion)
  const [regionId, setRegionId] = useState<string | null>(
    persisted?.regionId ?? null,
  )
  const [dateRange, setDateRange] = useState<DateRange>(
    persisted?.dateRange ?? defaultDateRange,
  )
  const [header, setHeader] = useState<RegionTopbarHeader | null>(null)

  const setRegionSelection = (nextRegion: RegionOption) => {
    setRegion(nextRegion.name)
    setRegionId(nextRegion.id)
  }

  // Resolve the canonical "All India" region id at runtime when a persisted
  // region id isn't available. This avoids hard-coding an id while still
  // defaulting to the All India region when present from the API.
  useEffect(() => {
    if (regionId) return

    let cancelled = false

    async function resolveDefaultRegionId() {
      try {
        const regions = await getRegions().catch(() => fallbackRegions)
        const allIndia = regions.find(
          (r) => r.code === 'ALL_INDIA' || r.name === 'All India',
        )
        if (!cancelled && allIndia) setRegionId(allIndia.id)
      } catch {
        // ignore — leave regionId null if resolution fails
      }
    }

    void resolveDefaultRegionId()

    return () => {
      cancelled = true
    }
  }, [regionId])

  useEffect(() => {
    const payload: PersistedRegionFilter = { region, regionId, dateRange }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      // localStorage unavailable (e.g. private browsing) — filters just won't persist
    }
  }, [region, regionId, dateRange])

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
