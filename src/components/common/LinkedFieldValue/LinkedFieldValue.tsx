import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Typography } from '@mui/material'

export function LinkedFieldValue({
  to,
  children,
}: {
  to: string
  children: ReactNode
}) {
  const navigate = useNavigate()
  return (
    <Typography
      component="span"
      onClick={() => navigate(to)}
      sx={{
        fontWeight: 600,
        fontSize: '0.8125rem',
        color: 'text.primary',
        cursor: 'pointer',
        transition: 'color 150ms',
        '&:hover': {
          color: 'primary.main',
          textShadow: '0 0 12px var(--mui-palette-primary-main, rgba(25,118,210,0.5))',
        },
      }}
    >
      {children}
    </Typography>
  )
}
