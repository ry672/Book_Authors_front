import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { BookResponse } from "./bookSlice";

export interface AuthorResponse {
  id: number;
  name: string;
  full_name: string;
  description?: string;
  country?: string;
  is_deleted: boolean;
  author_photo?: string | null;
  updatedAt: string;
  createdAt: string;
  books: BookResponse[];
}

interface AuthorState {
  author: AuthorResponse | null;
}

const initialState: AuthorState = {
  author: null,
};

const authorSlice = createSlice({
  name: "author",
  initialState,
  reducers: {
    setAuthor: (state, action: PayloadAction<AuthorResponse>) => {
      state.author = action.payload;
    },
    clearAuthor: (state) => {
      state.author = null;
    },
  },
});

export const { setAuthor, clearAuthor } = authorSlice.actions;
export default authorSlice.reducer;