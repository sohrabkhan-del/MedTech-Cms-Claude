import { z } from 'zod'

const uuidMessage = 'Enter a valid UUID'

export const chemistBusinessSchema = z.object({
  outletName: z.string().min(2, 'Outlet name is required'),
  userName: z.string().optional(),
  panNumber: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Enter a valid PAN number'),
  drugLicenseNumber: z.string().min(1, 'Drug license number is required'),
  drugLicenseExpiry: z.string().min(1, 'Drug license expiry is required'),
  addressType: z.enum(['SHOP', 'GODOWN', 'OTHER']),
  addressLine1: z.string().min(1, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  landmark: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  district: z.string().min(1, 'District is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  notes: z.string().optional(),
})

export type ChemistBusinessValues = z.infer<typeof chemistBusinessSchema>

export const chemistBusinessDefaults: ChemistBusinessValues = {
  outletName: '',
  userName: '',
  panNumber: '',
  drugLicenseNumber: '',
  drugLicenseExpiry: '',
  addressType: 'SHOP',
  addressLine1: '',
  addressLine2: '',
  landmark: '',
  city: '',
  district: '',
  state: '',
  pincode: '',
  latitude: '',
  longitude: '',
  notes: '',
}

// Fields marked "API" map 1:1 to POST /partners/create's body and are sent
// on submit.
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

  // --- API: assignment ---
  regionId: z.string().uuid(uuidMessage),
  assignedMedicalRepresentativeId: z.string().uuid('Assign a medical representative'),
  notes: z.string().optional(),

  // --- API: outlets, one per business/shop location ---
  businesses: z
    .array(chemistBusinessSchema)
    .min(1, 'Add at least one business/outlet'),
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
  regionId: '',
  assignedMedicalRepresentativeId: '',
  notes: '',
  businesses: [chemistBusinessDefaults],
}

export interface PartnerDocumentPayload {
  id: string
  name: string
  size?: number
  path: string
  type?: string
}

export interface PartnerBusinessPayload {
  outletName: string
  userName?: string
  panNumber: string
  drugLicenseNumber: string
  drugLicenseExpiry: string
  addressType: 'SHOP' | 'GODOWN' | 'OTHER'
  addressLine1: string
  addressLine2?: string
  landmark?: string
  city: string
  district: string
  state: string
  pincode: string
  latitude?: number
  longitude?: number
  notes?: string
  documents?: PartnerDocumentPayload[]
}

export interface PartnerProfileImagePayload {
  id: string
  name: string
  size?: number
  path: string
  type?: string
}

/** Fields accepted by POST /partners/create and PUT /partners/:id. */
export interface ChemistApiPayload {
  type: 'CHEMIST'
  businessName: string
  ownerName: string
  profileImage?: PartnerProfileImagePayload
  email: string
  phone: string
  country: string
  gstNumber: string
  regionId: string
  assignedMedicalRepresentativeId: string
  notes?: string
  businesses: PartnerBusinessPayload[]
}

export function toChemistApiPayload(values: ChemistFormValues): ChemistApiPayload {
  return {
    type: 'CHEMIST',
    businessName: values.businessName,
    ownerName: [values.ownerFirstName, values.ownerLastName].filter(Boolean).join(' '),
    email: values.email,
    phone: values.phone,
    country: values.country,
    gstNumber: values.gstNumber,
    regionId: values.regionId,
    assignedMedicalRepresentativeId: values.assignedMedicalRepresentativeId,
    notes: values.notes,
    businesses: values.businesses.map((business) => ({
      outletName: business.outletName,
      userName: business.userName || undefined,
      panNumber: business.panNumber,
      drugLicenseNumber: business.drugLicenseNumber,
      drugLicenseExpiry: business.drugLicenseExpiry,
      addressType: business.addressType,
      addressLine1: business.addressLine1,
      addressLine2: business.addressLine2,
      landmark: business.landmark,
      city: business.city,
      district: business.district,
      state: business.state,
      pincode: business.pincode,
      latitude: business.latitude ? Number(business.latitude) : undefined,
      longitude: business.longitude ? Number(business.longitude) : undefined,
      notes: business.notes,
    })),
  }
}
