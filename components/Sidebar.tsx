"use client";

import { motion } from "framer-motion";

export const Sidebar = ({
    categories,
    activeCategory,
    onSelectCategory,
}: {
    categories: any[];
    activeCategory: string;
    onSelectCategory: (id: string) => void;
}) => {
    return (
        <aside className="w-64 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700/50 h-screen sticky top-0 flex flex-col p-4 shadow-lg z-10">
            <div className="mb-8 pl-2">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                    Learning SaaS
                </h1>
                <p className="text-xs text-slate-500 font-medium tracking-wider mt-1">
                    ADVANCED CURRICULUM
                </p>
            </div>

            <nav className="space-y-2 flex-1 overflow-y-auto pr-2">
                {categories.map((cat) => (
                    <motion.button
                        key={cat.id}
                        onClick={() => onSelectCategory(cat.id)}
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 font-medium flex items-center justify-between group ${activeCategory === cat.id
                            ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                            : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                            }`}
                    >
                        <span>{cat.title}</span>
                        {activeCategory === cat.id && (
                            <motion.div
                                layoutId="active-indicator"
                                className="w-1.5 h-1.5 rounded-full bg-white"
                            />
                        )}
                    </motion.button>
                ))}

                <div className="my-2 border-t border-slate-100 dark:border-slate-800 mx-4" />

                <motion.button
                    onClick={() => onSelectCategory("dictionary")}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 font-medium flex items-center justify-between group ${activeCategory === "dictionary"
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                        : "text-slate-600 hover:bg-slate-50 hover:text-emerald-600"
                        }`}
                >
                    <span>Sözlük</span>
                    {activeCategory === "dictionary" && (
                        <motion.div
                            layoutId="active-indicator"
                            className="w-1.5 h-1.5 rounded-full bg-white"
                        />
                    )}
                </motion.button>
            </nav>

            <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                        EO
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-800">Emre O.</p>
                        <p className="text-xs text-slate-500">Pro Student</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};
