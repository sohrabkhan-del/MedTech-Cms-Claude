import { z } from 'zod'

// Fields marked "API" map 1:1 to POST /medical-representatives's body and are
// sent on submit. Fields marked "UI only" stay in the form because they were
// already part of it, but the create/update API has no matching field for
// them yet — they are kept in local UI state only and NOT sent to the API.
export const medicalRepFormSchema = z.object({
  // --- API ---
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit phone number'),
  country: z.string().min(1, 'Country code is required'),
  profileImageUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  regionId: z.string().uuid('Select a region'),

  // --- UI only: not sent to POST /medical-representatives ---
  status: z.enum(['active', 'pending', 'inactive', 'suspended']),
  notes: z.string().optional(),
})

export type MedicalRepFormValues = z.infer<typeof medicalRepFormSchema>

export const medicalRepFormDefaults: MedicalRepFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
  country: '91',
  profileImageUrl: '',
  regionId: '',
  status: 'pending',
  notes: '',
}

/** Fields accepted by POST /medical-representatives. */
export interface MedicalRepApiPayload {
  firstName: string
  lastName: string
  email: string
  password: string
  phone: string
  country: string
  profileImageUrl?: string
  regionId: string
}

/** Strips UI-only fields (status, notes) before sending to the API. */
export function toMedicalRepApiPayload(values: MedicalRepFormValues): MedicalRepApiPayload {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email,
    password: values.password,
    phone: values.phone,
    country: values.country,
    profileImageUrl: values.profileImageUrl || undefined,
    regionId: values.regionId,
  }
}
