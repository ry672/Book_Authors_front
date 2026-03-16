import { useNavigate } from "react-router-dom";

export const NavMenu = () => {
  const navigate = useNavigate();

  return (
    <aside className="w-64 h-screen shrink-0 sticky top-0 bg-gray-900 text-white">
      <nav className="mt-5 px-2 space-y-4">
        <div className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none" onClick={() => navigate("/author-page")} >
          <button className="nav_button">
            Authors
          </button>
        </div>

        <div className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none" onClick={() => navigate("/books-page")} >
          <button className="nav_button">
            Books
          </button>
        </div>

        <div className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none" onClick={() => navigate("/category-page")} >
          <button className="nav_button">
            Categories
          </button>
        </div>

        {/* <div onClick={() => navigate("/profile-page")}>
          <button>ProfilePage</button>
        </div> */}
      </nav>
    </aside>
  );
};