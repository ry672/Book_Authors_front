import { Routes, Route, Navigate, Outlet } from "react-router-dom";

import { NavMenu } from "./components/NavMenu";
import { BooksPage } from "./pages/BooksPage";
import { AuthorPage } from "./pages/AuthorsPage";
import { ProfileAuthorPage } from "./pages/AuthorProfilePage";
import { BookProfilePage } from "./pages/BookPage";
import { CategoryPage } from "./pages/CategoriesPage";

import { RegistrationPage } from "./pages/RegistrationPage";
import { LoginPage } from "./pages/LoginPage";
import { ProfilePage } from "./pages/ProfilePage";

function Layout() {
  return (
    <div
      className="min-h-screen flex text-slate-100"
      style={{ backgroundColor: "#10141C" }}
    >
      <NavMenu />
      <main className="flex-1 min-h-screen overflow-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
   
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/registration-page" element={<RegistrationPage />} />

        <Route element={<Layout />}>
          <Route path="/books-page" element={<BooksPage />} />
          <Route path="/author-page" element={<AuthorPage />} />
          <Route path="/profile-author-page/:id" element={<ProfileAuthorPage />} />
          <Route path="/book-profile-page/:id" element={<BookProfilePage />} />
          <Route path="/profile-page" element={<ProfilePage />} />
          <Route path="/category-page" element={<CategoryPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
   
  );
}
