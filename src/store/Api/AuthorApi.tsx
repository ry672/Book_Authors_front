import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
import type { BookResponse } from "../Slice/bookSlice";

export interface Author {
  id: number;
  name: string;
  full_name: string;
  description?: string;
  country?: string;
  is_deleted: boolean;
  author_photo?: string | null;
  email?: string;
  updatedAt: string;
  createdAt: string;
  books?: BookResponse[];
}

export interface AuthorPayload {
  count: number;
  page: number;
  take: number;
  pages: number;
  rows: Author[];
}

export type GetAuthorsArgs = {
  search?: string;
  page?: number;
  take?: number;
  name?: string;
  full_name?: string;
  country?: string;
  description?: string;
};

export type AuthorFormValues = {
  name: string;
  full_name: string;
  description?: string;
  country?: string;
  remove_photo?: string;
};

export type CreateAuthorRequest = {
  data: AuthorFormValues;
  file?: File | null;
};

export type PatchAuthorsArgs = {
  id: number;
  data: Partial<AuthorFormValues>;
  file?: File | null;
};

const API_BASE_URL = import.meta.env.VITE_EXCHANGE_API_BASE_URL;

const buildAuthorFormData = (
  data: Partial<AuthorFormValues>,
  file?: File | null
) => {
  const formData = new FormData();

  if (data.name !== undefined) formData.append("name", data.name.trim());
  if (data.full_name !== undefined)
    formData.append("full_name", data.full_name.trim());
  if (data.description !== undefined)
    formData.append("description", data.description.trim());
  if (data.country !== undefined)
    formData.append("country", data.country.trim());
  if (data.remove_photo !== undefined)
    formData.append("remove_photo", data.remove_photo);

  if (file) {
    formData.append("file", file);
  }

  return formData;
};

export const authorApi = createApi({
  reducerPath: "authorApi",
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
  tagTypes: ["Authors", "Author"],
  endpoints: (builder) => ({
    postAuthor: builder.mutation<Author, CreateAuthorRequest>({
      query: ({ data, file }) => ({
        url: "/author",
        method: "POST",
        body: buildAuthorFormData(data, file),
      }),
      invalidatesTags: ["Authors"],
    }),

    getAuthor: builder.query<AuthorPayload, GetAuthorsArgs | void>({
      query: (args) => ({
        url: "/author",
        method: "GET",
        params: {
          ...(args?.search ? { search: args.search } : {}),
          ...(args?.name ? { name: args.name } : {}),
          ...(args?.full_name ? { full_name: args.full_name } : {}),
          ...(args?.country ? { country: args.country } : {}),
          ...(args?.description ? { description: args.description } : {}),
          ...(args?.page ? { page: args.page } : {}),
          ...(args?.take ? { take: args.take } : {}),
        },
      }),
      providesTags: (result) => [
        "Authors",
        ...(result?.rows.map((author) => ({
          type: "Author" as const,
          id: author.id,
        })) ?? []),
      ],
      keepUnusedDataFor: 300,
    }),

    getAuthorById: builder.query<Author, number>({
      query: (id) => ({
        url: `/author/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Author", id }],
      keepUnusedDataFor: 300,
    }),

    patchAuthor: builder.mutation<Author, PatchAuthorsArgs>({
      query: ({ id, data, file }) => ({
        url: `/author/${id}`,
        method: "PATCH",
        body: buildAuthorFormData(data, file),
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "Authors",
        { type: "Author", id },
      ],
    }),

    deleteAuthor: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/author/${id}/soft`,
        method: "DELETE",
      }),
      invalidatesTags: ["Authors"],
    }),
  }),
});

export const {
  usePostAuthorMutation,
  useGetAuthorQuery,
  useGetAuthorByIdQuery,
  usePatchAuthorMutation,
  useDeleteAuthorMutation,
} = authorApi;