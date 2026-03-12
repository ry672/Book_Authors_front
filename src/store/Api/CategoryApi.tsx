import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface CategoryResponse {
  id: number;
  name: string;
  is_deleted: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryRequest {
  name: string;
}

export type PatchCategoryArgs = {
  id: number;
  data: Partial<CategoryRequest>;
};

export type GetCategoriesArgs = {
  search?: string;
  name?: string;
  page?: number;
  take?: number;
};

export interface CategoryPayload {
  count: number;
  page: number;
  take: number;
  pages: number;
  rows: CategoryResponse[];
}

const API_BASE_URL = import.meta.env.VITE_EXCHANGE_API_BASE_URL;

export const categoryApi = createApi({
  reducerPath: "categoryApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ["Categories", "Category", "Books"],
  endpoints: (builder) => ({
    getCategory: builder.query<CategoryPayload, GetCategoriesArgs | void>({
      query: (args) => ({
        url: "/category",
        method: "GET",
        params: {
          ...(args?.search ? { search: args.search } : {}),
          ...(args?.name ? { name: args.name } : {}),
          ...(args?.page ? { page: args.page } : {}),
          ...(args?.take ? { take: args.take } : {}),
        },
      }),
      providesTags: (result) => [
        "Categories",
        "Books",
        ...(result?.rows?.map((category) => ({
          type: "Category" as const,
          id: category.id,
        })) ?? []),
      ],
      keepUnusedDataFor: 300,
    }),

    getCategoryById: builder.query<CategoryResponse, number>({
      query: (id) => ({
        url: `/category/${id}`,
        method: "GET",
      }),
      providesTags: (_res, _err, id) => [{ type: "Category", id }],
      keepUnusedDataFor: 300,
    }),

    postCategory: builder.mutation<CategoryResponse, CategoryRequest>({
      query: (payload) => ({
        url: "/category",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Categories", "Books"],
    }),

    patchCategory: builder.mutation<CategoryResponse, PatchCategoryArgs>({
      query: ({ id, data }) => ({
        url: `/category/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        "Categories",
        "Books",
        { type: "Category", id },
      ],
    }),

    deleteCategory: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/category/${id}/soft`,
        method: "DELETE",
      }),
      invalidatesTags: ["Categories", "Books"],
    }),
  }),
});

export const {
  useGetCategoryQuery,
  useGetCategoryByIdQuery,
  usePostCategoryMutation,
  usePatchCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;