import { useNavigate } from 'react-router-dom'
import { Megaphone } from 'lucide-react'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import { ShowcaseProductsListTab } from '@/features/marketingProducts/components/ShowcaseProductsListTab'
import type { ShowcaseProduct } from '@/features/marketingProducts/types/marketingProducts.types'

export function ProductsCatalogPage() {
  const navigate = useNavigate()
  useRegionTopbarHeader({
    icon: <Megaphone size={20} />,
    title: 'Products Catalog',
    subtitle: 'Manage promotional showcase products for Dealers & Chemists.',
  })

  const handleViewProduct = (product: ShowcaseProduct) => {
    navigate(`/marketing-products/products-catelog/${product.id}`)
  }

  return <ShowcaseProductsListTab onViewProduct={handleViewProduct} />
}
