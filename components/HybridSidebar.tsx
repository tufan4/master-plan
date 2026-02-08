
"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    Menu, X, ChevronRight, Info, Plus, Trash2, Sparkles, Wand2
} from "lucide-react";
import { useState, useEffect } from "react";

interface HybridSidebarProps {
    categories: any[];
    activeCategory: string;
    setActiveCategory: (id: string) => void;
    openAbout: () => void;
    setShowNewCurriculumModal: (show: boolean) => void;
    deleteCategory: (id: string) => void;
    ghostTopics: Record<string, string[]>;
    onGenerateGhost: (catId: string, title: string) => void;
    onCreateGhost: (topic: string) => void;
    loadingGhost: Record<string, boolean>;
}

export default function HybridSidebar({
    categories,
    activeCategory,
    setActiveCategory,
    openAbout,
    setShowNewCurriculumModal,
    deleteCategory,
    ghostTopics,
    onGenerateGhost,
    onCreateGhost,
    loadingGhost
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
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden"
                        onClick={() => setIsExpanded(false)}
                    />
                )}
            </AnimatePresence>

            {/* SIDEBAR CONTAINER */}
            <motion.aside
                id="hybrid-sidebar"
                initial={false}
                animate={{ width: isExpanded ? 280 : 60, x: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 35 }}
                className="fixed top-0 left-0 h-full bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 z-50 flex flex-col lg:hidden overflow-hidden shadow-[10px_0_30px_rgba(0,0,0,0.5)]"
            >
                {/* HEADER / TOGGLE (STRICT CONTROL) */}
                <div
                    className="h-20 flex items-center justify-between px-0 shrink-0 cursor-pointer border-b border-slate-800/50"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="w-[60px] flex justify-center">
                        <motion.div
                            animate={{ rotate: isExpanded ? 90 : 0 }}
                            className="p-2 rounded-xl bg-slate-800/50"
                        >
                            {isExpanded ? <X className="text-amber-400" /> : <Menu className="text-amber-400" />}
                        </motion.div>
                    </div>

                    <motion.div
                        className="flex-1 overflow-hidden whitespace-nowrap"
                        animate={{ opacity: isExpanded ? 1 : 0 }}
                    >
                        <span className="font-black text-amber-500 tracking-[0.2em] text-xs">MASTER TUFAN</span>
                    </motion.div>
                </div>

                {/* CONTENT AREA */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* New Add Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowNewCurriculumModal(true);
                            setIsExpanded(false);
                        }}
                        className="w-full flex items-center h-14 hover:bg-blue-600/10 transition-all text-blue-400 group border-b border-white/5"
                    >
                        <div className="w-[60px] flex justify-center shrink-0">
                            <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                        </div>
                        <motion.span
                            className="whitespace-nowrap text-sm font-bold tracking-tight"
                            animate={{ opacity: isExpanded ? 1 : 0, x: isExpanded ? 0 : -10 }}
                        >
                            YENİ MÜFREDAT EKLE
                        </motion.span>
                    </button>

                    {/* Categories */}
                    <div className="space-y-1 mt-4">
                        {categories.map((cat: any) => {
                            const isActive = activeCategory === cat.id;
                            const hasGhost = ghostTopics[cat.id] && ghostTopics[cat.id].length > 0;

                            return (
                                <div key={cat.id} className="relative group">
                                    <div className="flex flex-col">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Only allow category switch if expanded OR if already visible
                                                if (isExpanded) handleCategoryClick(cat.id);
                                                else setIsExpanded(true);
                                            }}
                                            className={`w-full flex items-center h-14 transition-all relative
                                            ${isActive ? 'bg-blue-600/20' : 'hover:bg-slate-800/50'}
                                        `}
                                        >
                                            {/* Icon / First Letter */}
                                            <div className="w-[60px] flex justify-center shrink-0">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black border transition-all ${isActive ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                                                    {cat.title ? cat.title.substring(0, 2).toUpperCase() : '??'}
                                                </div>
                                            </div>

                                            {/* Label */}
                                            <motion.span
                                                className={`whitespace-nowrap text-sm flex-1 text-left ${isActive ? 'text-blue-300 font-bold' : 'text-slate-400'}`}
                                                animate={{ opacity: isExpanded ? 1 : 0, x: isExpanded ? 0 : -10 }}
                                            >
                                                {cat.title}
                                            </motion.span>
                                        </button>

                                        {/* EXPANDED ACTIONS (Mobile) */}
                                        <AnimatePresence>
                                            {isExpanded && cat.isCustom && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="bg-slate-900/50 border-b border-slate-800/50"
                                                >
                                                    <div className="flex items-center gap-2 pl-[60px] pr-4 py-2">
                                                        {/* DELETE */}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (confirm(`'${cat.title}' müfredatını silmek istediğine emin misin?`)) {
                                                                    deleteCategory(cat.id);
                                                                }
                                                            }}
                                                            className="p-2 bg-red-900/20 text-red-500 hover:bg-red-600 hover:text-white rounded-lg transition-all"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>

                                                        {/* BENZER EKLE */}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onGenerateGhost(cat.id, cat.title);
                                                            }}
                                                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-purple-900/20 text-purple-400 hover:bg-purple-600 hover:text-white rounded-lg transition-all text-xs font-bold"
                                                        >
                                                            {loadingGhost[cat.id] ? (
                                                                <div className="w-3 h-3 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                                                            ) : (
                                                                <Wand2 size={14} />
                                                            )}
                                                            {loadingGhost[cat.id] ? 'Üretiliyor...' : 'Benzer Ekle'}
                                                        </button>
                                                    </div>

                                                    {/* GHOST TOPICS LIST */}
                                                    {hasGhost && (
                                                        <div className="pl-[60px] pr-4 pb-3 space-y-1">
                                                            {ghostTopics[cat.id].map((topic, idx) => (
                                                                <button
                                                                    key={idx}
                                                                    onClick={() => {
                                                                        onCreateGhost(topic);
                                                                        setIsExpanded(false);
                                                                    }}
                                                                    className="w-full text-left text-[10px] text-slate-500 hover:text-blue-400 py-1 px-2 border-l border-slate-700 hover:border-blue-500 flex items-center gap-2 transition-colors"
                                                                >
                                                                    <Plus size={10} />
                                                                    {topic}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Active Indicator */}
                                        {isActive && (
                                            <div className="absolute left-0 top-0 h-14 w-1 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
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
            </motion.aside >
        </>
    );
}
