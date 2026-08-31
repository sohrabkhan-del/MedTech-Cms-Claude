import { z } from 'zod'

const uuidMessage = 'Enter a valid UUID'

const requiredString = (message: string) => z.string().trim().min(1, message)

const requiredPattern = (regex: RegExp, message: string) =>
  requiredString(message).refine((val) => regex.test(val), { message })

export const chemistBusinessSchema = z.object({
  id: z.string().optional(),
  outletName: requiredString('Outlet name is required'),
  userName: requiredString('User name is required'),
  panNumber: requiredPattern(
    /^[A-Z]{5}[0-9]{4}[A-Z]$/,
    'Enter a valid PAN number',
  ),
  drugLicenseNumber: requiredString('Drug license number is required'),
  drugLicenseExpiry: requiredString('Drug license expiry is required'),
  addressType: z.enum(['SHOP', 'GODOWN', 'OTHER']),
  addressLine1: requiredString('Address line 1 is required'),
  addressLine2: requiredString('Address line 2 is required'),
  landmark: requiredString('Landmark is required'),
  city: requiredString('City is required'),
  district: requiredString('District is required'),
  state: requiredString('State is required'),
  pincode: requiredPattern(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
  latitude: requiredString('Latitude is required'),
  longitude: requiredString('Longitude is required'),
  scanRadius: requiredString('Scan radius is required'),
  bufferRadius: requiredString('Buffer radius is required'),
  notes: z.string().optional(),
  documents: z.array(z.custom<PartnerDocumentPayload>()).default([]),
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
  notes: '',
  documents: [],
}

// Fields marked "API" map 1:1 to POST /partners/create's body and are sent
// on submit.
//
// Compulsory fields: phone, email, regionId, assignedMedicalRepresentativeId.
// Everything else is optional (format is still checked where a pattern applies).
export const chemistFormSchema = z.object({
  // --- API: identity / business ---
  businessName: requiredString('Business name is required'),
  ownerFirstName: requiredString('Owner first name is required'),
  ownerLastName: requiredString('Owner last name is required'),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, 'Enter a valid 10-digit phone number'),
  country: requiredString('Country is required'),

  // --- API: licensing ---
  gstNumber: requiredPattern(
    /^[0-9A-Z]{15}$/,
    'Enter a valid 15-character GST number',
  ),

  // --- API: profile ---
  profileImageUrl: requiredString('Profile image is required'),
  profileImage: z.custom<PartnerDocumentPayload>().optional(),

  // --- API: assignment ---
  regionId: z.string().trim().uuid(uuidMessage),
  assignedMedicalRepresentativeId: z
    .string()
    .trim()
    .uuid('Assign a medical representative'),
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
  profileImage: undefined,
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
  viewUrl?: string
  signedViewUrl?: string
  directViewUrl?: string
  objectUrl?: string
  url?: string
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
export function toProfileImagePayload(
  url?: string,
): PartnerProfileImagePayload | undefined {
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

export function toChemistApiPayload(
  values: ChemistFormValues,
): ChemistApiPayload {
  return {
    type: 'CHEMIST',
    businessName: values.businessName ?? '',
    ownerName: [values.ownerFirstName, values.ownerLastName]
      .filter(Boolean)
      .join(' '),
    profileImage:
      values.profileImage ?? toProfileImagePayload(values.profileImageUrl),
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
      bufferRadius: business.bufferRadius
        ? Number(business.bufferRadius)
        : undefined,
      geoTagImage: null,
      regionId: values.regionId,
      notes: business.notes,
      documents: business.documents ?? [],
    })),
  }
}
