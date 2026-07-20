import { useEffect, useReducer, useState } from 'react'
import { adminsService } from '@/features/systemUsers/services/adminsService'
import type { Admin, AdminFormValues } from '@/features/systemUsers/types/systemUsers.types'

interface FormOptions {
  regionOptions: Admin['regionAccess'][]
  roleOptions: Admin['role'][]
  statusOptions: Admin['status'][]
}

interface LoadState {
  admin: Admin | undefined
  options: FormOptions | null
  isLoading: boolean
  loadError: string | null
}

type LoadAction =
  | { type: 'loading' }
  | { type: 'succeeded'; admin: Admin | undefined; options: FormOptions }
  | { type: 'failed'; error: string }

const initialLoadState: LoadState = { admin: undefined, options: null, isLoading: false, loadError: null }

function loadReducer(state: LoadState, action: LoadAction): LoadState {
  switch (action.type) {
    case 'loading':
      return { ...state, isLoading: true, loadError: null }
    case 'succeeded':
      return { ...action, isLoading: false, loadError: null }
    case 'failed':
      return { ...state, isLoading: false, loadError: action.error }
  }
}

export function useAdminForm(adminId: string | undefined) {
  const isEdit = !!adminId
  const [loadState, dispatch] = useReducer(loadReducer, initialLoadState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([
      adminId ? adminsService.getAdminDetail(adminId) : Promise.resolve(undefined),
      adminsService.getAdminFormOptions(),
    ])
      .then(([admin, options]) => {
        if (!cancelled) dispatch({ type: 'succeeded', admin, options })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load admin form data.' })
      })

    return () => {
      cancelled = true
    }
  }, [adminId])

  async function submit(values: AdminFormValues) {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      if (isEdit && adminId) {
        await adminsService.updateAdmin(adminId, values)
      } else {
        await adminsService.createAdmin(values)
      }
      return true
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save admin.')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return { isEdit, ...loadState, isSubmitting, error: loadState.loadError ?? submitError, submit }
}
