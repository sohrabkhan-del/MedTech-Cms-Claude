import { useNavigate } from 'react-router-dom'
import { Megaphone } from 'lucide-react'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import { ProductEnquiriesTab } from '@/features/marketingProducts/components/ProductEnquiriesTab'
import type { ShowcaseProduct } from '@/features/marketingProducts/types/marketingProducts.types'

export function ProductsCatalogPage() {
  const navigate = useNavigate()
  useRegionTopbarHeader({
    icon: <Megaphone size={20} />,
    title: 'Products Catalog',
    subtitle: 'Manage promotional showcase products, enquiries, and interested Dealers & Chemists.',
  })

  const handleViewProduct = (product: ShowcaseProduct) => {
    navigate(`/marketing-products/products-catelog/${product.id}`)
  }

  return <ProductEnquiriesTab onViewProduct={handleViewProduct} />
}
