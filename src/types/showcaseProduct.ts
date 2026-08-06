export type ShowcaseVisibility = 'dealer' | 'chemist'

export interface ShowcaseProductImage {
  url: string
  alt?: string
  isPrimary?: boolean
}

export interface ShowcaseProductCategory {
  id: string
  code: string
  name: string
}

export interface ShowcaseProduct {
  id: string
  productCode: string
  name: string
  description: string
  categoryId: string | null
  category: ShowcaseProductCategory | null
  brand: string
  images: ShowcaseProductImage[]
  mrp: number
  dealerPrice: number
  chemistPrice: number
  availableStock?: number
  stockUnit?: string
  lowStockThreshold?: number
  isActive: boolean
  visibleTo: ShowcaseVisibility[]
  createdAt: string
  updatedAt: string
}
