export type ShowcaseUserType = 'Dealer' | 'Chemist'
export type EnquiryStatus = 'pending' | 'responded'
export type DeliveryStatus = 'pending' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled'

export interface ProductEnquiry {
  id: string
  userId: string
  userName: string
  userType: ShowcaseUserType
  interestedDate: string
  enquiryStatus: EnquiryStatus
  deliveryStatus: DeliveryStatus
  email: string
  mobileNumber: string
}

export interface ShowcaseProduct {
  id: string
  productName: string
  sku: string
  category: string
  price: number

  description: string
  productImage: string
  featuredProduct: boolean
  region: string

  totalInterestedUsers: number
  totalProductViews: number
  productsDelivered: number

  enquiries: ProductEnquiry[]
  internalNotes: string
}
