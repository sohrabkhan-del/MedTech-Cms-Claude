import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Chemist, ChemistKpis } from '@/features/userManagement/types/userManagement.types'

interface ChemistState {
  items: Chemist[]
  kpis: ChemistKpis | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: ChemistState = {
  items: [],
  kpis: null,
  status: 'idle',
  error: null,
}

const chemistSlice = createSlice({
  name: 'chemists',
  initialState,
  reducers: {
    fetchChemistsStart(state) {
      state.status = 'loading'
      state.error = null
    },
    fetchChemistsSuccess(state, action: PayloadAction<{ items: Chemist[]; kpis: ChemistKpis }>) {
      state.status = 'succeeded'
      state.items = action.payload.items
      state.kpis = action.payload.kpis
    },
    fetchChemistsFailure(state, action: PayloadAction<string>) {
      state.status = 'failed'
      state.error = action.payload
    },
  },
})

export const { fetchChemistsStart, fetchChemistsSuccess, fetchChemistsFailure } = chemistSlice.actions
export const chemistReducer = chemistSlice.reducer
