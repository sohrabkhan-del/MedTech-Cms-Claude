import { Autocomplete, CircularProgress, TextField } from '@mui/material'
import { useCategoryOptionsLazyLoad } from '@/components/common/CategoryAutocompleteField/useCategoryOptionsLazyLoad'
import type { CategoryOption } from '@/features/marketingProducts/services/showcaseProductsApi'

interface CategorySelectAutocompleteProps {
  /** Selected category's id, or null when nothing is selected. */
  value: CategoryOption | null
  onChange: (selected: CategoryOption | null) => void
  label?: string
  placeholder?: string
  size?: 'small' | 'medium'
  error?: boolean
  helperText?: string
  /** Hides the floating input label, matching this app's form field convention. */
  hideInputLabel?: boolean
}

/**
 * Single-select category picker backed by GET /categories, paginated and
 * lazy-loaded on scroll. Plain value/onChange — no react-hook-form
 * dependency, so it can be used from filter drawers and other non-form
 * contexts.
 */
export function CategorySelectAutocomplete({
  value,
  onChange,
  label,
  placeholder,
  size = 'small',
  error,
  helperText,
  hideInputLabel,
}: CategorySelectAutocompleteProps) {
  const {
    open,
    setOpen,
    inputValue,
    options,
    isFetching,
    handleInputChange,
    handleListboxScroll,
  } = useCategoryOptionsLazyLoad()

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={options}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      value={value}
      onChange={(_, selected) => onChange(selected)}
      inputValue={inputValue}
      onInputChange={(_, val) => handleInputChange(val)}
      filterOptions={(opts) => opts}
      loading={isFetching}
      slotProps={{
        listbox: { onScroll: handleListboxScroll, sx: { maxHeight: 280 } },
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          size={size}
          label={label}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
          slotProps={{
            ...params.slotProps,
            ...(hideInputLabel && { inputLabel: { shrink: false, sx: { display: 'none' } } }),
            input: {
              ...params.slotProps.input,
              endAdornment: (
                <>
                  {isFetching ? <CircularProgress color="inherit" size={16} /> : null}
                  {params.slotProps.input.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  )
}
