import {
  Autocomplete,
  Checkbox,
  Chip,
  CircularProgress,
  TextField,
  type AutocompleteRenderValueGetItemProps,
} from '@mui/material'
import { Check, Square } from 'lucide-react'
import { useCategoryOptionsLazyLoad } from '@/components/common/CategoryAutocompleteField/useCategoryOptionsLazyLoad'
import type { CategoryOption } from '@/features/marketingProducts/services/showcaseProductsApi'

interface CategoryMultiSelectAutocompleteProps {
  value: CategoryOption[]
  onChange: (selected: CategoryOption[]) => void
  label?: string
  placeholder?: string
  size?: 'small' | 'medium'
}

/**
 * Multi-select category picker backed by GET /categories, paginated and
 * lazy-loaded on scroll. Selected categories render as removable chips and
 * a checkbox in the dropdown, matching MUI's standard multi-select
 * Autocomplete pattern.
 */
export function CategoryMultiSelectAutocomplete({
  value,
  onChange,
  label,
  placeholder,
  size = 'small',
}: CategoryMultiSelectAutocompleteProps) {
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
      multiple
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
      disableCloseOnSelect
      renderOption={({ key, ...optionProps }, option, { selected }) => (
        <li key={key} {...optionProps}>
          <Checkbox
            icon={<Square size={16} />}
            checkedIcon={<Check size={16} />}
            checked={selected}
            size="small"
            sx={{ mr: 1 }}
          />
          {option.name}
        </li>
      )}
      renderValue={(
        selected: CategoryOption[],
        getItemProps: AutocompleteRenderValueGetItemProps<true>,
      ) =>
        selected.map((option, index) => {
          const { key, ...itemProps } = getItemProps({ index })
          return <Chip key={key} label={option.name} size="small" {...itemProps} />
        })
      }
      slotProps={{
        listbox: { onScroll: handleListboxScroll, sx: { maxHeight: 280 } },
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          size={size}
          label={label}
          placeholder={value.length === 0 ? placeholder : undefined}
          slotProps={{
            ...params.slotProps,
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
