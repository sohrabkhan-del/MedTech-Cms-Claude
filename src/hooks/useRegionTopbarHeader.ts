import { useEffect, useRef, useState } from 'react'
import {
  useRegionFilter,
  type RegionTopbarHeader,
} from '@/contexts/RegionFilterContext'

type RegionTopbarHeaderInput = Omit<RegionTopbarHeader, 'lastUpdated'> & {
  /**
   * When provided, `lastUpdated` is derived automatically: it is stamped
   * the moment `isLoading` first turns false, and re-stamped on every
   * subsequent loading -> loaded transition (e.g. a manual refresh).
   * Pass an explicit `lastUpdated` instead if a page needs custom timing.
   */
  isLoading?: boolean
  lastUpdated?: Date
}

export function useRegionTopbarHeader(
  header: RegionTopbarHeaderInput,
  enabled = true,
) {
  const { setHeader } = useRegionFilter()
  const { icon, title, subtitle, live, isLoading, lastUpdated: explicitLastUpdated } = header
  const iconRef = useRef(icon)
  iconRef.current = icon

  const stampsImmediately = isLoading === false || isLoading === undefined
  const [autoLastUpdated, setAutoLastUpdated] = useState<Date | undefined>(() =>
    stampsImmediately ? new Date() : undefined,
  )
  const [prevIsLoading, setPrevIsLoading] = useState(isLoading)

  if (isLoading !== prevIsLoading) {
    setPrevIsLoading(isLoading)
    if (stampsImmediately) {
      setAutoLastUpdated(new Date())
    }
  }

  const lastUpdated = explicitLastUpdated ?? autoLastUpdated

  useEffect(() => {
    if (!enabled) {
      setHeader(null)
      return
    }
    setHeader({ icon: iconRef.current, title, subtitle, live, lastUpdated })
    return () => setHeader(null)
  }, [title, subtitle, live, lastUpdated, enabled, setHeader])
}
