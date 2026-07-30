import { useState } from 'react'
import { Box, Card, Stack, Typography } from '@mui/material'
import { GripVertical } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { shadows } from '@/theme/tokens'
import { DemoSection } from '../components/DemoSection'
import { CodeBlock } from '../components/CodeBlock'
import { PropsTable } from '../components/PropsTable'

const usageCode = `import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function DraggableCard({ id, label }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} {...attributes} {...listeners}>
      {label}
    </div>
  )
}

<DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
  <SortableContext items={ids} strategy={rectSortingStrategy}>
    {items.map((item) => <DraggableCard key={item.id} {...item} />)}
  </SortableContext>
</DndContext>`

interface DemoCard {
  id: string
  label: string
  subtitle: string
}

const initialCards: DemoCard[] = [
  { id: 'card-1', label: 'Scan Activity', subtitle: 'Widget position 1' },
  { id: 'card-2', label: 'Reward Progress', subtitle: 'Widget position 2' },
  { id: 'card-3', label: 'Leaderboard', subtitle: 'Widget position 3' },
  { id: 'card-4', label: 'Recent Redemptions', subtitle: 'Widget position 4' },
]

function SortableCard({ id, label, subtitle }: DemoCard) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  return (
    <Card
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      sx={{
        p: 2,
        cursor: 'grab',
        opacity: isDragging ? 0.5 : 1,
        boxShadow: isDragging ? shadows.dropdown : shadows.card,
      }}
      {...attributes}
      {...listeners}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Box sx={{ color: 'text.disabled', display: 'flex' }}>
          <GripVertical size={18} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>{label}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {subtitle}
          </Typography>
        </Box>
      </Stack>
    </Card>
  )
}

export function DraggableCardDemo() {
  const [cards, setCards] = useState(initialCards)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setCards((prev) => {
      const oldIndex = prev.findIndex((c) => c.id === active.id)
      const newIndex = prev.findIndex((c) => c.id === over.id)
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  return (
    <Stack spacing={4}>
      <DemoSection
        title="Reorderable grid"
        description="Drag any card by its handle to reorder — powered by @dnd-kit/core + @dnd-kit/sortable."
      >
        <Box sx={{ width: '100%' }}>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={cards.map((c) => c.id)} strategy={rectSortingStrategy}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                  gap: 2,
                }}
              >
                {cards.map((card) => (
                  <SortableCard key={card.id} {...card} />
                ))}
              </Box>
            </SortableContext>
          </DndContext>
        </Box>
      </DemoSection>

      <DemoSection title="Usage">
        <CodeBlock code={usageCode} />
      </DemoSection>

      <DemoSection title="Props (subset)">
        <PropsTable
          rows={[
            { name: 'sensors', type: 'SensorDescriptor[]', description: 'e.g. useSensor(PointerSensor) — controls drag activation.' },
            { name: 'collisionDetection', type: 'CollisionDetection', default: 'closestCenter' },
            { name: 'onDragEnd', type: '(event: DragEndEvent) => void', description: 'Compute the new order, typically via arrayMove.' },
            { name: 'items (SortableContext)', type: 'string[] | number[]', description: 'Array of item ids in current order.' },
            { name: 'strategy (SortableContext)', type: 'rectSortingStrategy | verticalListSortingStrategy | ...' },
          ]}
        />
      </DemoSection>
    </Stack>
  )
}
