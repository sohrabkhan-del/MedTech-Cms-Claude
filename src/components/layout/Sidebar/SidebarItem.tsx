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
  Tooltip,
} from '@mui/material'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import type { MenuItem } from '@/components/layout/Sidebar/menuConfig'
import { transitions } from '@/theme/tokens'

function isDescendantActive(item: MenuItem, pathname: string): boolean {
  if (item.path === pathname) return true
  return item.children?.some((child) => isDescendantActive(child, pathname)) ?? false
}

interface SidebarItemProps {
  item: MenuItem
  depth?: number
  railMode?: boolean
}

export function SidebarItem({ item, depth = 0, railMode = false }: SidebarItemProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const active = isDescendantActive(item, location.pathname)
  const [open, setOpen] = useState(active)

  const hasChildren = !!item.children?.length
  const Icon = item.icon
  const isNested = depth > 0

  const handleClick = () => {
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
        pl: railMode ? 1.5 : isNested ? 4.5 : 2,
        py: 0.625,
        minHeight: 32,
        justifyContent: railMode ? 'center' : 'flex-start',
        transition: `background-color ${transitions.base}, color ${transitions.base}`,
        '&:hover': {
          backgroundColor: 'background.default',
        },
        '&.Mui-selected': {
          background: 'linear-gradient(90deg, rgba(26,62,140,0.10) 0%, rgba(26,62,140,0.03) 100%)',
          color: 'primary.main',
          '& .MuiListItemIcon-root': { color: 'primary.main' },
          '&:hover': { background: 'linear-gradient(90deg, rgba(26,62,140,0.14) 0%, rgba(26,62,140,0.05) 100%)' },
        },
      }}
    >
      {isNested && !railMode && (
        <Box
          sx={{
            position: 'absolute',
            left: 24,
            top: 0,
            bottom: 0,
            width: '1px',
            backgroundColor: 'divider',
          }}
        />
      )}
      {isNested && !railMode && (
        <Box
          sx={{
            position: 'absolute',
            left: isSelfActive ? 21 : 22,
            top: '50%',
            transform: 'translateY(-50%)',
            width: isSelfActive ? 7 : 5,
            height: isSelfActive ? 7 : 5,
            borderRadius: '50%',
            backgroundColor: isSelfActive ? 'primary.main' : 'text.disabled',
          }}
        />
      )}
      {Icon && !isNested ? (
        <ListItemIcon sx={{ minWidth: railMode ? 0 : 30, color: isSelfActive ? 'inherit' : 'text.secondary' }}>
          <Icon sx={{ fontSize: 18 }} />
        </ListItemIcon>
      ) : null}
      {!railMode && (
        <ListItemText
          primary={item.label}
          slotProps={{
            primary: {
              sx: {
                fontSize: '0.75rem',
                fontWeight: isSelfActive ? 700 : 500,
                color: isSelfActive ? 'primary.main' : isNested ? 'text.secondary' : 'text.primary',
              },
            },
          }}
        />
      )}
      {!railMode && item.badgeCount ? (
        <Chip
          label={item.badgeCount}
          size="small"
          color="secondary"
          sx={{ height: 16, minWidth: 16, fontSize: '0.6rem', '& .MuiChip-label': { px: 0.625 } }}
        />
      ) : null}
      {!railMode && hasChildren ? (
        <ChevronRightIcon
          fontSize="small"
          sx={{
            color: 'text.disabled',
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
      {hasChildren && !railMode && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.children!.map((child) => (
              <SidebarItem key={child.path ?? child.label} item={child} depth={depth + 1} />
            ))}
          </List>
        </Collapse>
      )}
    </Box>
  )
}
