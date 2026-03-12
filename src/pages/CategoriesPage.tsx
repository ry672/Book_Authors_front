import { useEffect, useMemo, useState } from "react";
import { Pagination } from "../components/Pagnatation";
import { CreateCategoryAside } from "../components/CreateCategory";
import { CategoryFiltersAside } from "../components/CategoryFilter";
import { UpdateCategoryAside } from "../components/UpdateCategory";
import {
  useDeleteCategoryMutation,
  useGetCategoryQuery,
} from "../store/Api/CategoryApi";
import plisIcon from "../images/icons8-plus-24.png";
import { DeleteConfirm } from "../components/DeleteConfirm";

export const CategoryPage = () => {
  const [page, setPage] = useState(1);
  const [take, setTake] = useState(5);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);

  const [editId, setEditId] = useState<number | null>(null);
  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryMutation();

  const [search, setSearch] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const queryArgs = useMemo(
    () => ({
      search: search.trim() || undefined,
      page,
      take,
    }),
    [search, page, take]
  );

  const { data, isLoading, isError } = useGetCategoryQuery(queryArgs);

  const items = Array.isArray(data) ? data : (data as any)?.rows ?? [];
  const totalPages = Array.isArray(data)
    ? 1
    : Math.max((data as any)?.pages ?? 1, 1);

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
      await deleteCategory(deleteId).unwrap();
      closeDelete();
    } catch (e) {
      console.log("Delete failed", e);
    }
  };

  return (
    <>
      <div className="m-4 flex items-end justify-between gap-3">
        <CategoryFiltersAside
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

      <div className="overflow-hidden rounded-md border border-[#2D3748]">
        <table className="w-full border-collapse bg-transparent">
          <thead>
            <tr>
              <th className="w-20 border-b border-[#2D3748] bg-gray-900 px-4 py-2 text-left text-[12px] text-white">
                Name
              </th>
              <th className="w-20 border-b border-[#2D3748] bg-gray-900 px-4 py-2 text-left text-[12px] text-white"></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {isLoading && (
              <tr>
                <td
                  colSpan={2}
                  className="border-b border-[#2D3748] px-4 py-4 text-white"
                >
                  Loading...
                </td>
              </tr>
            )}

            {isError && (
              <tr>
                <td
                  colSpan={2}
                  className="border-b border-[#2D3748] px-4 py-4 text-red-500"
                >
                  Error
                </td>
              </tr>
            )}

            {!isLoading && !isError && items.length === 0 && (
              <tr>
                <td
                  colSpan={2}
                  className="border-b border-[#2D3748] px-4 py-4 text-white"
                >
                  No results
                </td>
              </tr>
            )}

            {!isLoading &&
              !isError &&
              items
                ?.filter((c: any) => c.is_deleted === false)
                .map((c: any) => (
                  <tr key={c.id} className="text-gray-500">
                    <th className="border-b border-[#2D3748] px-4 py-1 text-left text-[12px] text-white">
                      {c.name}
                    </th>

                    <td className="border-b border-[#2D3748]">
                      <div className="m-2 flex w-60 items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openUpdate(c.id);
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
                            openDelete(c.id);
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

        <div className="m-4">
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
      </div>

      <DeleteConfirm
        onClose={closeDelete}
        isOpen={isDeleteOpen}
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />

      {isUpdateOpen && editId !== null && (
        <aside className="fixed right-0 top-0 z-50 h-screen w-[420px] overflow-auto border bg-[#10141C] p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Update Category</h2>
            <button
              onClick={closeUpdate}
              type="button"
              className="rounded-md border bg-white px-2 py-2 text-[13px] font-semibold text-black"
            >
              Close
            </button>
          </div>

          <UpdateCategoryAside id={editId} onSuccess={closeUpdate} />
        </aside>
      )}

      {isCreateOpen && (
        <aside className="fixed right-0 top-0 z-50 h-screen w-[420px] overflow-auto border bg-[#10141C] p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Create Category</h2>
            <button
              onClick={() => setIsCreateOpen(false)}
              type="button"
              className="rounded-md border bg-white px-2 py-2 text-[13px] font-semibold text-black"
            >
              Close
            </button>
          </div>

          <CreateCategoryAside onSuccess={() => setIsCreateOpen(false)} />
        </aside>
      )}
    </>
  );
};