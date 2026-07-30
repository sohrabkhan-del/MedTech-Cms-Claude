// MOCK MODE — flip VITE_USE_MOCKS=false and confirm this endpoint's real backend path once integration starts.
import { baseApi } from '@/store/api/baseApi'
import {
  mockProducts,
  getProductById,
  productKpis,
  productCategoryOptions,
  productFromImportedRow,
} from '@/features/inventoryManagement/mockProducts'
import type {
  Product,
  ProductFormValues,
} from '@/features/inventoryManagement/types/inventoryManagement.types'
import type { ParsedImportFile } from '@/components/common/CommonTable/tableCsv'
import { mockDelay } from '@/services/mockDelay'

// TODO: replace mock-backed implementations with apiClient calls once the
// product master API is available. create/update are currently no-ops
// resolving immediately so the UI/hook contract is stable ahead of time.

const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<Product[], void>({
      query: () => ({ tag: 'Products', url: '/products', mockResolver: () => mockDelay(mockProducts) }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Products' as const, id })), { type: 'Products' as const, id: 'LIST' }]
          : [{ type: 'Products' as const, id: 'LIST' }],
    }),

    getProductDetail: builder.query<Product | undefined, string>({
      query: (id) => ({ tag: 'Products', url: `/products/${id}`, mockResolver: () => mockDelay(getProductById(id)) }),
      providesTags: (_result, _error, id) => [{ type: 'Products', id }],
    }),

    getProductKpis: builder.query<typeof productKpis, void>({
      query: () => ({ tag: 'Products', url: '/products/kpis', mockResolver: () => mockDelay(productKpis) }),
      providesTags: [{ type: 'Products', id: 'KPIS' }],
    }),

    getProductCategoryOptions: builder.query<typeof productCategoryOptions, void>({
      query: () => ({
        tag: 'Products',
        url: '/products/category-options',
        mockResolver: () => mockDelay(productCategoryOptions),
      }),
      providesTags: [{ type: 'Products', id: 'CATEGORY_OPTIONS' }],
    }),

    createProduct: builder.mutation<void, ProductFormValues>({
      query: (values) => ({
        tag: 'Products',
        url: '/products',
        method: 'POST',
        data: values,
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: [{ type: 'Products', id: 'LIST' }, { type: 'Products', id: 'KPIS' }],
    }),

    updateProduct: builder.mutation<void, { id: string; values: ProductFormValues }>({
      query: ({ id, values }) => ({
        tag: 'Products',
        url: `/products/${id}`,
        method: 'PUT',
        data: values,
        mockResolver: () => Promise.resolve(),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Products', id },
        { type: 'Products', id: 'LIST' },
        { type: 'Products', id: 'KPIS' },
      ],
    }),

    // Maps parsed xlsx rows onto Product records for the mock store. Real imports
    // will need a backend endpoint that validates/maps columns server-side. Does not
    // invalidate the products list/KPIs tags — like the original service, imported
    // rows aren't persisted into the underlying mock store; the caller merges the
    // returned rows into local state instead (see useProducts).
    importProducts: builder.mutation<Product[], ParsedImportFile>({
      query: (parsed) => ({
        tag: 'Products',
        url: '/products/import',
        method: 'POST',
        data: parsed,
        mockResolver: () =>
          mockDelay(parsed.rows.map((row, i) => productFromImportedRow(row, mockProducts.length + i + 1))),
      }),
    }),
  }),
})

export const {
  useGetProductsQuery,
  useGetProductDetailQuery,
  useGetProductKpisQuery,
  useGetProductCategoryOptionsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useImportProductsMutation,
} = productsApi
