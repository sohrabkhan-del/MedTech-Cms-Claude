import { z } from 'zod'

const uuidMessage = 'Enter a valid UUID'

export const chemistLocationSchema = z.object({
  address: z.string().min(5, 'Shop address is required'),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  scanRadius: z.string().optional(),
  bufferRadius: z.string().optional(),
})

export type ChemistLocationValues = z.infer<typeof chemistLocationSchema>

// Fields marked "API" map 1:1 to POST /partners/create's body and are sent
// on submit. Fields marked "UI only" stay in the form because they were
// already part of it, but the create/update API has no matching field for
// them yet — they are kept in local UI state only and NOT sent to the API.
export const chemistFormSchema = z.object({
  // --- API: identity / business ---
  businessName: z.string().min(2, 'Business/shop name is required'),
  ownerFirstName: z.string().min(1, 'Owner first name is required'),
  ownerLastName: z.string().min(1, 'Owner last name is required'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit phone number'),
  country: z.string().min(1, 'Country code is required'),

  // --- API: licensing ---
  gstNumber: z
    .string()
    .regex(/^[0-9A-Z]{15}$/, 'Enter a valid 15-character GST number'),
  panNumber: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Enter a valid PAN number'),
  drugLicenseNumber: z.string().min(1, 'Drug license number is required'),
  drugLicenseExpiry: z.string().min(1, 'Drug license expiry is required'),

  // --- API: address ---
  addressLine1: z.string().min(1, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  landmark: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  district: z.string().min(1, 'District is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),

  // --- API: assignment ---
  regionId: z.string().uuid(uuidMessage),
  assignedMedicalRepresentativeId: z.string().uuid('Assign a medical representative'),

  // --- UI only: not sent to POST /partners/create / PUT /partners/:id ---
  locations: z
    .array(chemistLocationSchema)
    .min(1, 'Add at least one shop location'),
  notes: z.string().optional(),
})

export type ChemistFormValues = z.infer<typeof chemistFormSchema>

export const chemistFormDefaults: ChemistFormValues = {
  businessName: '',
  ownerFirstName: '',
  ownerLastName: '',
  email: '',
  phone: '',
  country: '91',
  gstNumber: '',
  panNumber: '',
  drugLicenseNumber: '',
  drugLicenseExpiry: '',
  addressLine1: '',
  addressLine2: '',
  landmark: '',
  city: '',
  district: '',
  state: '',
  pincode: '',
  regionId: '',
  assignedMedicalRepresentativeId: '',
  locations: [
    { address: '', latitude: '', longitude: '', scanRadius: '', bufferRadius: '' },
  ],
  notes: '',
}

/** Fields accepted by POST /partners/create and PUT /partners/:id. */
export interface ChemistApiPayload {
  type: 'CHEMIST'
  businessName: string
  ownerFirstName: string
  ownerLastName: string
  email: string
  phone: string
  country: string
  gstNumber: string
  panNumber: string
  drugLicenseNumber: string
  drugLicenseExpiry: string
  addressLine1: string
  addressLine2?: string
  landmark?: string
  city: string
  district: string
  state: string
  pincode: string
  regionId: string
  assignedMedicalRepresentativeId: string
}

/** Strips UI-only fields (locations, notes) before sending to the API. */
export function toChemistApiPayload(values: ChemistFormValues): ChemistApiPayload {
  return {
    type: 'CHEMIST',
    businessName: values.businessName,
    ownerFirstName: values.ownerFirstName,
    ownerLastName: values.ownerLastName,
    email: values.email,
    phone: values.phone,
    country: values.country,
    gstNumber: values.gstNumber,
    panNumber: values.panNumber,
    drugLicenseNumber: values.drugLicenseNumber,
    drugLicenseExpiry: values.drugLicenseExpiry,
    addressLine1: values.addressLine1,
    addressLine2: values.addressLine2,
    landmark: values.landmark,
    city: values.city,
    district: values.district,
    state: values.state,
    pincode: values.pincode,
    regionId: values.regionId,
    assignedMedicalRepresentativeId: values.assignedMedicalRepresentativeId,
  }
}
