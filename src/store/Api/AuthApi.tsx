import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";

export interface IAuthAuthor {
  id: number;
  name: string;
  full_name: string;
  description?: string;
  country?: string;
  is_deleted: boolean;
  author_photo?: string | null;
  email: string;
  updatedAt: string;
  createdAt: string;
}

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IRegisterPayload {
  name: string;
  full_name: string;
  description?: string;
  country?: string;
  email: string;
  password: string;
}

export interface IAuthResponse {
  message: string;
  author: IAuthAuthor;
  accessToken: string;
  refreshToken: string;
}

const API_BASE_URL = import.meta.env.VITE_EXCHANGE_API_BASE_URL;

export const authApi = createApi({
  reducerPath: "authApi",
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
  endpoints: (builder) => ({
    loginUser: builder.mutation<IAuthResponse, ILoginPayload>({
      query: (payload) => ({
        url: "/auth/login",
        method: "POST",
        body: {
          email: payload.email.trim().toLowerCase(),
          password: payload.password,
        },
      }),
    }),

    registerUser: builder.mutation<IAuthResponse, IRegisterPayload>({
      query: (payload) => ({
        url: "/auth/register",
        method: "POST",
        body: {
          name: payload.name.trim(),
          full_name: payload.full_name.trim(),
          description: payload.description?.trim() ?? "",
          country: payload.country?.trim() ?? "",
          email: payload.email.trim().toLowerCase(),
          password: payload.password,
        },
      }),
    }),

    logoutUser: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useLoginUserMutation,
  useRegisterUserMutation,
  useLogoutUserMutation,
} = authApi;