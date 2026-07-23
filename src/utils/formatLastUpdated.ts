export function formatLastUpdated(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.round(diffMs / 60000)
  if (diffMinutes < 1) return 'Updated just now'
  if (diffMinutes < 60) return `Updated ${diffMinutes}m ago`
  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `Updated ${diffHours}h ago`
  const diffDays = Math.round(diffHours / 24)
  return `Updated ${diffDays}d ago`
}
