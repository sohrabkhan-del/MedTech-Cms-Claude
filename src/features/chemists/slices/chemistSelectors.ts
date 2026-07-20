import type { RootState } from '@/app/store'

export const selectChemists = (state: RootState) => state.chemists.items
export const selectChemistKpis = (state: RootState) => state.chemists.kpis
export const selectChemistsStatus = (state: RootState) => state.chemists.status
export const selectChemistsError = (state: RootState) => state.chemists.error
