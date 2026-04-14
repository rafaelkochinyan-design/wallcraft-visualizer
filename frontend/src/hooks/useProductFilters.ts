import { useSearchParams } from 'react-router-dom'

export interface ProductFilters {
  q: string
  category_id: string
  collection_id: string
  sort: 'newest' | 'price_asc' | 'price_desc' | 'name_asc'
  min_price: string
  max_price: string
  page: number
}

export function useProductFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters: ProductFilters = {
    q:             searchParams.get('q') ?? '',
    category_id:   searchParams.get('category_id') ?? '',
    collection_id: searchParams.get('collection_id') ?? '',
    sort:          (searchParams.get('sort') ?? 'newest') as ProductFilters['sort'],
    min_price:     searchParams.get('min_price') ?? '',
    max_price:     searchParams.get('max_price') ?? '',
    page:          Number(searchParams.get('page') ?? 1),
  }

  function setFilter(key: keyof ProductFilters, value: string | number) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value === '' || value === 0 || (key === 'sort' && value === 'newest')) {
          next.delete(key)
        } else {
          next.set(key, String(value))
        }
        if (key !== 'page') next.delete('page') // reset to page 1 on filter change
        return next
      },
      { replace: true }
    )
  }

  function resetFilters() {
    setSearchParams({}, { replace: true })
  }

  const activeCount = [filters.q, filters.category_id, filters.collection_id, filters.min_price, filters.max_price].filter(
    Boolean
  ).length

  return { filters, setFilter, resetFilters, activeCount }
}
