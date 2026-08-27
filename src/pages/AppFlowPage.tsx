import { Box } from '@mui/material'

export function AppFlowPage() {
  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#F5F7FA',
      }}
    >
      <iframe
        title="App flow preview"
        src="/app-flows.html"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
          background: '#F5F7FA',
        }}
      />
    </Box>
  )
}
