import { Checkbox, ListItemText, MenuItem, TextField } from '@mui/material'
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import type { RegionOption } from '@/contexts/RegionFilterContext'

interface RegionMultiSelectFieldProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>
  control: Control<TFieldValues>
  regions: RegionOption[]
}

/**
 * Multi-select region picker with an "All Regions" option that is mutually
 * exclusive with picking specific regions (selecting it clears specific
 * picks and vice versa). Shared by the Admin form and the profile edit form.
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
        const value = field.value as string[]
        const allRegionOption = regions.find((r) => r.code === 'ALL_INDIA')
        const specificRegions = regions.filter((r) => r.code !== 'ALL_INDIA')
        const isAllSelected = !!allRegionOption && value.includes(allRegionOption.id)

        function handleChange(selectedIds: string[]) {
          if (!allRegionOption) {
            field.onChange(selectedIds)
            return
          }
          const allJustPicked = selectedIds.includes(allRegionOption.id) && !isAllSelected
          const allJustCleared = isAllSelected && !selectedIds.includes(allRegionOption.id)

          if (allJustPicked) {
            field.onChange([allRegionOption.id])
          } else if (allJustCleared) {
            field.onChange([])
          } else {
            field.onChange(selectedIds.filter((id) => id !== allRegionOption.id))
          }
        }

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
                renderValue: (selected) =>
                  regions
                    .filter((r) => (selected as string[]).includes(r.id))
                    .map((r) => r.name)
                    .join(', '),
              },
              inputLabel: { shrink: false, sx: { display: 'none' } },
            }}
          >
            {allRegionOption ? (
              <MenuItem value={allRegionOption.id}>
                <Checkbox checked={isAllSelected} size="small" />
                <ListItemText primary={allRegionOption.name} />
              </MenuItem>
            ) : null}
            {specificRegions.map((region) => (
              <MenuItem key={region.id} value={region.id} disabled={isAllSelected}>
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
