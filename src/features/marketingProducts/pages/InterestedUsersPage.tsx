import { useNavigate } from 'react-router-dom'
import { Users } from 'lucide-react'
import { useRegionTopbarHeader } from '@/hooks/useRegionTopbarHeader'
import { InterestedUsersListTab } from '@/features/marketingProducts/components/InterestedUsersListTab'
import type { InterestedUserLead } from '@/features/marketingProducts/types/marketingProducts.types'

export function InterestedUsersPage() {
  const navigate = useNavigate()
  useRegionTopbarHeader({
    icon: <Users size={20} />,
    title: 'Interested Users',
    subtitle: 'Manage leads from Dealers and Chemists who have expressed interest in showcase products.',
  })

  const handleViewLead = (lead: InterestedUserLead) => {
    navigate(`/marketing-products/interested-users/${lead.id}`)
  }

  return <InterestedUsersListTab onViewLead={handleViewLead} />
}
