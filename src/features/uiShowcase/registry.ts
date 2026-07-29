import {
  MousePointerClick,
  PanelTop,
  ToggleLeft,
  SlidersHorizontal as SliderIcon,
  CalendarRange,
  MessageSquareWarning,
  LayoutList,
  Tags,
  LayoutPanelTop,
  TextCursorInput,
  MessageCircleQuestion,
  ChevronDownSquare,
  CheckSquare,
  CircleDot,
  ListCollapse,
  CircleUserRound,
  MoreHorizontal,
} from 'lucide-react'
import type { ComponentDemo } from './types'
import { ButtonDemo } from './demos/ButtonDemo'
import { DialogDemo } from './demos/DialogDemo'
import { ToggleDemo } from './demos/ToggleDemo'
import { SliderDemo } from './demos/SliderDemo'
import { DateRangePickerDemo } from './demos/DateRangePickerDemo'
import { SnackbarDemo } from './demos/SnackbarDemo'
import { TabsDemo } from './demos/TabsDemo'
import { BadgeDemo } from './demos/BadgeDemo'
import { CardDemo } from './demos/CardDemo'
import { InputDemo } from './demos/InputDemo'
import { TooltipDemo } from './demos/TooltipDemo'
import { SelectDemo } from './demos/SelectDemo'
import { CheckboxDemo } from './demos/CheckboxDemo'
import { RadioDemo } from './demos/RadioDemo'
import { AccordionDemo } from './demos/AccordionDemo'
import { AvatarDemo } from './demos/AvatarDemo'
import { PaginationDemo } from './demos/PaginationDemo'

/**
 * Single source of truth for the UI showcase. Adding a new component demo
 * later only requires: (1) a new demo component in `./demos`, (2) one entry
 * in this array. The sidebar item, /ui landing page and /ui/:slug route are
 * all derived from this list — no other file needs to change.
 */
export const componentDemos: ComponentDemo[] = [
  {
    slug: 'button',
    label: 'Button',
    description: 'All variants, sizes, and disabled/loading states.',
    icon: MousePointerClick,
    Demo: ButtonDemo,
  },
  {
    slug: 'dialog',
    label: 'Dialog / Modal',
    description: 'Default, confirmation, form content, and scrollable dialogs.',
    icon: PanelTop,
    Demo: DialogDemo,
  },
  {
    slug: 'toggle',
    label: 'Toggle / Switch',
    description: 'Colors, sizes, and disabled state.',
    icon: ToggleLeft,
    Demo: ToggleDemo,
  },
  {
    slug: 'slider',
    label: 'Slider',
    description: 'Single value, range, stepped, and disabled sliders.',
    icon: SliderIcon,
    Demo: SliderDemo,
  },
  {
    slug: 'date-range-picker',
    label: 'Date Range Picker',
    description: 'Presets, custom range, and compact preset dropdown.',
    icon: CalendarRange,
    Demo: DateRangePickerDemo,
  },
  {
    slug: 'snackbar',
    label: 'Snackbar / Toast',
    description: 'Success, error, warning, info — auto-dismiss and persistent.',
    icon: MessageSquareWarning,
    Demo: SnackbarDemo,
  },
  {
    slug: 'tabs',
    label: 'Tabs',
    description: 'Filled, outlined, and underline variants.',
    icon: LayoutList,
    Demo: TabsDemo,
  },
  {
    slug: 'badge',
    label: 'Badge / Chip',
    description: 'Status badges and plain chips.',
    icon: Tags,
    Demo: BadgeDemo,
  },
  {
    slug: 'card',
    label: 'Card',
    description: 'SectionCard and StatCard building blocks.',
    icon: LayoutPanelTop,
    Demo: CardDemo,
  },
  {
    slug: 'input',
    label: 'Input / TextField',
    description: 'Sizes, helper text, error and disabled states.',
    icon: TextCursorInput,
    Demo: InputDemo,
  },
  {
    slug: 'tooltip',
    label: 'Tooltip',
    description: 'Placement options for hover hints.',
    icon: MessageCircleQuestion,
    Demo: TooltipDemo,
  },
  {
    slug: 'select',
    label: 'Dropdown / Select',
    description: 'TextField select, plain Select, and the compact preset dropdown.',
    icon: ChevronDownSquare,
    Demo: SelectDemo,
  },
  {
    slug: 'checkbox',
    label: 'Checkbox',
    description: 'Checked, indeterminate, and disabled states.',
    icon: CheckSquare,
    Demo: CheckboxDemo,
  },
  {
    slug: 'radio',
    label: 'Radio',
    description: 'Single radios and a grouped example.',
    icon: CircleDot,
    Demo: RadioDemo,
  },
  {
    slug: 'accordion',
    label: 'Accordion',
    description: 'Expand/collapse panels, including a disabled panel.',
    icon: ListCollapse,
    Demo: AccordionDemo,
  },
  {
    slug: 'avatar',
    label: 'Avatar',
    description: 'Display sizes and the editable upload variant.',
    icon: CircleUserRound,
    Demo: AvatarDemo,
  },
  {
    slug: 'pagination',
    label: 'Pagination',
    description: 'Sizes, variants, and disabled state.',
    icon: MoreHorizontal,
    Demo: PaginationDemo,
  },
]

export function findComponentDemo(slug: string | undefined) {
  return componentDemos.find((demo) => demo.slug === slug)
}
