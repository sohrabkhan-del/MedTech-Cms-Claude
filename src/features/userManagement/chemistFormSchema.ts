import { z } from 'zod'

const uuidMessage = 'Enter a valid UUID'

// Allows an empty string OR a value matching the pattern — for fields that
// are optional but should still be well-formed when the user does fill them in.
const optionalPattern = (regex: RegExp, message: string) =>
  z.string().refine((val) => val === '' || regex.test(val), { message })

export const chemistBusinessSchema = z.object({
  id: z.string().optional(),
  outletName: z.string().optional(),
  userName: z.string().optional(),
  panNumber: optionalPattern(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Enter a valid PAN number'),
  drugLicenseNumber: z.string().optional(),
  drugLicenseExpiry: z.string().optional(),
  addressType: z.enum(['SHOP', 'GODOWN', 'OTHER']),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  landmark: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  pincode: optionalPattern(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  scanRadius: z.string().optional(),
  bufferRadius: z.string().optional(),
  geoAccuracy: z.string().optional(),
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
  scanRadius: '',
  bufferRadius: '',
  geoAccuracy: '',
  notes: '',
}

// Fields marked "API" map 1:1 to POST /partners/create's body and are sent
// on submit.
//
// Compulsory fields: phone, email, regionId, assignedMedicalRepresentativeId.
// Everything else is optional (format is still checked where a pattern applies).
export const chemistFormSchema = z.object({
  // --- API: identity / business ---
  businessName: z.string().optional(),
  ownerFirstName: z.string().optional(),
  ownerLastName: z.string().optional(),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit phone number'),
  country: z.string().optional(),

  // --- API: licensing ---
  gstNumber: optionalPattern(/^[0-9A-Z]{15}$/, 'Enter a valid 15-character GST number'),

  // --- API: profile ---
  profileImageUrl: z.string().optional(),

  // --- API: assignment ---
  regionId: z.string().uuid(uuidMessage),
  assignedMedicalRepresentativeId: z.string().uuid('Assign a medical representative'),
  notes: z.string().optional(),

  // --- API: outlets, one per business/shop location ---
  // The array itself still needs at least one entry (the UI always renders
  // one outlet block by default); the fields *within* each outlet are optional.
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
  profileImageUrl: '',
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
  id?: string
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
  country: string
  pincode: string
  latitude?: number
  longitude?: number
  scanRadius?: number
  bufferRadius?: number
  geoAccuracy?: number
  geoTagImage?: PartnerDocumentPayload | null
  regionId: string
  notes?: string
  documents: PartnerDocumentPayload[]
}

export interface PartnerProfileImagePayload {
  id: string
  name: string
  size?: number
  path: string
  type?: string
}

/** Builds a profileImage payload from a plain URL — there's no file-upload API yet, so `path` is the URL as typed. */
export function toProfileImagePayload(url?: string): PartnerProfileImagePayload | undefined {
  const trimmed = url?.trim()
  if (!trimmed) return undefined
  const fileName = trimmed.split('/').pop() || 'profile-image'
  const extension = fileName.split('.').pop()?.toLowerCase()
  const mimeByExtension: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    gif: 'image/gif',
  }
  return {
    id: crypto.randomUUID(),
    name: fileName,
    path: trimmed,
    type: extension ? mimeByExtension[extension] : undefined,
  }
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
    businessName: values.businessName ?? '',
    ownerName: [values.ownerFirstName, values.ownerLastName].filter(Boolean).join(' '),
    profileImage: toProfileImagePayload(values.profileImageUrl),
    email: values.email,
    phone: values.phone,
    country: values.country || '91',
    gstNumber: values.gstNumber ?? '',
    regionId: values.regionId,
    assignedMedicalRepresentativeId: values.assignedMedicalRepresentativeId,
    notes: values.notes,
    businesses: values.businesses.map((business) => ({
      id: business.id || undefined,
      outletName: business.outletName ?? '',
      userName: business.userName || undefined,
      panNumber: business.panNumber ?? '',
      drugLicenseNumber: business.drugLicenseNumber ?? '',
      drugLicenseExpiry: business.drugLicenseExpiry ?? '',
      addressType: business.addressType,
      addressLine1: business.addressLine1 ?? '',
      addressLine2: business.addressLine2,
      landmark: business.landmark,
      city: business.city ?? '',
      district: business.district ?? '',
      state: business.state ?? '',
      country: 'India',
      pincode: business.pincode ?? '',
      latitude: business.latitude ? Number(business.latitude) : undefined,
      longitude: business.longitude ? Number(business.longitude) : undefined,
      scanRadius: business.scanRadius ? Number(business.scanRadius) : undefined,
      bufferRadius: business.bufferRadius ? Number(business.bufferRadius) : undefined,
      geoAccuracy: business.geoAccuracy ? Number(business.geoAccuracy) : undefined,
      geoTagImage: null,
      regionId: values.regionId,
      notes: business.notes,
      documents: [],
    })),
  }
}