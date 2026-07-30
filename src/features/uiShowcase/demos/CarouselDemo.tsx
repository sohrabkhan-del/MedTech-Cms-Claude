import { Box, Stack, Typography } from '@mui/material'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { radius } from '@/theme/tokens'
import { DemoSection } from '../components/DemoSection'
import { CodeBlock } from '../components/CodeBlock'
import { PropsTable } from '../components/PropsTable'

const usageCode = `import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

<Swiper modules={[Navigation, Pagination]} navigation pagination={{ clickable: true }}>
  <SwiperSlide>Slide 1</SwiperSlide>
  <SwiperSlide>Slide 2</SwiperSlide>
</Swiper>`

const slides = [
  { label: 'Scan Activity', color: '#1A3E8C' },
  { label: 'Reward Redemptions', color: '#F7941D' },
  { label: 'Scheme Performance', color: '#1E9E5A' },
  { label: 'Wallet Growth', color: '#E5484D' },
  { label: 'Dealer Leaderboard', color: '#15326E' },
]

function Slide({ label, color }: { label: string; color: string }) {
  return (
    <Box
      sx={{
        height: 200,
        borderRadius: `${radius.lg}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: color,
        color: '#fff',
        fontWeight: 700,
        fontSize: '1.125rem',
      }}
    >
      {label}
    </Box>
  )
}

export function CarouselDemo() {
  return (
    <Stack spacing={4}>
      <DemoSection title="Arrows + dot indicators" description="Single slide per view, with navigation arrows and clickable pagination dots.">
        <Box sx={{ width: '100%' }}>
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            spaceBetween={16}
            style={{ paddingBottom: 32 }}
          >
            {slides.map((slide) => (
              <SwiperSlide key={slide.label}>
                <Slide {...slide} />
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>
      </DemoSection>

      <DemoSection title="Autoplay" description="Advances automatically every 2.5s; pauses on hover.">
        <Box sx={{ width: '100%' }}>
          <Swiper
            modules={[Autoplay, Pagination]}
            autoplay={{ delay: 2500, disableOnInteraction: false, pauseOnMouseEnter: true }}
            pagination={{ clickable: true }}
            spaceBetween={16}
            style={{ paddingBottom: 32 }}
          >
            {slides.map((slide) => (
              <SwiperSlide key={slide.label}>
                <Slide {...slide} />
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>
      </DemoSection>

      <DemoSection title="Multi-item per slide" description="slidesPerView shows multiple items at once, responsive via breakpoints.">
        <Box sx={{ width: '100%' }}>
          <Swiper
            modules={[Navigation]}
            navigation
            spaceBetween={16}
            slidesPerView={1.2}
            breakpoints={{
              600: { slidesPerView: 2.2 },
              900: { slidesPerView: 3.2 },
            }}
            style={{ paddingBottom: 8 }}
          >
            {slides.map((slide) => (
              <SwiperSlide key={slide.label}>
                <Slide {...slide} />
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>
      </DemoSection>

      <DemoSection title="Usage">
        <CodeBlock code={usageCode} />
      </DemoSection>

      <DemoSection title="Props (subset — swiper/react)">
        <PropsTable
          rows={[
            { name: 'modules', type: '[Navigation, Pagination, Autoplay, ...]', description: 'Imported from swiper/modules; enables the corresponding feature.' },
            { name: 'navigation', type: 'boolean | NavigationOptions', default: 'false' },
            { name: 'pagination', type: 'boolean | { clickable: boolean }', default: 'false' },
            { name: 'autoplay', type: 'boolean | { delay: number; disableOnInteraction?: boolean }', default: 'false' },
            { name: 'slidesPerView', type: "number | 'auto'", default: '1' },
            { name: 'spaceBetween', type: 'number', default: '0' },
            { name: 'breakpoints', type: 'Record<number, SwiperOptions>', description: 'Responsive overrides keyed by min-width in px.' },
          ]}
        />
      </DemoSection>

      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        Powered by the <Box component="code">swiper</Box> package (also used by the Swiper JS demo page).
      </Typography>
    </Stack>
  )
}
