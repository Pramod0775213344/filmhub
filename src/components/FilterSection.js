"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, Search } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

export default function FilterSection({ categories, years, languages, currentFilters, hideCategoryFilter = false, hideLanguageFilter = false }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleFilterChange = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "All" || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearch = useDebouncedCallback((term) => {
    handleFilterChange("q", term);
  }, 300);

  return (
    <div className="flex flex-col gap-4 w-full md:w-auto">
      {/* Search Bar */}
      <div className="relative w-full md:min-w-[300px]">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
        <input 
          type="text"
          placeholder="Search movies..."
          defaultValue={currentFilters.q || ""}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full rounded-xl bg-zinc-900 py-3 pl-12 pr-4 text-sm font-bold text-white ring-1 ring-white/10 transition-all focus:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-zinc-600"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {/* Sort Filter */}
        <FilterDropdown 
          label="Sort By" 
          options={["Latest", "Oldest", "Rating", "Year"]} 
          value={currentFilters.sort ? (currentFilters.sort.charAt(0).toUpperCase() + currentFilters.sort.slice(1)) : "Latest"}
          onChange={(val) => handleFilterChange("sort", val.toLowerCase())}
        />

        {/* Category Filter */}
        {!hideCategoryFilter && (
          <FilterDropdown 
            label="Genre" 
            options={categories} 
            value={currentFilters.category || "All"} 
            onChange={(val) => handleFilterChange("category", val)} 
          />
        )}

        {/* Year Filter */}
        <FilterDropdown 
          label="Year" 
          options={years} 
          value={currentFilters.year || "All"} 
          onChange={(val) => handleFilterChange("year", val)} 
        />

        {/* Language Filter */}
        {!hideLanguageFilter && (
          <FilterDropdown 
            label="Language" 
            options={languages} 
            value={currentFilters.language || "All"} 
            onChange={(val) => handleFilterChange("language", val)} 
          />
        )}
      </div>
    </div>
  );
}

function FilterDropdown({ label, options, value, onChange }) {
  return (
    <div className="group relative">
      <div className="flex flex-col gap-1.5">
        <span className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-500">{label}</span>
        <div className="relative">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="appearance-none rounded-xl bg-zinc-900 px-5 py-3 pr-10 text-sm font-bold text-white ring-1 ring-white/10 transition-all focus:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer min-w-[120px]"
          >
            {options.map((opt) => (
              <option key={opt} value={opt} className="bg-zinc-900 py-2">
                {opt}
              </option>
            ))}
          </select>
          <ChevronDown 
            size={16} 
            className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 transition-transform group-hover:text-white" 
          />
        </div>
      </div>
    </div>
  );
}
