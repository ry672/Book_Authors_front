import { configureStore } from "@reduxjs/toolkit";
import { authorApi } from "./Api/AuthorApi";
import authorReducer from "./Slice/authorSlice";
import { bookApi } from "./Api/BookApi";
import { categoryApi } from "./Api/CategoryApi";
import { authApi } from "./Api/AuthApi";

const AUTHOR_KEY = "author_state_v1";

const loadAuthorState = () => {
  try {
    const raw = localStorage.getItem(AUTHOR_KEY);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
};

export const store = configureStore({
  reducer: {
    author: authorReducer,
    [authorApi.reducerPath]: authorApi.reducer,
    [bookApi.reducerPath]: bookApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  preloadedState: (() => {
    const savedAuthor = loadAuthorState();
    return savedAuthor ? { author: savedAuthor } : undefined;
  })(),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authorApi.middleware,
      bookApi.middleware,
      categoryApi.middleware,
      authApi.middleware
    ),
});

store.subscribe(() => {
  try {
    localStorage.setItem(AUTHOR_KEY, JSON.stringify(store.getState().author));
  } catch {}
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;