import type { ComponentType } from 'react'
import type { LucideIcon } from 'lucide-react'

export interface ComponentDemo {
  /** URL segment, e.g. 'button' -> /ui/button */
  slug: string
  label: string
  description: string
  icon: LucideIcon
  Demo: ComponentType
}
