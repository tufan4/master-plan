"use client";
import { Search } from "lucide-react";
import { useState } from "react";

interface GlobalSearchProps {
    onSearch: (query: string) => void;
}

export const GlobalSearch = ({ onSearch }: GlobalSearchProps) => {
    const [query, setQuery] = useState("");

    const handleSearch = (value: string) => {
        setQuery(value);
        onSearch(value);
    };

    return (
        <div className="relative w-full max-w-2xl">
            <input
                type="text"
                placeholder="Tüm konular, başlıklar ve terimleri ara..."
                className="w-full px-5 py-3 pl-12 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all backdrop-blur-sm"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />

            {query && (
                <button
                    onClick={() => handleSearch("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-sm font-medium"
                >
                    Temizle
                </button>
            )}
        </div>
    );
};
