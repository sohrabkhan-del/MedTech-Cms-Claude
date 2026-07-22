import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Box,
  Chip,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  Tooltip,
} from '@mui/material'
import { ChevronRight as ChevronRightIcon } from 'lucide-react'
import type { MenuItem } from '@/components/layout/Sidebar/menuConfig'
import {
  sidebarPalettes,
  type SidebarPalette,
} from '@/components/layout/Sidebar/sidebarPalettes'
import { transitions, radius } from '@/theme/tokens'
import { NotificationsMenuContent } from '@/features/notifications/components/NotificationsMenuContent'

function isDescendantActive(item: MenuItem, pathname: string): boolean {
  if (item.path === pathname) return true
  return (
    item.children?.some((child) => isDescendantActive(child, pathname)) ?? false
  )
}

interface SidebarItemProps {
  item: MenuItem
  depth?: number
  railMode?: boolean
  palette?: SidebarPalette
  badgeOverrides?: Record<string, number>
}

export function SidebarItem({
  item,
  depth = 0,
  railMode = false,
  palette = sidebarPalettes.light,
  badgeOverrides,
}: SidebarItemProps) {
  const badgeCount = (item.path && badgeOverrides?.[item.path]) ?? item.badgeCount
  const location = useLocation()
  const navigate = useNavigate()
  const active = isDescendantActive(item, location.pathname)
  const [open, setOpen] = useState(active)
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null)

  const hasChildren = !!item.children?.length
  const Icon = item.icon
  const isNested = depth > 0
  const lineLeft = 42 + (depth - 1) * 20

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (item.notificationsPopover) {
      setPopoverAnchor(event.currentTarget)
      return
    }
    if (hasChildren) {
      setOpen((prev) => !prev)
      return
    }
    if (item.path) navigate(item.path)
  }

  const isSelfActive = item.path === location.pathname

  const button = (
    <ListItemButton
      onClick={handleClick}
      selected={isSelfActive}
      sx={{
        position: 'relative',
        borderRadius: '8px',
        mx: 1,
        mb: 0.25,
        pl: railMode ? 1.5 : isNested ? 8.5 + (depth - 1) * 2 : 4,
        py: 0.5,
        minHeight: 38,
        justifyContent: railMode ? 'center' : 'flex-start',
        transition: `background-color ${transitions.base}, color ${transitions.base}`,
        '&:hover': {
          backgroundColor: palette.hoverBackground,
        },
        '&.Mui-selected': {
          background: palette.activeBackground,
          color: palette.activeIconColor,
          '& .MuiListItemIcon-root': { color: palette.activeIconColor },
          '&:hover': { background: palette.activeBackground },
        },
      }}
    >
      {isNested && !railMode && (
        <Box
          sx={{
            position: 'absolute',
            left: lineLeft,
            top: 0,
            bottom: 0,
            width: '1px',
            backgroundColor: palette.divider,
          }}
        />
      )}
      {isNested && !railMode && (
        <Box
          sx={{
            position: 'absolute',
            left: isSelfActive ? lineLeft - 3 : lineLeft - 2,
            top: '50%',
            transform: 'translateY(-50%)',
            width: isSelfActive ? 7 : 5,
            height: isSelfActive ? 7 : 5,
            borderRadius: '50%',
            backgroundColor: isSelfActive
              ? palette.activeIconColor
              : palette.textDisabled,
          }}
        />
      )}
      {Icon && !isNested ? (
        <ListItemIcon
          sx={{
            minWidth: railMode ? 0 : 27,
            color: isSelfActive ? 'inherit' : palette.textSecondary,
          }}
        >
          <Icon size={16} />
        </ListItemIcon>
      ) : null}
      {!railMode && (
        <ListItemText
          primary={item.label}
          slotProps={{
            primary: {
              sx: {
                fontSize: isNested ? '0.75rem' : '0.8rem',
                fontWeight: isSelfActive ? 700 : isNested ? 400 : 500,
                color: isSelfActive
                  ? palette.activeIconColor
                  : isNested
                    ? palette.textDisabled
                    : palette.textPrimary,
              },
            },
          }}
        />
      )}
      {!railMode && badgeCount ? (
        <Chip
          label={badgeCount}
          size="small"
          color="secondary"
          sx={{
            height: 16,
            minWidth: 16,
            fontSize: '0.6rem',
            '& .MuiChip-label': { px: 0.625 },
          }}
        />
      ) : null}
      {!railMode && hasChildren ? (
        <ChevronRightIcon
          size={20}
          style={{
            color: palette.textDisabled,
            transition: `transform ${transitions.base}`,
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
        />
      ) : null}
    </ListItemButton>
  )

  return (
    <Box>
      {railMode ? (
        <Tooltip title={item.label} placement="right">
          {button}
        </Tooltip>
      ) : (
        button
      )}
      {item.notificationsPopover && (
        <Menu
          anchorEl={popoverAnchor}
          open={!!popoverAnchor}
          onClose={() => setPopoverAnchor(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          slotProps={{ paper: { sx: { borderRadius: `${radius.lg}px`, ml: 1 } } }}
        >
          <NotificationsMenuContent onNavigate={() => setPopoverAnchor(null)} />
        </Menu>
      )}
      {hasChildren && !railMode && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.children!.map((child) => (
              <SidebarItem
                key={child.path ?? child.label}
                item={child}
                depth={depth + 1}
                palette={palette}
                badgeOverrides={badgeOverrides}
              />
            ))}
          </List>
        </Collapse>
      )}
    </Box>
  )
}
