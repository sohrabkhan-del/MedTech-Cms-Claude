import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import { authReducer } from '@/features/auth/slices/authSlice'
import { authPersistConfig } from '@/app/store/persistConfig'
import { chemistReducer } from '@/features/userManagement/slices/chemistSlice'
import { configureApiClientAuth } from '@/services/apiClient'
import { logout, setCredentials } from '@/features/auth/slices/authSlice'

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  chemists: chemistReducer,
})

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)

configureApiClientAuth({
  getAccessToken: () => store.getState().auth.token,
  getRefreshToken: () => store.getState().auth.refreshToken,
  onTokenRefreshed: ({ token, refreshToken }) => {
    const { user } = store.getState().auth
    if (user) {
      store.dispatch(setCredentials({ token, refreshToken, user }))
    }
  },
  onUnauthorized: () => {
    store.dispatch(logout())
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
