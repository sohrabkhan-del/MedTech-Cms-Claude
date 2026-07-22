import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { mockNotifications } from '@/features/notifications/mockNotifications'
import type { AppNotification } from '@/types/notification'

interface NotificationsState {
  items: AppNotification[]
}

const initialState: NotificationsState = {
  items: mockNotifications,
}

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    markAsRead(state, action: PayloadAction<string>) {
      const notification = state.items.find((item) => item.id === action.payload)
      if (notification) notification.isRead = true
    },
    markAllAsRead(state) {
      state.items.forEach((item) => {
        item.isRead = true
      })
    },
  },
})

export const { markAsRead, markAllAsRead } = notificationsSlice.actions
export const notificationsReducer = notificationsSlice.reducer
