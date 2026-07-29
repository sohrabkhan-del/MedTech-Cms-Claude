import { Navigate, useParams } from 'react-router-dom'
import { ShowcasePageHeader } from '../components/ShowcasePageHeader'
import { findComponentDemo } from '../registry'

export function UiComponentDemoPage() {
  const { slug } = useParams<{ slug: string }>()
  const demo = findComponentDemo(slug)

  if (!demo) return <Navigate to="/ui" replace />

  const { label, description, icon: Icon, Demo } = demo

  return (
    <>
      <ShowcasePageHeader icon={<Icon size={20} />} title={label} subtitle={description} />
      <Demo />
    </>
  )
}
