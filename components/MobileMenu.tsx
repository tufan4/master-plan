"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, BookOpen } from "lucide-react";
import { useState } from "react";

interface MobileMenuProps {
    categories: any[];
    activeCategory: string;
    setActiveCategory: (id: string) => void;
    setShowDictionary: (show: boolean) => void;
    showDictionary: boolean;
    dictionaryCount: number;
}

export default function MobileMenu({
    categories,
    activeCategory,
    setActiveCategory,
    setShowDictionary,
    showDictionary,
    dictionaryCount
}: MobileMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleCategoryClick = (id: string) => {
        setActiveCategory(id);
        setShowDictionary(false);
        setIsOpen(false);
    };

    const handleDictionaryClick = () => {
        setShowDictionary(true);
        setActiveCategory('');
        setIsOpen(false);
    };

    return (
        <>
            {/* Hamburger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-50 p-3 bg-slate-800 rounded-xl shadow-lg border border-slate-700 hover:bg-slate-700 transition-all lg:hidden"
            >
                {isOpen ? <X size={24} className="text-amber-400" /> : <Menu size={24} className="text-amber-400" />}
            </button>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
                        />

                        {/* Menu Panel */}
                        <motion.div
                            initial={{ x: -300 }}
                            animate={{ x: 0 }}
                            exit={{ x: -300 }}
                            transition={{ type: "spring", damping: 25 }}
                            className="fixed left-0 top-0 bottom-0 w-72 bg-slate-800 shadow-2xl z-40 overflow-y-auto lg:hidden"
                        >
                            <div className="p-6 space-y-4">
                                <h2 className="text-2xl font-black text-amber-400 mb-6 mt-12">
                                    MASTER TUFAN
                                </h2>

                                {/* Categories */}
                                {categories.map((cat: any) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => handleCategoryClick(cat.id)}
                                        className={`w-full text-left px-4 py-3 rounded-xl transition-all ${activeCategory === cat.id && !showDictionary
                                                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                                                : 'bg-slate-700/30 hover:bg-slate-700/50 text-slate-300'
                                            }`}
                                    >
                                        <span className="text-sm font-medium">{cat.title}</span>
                                    </button>
                                ))}

                                {/* Dictionary */}
                                <button
                                    onClick={handleDictionaryClick}
                                    className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${showDictionary
                                            ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg'
                                            : 'bg-slate-700/30 hover:bg-slate-700/50 text-slate-300'
                                        }`}
                                >
                                    <BookOpen size={18} />
                                    <span className="text-sm font-medium">Sözlük ({dictionaryCount})</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
