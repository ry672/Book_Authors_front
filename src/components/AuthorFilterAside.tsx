import React from "react";

type Props = {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;


  setPage: React.Dispatch<React.SetStateAction<number>>;
};

export const AuthorFiltersAside: React.FC<Props> = ({
 
  search,
  setSearch,
  setPage,
}) => {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="space-y-2">
        <input
          className="w-[220px] rounded-md border border-[#2D3748] bg-gray-900 px-2 py-2 placeholder:text-sm text-white"
          value={search}
          placeholder="Search..."
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      
    </div>
  );
};