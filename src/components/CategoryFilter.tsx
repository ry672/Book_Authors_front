import React from "react";

type Props = {
 

  search: string;
  setSearch: (v: string) => void;



  setPage: (v: number) => void;
};

export const CategoryFiltersAside: React.FC<Props> = ({
 
  search,
  setSearch,
  setPage,
}) => {
 

  return (
    
      

      <div className="flex justify-between gap-5 ">
        {/* Search */}
      <div className="space-y-2">
        
        <input
          className="w-full rounded-md border border-[#2D3748] bg-gray-900 px-2 py-1 placeholder:text-sm mt-4"
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