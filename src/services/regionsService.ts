import { apiClient } from '@/services/apiClient'
import type { RegionOption } from '@/contexts/RegionFilterContext'

interface RegionsResponse {
  success: boolean
  data: RegionOption[]
}

export const fallbackRegions: RegionOption[] = [
  {
    id: '86709472-1e05-4c9d-9c91-7e7ce5c037d2',
    code: 'ALL_INDIA',
    name: 'All India',
    isActive: true,
  },
  {
    id: 'e6932f0d-ec81-4d19-91bc-b73d53221ff6',
    code: 'NORTH',
    name: 'North',
    isActive: true,
  },
  {
    id: 'd8b7ae4b-a4e7-497a-93ce-279e3fafe1f9',
    code: 'SOUTH',
    name: 'South',
    isActive: true,
  },
  {
    id: 'b3638b8b-954d-482d-ab55-75f6bf90e154',
    code: 'EAST',
    name: 'East',
    isActive: true,
  },
  {
    id: 'a115ac06-9213-4461-bd43-c5af6fbe0ef0',
    code: 'WEST',
    name: 'West',
    isActive: true,
  },
]

export async function getRegions(): Promise<RegionOption[]> {
  const response = await apiClient.get<RegionsResponse>('/regions')
  return response.data.data.filter((region) => region.isActive)
}
