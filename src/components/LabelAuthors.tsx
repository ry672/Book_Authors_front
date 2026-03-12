import { useMemo, useState } from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

import { useGetAuthorQuery, type AuthorResponse } from "../store/Api/AuthorApi";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name?: Path<T>;
};

export function LabelAuthors<T extends FieldValues>({
  control,
  name,
}: Props<T>) {
  const { data, isLoading } = useGetAuthorQuery({});
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const authors: AuthorResponse[] = data?.rows ?? [];

  const filteredAutthors = useMemo(() => {
    return authors
      .filter((a) =>
        a.name.toLowerCase().includes(search.trim().toLowerCase())
      )
      .slice(0, 5);
  }, [authors, search]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <Controller
      name={(name ?? "categoryId") as Path<T>}
      control={control}
      rules={{ required: "Select author" }}
      render={({ field, fieldState }) => {
        const selectedAuthor = authors.find(
          (c) => c.id === Number(field.value)
        );

        return (
          <div className="relative w-full">
            <span className="text-white text-[14px]">Select author</span>
            <div
              onClick={() => setIsOpen((prev) => !prev)}
              className="mt-2 flex cursor-pointer items-center justify-between bg-gray-900 rounded-md border border-[#2D3748] placeholder:text-[14px]  px-2 py-1"
            >
              <span className="text-[14px]">
                {selectedAuthor ? selectedAuthor.name : "Select category"}
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
                    placeholder="Search author..."
                    className="w-full  border-b border-[#2D3748] bg-gray-900 text-white outline-none px-3 py-2"
                  />
                </div>

                <div className="max-h-[220px] overflow-y-auto">
                  {filteredAutthors.length > 0 ? (
                    filteredAutthors.map((a) => (
                      <div
                        key={a.id}
                        onClick={() => {
                          field.onChange(a.id);
                          setIsOpen(false);
                          setSearch("");
                        }}
                        className="cursor-pointer px-3 py-2 text-white hover:bg-[#2D3748]"
                      >
                        {a.name}
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-gray-400">
                      No authors found
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