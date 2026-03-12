import { Routes, Route, Navigate, Outlet } from "react-router-dom";

import { NavMenu } from "./components/NavMenu";
import { BooksPage } from "./pages/BooksPage";
import { AuthorPage } from "./pages/AuthorsPage";
import { ProfileAuthorPage } from "./pages/AuthorProfilePage";
import { BookProfilePage } from "./pages/BookPage";
import { CategoryPage } from "./pages/CategoriesPage";
import AmplitudeProvider from "./components/AmplitudeProvider";
// import { Amplitude } from '@/amplitude';


function Layout() {
  return (
    <div className="min-h-screen flex text-slate-100"
      style={{ backgroundColor: "#10141C" }}>
      <NavMenu />
      <main className="flex-1 min-h-screen overflow-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (

    <AmplitudeProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<BooksPage />} />

          <Route path="/author-page" element={<AuthorPage />} />
          <Route path="/profile-author-page/:id" element={<ProfileAuthorPage />} />

          <Route path="/book-profile-page/:id" element={<BookProfilePage />} />
          <Route path="/profile-page" element={<ProfileAuthorPage />} />
          <Route path="/category-page" element={<CategoryPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AmplitudeProvider>

  );
}
