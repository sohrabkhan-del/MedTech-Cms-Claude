import {
  Controller,
  useWatch,
  type Control,
  type FieldPath,
  type FieldValues,
  type UseFormSetValue,
} from 'react-hook-form'
import { CategorySelectAutocomplete } from '@/components/common/CategoryAutocompleteField/CategorySelectAutocomplete'
import type { CategoryOption } from '@/features/marketingProducts/services/showcaseProductsApi'

interface CategoryAutocompleteFieldProps<TFieldValues extends FieldValues> {
  /** Field storing the selected category's id. */
  name: FieldPath<TFieldValues>
  /** Field storing the selected category's display name (kept in sync for read-back display). */
  nameField: FieldPath<TFieldValues>
  control: Control<TFieldValues>
  setValue: UseFormSetValue<TFieldValues>
  label?: string
  placeholder?: string
}

/**
 * React-hook-form binding around `CategorySelectAutocomplete` — keeps the
 * id field and the display-name field in sync on selection.
 */
export function CategoryAutocompleteField<TFieldValues extends FieldValues>({
  name,
  nameField,
  control,
  setValue,
  label,
  placeholder,
}: CategoryAutocompleteFieldProps<TFieldValues>) {
  const selectedId = useWatch({ control, name })
  const selectedName = useWatch({ control, name: nameField })

  const selectedOption: CategoryOption | null = selectedId
    ? { id: selectedId as string, name: (selectedName as string) || (selectedId as string) }
    : null

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <CategorySelectAutocomplete
          value={selectedOption}
          onChange={(selected) => {
            field.onChange(selected?.id ?? '')
            setValue(nameField, (selected?.name ?? '') as TFieldValues[typeof nameField])
          }}
          label={label}
          placeholder={placeholder}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
          hideInputLabel
        />
      )}
    />
  )
}
