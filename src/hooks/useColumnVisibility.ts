import { useCallback, useState } from 'react'

function storageKey(tableKey: string): string {
  return `medtech-cms:columns:${tableKey}`
}

function readHidden(tableKey: string): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey(tableKey))
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set()
  } catch {
    return new Set()
  }
}

/**
 * `tableKey` is expected to be stable for the lifetime of a CommonTable instance.
 * If a consumer needs to switch keys, remount via a `key` prop rather than relying
 * on this hook to resync — that keeps state changes driven by render, not an effect.
 */
export function useColumnVisibility(tableKey: string) {
  const [hidden, setHidden] = useState<Set<string>>(() => readHidden(tableKey))

  const toggle = useCallback(
    (columnKey: string) => {
      setHidden((prev) => {
        const next = new Set(prev)
        if (next.has(columnKey)) next.delete(columnKey)
        else next.add(columnKey)
        try {
          localStorage.setItem(storageKey(tableKey), JSON.stringify([...next]))
        } catch {
          // localStorage unavailable (private mode, quota) — visibility just won't persist
        }
        return next
      })
    },
    [tableKey],
  )

  return { hidden, toggle }
}
