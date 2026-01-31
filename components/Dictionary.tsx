"use client";
import { useState } from "react";
import { Search, Book } from "lucide-react";

interface DictionaryItem {
    term: string;
    definition: string;
}

export const Dictionary = ({ dictionary }: { dictionary: DictionaryItem[] }) => {
    const [search, setSearch] = useState("");

    const filtered = dictionary
        .filter(d => d.term.toLowerCase().includes(search.toLowerCase()) || d.definition.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => a.term.localeCompare(b.term));

    const grouped = filtered.reduce((acc, curr) => {
        const letter = curr.term[0].toUpperCase();
        if (!acc[letter]) acc[letter] = [];
        acc[letter].push(curr);
        return acc;
    }, {} as Record<string, DictionaryItem[]>);

    return (
        <div className="w-full">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-100 tracking-tight">Mesleki Sözlük</h2>
                    <p className="text-slate-400 mt-2">Teknik terim veritabanı.</p>
                </div>
                <Book className="text-slate-700" size={48} />
            </header>

            <div className="relative mb-10">
                <input
                    type="text"
                    placeholder="Terim veya tanım ara..."
                    className="w-full px-5 py-4 pl-12 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-100 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            </div>

            <div className="grid gap-8">
                {Object.keys(grouped).map(letter => (
                    <div key={letter} className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-700/50">
                        <div className="flex items-center gap-4 mb-6 border-b border-slate-700/50 pb-2">
                            <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-300 font-bold">
                                {letter}
                            </div>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2">
                            {grouped[letter].map((item, i) => (
                                <div key={i} className="group p-4 rounded-xl hover:bg-slate-700/30 transition-colors border border-transparent hover:border-slate-600">
                                    <dt className="text-lg font-bold text-slate-200 group-hover:text-blue-400 transition-colors mb-2">
                                        {item.term}
                                    </dt>
                                    <dd className="text-slate-400 text-sm leading-relaxed">
                                        {item.definition}
                                    </dd>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-20 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700">
                    <Search className="mx-auto h-12 w-12 text-slate-600 mb-4" />
                    <p className="text-slate-400 font-medium">Sonuç bulunamadı.</p>
                    <p className="text-slate-500 text-sm mt-1">Farklı bir terim deneyin.</p>
                </div>
            )}
        </div>
    );
};
