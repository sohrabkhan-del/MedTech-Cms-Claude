import { useEffect } from 'react'
import { chemistService } from '@/features/chemists/services/chemistService'
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { fetchChemistsStart, fetchChemistsSuccess, fetchChemistsFailure } from '@/features/chemists/slices/chemistSlice'
import {
  selectChemists,
  selectChemistKpis,
  selectChemistsStatus,
  selectChemistsError,
} from '@/features/chemists/slices/chemistSelectors'

export function useChemists() {
  const dispatch = useAppDispatch()
  const chemists = useAppSelector(selectChemists)
  const kpis = useAppSelector(selectChemistKpis)
  const status = useAppSelector(selectChemistsStatus)
  const error = useAppSelector(selectChemistsError)

  useEffect(() => {
    if (status !== 'idle') return

    dispatch(fetchChemistsStart())
    Promise.all([chemistService.getChemists(), chemistService.getChemistKpis()])
      .then(([items, chemistKpis]) => {
        dispatch(fetchChemistsSuccess({ items, kpis: chemistKpis }))
      })
      .catch((err: Error) => {
        dispatch(fetchChemistsFailure(err.message ?? 'Failed to load chemists.'))
      })
  }, [status, dispatch])

  return { chemists, kpis, isLoading: status === 'loading', error }
}
