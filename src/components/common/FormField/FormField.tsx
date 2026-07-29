import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { TextField, type TextFieldProps } from '@mui/material'

interface FormFieldProps<TFieldValues extends FieldValues> extends Omit<
  TextFieldProps,
  'name' | 'error'
> {
  name: FieldPath<TFieldValues>
  control: Control<TFieldValues>
  required?: boolean
  /** Restrict input to digits only (e.g. quantity, points). */
  numeric?: boolean
  /** Restrict input to digits plus a single decimal point (e.g. price, multipliers). */
  decimal?: boolean
}

function sanitizeNumeric(value: string, decimal: boolean): string {
  const cleaned = decimal
    ? value.replace(/[^0-9.]/g, '')
    : value.replace(/[^0-9]/g, '')
  if (!decimal) return cleaned
  const [whole, ...rest] = cleaned.split('.')
  return rest.length > 0 ? `${whole}.${rest.join('')}` : whole
}

export function FormField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  required,
  numeric,
  decimal,
  ...textFieldProps
}: FormFieldProps<TFieldValues>) {
  const isNumeric = numeric || decimal
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          {...textFieldProps}
          onChange={
            isNumeric
              ? (e) =>
                  field.onChange(sanitizeNumeric(e.target.value, !!decimal))
              : field.onChange
          }
          slotProps={
            isNumeric
              ? {
                  ...textFieldProps.slotProps,
                  htmlInput: {
                    inputMode: decimal ? 'decimal' : 'numeric',
                    ...textFieldProps.slotProps?.htmlInput,
                  },
                }
              : textFieldProps.slotProps
          }
          label={required ? `${label} *` : label}
          error={!!fieldState.error}
          helperText={fieldState.error?.message ?? textFieldProps.helperText}
          fullWidth
          size="small"
        />
      )}
    />
  )
}
