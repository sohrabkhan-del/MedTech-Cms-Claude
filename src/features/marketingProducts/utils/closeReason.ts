export type CloseReason = 'order_placed' | 'no_stock' | 'partner_declined' | 'other'

export const closeReasonLabels: Record<CloseReason, string> = {
  order_placed: 'Order Placed',
  no_stock: 'No Stock',
  partner_declined: 'Partner Declined',
  other: 'Other',
}

export const closeReasonOptions: { value: CloseReason; label: string }[] = [
  { value: 'order_placed', label: closeReasonLabels.order_placed },
  { value: 'no_stock', label: closeReasonLabels.no_stock },
  { value: 'partner_declined', label: closeReasonLabels.partner_declined },
  { value: 'other', label: closeReasonLabels.other },
]

export function formatCloseReason(reason?: string | null): string {
  if (!reason || !reason.trim()) return '-'
  const normalized = reason.trim().toLowerCase()
  if (normalized in closeReasonLabels) {
    return closeReasonLabels[normalized as CloseReason]
  }
  if (reason.includes('_')) {
    return reason
      .split('_')
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }
  return reason
}
