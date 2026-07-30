import { Box, Stack, Typography } from '@mui/material'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { radius } from '@/theme/tokens'
import { DemoSection } from '../components/DemoSection'
import { CodeBlock } from '../components/CodeBlock'
import { PropsTable } from '../components/PropsTable'

const usageCode = `import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

<Swiper
  modules={[Navigation, Pagination]}
  navigation
  pagination={{ clickable: true }}
  slidesPerView={3}
  spaceBetween={16}
>
  {items.map((item) => <SwiperSlide key={item.id}>{item.content}</SwiperSlide>)}
</Swiper>`

const products = [
  'Product Master', 'Factory Upload', 'Distributor Upload', 'Gift Catalogue', 'Scheme Rules', 'Wallet Reports',
]

function Tile({ label }: { label: string }) {
  return (
    <Box
      sx={{
        height: 120,
        borderRadius: `${radius.md}px`,
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.paper',
        fontWeight: 600,
        fontSize: '0.875rem',
        textAlign: 'center',
        px: 2,
      }}
    >
      {label}
    </Box>
  )
}

export function SwiperJsDemo() {
  return (
    <Stack spacing={4}>
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        This project installs and uses the real <Box component="code" sx={{ fontWeight: 700 }}>swiper</Box> package (already added as a
        dependency) — this page exercises its slides-per-view, pagination, and navigation module options directly.
      </Typography>

      <DemoSection title="slidesPerView: 1" description="One item visible at a time.">
        <Box sx={{ width: '100%' }}>
          <Swiper modules={[Navigation, Pagination]} navigation pagination={{ clickable: true }} slidesPerView={1} spaceBetween={16} style={{ paddingBottom: 32 }}>
            {products.map((p) => (
              <SwiperSlide key={p}><Tile label={p} /></SwiperSlide>
            ))}
          </Swiper>
        </Box>
      </DemoSection>

      <DemoSection title="slidesPerView: 3" description="Three items visible at once, with navigation arrows.">
        <Box sx={{ width: '100%' }}>
          <Swiper modules={[Navigation]} navigation slidesPerView={3} spaceBetween={16}>
            {products.map((p) => (
              <SwiperSlide key={p}><Tile label={p} /></SwiperSlide>
            ))}
          </Swiper>
        </Box>
      </DemoSection>

      <DemoSection title="Pagination only (no arrows)" description="pagination={{ clickable: true }} without the navigation module.">
        <Box sx={{ width: '100%' }}>
          <Swiper modules={[Pagination]} pagination={{ clickable: true }} slidesPerView={2} spaceBetween={16} style={{ paddingBottom: 32 }}>
            {products.map((p) => (
              <SwiperSlide key={p}><Tile label={p} /></SwiperSlide>
            ))}
          </Swiper>
        </Box>
      </DemoSection>

      <DemoSection title="Usage">
        <CodeBlock code={usageCode} />
      </DemoSection>

      <DemoSection title="Props (subset)">
        <PropsTable
          rows={[
            { name: 'modules', type: '[Navigation, Pagination, ...]', description: 'Import only the modules you use to keep bundle size down.' },
            { name: 'slidesPerView', type: "number | 'auto'", default: '1' },
            { name: 'spaceBetween', type: 'number', default: '0' },
            { name: 'navigation', type: 'boolean', default: 'false' },
            { name: 'pagination', type: 'boolean | { clickable: boolean }', default: 'false' },
            { name: 'loop', type: 'boolean', default: 'false' },
          ]}
        />
      </DemoSection>
    </Stack>
  )
}
