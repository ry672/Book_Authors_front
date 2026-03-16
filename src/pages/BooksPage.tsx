import { useEffect, useMemo, useState } from "react";
import { useDeleteBookMutation, useGetBookQuery } from "../store/Api/BookApi";
import { Pagination } from "../components/Pagnatation";
import { useNavigate } from "react-router-dom";
import { CreateBookAside } from "../components/CreateBookPage";
import { UpdateBookAside } from "../components/UpdateBook";
import { BookFiltersAside } from "../components/BookFilterAside";
import plisIcon from "../images/icons8-plus-24.png";
import { DeleteConfirm } from "../components/DeleteConfirm";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { LogoutButton } from "../components/ButtonLogout";

export const BooksPage = () => {
  const [page, setPage] = useState(1);
  const [take, setTake] = useState(5);

  const navigate = useNavigate();
  const accessToken = useSelector(
    (state: RootState) => state.author.accessToken
  );

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);

  const [editId, setEditId] = useState<number | null>(null);
  const [deleteBook, { isLoading: isDeleting }] = useDeleteBookMutation();

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    if (!accessToken) {
      navigate("/", { replace: true });
    }
  }, [accessToken, navigate]);

  const exactPrice = useMemo(() => {
    const v = price.trim();
    if (!v) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }, [price]);

  const queryArgs = useMemo(
    () => ({
      search: search.trim() || undefined,
      page,
      take,
      name: name.trim() || undefined,
      price: exactPrice,
    }),
    [search, page, take, name, exactPrice]
  );

  const {
    data: books,
    isLoading,
    isError,
  } = useGetBookQuery(queryArgs, {
    skip: !accessToken,
  });

  const totalPages = Math.max(books?.pages ?? 1, 1);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [page, totalPages]);

  const openCreate = () => {
    setIsUpdateOpen(false);
    setEditId(null);
    setIsCreateOpen(true);
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
      await deleteBook(deleteId).unwrap();
      closeDelete();
    } catch (e) {
      console.log("Delete failed", e);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setName("");
    setPrice("");
    setPage(1);
  };

  const bookPageClick = (id: number) => {
    navigate(`/book-profile-page/${id}`);
  };

  if (!accessToken) {
    return null;
  }

  return (
    <>
      <div className="m-4 flex items-end justify-between gap-3">
        <BookFiltersAside
          onClear={clearFilters}
          search={search}
          setSearch={setSearch}
          setPage={setPage}
        />

        <LogoutButton/>
        <button
          type="button"
          onClick={openCreate}
          className="flex gap-2 rounded-md border bg-white px-2 py-2 text-[13px] font-semibold text-black"
        >
          Create
          <img src={plisIcon} alt="" className="mt-1 h-3 w-3" />
        </button>
      </div>

      <div className="overflow-hidden rounded-md border border-[#2D3748]">
        <table className="w-full border-collapse bg-transparent">
          <thead>
            <tr>
              <th className="w-40 border-b border-[#2D3748] bg-gray-900 px-4 py-2 text-left text-[12px] text-white">
                Name
              </th>
              <th className="w-30 border-b border-[#2D3748] bg-gray-900 px-4 py-2 text-left text-[12px] text-white">
                Price
              </th>
              <th className="w-40 border-b border-[#2D3748] bg-gray-900 px-4 py-2 text-left text-[12px] text-white">
                Category
              </th>
              <th className="w-40 border-b border-[#2D3748] bg-gray-900 px-4 py-2 text-left text-[12px] text-white">
                Description
              </th>
              <th className="w-40 border-b border-[#2D3748] bg-gray-900 px-4 py-2 text-left text-[12px] text-white">
                Authors
              </th>
              <th className="w-60 border-b border-[#2D3748] bg-gray-900 px-4 py-2 text-left text-[12px] text-white"></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-4 text-white">
                  Loading...
                </td>
              </tr>
            )}

            {isError && (
              <tr>
                <td colSpan={6} className="px-4 py-4 text-red-500">
                  Error
                </td>
              </tr>
            )}

            {!isLoading && !isError && (books?.rows?.length ?? 0) === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-4 text-white">
                  No results
                </td>
              </tr>
            )}

            {books?.rows
              ?.filter((b) => b.is_deleted === false)
              .map((b) => (
                <tr key={b.id} className="text-gray-500">
                  <th
                    onClick={() => bookPageClick(b.id)}
                    className="cursor-pointer border-b border-[#2D3748] px-4 py-1 text-left text-[12px] text-white"
                  >
                    {b.name}
                  </th>
                  <td className="border-b border-[#2D3748] px-4 py-2 text-left text-[12px] text-white">
                    {b.price}$
                  </td>
                  <td className="border-b border-[#2D3748] px-4 py-2 text-left text-[12px] text-white">
                    {b.category.name}
                  </td>
                  <td className="border-b border-[#2D3748] px-4 py-2 text-left text-[12px] text-white">
                    {b.description}
                  </td>
                  <td className="border-b border-[#2D3748] px-4 py-2 text-left text-[12px] text-white">
                    {b.author.name}
                  </td>

                  <td className="border-b border-[#2D3748]">
                    <div className="m-2 flex w-60 items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openUpdate(b.id);
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
                          openDelete(b.id);
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

        <Pagination
          page={page}
          totalPages={totalPages}
          onPrev={() => setPage((p) => Math.max(p - 1, 1))}
          onNext={() => setPage((p) => Math.min(p + 1, totalPages))}
          onPage={(p) => setPage(p)}
          take={take}
          onTake={(value) => {
            setTake(value);
            setPage(1);
          }}
        />
      </div>

      {isUpdateOpen && editId !== null && (
        <aside className="fixed right-0 top-0 z-50 h-screen w-[420px] overflow-auto border bg-[#10141C] p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Update Book</h2>
            <button
              onClick={closeUpdate}
              type="button"
              className="rounded-md border bg-white px-2 py-2 text-[13px] font-semibold text-black"
            >
              Close
            </button>
          </div>

          <UpdateBookAside id={editId} onSuccess={closeUpdate} />
        </aside>
      )}

      {isCreateOpen && (
        <aside className="fixed right-0 top-0 z-50 h-screen w-[420px] overflow-auto border bg-[#10141C] p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Create Book</h2>
            <button
              onClick={() => setIsCreateOpen(false)}
              type="button"
              className="rounded-md border bg-white px-2 py-2 text-[13px] font-semibold text-black"
            >
              Close
            </button>
          </div>

          <CreateBookAside onSuccess={() => setIsCreateOpen(false)} />
        </aside>
      )}

      <DeleteConfirm
        isOpen={isDeleteOpen}
        isLoading={isDeleting}
        onClose={closeDelete}
        onConfirm={confirmDelete}
      />
    </>
  );
};