import { useEffect, useRef } from 'react'
import {
  useRegionFilter,
  type RegionTopbarHeader,
} from '@/contexts/RegionFilterContext'

export function useRegionTopbarHeader(
  header: RegionTopbarHeader,
  enabled = true,
) {
  const { setHeader } = useRegionFilter()
  const { icon, title, subtitle, live, lastUpdated } = header
  const iconRef = useRef(icon)
  iconRef.current = icon

  useEffect(() => {
    if (!enabled) {
      setHeader(null)
      return
    }
    setHeader({ icon: iconRef.current, title, subtitle, live, lastUpdated })
    return () => setHeader(null)
  }, [title, subtitle, live, lastUpdated, enabled, setHeader])
}
