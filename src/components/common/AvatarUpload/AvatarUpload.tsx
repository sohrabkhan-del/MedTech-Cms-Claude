import { useRef } from 'react'
import { Avatar, Box, IconButton } from '@mui/material'
import { Camera } from 'lucide-react'

interface AvatarUploadProps {
  imageUrl?: string
  fallbackText: string
  size?: number
  onChange: (dataUrl: string) => void
}

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024

export function AvatarUpload({ imageUrl, fallbackText, size = 96, onChange }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !file.type.startsWith('image/') || file.size > MAX_FILE_SIZE_BYTES) return

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') onChange(reader.result)
    }
    reader.readAsDataURL(file)
  }

  return (
    <Box sx={{ position: 'relative', width: size, height: size }}>
      <Avatar
        src={imageUrl}
        sx={{
          width: size,
          height: size,
          bgcolor: 'secondary.main',
          fontSize: size * 0.36,
          fontWeight: 700,
        }}
      >
        {fallbackText}
      </Avatar>
      <IconButton
        onClick={() => inputRef.current?.click()}
        aria-label="Change profile photo"
        size="small"
        sx={{
          position: 'absolute',
          right: -4,
          bottom: -4,
          width: 32,
          height: 32,
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
          border: '2px solid',
          borderColor: 'background.paper',
          '&:hover': { backgroundColor: 'primary.dark' },
        }}
      >
        <Camera size={16} />
      </IconButton>
      <Box
        component="input"
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        sx={{ display: 'none' }}
      />
    </Box>
  )
}
