import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useGetAuthorByIdQuery } from "../store/Api/AuthorApi";
import type { RootState } from "../store/store";
import defaultAvatar from "../images/icons8-user-default-64.png";
import { LogoutButton } from "./ButtonLogout";

const getAuthorImageUrl = (photo?: string | null) => {
  if (!photo?.trim()) {
    return defaultAvatar;
  }

  if (photo.startsWith("http://") || photo.startsWith("https://")) {
    return photo;
  }

  const baseUrl = import.meta.env.VITE_SERVER_URL?.replace(/\/$/, "") ?? "";
  const normalizedPhoto = photo.startsWith("/") ? photo : `/${photo}`;

  return `${baseUrl}${normalizedPhoto}`;
};

export const NavMenu = () => {
  const authorId = useSelector((state: RootState) => state.author.author?.id);

  const { data: author } = useGetAuthorByIdQuery(authorId ?? 0, {
    skip: !authorId,
  });

  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const toggleProfileMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const goToProfile = () => {
    setIsOpen(false);
    navigate("/profile-page");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;

      if (!menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <aside className="sticky top-0 h-screen w-64 shrink-0 bg-gray-900 text-white">
      <nav className="mt-5 flex h-[calc(100%-30px)] flex-col justify-between gap-5 px-2">
        <div className="space-y-4">
          <button
            type="button"
            className="w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none"
            onClick={() => navigate("/author-page")}
          >
            Authors
          </button>

          <button
            type="button"
            className="w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none"
            onClick={() => navigate("/books-page")}
          >
            Books
          </button>

          <button
            type="button"
            className="w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none"
            onClick={() => navigate("/category-page")}
          >
            Categories
          </button>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={toggleProfileMenu}
            className={`flex w-full items-center justify-center rounded-md p-2 text-left cursor-pointer transition ${
              isOpen
                ? "bg-gray-700 ring-2 ring-[#117278]/40"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            <div className="mr-2">
              <img
                src={getAuthorImageUrl(author?.author_photo)}
                alt={author?.name ?? "User"}
                className="h-10 w-10 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = defaultAvatar;
                }}
              />
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate">
                {author?.name ?? "Unknown user"}
              </span>
              <span className="truncate text-sm text-gray-300">
                {author?.email ?? "No email"}
              </span>
            </div>
          </button>

          {isOpen && (
            <div className="absolute bottom-[20px] left-[250px] z-50 h-[130px] w-[250px] rounded-md border border-[#2D3748] bg-gray-900 shadow-sm">
              <button
                type="button"
                onClick={goToProfile}
                className="w-full border-b border-[#2D3748] px-3 py-3 text-left text-sm text-white hover:bg-gray-800"
              >
                <div className="flex flex-row items-center gap-2">
                  <img
                    src={getAuthorImageUrl(author?.author_photo)}
                    alt={author?.name ?? "User"}
                    className="h-10 w-10 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = defaultAvatar;
                    }}
                  />
                  <div className="flex flex-col">
                    <span className="truncate">
                      {author?.name ?? "Unknown user"}
                    </span>
                    <span className="truncate text-sm text-gray-300">
                      {author?.email ?? "No email"}
                    </span>
                  </div>
                </div>
              </button>

              <div className="p-2">
                <LogoutButton />
              </div>
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
};