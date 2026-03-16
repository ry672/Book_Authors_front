import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
import type { Author } from "./AuthorApi";
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
  photos: string[];
  created_at: string;
  updated_at: string;
  author: Author;
  category: CategoryResponse;
}

export interface BookFormValues {
  name: string;
  price: number;
  description: string;
  link: string;
  authorId: number;
  categoryId: number;
  remove_photos?: boolean;
  remove_photo_urls?: string[];
}

export interface CreateBookArgs {
  data: BookFormValues;
  files?: File[];
}

export interface PatchBookArgs {
  id: number;
  data: Partial<BookFormValues>;
  files?: File[];
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
};

const API_BASE_URL = import.meta.env.VITE_EXCHANGE_API_BASE_URL;

const buildBookFormData = (
  data: Partial<BookFormValues>,
  files?: File[]
) => {
  const formData = new FormData();

  if (data.name !== undefined) formData.append("name", data.name.trim());
  if (data.description !== undefined) {
    formData.append("description", data.description.trim());
  }
  if (data.link !== undefined) formData.append("link", data.link.trim());
  if (data.price !== undefined) formData.append("price", String(data.price));
  if (data.authorId !== undefined) {
    formData.append("authorId", String(data.authorId));
  }
  if (data.categoryId !== undefined) {
    formData.append("categoryId", String(data.categoryId));
  }
  if (data.remove_photos !== undefined) {
    formData.append("remove_photos", String(data.remove_photos));
  }
  if (
    data.remove_photo_urls !== undefined &&
    data.remove_photo_urls.length > 0
  ) {
    formData.append(
      "remove_photo_urls",
      JSON.stringify(data.remove_photo_urls)
    );
  }

  files?.forEach((file) => {
    formData.append("files", file);
  });

  return formData;
};

export const bookApi = createApi({
  reducerPath: "bookApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).author.accessToken;

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
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
          : [
              { type: "Books", id: "LIST" },
              { type: "Category", id: "LIST" },
              { type: "Authors", id: "LIST" },
            ],
    }),

    getBookById: builder.query<BookResponse, number>({
      query: (id) => ({
        url: `/books/${id}`,
        method: "GET",
      }),
      providesTags: (_res, _err, id) => [{ type: "Book", id }],
    }),

    postBook: builder.mutation<BookResponse, CreateBookArgs>({
      query: ({ data, files }) => ({
        url: "/books",
        method: "POST",
        body: buildBookFormData(data, files),
      }),
      invalidatesTags: [
        { type: "Books", id: "LIST" },
        { type: "Category", id: "LIST" },
        { type: "Authors", id: "LIST" },
      ],
    }),

    patchBook: builder.mutation<BookResponse, PatchBookArgs>({
      query: ({ id, data, files }) => ({
        url: `/books/${id}`,
        method: "PATCH",
        body: buildBookFormData(data, files),
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
