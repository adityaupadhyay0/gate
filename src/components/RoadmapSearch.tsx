"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";

export default function RoadmapSearch() {
  const { replace } = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    startTransition(() => {
      replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="relative group">
      <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isPending ? 'text-brand-500 animate-pulse' : 'text-slate-400 group-focus-within:text-brand-500'}`} />
      <input
        type="text"
        placeholder="Search topic or concept..."
        defaultValue={searchParams.get("q")?.toString()}
        onChange={(e) => handleSearch(e.target.value)}
        className="bg-white border-2 border-slate-100 rounded-2xl pl-12 pr-6 py-3 text-sm font-bold focus:outline-none focus:border-brand-500 transition-all w-full md:w-64 shadow-sm"
      />
    </div>
  );
}
