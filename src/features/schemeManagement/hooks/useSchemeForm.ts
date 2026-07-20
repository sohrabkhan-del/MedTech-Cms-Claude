import { useEffect, useReducer, useState } from 'react'
import { schemesService } from '@/features/schemeManagement/services/schemesService'
import type { Scheme, SchemeFormValues } from '@/features/schemeManagement/types/schemeManagement.types'

interface FormOptions {
  schemeTypeOptions: string[]
  schemeApplicableUserOptions: string[]
  rewardTypeOptions: string[]
  rewardFrequencyOptions: string[]
  festivalOptions: string[]
  productCategoryOptions: string[]
}

interface LoadState {
  scheme: Scheme | undefined
  cloneSource: Scheme | undefined
  options: FormOptions | null
  isLoading: boolean
  loadError: string | null
}

type LoadAction =
  | { type: 'loading' }
  | { type: 'succeeded'; scheme: Scheme | undefined; cloneSource: Scheme | undefined; options: FormOptions }
  | { type: 'failed'; error: string }

const initialLoadState: LoadState = { scheme: undefined, cloneSource: undefined, options: null, isLoading: false, loadError: null }

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

export function useSchemeForm(schemeId: string | undefined, cloneFromId: string | null) {
  const isEdit = !!schemeId
  const [loadState, dispatch] = useReducer(loadReducer, initialLoadState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'loading' })

    Promise.all([
      schemeId ? schemesService.getSchemeDetail(schemeId) : Promise.resolve(undefined),
      !schemeId && cloneFromId ? schemesService.getSchemeDetail(cloneFromId) : Promise.resolve(undefined),
      schemesService.getSchemeFormOptions(),
    ])
      .then(([scheme, cloneSource, options]) => {
        if (!cancelled) dispatch({ type: 'succeeded', scheme, cloneSource, options })
      })
      .catch((err: Error) => {
        if (!cancelled) dispatch({ type: 'failed', error: err.message ?? 'Failed to load scheme form data.' })
      })

    return () => {
      cancelled = true
    }
  }, [schemeId, cloneFromId])

  async function submit(values: SchemeFormValues) {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      if (isEdit && schemeId) {
        await schemesService.updateScheme(schemeId, values)
      } else {
        await schemesService.createScheme(values)
      }
      return true
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save scheme.')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  return { isEdit, ...loadState, isSubmitting, error: loadState.loadError ?? submitError, submit }
}
