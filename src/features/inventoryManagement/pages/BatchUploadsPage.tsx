import { useState } from 'react'
import { Box, Stack, Tab, Tabs, Typography } from '@mui/material'
import { UploadCloud } from 'lucide-react'
import { BatchUidUploadTab } from '@/features/inventoryManagement/components/BatchUidUploadTab'
import { DistributorUploadTab } from '@/features/inventoryManagement/components/DistributorUploadTab'

const TAB_LABELS = ['Batch & UID Upload', 'Distributor Upload']

export function BatchUploadsPage() {
  const [activeTab, setActiveTab] = useState(0)

  const handleTabChange = (_: React.SyntheticEvent, value: number) => {
    setActiveTab(value)
  }

  return (
    <>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2.5 }}>
        <Stack
          sx={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'primary.light',
            color: 'primary.main',
          }}
        >
          <UploadCloud size={20} />
        </Stack>
        <Stack>
          <Typography variant="h1">Batch & Distributor Uploads</Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Import batch master, UID mapping, and distributor master data via Excel.
          </Typography>
        </Stack>
      </Stack>

      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40, textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem' } }}
        >
          {TAB_LABELS.map((label) => (
            <Tab key={label} label={label} />
          ))}
        </Tabs>
      </Box>

      {activeTab === 0 && <BatchUidUploadTab />}
      {activeTab === 1 && <DistributorUploadTab />}
    </>
  )
}
