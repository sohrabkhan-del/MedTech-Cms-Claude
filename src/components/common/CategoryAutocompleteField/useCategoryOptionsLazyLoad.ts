import { useState, type UIEvent } from 'react'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useGetCategoryOptionsQuery } from '@/features/marketingProducts/services/showcaseProductsApi'

const PAGE_SIZE = 10
/** Fraction of scroll-from-bottom (px) at which the next page is requested. */
const SCROLL_THRESHOLD_PX = 48

/**
 * Shared paginated/search/scroll-to-load-more state for the category
 * Autocomplete variants, backed by GET /categories.
 */
export function useCategoryOptionsLazyLoad() {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(inputValue, 300)

  const { data, isFetching } = useGetCategoryOptionsQuery(
    { page, limit: PAGE_SIZE, search: debouncedSearch },
    { skip: !open },
  )

  const options = data?.items ?? []
  const hasMore = data?.hasMore ?? false

  function handleInputChange(value: string) {
    setInputValue(value)
    setPage(1)
  }

  function handleListboxScroll(event: UIEvent<HTMLUListElement>) {
    const listbox = event.currentTarget
    const reachedBottom =
      listbox.scrollHeight - listbox.scrollTop - listbox.clientHeight <
      SCROLL_THRESHOLD_PX
    if (reachedBottom && hasMore && !isFetching) {
      setPage((prev) => prev + 1)
    }
  }

  return {
    open,
    setOpen,
    inputValue,
    options,
    isFetching,
    handleInputChange,
    handleListboxScroll,
  }
}
