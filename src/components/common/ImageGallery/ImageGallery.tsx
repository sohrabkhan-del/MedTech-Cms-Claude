import { useState } from 'react'
import { Box, IconButton, Stack } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ImageOutlined from '@mui/icons-material/ImageOutlined'
import { radius } from '@/theme/tokens'

interface ImageGalleryProps {
  images: string[]
  alt?: string
  height?: number
}

export function ImageGallery({ images, alt = 'Product image', height = 280 }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (images.length === 0) {
    return (
      <Box
        sx={{
          height,
          borderRadius: `${radius.lg}px`,
          backgroundColor: 'background.default',
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.disabled',
        }}
      >
        <ImageOutlined sx={{ fontSize: 40 }} />
      </Box>
    )
  }

  const goTo = (index: number) => setActiveIndex((index + images.length) % images.length)

  return (
    <Stack spacing={1.5}>
      <Box
        sx={{
          position: 'relative',
          height,
          borderRadius: `${radius.lg}px`,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.default',
        }}
      >
        <Box
          component="img"
          src={images[activeIndex]}
          alt={`${alt} ${activeIndex + 1}`}
          sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        {images.length > 1 && (
          <>
            <IconButton
              aria-label="Previous image"
              onClick={() => goTo(activeIndex - 1)}
              size="small"
              sx={{
                position: 'absolute',
                top: '50%',
                left: 8,
                transform: 'translateY(-50%)',
                backgroundColor: 'background.paper',
                boxShadow: 1,
                '&:hover': { backgroundColor: 'background.paper' },
              }}
            >
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <IconButton
              aria-label="Next image"
              onClick={() => goTo(activeIndex + 1)}
              size="small"
              sx={{
                position: 'absolute',
                top: '50%',
                right: 8,
                transform: 'translateY(-50%)',
                backgroundColor: 'background.paper',
                boxShadow: 1,
                '&:hover': { backgroundColor: 'background.paper' },
              }}
            >
              <ChevronRightIcon fontSize="small" />
            </IconButton>
            <Stack direction="row" spacing={0.75} sx={{ position: 'absolute', bottom: 10, left: 0, right: 0, justifyContent: 'center' }}>
              {images.map((image, index) => (
                <Box
                  key={image}
                  onClick={() => goTo(index)}
                  sx={{
                    width: index === activeIndex ? 16 : 6,
                    height: 6,
                    borderRadius: 3,
                    cursor: 'pointer',
                    backgroundColor: index === activeIndex ? 'primary.main' : 'rgba(255,255,255,0.7)',
                    boxShadow: index === activeIndex ? 'none' : '0 0 0 1px rgba(0,0,0,0.15)',
                    transition: 'width 0.2s ease',
                  }}
                />
              ))}
            </Stack>
          </>
        )}
      </Box>
      {images.length > 1 && (
        <Stack direction="row" spacing={1}>
          {images.map((image, index) => (
            <Box
              key={image}
              component="img"
              src={image}
              alt={`${alt} thumbnail ${index + 1}`}
              onClick={() => goTo(index)}
              sx={{
                width: 56,
                height: 56,
                borderRadius: `${radius.md}px`,
                objectFit: 'cover',
                cursor: 'pointer',
                border: '2px solid',
                borderColor: index === activeIndex ? 'primary.main' : 'transparent',
                opacity: index === activeIndex ? 1 : 0.7,
                transition: 'opacity 0.15s ease, border-color 0.15s ease',
                '&:hover': { opacity: 1 },
              }}
            />
          ))}
        </Stack>
      )}
    </Stack>
  )
}
