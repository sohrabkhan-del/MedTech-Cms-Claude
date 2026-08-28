import { Checkbox, ListItemText, MenuItem, TextField } from '@mui/material'
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'
import type { RegionOption } from '@/contexts/RegionFilterContext'

interface RegionMultiSelectFieldProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>
  control: Control<TFieldValues>
  regions: RegionOption[]
}

/**
 * Multi-select region picker with an "All India" option that stays in sync with the
 * four regional groups. When North + South + East + West are selected, the component
 * automatically promotes the selection to All India.
 */
export function RegionMultiSelectField<TFieldValues extends FieldValues>({
  name,
  control,
  regions,
}: RegionMultiSelectFieldProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const value = (
          Array.isArray(field.value) ? field.value : []
        ) as string[]
        const allRegionOption = regions.find((r) => r.code === 'ALL_INDIA')
        const specificRegions = regions.filter((r) => r.code !== 'ALL_INDIA')
        const isAllSelected =
          !!allRegionOption && value.includes(allRegionOption.id)
        const allSpecificSelected =
          specificRegions.length > 0 &&
          specificRegions.every((region) => value.includes(region.id))

        if (allRegionOption && allSpecificSelected && !isAllSelected) {
          field.onChange([allRegionOption.id])
        }

        function handleChange(selectedIds: string[]) {
          if (!allRegionOption) {
            field.onChange(selectedIds)
            return
          }

          const safeSelectedIds = selectedIds.filter(Boolean)
          const allJustPicked =
            safeSelectedIds.includes(allRegionOption.id) && !isAllSelected
          const allJustCleared =
            isAllSelected && !safeSelectedIds.includes(allRegionOption.id)
          const allSpecificGroupSelected =
            specificRegions.length > 0 &&
            specificRegions.every((region) =>
              safeSelectedIds.includes(region.id),
            )

          if (allJustPicked) {
            field.onChange([allRegionOption.id])
          } else if (allJustCleared) {
            field.onChange([])
          } else if (allSpecificGroupSelected) {
            field.onChange([allRegionOption.id])
          } else {
            field.onChange(
              safeSelectedIds.filter((id) => id !== allRegionOption.id),
            )
          }
        }

        const selectedNames = regions
          .filter((region) => value.includes(region.id))
          .map((region) => region.name)

        const displayLabel =
          isAllSelected || allSpecificSelected
            ? `${allRegionOption?.name ?? 'All India'} (North, South, East, West)`
            : selectedNames.join(', ')

        return (
          <TextField
            select
            fullWidth
            size="small"
            value={value}
            onChange={(e) =>
              handleChange(
                typeof e.target.value === 'string'
                  ? e.target.value.split(',')
                  : (e.target.value as string[]),
              )
            }
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            slotProps={{
              select: {
                multiple: true,
                renderValue: () => displayLabel,
              },
              inputLabel: { shrink: false, sx: { display: 'none' } },
            }}
          >
            {allRegionOption ? (
              <MenuItem
                value={allRegionOption.id}
                sx={{
                  fontWeight: isAllSelected ? 700 : 400,
                  bgcolor: isAllSelected ? 'primary.50' : 'transparent',
                }}
              >
                <Checkbox checked={isAllSelected} size="small" />
                <ListItemText primary={allRegionOption.name} />
              </MenuItem>
            ) : null}
            {specificRegions.map((region) => (
              <MenuItem
                key={region.id}
                value={region.id}
                disabled={isAllSelected}
                sx={{
                  opacity: isAllSelected ? 0.7 : 1,
                  fontWeight: value.includes(region.id) ? 600 : 400,
                }}
              >
                <Checkbox checked={value.includes(region.id)} size="small" />
                <ListItemText primary={region.name} />
              </MenuItem>
            ))}
          </TextField>
        )
      }}
    />
  )
}
