
"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    Menu, X, BookOpen, ChevronRight, Info, Instagram, Linkedin,
    Settings, Search, Home
} from "lucide-react";
import { useState, useEffect } from "react";

interface HybridSidebarProps {
    categories: any[];
    activeCategory: string;
    setActiveCategory: (id: string) => void;
    setShowDictionary: (show: boolean) => void;
    showDictionary: boolean;
    dictionaryCount: number;
    openAbout: () => void;
}

export default function HybridSidebar({
    categories,
    activeCategory,
    setActiveCategory,
    setShowDictionary,
    showDictionary,
    dictionaryCount,
    openAbout
}: HybridSidebarProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Close sidebar when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const sidebar = document.getElementById('hybrid-sidebar');
            if (sidebar && !sidebar.contains(e.target as Node) && isExpanded) {
                setIsExpanded(false);
            }
        };

        if (isExpanded) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isExpanded]);

    const handleCategoryClick = (id: string) => {
        setActiveCategory(id);
        setShowDictionary(false);
        setIsExpanded(false);
    };

    return (
        <>
            {/* BACKDROP for Expanded State */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setIsExpanded(false)}
                    />
                )}
            </AnimatePresence>

            {/* SIDEBAR CONTAINER */}
            <motion.aside
                id="hybrid-sidebar"
                initial={false}
                animate={{ width: isExpanded ? 280 : 60 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed top-0 left-0 h-full bg-slate-900 border-r border-slate-800 z-50 flex flex-col lg:hidden overflow-hidden shadow-2xl"
            // On swipe right logic could be added here with pan handlers if needed, 
            // but for now relying on tap to expand
            >
                {/* HEADER / TOGGLE */}
                <div
                    className="h-16 flex items-center justify-between px-0 shrink-0 cursor-pointer border-b border-slate-800"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="w-[60px] flex justify-center">
                        {isExpanded ? <X className="text-amber-400" /> : <Menu className="text-amber-400" />}
                    </div>

                    <motion.div
                        className="flex-1 overflow-hidden whitespace-nowrap"
                        animate={{ opacity: isExpanded ? 1 : 0 }}
                    >
                        <span className="font-bold text-amber-500 tracking-wider">MASTER TUFAN</span>
                    </motion.div>
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
                    {/* Categories */}
                    <div className="space-y-1">
                        {categories.map((cat: any) => {
                            const isActive = activeCategory === cat.id && !showDictionary;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!isExpanded) setIsExpanded(true);
                                        else handleCategoryClick(cat.id);
                                    }}
                                    className={`w-full flex items-center h-12 transition-all relative group
                                        ${isActive ? 'bg-blue-600/20' : 'hover:bg-slate-800'}
                                    `}
                                >
                                    {/* Icon / First Letter */}
                                    <div className="w-[60px] flex justify-center shrink-0">
                                        <span className={`text-sm font-black ${isActive ? 'text-blue-400' : 'text-slate-500'}`}>
                                            {cat.id.substring(0, 2)}
                                        </span>
                                    </div>

                                    {/* Label */}
                                    <motion.span
                                        className={`whitespace-nowrap text-sm ${isActive ? 'text-blue-300 font-bold' : 'text-slate-400'}`}
                                        animate={{ opacity: isExpanded ? 1 : 0, x: isExpanded ? 0 : -10 }}
                                    >
                                        {cat.title}
                                    </motion.span>

                                    {/* Active Indicator Strip */}
                                    {isActive && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="my-4 border-t border-slate-800 mx-2" />

                    {/* Dictionary */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!isExpanded) setIsExpanded(true);
                            else {
                                setShowDictionary(true);
                                setActiveCategory('');
                                setIsExpanded(false);
                            }
                        }}
                        className={`w-full flex items-center h-12 transition-all relative
                            ${showDictionary ? 'bg-purple-600/20' : 'hover:bg-slate-800'}
                        `}
                    >
                        <div className="w-[60px] flex justify-center shrink-0">
                            <BookOpen size={20} className={showDictionary ? 'text-purple-400' : 'text-slate-500'} />
                        </div>
                        <motion.span
                            className={`whitespace-nowrap text-sm ${showDictionary ? 'text-purple-300 font-bold' : 'text-slate-400'}`}
                            animate={{ opacity: isExpanded ? 1 : 0, x: isExpanded ? 0 : -10 }}
                        >
                            Sözlük
                        </motion.span>
                    </button>

                </div>

                {/* BOTTOM ACTIONS */}
                <div className="border-t border-slate-800 bg-slate-900 z-10">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            openAbout(); // Trigger About Modal
                        }}
                        className="w-full flex items-center h-14 hover:bg-slate-800 transition-all text-amber-500"
                    >
                        <div className="w-[60px] flex justify-center shrink-0">
                            <Info size={22} />
                        </div>
                        <motion.span
                            className="whitespace-nowrap text-sm font-medium"
                            animate={{ opacity: isExpanded ? 1 : 0, x: isExpanded ? 0 : -10 }}
                        >
                            Sistem Hakkında
                        </motion.span>
                    </button>
                </div>
            </motion.aside>
        </>
    );
}
