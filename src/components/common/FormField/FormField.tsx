import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { TextField, type TextFieldProps } from '@mui/material'

interface FormFieldProps<TFieldValues extends FieldValues> extends Omit<TextFieldProps, 'name' | 'error'> {
  name: FieldPath<TFieldValues>
  control: Control<TFieldValues>
  required?: boolean
}

export function FormField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  required,
  ...textFieldProps
}: FormFieldProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          {...textFieldProps}
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
