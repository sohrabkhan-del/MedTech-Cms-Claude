import { z } from 'zod'

const GSTIN_REGEX = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/

export const SHOP_DOCUMENT_ACCEPT = '.pdf,.png,.jpg,.jpeg'
const SHOP_DOCUMENT_ACCEPTED_TYPES = ['application/pdf', 'image/png', 'image/jpeg']
const SHOP_DOCUMENT_MAX_SIZE_BYTES = 10 * 1024 * 1024

export const inviteShopDetailsFormSchema = z.object({
  shopName: z.string().min(2, 'Shop / Godown name is required'),
  gstNumber: z.string().regex(GSTIN_REGEX, 'Enter a valid 15-character GSTIN'),
  registeredAddress: z.string().min(5, 'Shop / Godown address is required'),
  city: z.string().min(2, 'City is required'),
  zone: z.enum(['North', 'South', 'East', 'West']),
  latitude: z.string().min(1, 'Capture your location to continue'),
  longitude: z.string().min(1, 'Capture your location to continue'),
  documents: z
    .array(z.instanceof(File))
    .min(1, 'Upload at least one shop document')
    .refine(
      (files) => files.every((file) => SHOP_DOCUMENT_ACCEPTED_TYPES.includes(file.type)),
      'Only PDF, PNG, and JPG files are allowed',
    )
    .refine(
      (files) => files.every((file) => file.size <= SHOP_DOCUMENT_MAX_SIZE_BYTES),
      'Each file must be 10 MB or smaller',
    ),
})

export type InviteShopDetailsFormValues = z.infer<typeof inviteShopDetailsFormSchema>

export const inviteShopDetailsFormDefaults: InviteShopDetailsFormValues = {
  shopName: '',
  gstNumber: '',
  registeredAddress: '',
  city: '',
  zone: 'North',
  latitude: '',
  longitude: '',
  documents: [],
}
