import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { Toast } from '@/components/common/Toast/Toast'

type ToastSeverity = 'success' | 'warning' | 'error' | 'info'

interface ToastState {
  id: number
  severity: ToastSeverity
  title?: string
  message: string
}

interface ToastContextValue {
  show: (severity: ToastSeverity, message: string, title?: string) => void
  success: (message: string, title?: string) => void
  error: (message: string, title?: string) => void
  warning: (message: string, title?: string) => void
  info: (message: string, title?: string) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null)

  const show = useCallback((severity: ToastSeverity, message: string, title?: string) => {
    setToast({ id: Date.now(), severity, title, message })
  }, [])

  const value = useMemo<ToastContextValue>(
    () => ({
      show,
      success: (message, title) => show('success', message, title),
      error: (message, title) => show('error', message, title),
      warning: (message, title) => show('warning', message, title),
      info: (message, title) => show('info', message, title),
    }),
    [show],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast
        open={!!toast}
        title={toast?.title}
        message={toast?.message ?? ''}
        severity={toast?.severity ?? 'success'}
        onClose={() => setToast(null)}
      />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
