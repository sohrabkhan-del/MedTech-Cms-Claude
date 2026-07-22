import type { RootState } from '@/app/store'

export const selectNotifications = (state: RootState) => state.notifications.items
export const selectUnreadNotificationCount = (state: RootState) =>
  state.notifications.items.filter((item) => !item.isRead).length
export const selectNotificationById = (id: string | undefined) => (state: RootState) =>
  state.notifications.items.find((item) => item.id === id)
