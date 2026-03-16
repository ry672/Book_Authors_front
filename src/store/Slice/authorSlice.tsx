import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { BookResponse } from "./bookSlice";

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

interface AuthorState {
  author: Author | null;
  accessToken: string | null;
  refreshToken: string | null;
}

const initialState: AuthorState = {
  author: null,
  accessToken: null,
  refreshToken: null,
};

const authorSlice = createSlice({
  name: "author",
  initialState,
  reducers: {
    setAuthor: (
      state,
      action: PayloadAction<{
        author: Author;
        accessToken: string;
        refreshToken: string;
      }>
    ) => {
      state.author = action.payload.author;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    clearAuthor: (state) => {
      state.author = null;
      state.accessToken = null;
      state.refreshToken = null;
    },
  },
});

export const { setAuthor, clearAuthor } = authorSlice.actions;
export default authorSlice.reducer;