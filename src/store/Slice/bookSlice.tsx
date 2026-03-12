import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface BookResponse {
    is_deleted: boolean;
    id: number;
    name: string;
    price: number;
    authorId: number;
    categoryId: number;
    updated_at: string;
    created_at: string;
}

export interface BookState {
  book: BookResponse | null;
}

const initialState: BookState = {
  book: null,
};

const bookSlice = createSlice({
  name: "author",
  initialState,
  reducers: {
    setBook(state, action: PayloadAction<BookResponse>) {
      state.book = action.payload;
    },
    clearBook(state) {
      state.book = null;
    },
  },
});

export const { setBook, clearBook } = bookSlice.actions;
export default bookSlice.reducer;