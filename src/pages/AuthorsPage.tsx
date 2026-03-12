import { useEffect, useMemo, useState } from "react";
import {
  useDeleteAuthorMutation,
  useGetAuthorQuery,
} from "../store/Api/AuthorApi";
import { Pagination } from "../components/Pagnatation";
import { CreateAuthorAside } from "../components/CreateAuthor";
import { AuthorFiltersAside } from "../components/AuthorFilterAside";
import defaultAvatar from "../images/icons8-user-default-64.png";
import { useNavigate } from "react-router-dom";
import plisIcon from "../images/icons8-plus-24.png";
import { DeleteConfirm } from "../components/DeleteConfirm";
import { UpdateAuthorAside } from "../components/UpdateAuthor";

export const AuthorPage = () => {
  const [page, setPage] = useState(1);
  const [take, setTake] = useState(5);
  const [search, setSearch] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const navigate = useNavigate();
  const [deleteAuthor, { isLoading: isDeleting }] = useDeleteAuthorMutation();

  const queryArgs = useMemo(
    () => ({
      search: search.trim() || undefined,
      page,
      take,
    }),
    [search, page, take]
  );

  const { data, isLoading, isError } = useGetAuthorQuery(queryArgs);
  const totalPages = Math.max(data?.pages ?? 1, 1);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const authorPageClick = (id: number) => {
    navigate(`/profile-author-page/${id}`);
  };

  const openUpdate = (id: number) => {
    setIsCreateOpen(false);
    setEditId(id);
    setIsUpdateOpen(true);
  };

  const closeUpdate = () => {
    setIsUpdateOpen(false);
    setEditId(null);
  };

  const openCreate = () => {
    setIsUpdateOpen(false);
    setEditId(null);
    setIsCreateOpen(true);
  };

  const closeCreate = () => {
    setIsCreateOpen(false);
  };

  const openDelete = (id: number) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const closeDelete = () => {
    setDeleteId(null);
    setIsDeleteOpen(false);
  };

  const confirmDelete = async () => {
    if (deleteId === null) return;

    try {
      await deleteAuthor(deleteId).unwrap();
      closeDelete();
    } catch (e) {
      console.log("Delete failed", e);
    }
  };

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

  return (
    <>
      <div className="m-4 flex flex-wrap items-end justify-between gap-4">
        <AuthorFiltersAside
          search={search}
          setSearch={setSearch}
          setPage={setPage}
        />

        <button
          type="button"
          onClick={openCreate}
          className="flex gap-2 rounded-md border bg-white px-2 py-2 text-[13px] font-semibold text-black"
        >
          Create
          <img src={plisIcon} alt="" className="mt-1 h-3 w-3" />
        </button>
      </div>

      <div className="m-4 overflow-hidden rounded-md border border-[#2D3748]">
        <table className="w-full border-collapse bg-transparent">
          <thead>
            <tr>
              <th className="w-40 border-b border-[#2D3748] bg-gray-900 px-4 py-2 text-left text-[12px] text-white">
                Author Photo
              </th>
              <th className="w-40 border-b border-[#2D3748] bg-gray-900 px-4 py-2 text-left text-[12px] text-white">
                Name
              </th>
              <th className="w-40 border-b border-[#2D3748] bg-gray-900 px-4 py-2 text-left text-[12px] text-white">
                Full Name
              </th>
              <th className="w-40 border-b border-[#2D3748] bg-gray-900 px-4 py-2 text-left text-[12px] text-white">
                City
              </th>
              <th className="w-50 border-b border-[#2D3748] bg-gray-900 px-4 py-2 text-left text-[12px] text-white">
                Description
              </th>
              <th className="w-40 border-b border-[#2D3748] bg-gray-900 px-4 py-2 text-left text-[12px] text-white">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {isLoading && (
              <tr>
                <td
                  colSpan={6}
                  className="border-b border-[#2D3748] px-4 py-4 text-center text-white"
                >
                  Loading...
                </td>
              </tr>
            )}

            {isError && !isLoading && (
              <tr>
                <td
                  colSpan={6}
                  className="border-b border-[#2D3748] px-4 py-4 text-center text-red-400"
                >
                  Error
                </td>
              </tr>
            )}

            {!isLoading && !isError && (data?.rows.length ?? 0) === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="border-b border-[#2D3748] px-4 py-4 text-center text-white"
                >
                  No results
                </td>
              </tr>
            )}

            {!isLoading &&
              !isError &&
              data?.rows.map((author) => (
                <tr
                  key={author.id}
                  className="cursor-pointer text-gray-500 hover:bg-[#161B22]"
                >
                  <td className="border-b border-[#2D3748] px-4 py-2 text-left text-[12px] text-white">
                    <img
                      src={getAuthorImageUrl(author.author_photo)}
                      alt="Avatar"
                      className="h-10 w-10 rounded-full object-cover"
                      onClick={() => authorPageClick(author.id)}
                      onError={(e) => {
                        e.currentTarget.src = defaultAvatar;
                      }}
                    />
                  </td>

                  <td
                    className="border-b border-[#2D3748] px-4 py-2 text-left text-[12px] text-white"
                    onClick={() => authorPageClick(author.id)}
                  >
                    {author.name}
                  </td>

                  <td
                    className="border-b border-[#2D3748] px-4 py-2 text-left text-[12px] text-white"
                    onClick={() => authorPageClick(author.id)}
                  >
                    {author.full_name}
                  </td>

                  <td
                    className="border-b border-[#2D3748] px-4 py-2 text-left text-[12px] text-white"
                    onClick={() => authorPageClick(author.id)}
                  >
                    {author.country ?? "-"}
                  </td>

                  <td
                    className="border-b border-[#2D3748] px-4 py-2 text-left text-[12px] text-white"
                    onClick={() => authorPageClick(author.id)}
                  >
                    {author.description ?? "-"}
                  </td>

                  <td className="border-b border-[#2D3748] px-4 py-2">
                    <div className="flex w-60 items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openUpdate(author.id);
                        }}
                        className="rounded-md border bg-white px-2 py-2 text-[13px] font-semibold text-black"
                      >
                        Update
                      </button>

                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={(e) => {
                          e.stopPropagation();
                          openDelete(author.id);
                        }}
                        className="rounded-md border bg-white px-2 py-2 text-[13px] font-semibold text-black"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <DeleteConfirm
        isOpen={isDeleteOpen}
        isLoading={isDeleting}
        onClose={closeDelete}
        onConfirm={confirmDelete}
      />

      <div className="m-4">
        <Pagination
          page={page}
          take={take}
          totalPages={totalPages}
          onPrev={() => setPage((prev) => Math.max(prev - 1, 1))}
          onNext={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          onPage={(value) => setPage(value)}
          onTake={(value) => {
            setTake(value);
            setPage(1);
          }}
        />
      </div>

      {isUpdateOpen && editId !== null && (
        <aside className="absolute right-0 top-0 h-screen w-[420px] overflow-auto border bg-[#10141C] p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Update Author</h2>
            <button
              onClick={closeUpdate}
              type="button"
              className="rounded-md border bg-white px-2 py-2 text-[13px] font-semibold text-black"
            >
              Close
            </button>
          </div>
          <UpdateAuthorAside
            id={editId}
            onSuccess={() => {
              closeUpdate();
            }}
          />
        </aside>
      )}

      {isCreateOpen && (
        <aside className="absolute right-0 top-0 h-screen w-[420px] overflow-auto border bg-[#10141C] p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Create Author</h2>
            <button
              className="rounded-md border bg-white px-2 py-2 text-[13px] font-semibold text-black"
              onClick={closeCreate}
              type="button"
            >
              Close
            </button>
          </div>

          <CreateAuthorAside
            onSuccess={() => {
              closeCreate();
            }}
          />
        </aside>
      )}
    </>
  );
};