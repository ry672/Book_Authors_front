import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface CategoryResponse {
  id: number;
  name: string;
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryState {
  category: CategoryResponse | null;
}

const initialState: CategoryState = {
  category: null,
};

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    setCategory(state, action: PayloadAction<CategoryResponse>) {
      state.category = action.payload;
    },
    clearCategory(state) {
      state.category = null;
    },
  },
});

export const { setCategory, clearCategory } = categorySlice.actions;
export default categorySlice.reducer;