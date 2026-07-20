import { useEffect, useState } from 'react'
import { useScanFeed } from '@/features/fieldOperations/hooks/useScanFeed'
import { scanFeedService } from '@/features/fieldOperations/services/scanFeedService'
import type { ScanEvent } from '@/features/fieldOperations/types/fieldOperations.types'

const MAX_LIVE_ROWS = 200
const NEW_ROW_HIGHLIGHT_MS = 2000

/** Seeds from useScanFeed, then layers a live-updating stream on top while `isLive` is true. */
export function useLiveScanFeed() {
  const { scanEvents: seedEvents, kpis, isLoading, error } = useScanFeed()
  const [newScans, setNewScans] = useState<ScanEvent[]>([])
  const [newRowIds, setNewRowIds] = useState<Set<string>>(new Set())
  const [isLive, setIsLive] = useState(true)

  useEffect(() => {
    if (!isLive) return

    const unsubscribe = scanFeedService.subscribeToLiveScans((nextScan) => {
      setNewScans((prev) => [nextScan, ...prev].slice(0, MAX_LIVE_ROWS))
      setNewRowIds((prev) => new Set(prev).add(nextScan.id))

      setTimeout(() => {
        setNewRowIds((prev) => {
          const next = new Set(prev)
          next.delete(nextScan.id)
          return next
        })
      }, NEW_ROW_HIGHLIGHT_MS)
    })

    return unsubscribe
  }, [isLive])

  const liveScans = [...newScans, ...seedEvents].slice(0, MAX_LIVE_ROWS)

  return {
    liveScans,
    newRowIds,
    isLive,
    toggleLive: () => setIsLive((prev) => !prev),
    kpis,
    isLoading,
    error,
  }
}
