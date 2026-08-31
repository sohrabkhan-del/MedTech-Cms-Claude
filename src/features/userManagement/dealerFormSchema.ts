import { z } from 'zod'
import {
  toProfileImagePayload,
  type PartnerBusinessPayload,
  type PartnerDocumentPayload,
  type PartnerProfileImagePayload,
} from '@/features/userManagement/chemistFormSchema'

const uuidMessage = 'Enter a valid UUID'

const requiredString = (message: string) => z.string().trim().min(1, message)

const requiredPattern = (regex: RegExp, message: string) =>
  requiredString(message).refine((val) => regex.test(val), { message })

export const dealerBusinessSchema = z.object({
  id: z.string().optional(),
  outletName: z.string().optional(),
  userName: z.string().optional(),
  panNumber: z.string().optional(),
  drugLicenseNumber: z.string().optional(),
  drugLicenseExpiry: z.string().optional(),
  addressType: z.enum(['SHOP', 'GODOWN', 'OTHER']).optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  landmark: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  scanRadius: z.string().optional(),
  bufferRadius: z.string().optional(),
  notes: z.string().optional(),
  documents: z.array(z.custom<PartnerDocumentPayload>()).default([]),
})

export type DealerBusinessValues = z.infer<typeof dealerBusinessSchema>

export const dealerBusinessDefaults: DealerBusinessValues = {
  outletName: '',
  userName: '',
  panNumber: '',
  drugLicenseNumber: '',
  drugLicenseExpiry: '',
  addressType: 'GODOWN',
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

// Fields marked "API" map 1:1 to POST /partners/create's body (type: 'DEALER')
// and are sent on submit.
//
// Compulsory fields: phone, email, regionId, assignedMedicalRepresentativeId.
// Everything else is optional (format is still checked where a pattern applies).
export const dealerFormSchema = z.object({
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
  gstNumber: z.string().optional(),

  // --- API: profile ---
  profileImageUrl: z.string().optional(),
  profileImage: z.custom<PartnerDocumentPayload>().optional(),

  // --- API: assignment ---
  regionId: z.string().trim().uuid(uuidMessage),
  assignedMedicalRepresentativeId: z
    .string()
    .trim()
    .uuid('Assign a medical representative'),
  notes: z.string().optional(),

  // --- API: outlets, one per business/godown location ---
  // The array itself still needs at least one entry (the UI always renders
  // one godown block by default); the fields *within* each godown are optional.
  businesses: z
    .array(dealerBusinessSchema)
    .min(1, 'Add at least one business/godown'),
})

export type DealerFormValues = z.infer<typeof dealerFormSchema>

export const dealerFormDefaults: DealerFormValues = {
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
  businesses: [{ ...dealerBusinessDefaults, outletName: 'Godown 1' }],
}

/** Fields accepted by POST /partners/create and PUT /partners/:id (type: 'DEALER'). */
export interface DealerApiPayload {
  type: 'DEALER'
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

export function toDealerApiPayload(values: DealerFormValues): DealerApiPayload {
  return {
    type: 'DEALER',
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
