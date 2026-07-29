import { DocumentGridCard } from '@/components/common/DocumentGridCard/DocumentGridCard'
import type { LicenseDocument } from '@/types/partner'

export function LicenseDocumentsCard({
  documents,
}: {
  documents: LicenseDocument[]
}) {
  return (
    <DocumentGridCard
      title="License & Documents"
      documents={documents}
      emptyDescription="Documents added for this partner will appear here."
      showMetadata={false}
    />
  )
}
