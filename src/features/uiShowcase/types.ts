import type { ComponentType } from 'react'
import type { LucideIcon } from 'lucide-react'

/** 'component' = a single reusable UI element demo. 'page-template' = a full composed page preview. */
export type ComponentDemoCategory = 'component' | 'page-template'

export interface ComponentDemo {
  /** URL segment, e.g. 'button' -> /ui/button */
  slug: string
  label: string
  description: string
  icon: LucideIcon
  Demo: ComponentType
  category: ComponentDemoCategory
}
