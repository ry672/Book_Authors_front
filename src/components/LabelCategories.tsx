import { useMemo, useState } from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import {
  useGetCategoryQuery,
  type CategoryResponse,
} from "../store/Api/CategoryApi";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name?: Path<T>;
};

export function LabelCategories<T extends FieldValues>({
  control,
  name,
}: Props<T>) {
  const { data, isLoading } = useGetCategoryQuery({});
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const categories: CategoryResponse[] = data?.rows ?? [];

  const filteredCategories = useMemo(() => {
    return categories
      .filter((c) =>
        c.name.toLowerCase().includes(search.trim().toLowerCase())
      )
      .slice(0, 5);
  }, [categories, search]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <Controller
      name={(name ?? "categoryId") as Path<T>}
      control={control}
      rules={{ required: "Select category" }}
      render={({ field, fieldState }) => {
        const selectedCategory = categories.find(
          (c) => c.id === Number(field.value)
        );

        return (
          <div className="relative w-full">
            <span className="text-white text-[14px]">Select category</span>
            <div
              onClick={() => setIsOpen((prev) => !prev)}
              className="mt-2 flex cursor-pointer items-center justify-between bg-gray-900 rounded-md border border-[#2D3748] placeholder:text-[14px]  px-2 py-1"
            >
              <span className="text-[14px]">
                {selectedCategory ? selectedCategory.name : "Select category"}
              </span>
              <span>{isOpen ? "▲" : "▼"}</span>
            </div>

            {isOpen && (
              <div className="absolute z-20 mt-1 w-full rounded-md border border-[#2D3748] bg-gray-900 shadow-lg">
                <div>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search category..."
                    className="w-full  border-b border-[#2D3748] bg-gray-900 text-white outline-none px-3 py-2"
                  />
                </div>

                <div className="max-h-[220px] overflow-y-auto">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          field.onChange(c.id);
                          setIsOpen(false);
                          setSearch("");
                        }}
                        className="cursor-pointer px-3 py-2 text-white hover:bg-[#2D3748]"
                      >
                        {c.name}
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-gray-400">
                      No categories found
                    </div>
                  )}
                </div>
              </div>
            )}

            {fieldState.error?.message && (
              <p className="mt-1 text-red-500">{fieldState.error.message}</p>
            )}
          </div>
        );
      }}
    />
  );
}