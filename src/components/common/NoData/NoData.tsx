import { Box, Typography } from '@mui/material'

interface NoDataProps {
  message?: string
  height?: number | string
}

export function NoData({ message = 'No data', height = '100%' }: NoDataProps) {
  return (
    <Box
      sx={{
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography sx={{ color: 'text.secondary', fontWeight: 600 }}>
        {message}
      </Typography>
    </Box>
  )
}

export default NoData
