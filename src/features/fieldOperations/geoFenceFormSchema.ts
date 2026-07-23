import { z } from 'zod'

export const geoFenceFormSchema = z.object({
  userId: z.string(),
  userType: z.enum(['Dealer', 'Chemist', 'MR']),
  region: z.enum(['North', 'South', 'East', 'West']),
  radiusMeters: z.string().min(1, 'Radius is required'),
  bufferDistanceMeters: z.string().min(1, 'Buffer distance is required'),
})

export const geoFenceUserFormSchema = geoFenceFormSchema.extend({
  userId: z.string().min(1, 'Select a user'),
})

export type GeoFenceFormValues = z.infer<typeof geoFenceFormSchema>

export const geoFenceFormDefaults: GeoFenceFormValues = {
  userId: '',
  userType: 'Dealer',
  region: 'North',
  radiusMeters: '150',
  bufferDistanceMeters: '50',
}
