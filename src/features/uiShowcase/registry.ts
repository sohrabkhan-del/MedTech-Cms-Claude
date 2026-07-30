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
  GalleryHorizontal,
  Grip,
  XSquare,
  Navigation as NavbarIcon,
  PanelRightOpen,
  Rows3,
  Star,
  GitCommitHorizontal,
  Search as SearchIcon,
  Users,
  ChevronsRight,
  Newspaper,
  FileText,
  PenSquare,
  ListTree,
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
import { CarouselDemo } from './demos/CarouselDemo'
import { SwiperJsDemo } from './demos/SwiperJsDemo'
import { DraggableCardDemo } from './demos/DraggableCardDemo'
import { ModalCloseDemo } from './demos/ModalCloseDemo'
import { NavbarDemo } from './demos/NavbarDemo'
import { OffcanvasDemo } from './demos/OffcanvasDemo'
import { PlaceholderDemo } from './demos/PlaceholderDemo'
import { RatingDemo } from './demos/RatingDemo'
import { TimelineDemo } from './demos/TimelineDemo'
import { SearchDemo } from './demos/SearchDemo'
import { UserListDemo } from './demos/UserListDemo'
import { BreadcrumbDemo } from './demos/BreadcrumbDemo'
import { BlogDemo } from './demos/BlogDemo'
import { BlogDetailsDemo } from './demos/BlogDetailsDemo'
import { EditPostDemo } from './demos/EditPostDemo'
import { ScanTreeTableDemo } from './demos/ScanTreeTableDemo'

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
    category: 'component',
  },
  {
    slug: 'dialog',
    label: 'Dialog / Modal',
    description: 'Default, confirmation, form content, and scrollable dialogs.',
    icon: PanelTop,
    Demo: DialogDemo,
    category: 'component',
  },
  {
    slug: 'toggle',
    label: 'Toggle / Switch',
    description: 'Colors, sizes, and disabled state.',
    icon: ToggleLeft,
    Demo: ToggleDemo,
    category: 'component',
  },
  {
    slug: 'slider',
    label: 'Slider',
    description: 'Single value, range, stepped, and disabled sliders.',
    icon: SliderIcon,
    Demo: SliderDemo,
    category: 'component',
  },
  {
    slug: 'date-range-picker',
    label: 'Date Range Picker',
    description: 'Presets, custom range, and compact preset dropdown.',
    icon: CalendarRange,
    Demo: DateRangePickerDemo,
    category: 'component',
  },
  {
    slug: 'snackbar',
    label: 'Snackbar / Toast',
    description: 'Success, error, warning, info — auto-dismiss and persistent.',
    icon: MessageSquareWarning,
    Demo: SnackbarDemo,
    category: 'component',
  },
  {
    slug: 'tabs',
    label: 'Tabs',
    description: 'Filled, outlined, and underline variants.',
    icon: LayoutList,
    Demo: TabsDemo,
    category: 'component',
  },
  {
    slug: 'badge',
    label: 'Badge / Chip',
    description: 'Status badges and plain chips.',
    icon: Tags,
    Demo: BadgeDemo,
    category: 'component',
  },
  {
    slug: 'card',
    label: 'Card',
    description: 'SectionCard and StatCard building blocks.',
    icon: LayoutPanelTop,
    Demo: CardDemo,
    category: 'component',
  },
  {
    slug: 'input',
    label: 'Input / TextField',
    description: 'Sizes, helper text, error and disabled states.',
    icon: TextCursorInput,
    Demo: InputDemo,
    category: 'component',
  },
  {
    slug: 'tooltip',
    label: 'Tooltip',
    description: 'Placement options for hover hints.',
    icon: MessageCircleQuestion,
    Demo: TooltipDemo,
    category: 'component',
  },
  {
    slug: 'select',
    label: 'Dropdown / Select',
    description: 'TextField select, plain Select, and the compact preset dropdown.',
    icon: ChevronDownSquare,
    Demo: SelectDemo,
    category: 'component',
  },
  {
    slug: 'checkbox',
    label: 'Checkbox',
    description: 'Checked, indeterminate, and disabled states.',
    icon: CheckSquare,
    Demo: CheckboxDemo,
    category: 'component',
  },
  {
    slug: 'radio',
    label: 'Radio',
    description: 'Single radios and a grouped example.',
    icon: CircleDot,
    Demo: RadioDemo,
    category: 'component',
  },
  {
    slug: 'accordion',
    label: 'Accordion',
    description: 'Expand/collapse panels, including a disabled panel.',
    icon: ListCollapse,
    Demo: AccordionDemo,
    category: 'component',
  },
  {
    slug: 'avatar',
    label: 'Avatar',
    description: 'Display sizes and the editable upload variant.',
    icon: CircleUserRound,
    Demo: AvatarDemo,
    category: 'component',
  },
  {
    slug: 'pagination',
    label: 'Pagination',
    description: 'Sizes, variants, and disabled state.',
    icon: MoreHorizontal,
    Demo: PaginationDemo,
    category: 'component',
  },
  {
    slug: 'carousel',
    label: 'Carousel',
    description: 'Arrows + dots, autoplay, and multi-item-per-slide variants.',
    icon: GalleryHorizontal,
    Demo: CarouselDemo,
    category: 'component',
  },
  {
    slug: 'draggable-card',
    label: 'Draggable Card',
    description: 'Freely reorderable card grid via drag-and-drop.',
    icon: Grip,
    Demo: DraggableCardDemo,
    category: 'component',
  },
  {
    slug: 'modal-closes',
    label: 'Modal & Closes',
    description: 'Close via X, backdrop click, Escape key, and confirm/cancel.',
    icon: XSquare,
    Demo: ModalCloseDemo,
    category: 'component',
  },
  {
    slug: 'navbar',
    label: 'Navbar',
    description: 'Default, dropdown menu, sticky/scrolled, and mobile hamburger states.',
    icon: NavbarIcon,
    Demo: NavbarDemo,
    category: 'component',
  },
  {
    slug: 'offcanvas',
    label: 'Offcanvas',
    description: 'Slide-in panel from left, right, top, and bottom, with overlay.',
    icon: PanelRightOpen,
    Demo: OffcanvasDemo,
    category: 'component',
  },
  {
    slug: 'placeholder',
    label: 'Placeholder',
    description: 'Loading skeletons: text lines, avatar circle, card, and image.',
    icon: Rows3,
    Demo: PlaceholderDemo,
    category: 'component',
  },
  {
    slug: 'rating',
    label: 'Ratings',
    description: 'Read-only display, interactive selection, and half-star precision.',
    icon: Star,
    Demo: RatingDemo,
    category: 'component',
  },
  {
    slug: 'swiper-js',
    label: 'Swiper JS',
    description: 'slidesPerView, pagination, and navigation module options.',
    icon: GalleryHorizontal,
    Demo: SwiperJsDemo,
    category: 'component',
  },
  {
    slug: 'timeline',
    label: 'Timeline',
    description: 'Vertical and horizontal variants, with icons and dates.',
    icon: GitCommitHorizontal,
    Demo: TimelineDemo,
    category: 'component',
  },
  {
    slug: 'search',
    label: 'Search',
    description: 'Basic bar, live filtered suggestions, and clear button.',
    icon: SearchIcon,
    Demo: SearchDemo,
    category: 'component',
  },
  {
    slug: 'scan-tree-table',
    label: 'Master Scan Tree Table',
    description: 'Virtualized, expandable tree table for flat scan data — Invoice → Distributor → Dealer → Chemist → Category → Product → Batch → Container → Unit.',
    icon: ListTree,
    Demo: ScanTreeTableDemo,
    category: 'component',
  },
  {
    slug: 'user-list',
    label: 'Userlist',
    description: 'Avatar, name, role, and status in a searchable table.',
    icon: Users,
    Demo: UserListDemo,
    category: 'component',
  },
  {
    slug: 'breadcrumb',
    label: 'Breadcrumb',
    description: '2-level and 4-level trails, with a non-clickable current page.',
    icon: ChevronsRight,
    Demo: BreadcrumbDemo,
    category: 'component',
  },
  {
    slug: 'blog',
    label: 'Blog',
    description: 'Post grid: thumbnail, title, excerpt, author, date, tags.',
    icon: Newspaper,
    Demo: BlogDemo,
    category: 'page-template',
  },
  {
    slug: 'blog-details',
    label: 'Blog Details',
    description: 'Single post: hero, meta, body content, related posts.',
    icon: FileText,
    Demo: BlogDetailsDemo,
    category: 'page-template',
  },
  {
    slug: 'edit-post',
    label: 'Edit Post',
    description: 'Title, rich text editor, tags, featured image, save/publish.',
    icon: PenSquare,
    Demo: EditPostDemo,
    category: 'page-template',
  },
]

export function findComponentDemo(slug: string | undefined) {
  return componentDemos.find((demo) => demo.slug === slug)
}
