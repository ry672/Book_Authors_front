import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { AuthorResponse } from "./AuthorApi";
import type { CategoryResponse } from "./CategoryApi";

export interface BookResponse {
  id: number;
  name: string;
  categoryId: number;
  price: number;
  authorId: number;
  description: string;
  link: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  author: AuthorResponse;
  category: CategoryResponse;
}

export interface BookRequest {
  name: string;
  price: number;
  description: string;
  link: string;
  authorId: number;
  categoryId: number;
}

export interface BookPayload {
  count: number;
  page: number;
  take: number;
  pages: number;
  rows: BookResponse[];
}

export type GetBooksArgs = {
  search?: string;
  page: number;
  take: number;
  name?: string;
  price?: number;
  minPrice?: number;
  maxPrice?: number;
};

export type PatchBookArgs = {
  id: number;
  data: Partial<BookRequest>;
};

const API_BASE_URL = import.meta.env.VITE_EXCHANGE_API_BASE_URL;

export const bookApi = createApi({
  reducerPath: "bookApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ["Books", "Book", "Category", "Authors"],
  endpoints: (builder) => ({
    getBook: builder.query<BookPayload, GetBooksArgs>({
      query: ({ search, page, take, name, price }) => ({
        url: "/books",
        method: "GET",
        params: {
          ...(search ? { search } : {}),
          ...(name ? { name } : {}),
          ...(price !== undefined ? { price } : {}),
          // ...(minPrice !== undefined ? { minPrice } : {}),
          // ...(maxPrice !== undefined ? { maxPrice } : {}),
          page,
          take,
        },
      }),

      providesTags: (res) =>
        res
          ? [
              { type: "Books", id: "LIST" },
              ...res.rows.map((b) => ({ type: "Book" as const, id: b.id })),
              { type: "Category", id: "LIST" }, 
              { type: "Authors", id: "LIST" },
            ]
          : [{ type: "Books", id: "LIST" }, { type: "Category", id: "LIST" }, { type: "Authors", id: "LIST" }],
    }),

    getBookById: builder.query<BookResponse, number>({
      query: (id) => ({ url: `/books/${id}`, method: "GET" }),
      providesTags: (_res, _err, id) => [{ type: "Book", id }],
    }),

    postBook: builder.mutation<BookResponse, BookRequest>({
      query: (payload) => ({
        url: "/books",
        method: "POST",
        body: payload,
      }),

      invalidatesTags: [{ type: "Books", id: "LIST" }, { type: "Category", id: "LIST" }, { type: "Authors", id: "LIST" }],
    }),

    patchBook: builder.mutation<BookResponse, PatchBookArgs>({
      query: ({ id, data }) => ({
        url: `/books/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Books", id: "LIST" },
        { type: "Book", id },
      ],
    }),

    deleteBook: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/books/${id}/soft`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Books", id: "LIST" }],
    }),
  }),
});

export const {
  useGetBookQuery,
  useGetBookByIdQuery,
  usePostBookMutation,
  usePatchBookMutation,
  useDeleteBookMutation,
} = bookApi;
