"use client";

import dynamic from 'next/dynamic';

const TypewriterSlogan = dynamic(() => import("@/components/TypewriterSlogan"), { ssr: false });
const HybridSidebar = dynamic(() => import("@/components/HybridSidebar"), { ssr: false });
const TutorialOverlay = dynamic(() => import("@/components/TutorialOverlay"), { ssr: false });
const AboutModal = dynamic(() => import("@/components/AboutModal"), { ssr: false });

import {
    syncCompletedTopics, fetchCompletedTopics, cacheImage, getCachedImages
} from "@/lib/supabaseClient";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, ChevronDown, ChevronRight, CheckCircle2, Circle,
    Youtube, FileText, Book, X, Image as ImageIcon,
    Globe, MessageCircle, Sparkles, BookOpen, Info,
    Github, Lightbulb, HelpCircle, Layout, Settings, Plus, Wand2, Trash2, Menu
} from "lucide-react";
import { generateFullCurriculum, generateRelatedTopics } from "@/lib/geminiClient";

// ==================== PLATFORMS ====================
const PLATFORMS = [
    { id: "youtube", name: "YouTube", icon: Youtube, color: "red" },
    { id: "google", name: "PDF/Search", icon: FileText, color: "green" },
    { id: "reddit", name: "Reddit", icon: MessageCircle, color: "orange" },
    { id: "wikipedia", name: "Wiki", icon: Book, color: "gray" },
    { id: "github", name: "GitHub", icon: Github, color: "slate" },
    { id: "arxiv", name: "ArXiv", icon: FileText, color: "red" },
    { id: "ieee", name: "IEEE", icon: Globe, color: "blue" },
    { id: "semantic", name: "Semantic", icon: BookOpen, color: "cyan" },
    { id: "researchgate", name: "R.Gate", icon: Globe, color: "emerald" },
    { id: "sciencedirect", name: "SciDirect", icon: Book, color: "orange" },
    { id: "stackoverflow", name: "StackOver", icon: Layout, color: "orange" },
    { id: "mdn", name: "MDN Docs", icon: FileText, color: "black" },
    { id: "devto", name: "Dev.to", icon: Layout, color: "black" },
    { id: "leetcode", name: "LeetCode", icon: Settings, color: "yellow" },
    { id: "udemy", name: "Udemy", icon: Lightbulb, color: "purple" },
    { id: "coursera", name: "Coursera", icon: Globe, color: "blue" },
    { id: "mitocw", name: "MIT OCW", icon: BookOpen, color: "slate" },
    { id: "khan", name: "Khan Acad", icon: Sparkles, color: "green" },
    { id: "wolfram", name: "Wolfram", icon: Sparkles, color: "red" },
    { id: "desmos", name: "Desmos", icon: Layout, color: "green" },
    { id: "geogebra", name: "GeoGebra", icon: Circle, color: "blue" },
    { id: "arduino", name: "Arduino", icon: Settings, color: "cyan" },
    { id: "hackster", name: "Hackster", icon: Layout, color: "pink" },
    { id: "instructables", name: "Instruct", icon: Lightbulb, color: "yellow" },
    { id: "pinterest", name: "Pinterest", icon: Layout, color: "red" }
];

export default function MasterTufanOS() {
    const [allCategories, setAllCategories] = useState<any[]>([]);
    const [activeCategory, setActiveCategory] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiPrompt, setAiPrompt] = useState("");
    const [topicCount, setTopicCount] = useState(100);

    const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [activeControlPanel, setActiveControlPanel] = useState<string | null>(null);
    const [activePlatformPanel, setActivePlatformPanel] = useState<{ topicId: string; platform: string } | null>(null);
    const [showNewCurriculumModal, setShowNewCurriculumModal] = useState(false);
    const [showAboutModal, setShowAboutModal] = useState(false);
    const [runTutorial, setRunTutorial] = useState(false);

    const [galleryImages, setGalleryImages] = useState<string[]>([]);
    const [loadingImages, setLoadingImages] = useState(false);
    const [showImageGallery, setShowImageGallery] = useState<string | null>(null);
    const [visibleCount, setVisibleCount] = useState<Record<string, number>>({});

    const [ghostTopics, setGhostTopics] = useState<Record<string, string[]>>({});
    const [loadingGhost, setLoadingGhost] = useState<Record<string, boolean>>({});
    const [sidebarExpanded, setSidebarExpanded] = useState(false);

    // LOAD SAVED STATE & STATIC DATA
    useEffect(() => {
        // Only load custom curriculums from localStorage
        let customList = [];
        const savedCustom = localStorage.getItem("customCurriculums");
        if (savedCustom) {
            try { customList = JSON.parse(savedCustom); } catch (e) { console.error("Custom load failed", e); }
        }

        setAllCategories(customList);

        // Auto-select first category if nothing selected
        if (customList.length > 0 && !activeCategory) {
            setActiveCategory(customList[0].id);
        }

        // Other loads
        const savedGhosts = localStorage.getItem("ghostTopics");
        if (savedGhosts) { try { setGhostTopics(JSON.parse(savedGhosts)); } catch (e) { } }

        const savedCompleted = localStorage.getItem("completedTopics");
        if (savedCompleted) { try { setCompletedItems(new Set(JSON.parse(savedCompleted))); } catch (e) { } }
    }, []);



    const normalizeTopic = (text: string): string => {
        const acronyms = ["plc", "kpss", "hmi", "scada", "api", "rest", "sql", "html", "css", "js", "vfd", "pid", "cad", "cam", "cnc", "iot", "ai", "ml", "nlp", "aws", "os", "ram", "cpu", "io", "usb", "tcp", "ip", "udp", "http", "https", "ssl", "tls", "git", "npm", "json", "xml", "pdf", "tyt", "ayt", "dgs", "ales", "yds", "yökdil", "lgs"];
        return text.split(' ').map(word => {
            const lower = word.toLowerCase().replace(/[.,!?;:]/g, '');
            if (acronyms.includes(lower)) return word.toUpperCase();
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join(' ');
    };

    const createCurriculum = async (topic: string, count: number = 50) => {
        if (!topic.trim()) return;
        const normalized = normalizeTopic(topic);
        setIsGenerating(true);
        try {
            const result = await generateFullCurriculum(normalized, count);
            if (result && result.topics && result.topics.length > 0) {
                const mainContainer = {
                    id: `custom-${Date.now()}`,
                    title: result.title || normalized,
                    isCustom: true,
                    topics: result.topics
                };

                const updatedList = [...allCategories, mainContainer];
                setAllCategories(updatedList);

                // Save ONLY custom ones to localStorage
                const customOnly = updatedList.filter(c => c.isCustom);
                localStorage.setItem("customCurriculums", JSON.stringify(customOnly));

                setActiveCategory(mainContainer.id);
                setAiPrompt("");
                setShowNewCurriculumModal(false);
                setVisibleCount(prev => ({ ...prev, [mainContainer.id]: 30 }));
            } else {
                alert("AI müfredat üretemedi.");
            }
        } catch (error) {
            console.error(error);
            alert("Hata oluştu.");
        } finally {
            setIsGenerating(false);
        }
    };

    const deleteCurriculum = (id: string) => {
        const cat = allCategories.find(c => c.id === id);
        if (!cat) return;
        if (!cat.isCustom) {
            alert("Varsayılan müfredatlar silinemez.");
            return;
        }
        if (!confirm("Bu müfredatı silmek istediğinize emin misiniz?")) return;

        const newList = allCategories.filter(c => c.id !== id);
        setAllCategories(newList);

        const customOnly = newList.filter(c => c.isCustom);
        localStorage.setItem("customCurriculums", JSON.stringify(customOnly));

        if (activeCategory === id) setActiveCategory(newList.length > 0 ? newList[0].id : "");
    };

    const handleDeepDive = (platformId: string, item: any, lang: 'tr' | 'en') => {
        const isEn = lang === 'en';

        // 1. Get Base Query: Priority q_en/q_tr (AI) > en/title (Static)
        let qBase = "";
        if (isEn) {
            qBase = item.q_en || item.en || item.title;
        } else {
            qBase = item.q_tr || item.title;
        }

        let finalQuery = qBase;

        const encoded = encodeURIComponent(finalQuery);
        const searchUrlMap: Record<string, string> = {
            'youtube': `https://www.youtube.com/results?search_query=${encoded}`,
            'google': `https://www.google.com/search?q=${encoded}`,
            'wikipedia': `https://${lang}.wikipedia.org/wiki/Special:Search?search=${encoded}`,
            'reddit': `https://www.reddit.com/search/?q=${encoded}`,
            'github': `https://github.com/search?q=${encoded}`,
            'stackoverflow': `https://stackoverflow.com/search?q=${encoded}`,
            'udemy': `https://www.udemy.com/courses/search/?q=${encoded}`,
            'coursera': `https://www.coursera.org/courses?query=${encoded}`,
            'mdn': `https://developer.mozilla.org/en-US/search?q=${encoded}`,
            'arxiv': `https://arxiv.org/search/?query=${encoded}&searchtype=all`,
        };

        const url = searchUrlMap[platformId] || `https://www.google.com/search?q=${encoded}`;
        window.open(url, '_blank');
    };

    const loadImagesFromAPI = async (topic: string, topicId: string, count: number) => {
        setLoadingImages(true);
        const cached = getCachedImages(topicId);
        if (cached && cached.length >= count) { setGalleryImages(cached.slice(0, count)); setLoadingImages(false); return; }
        try {
            const key = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
            if (!key) throw new Error("Key missing");
            const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(topic + ' engineering technical')}&per_page=${count}&client_id=${key}`);
            const data = await res.json();
            const imgs = data.results.map((img: any) => img.urls.regular);
            cacheImage(topicId, imgs);
            setGalleryImages(imgs);
        } catch (e) {
            setGalleryImages(Array.from({ length: 10 }, (_, i) => `https://via.placeholder.com/400x300/1e293b/94a3b8?text=${encodeURIComponent(topic)}+${i + 1}`));
        } finally { setLoadingImages(false); }
    };

    const toggleComplete = (id: string) => {
        const newSet = new Set(completedItems);
        newSet.has(id) ? newSet.delete(id) : newSet.add(id);
        setCompletedItems(newSet);
        localStorage.setItem("completedTopics", JSON.stringify([...newSet]));
    };

    const toggleExpand = (id: string) => {
        const newSet = new Set(expandedItems);
        newSet.has(id) ? newSet.delete(id) : newSet.add(id);
        setExpandedItems(newSet);
    };

    const renderRecursive = (item: any, depth: number = 0) => {
        const isExpanded = expandedItems.has(item.id);
        const isCompleted = completedItems.has(item.id);
        const hasChildren = item.subtopics && item.subtopics.length > 0;
        const showPanel = activeControlPanel === item.id;

        return (
            <div key={item.id} style={{ marginLeft: `${depth * 16}px` }} className="mb-1">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`flex items-center gap-2 p-3 rounded-2xl cursor-pointer transition-all ${isCompleted ? 'bg-emerald-900/20 border-l-4 border-emerald-500' : 'bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50'}`}
                    onClick={() => setActiveControlPanel(showPanel ? null : item.id)}
                >
                    {hasChildren && <button onClick={(e) => { e.stopPropagation(); toggleExpand(item.id); }}>{isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</button>}
                    <button onClick={(e) => { e.stopPropagation(); toggleComplete(item.id); }} className={isCompleted ? "text-emerald-400" : "text-slate-500"}>{isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}</button>
                    <span className={`text-sm font-medium flex-1 ${isCompleted ? 'text-emerald-300 line-through opacity-50' : 'text-slate-100'}`}>{item.title}</span>
                </motion.div>

                <AnimatePresence>
                    {showPanel && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="ml-6 mt-2 bg-slate-900/60 p-5 rounded-[24px] overflow-hidden border border-slate-700/50 backdrop-blur-sm">
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                                {PLATFORMS.map(plat => {
                                    const Icon = plat.icon;
                                    const isActive = activePlatformPanel?.topicId === item.id && activePlatformPanel?.platform === plat.id;
                                    return (
                                        <button
                                            key={plat.id}
                                            onClick={(e) => { e.stopPropagation(); setActivePlatformPanel({ topicId: item.id, platform: plat.id }); }}
                                            className={`group relative p-4 flex flex-col items-center justify-center rounded-[24px] border-2 transition-all duration-300 ${isActive ? 'bg-blue-600 border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.5)] scale-105' : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-500 hover:bg-slate-800'}`}
                                        >
                                            <Icon size={24} className={isActive ? 'text-white' : `text-slate-400 group-hover:text-white transition-colors`} />
                                            <span className={`text-[10px] mt-2 font-black uppercase tracking-widest ${isActive ? 'text-blue-100' : 'text-slate-500 group-hover:text-slate-300'}`}>{plat.name}</span>
                                            {isActive && <motion.div layoutId="plat-active" className="absolute -inset-1 rounded-[24px] border-2 border-blue-400 animate-pulse" />}
                                        </button>
                                    );
                                })}
                                <button onClick={(e) => { e.stopPropagation(); setShowImageGallery(item.id); loadImagesFromAPI(item.title, item.id, 10); }} className="p-4 flex flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-purple-500/30 bg-purple-900/10 hover:bg-purple-900/30 hover:border-purple-500/50 transition-all group">
                                    <ImageIcon size={24} className="text-purple-400 group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] mt-2 font-black uppercase tracking-widest text-slate-500 group-hover:text-purple-300">IMAGES</span>
                                </button>
                            </div>

                            {activePlatformPanel?.topicId === item.id && (
                                <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mt-5 p-4 bg-slate-950/80 rounded-[20px] border border-blue-500/30 flex flex-col gap-3">
                                    <div className="flex justify-between items-center mb-1 px-1">
                                        <div className="flex items-center gap-2">
                                            <Sparkles size={14} className="text-blue-400" />
                                            <span className="text-[10px] font-black text-blue-400 tracking-[0.2em] uppercase">Deep Dive Engine</span>
                                        </div>
                                        <button onClick={() => setActivePlatformPanel(null)} className="text-slate-600 hover:text-white"><X size={16} /></button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <button
                                            onClick={() => handleDeepDive(activePlatformPanel!.platform, item, 'tr')}
                                            className="group relative overflow-hidden py-6 bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 rounded-2xl text-white shadow-xl shadow-blue-900/40 transition-all flex items-center justify-center gap-4 border border-blue-400/30 active:scale-95"
                                        >
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_white_0%,_transparent_10%)] opacity-0 group-hover:opacity-10 transition-opacity" />
                                            <span className="text-2xl">🇹🇷</span>
                                            <div className="flex flex-col items-start">
                                                <span className="text-sm font-black tracking-[0.1em] uppercase">TÜRKÇE ARA</span>
                                                <span className="text-[9px] font-bold text-blue-200/60 uppercase">Yerel Video & Makale</span>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => handleDeepDive(activePlatformPanel!.platform, item, 'en')}
                                            className="group relative overflow-hidden py-6 bg-gradient-to-br from-slate-800 to-slate-950 hover:from-slate-700 hover:to-slate-900 rounded-2xl text-white shadow-xl shadow-black/40 transition-all flex items-center justify-center gap-4 border border-slate-700 active:scale-95"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <span className="text-2xl">🌍</span>
                                            <div className="flex flex-col items-start">
                                                <span className="text-sm font-black tracking-[0.1em] uppercase">GLOBAL SEARCH</span>
                                                <span className="text-[9px] font-bold text-slate-500 uppercase">World-class Resources</span>
                                            </div>
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {showImageGallery === item.id && (
                                <div className="mt-5">
                                    <div className="flex justify-between items-center mb-3 px-2">
                                        <span className="text-[10px] font-black text-purple-400 tracking-[0.2em] uppercase">Görsel Kaynaklar</span>
                                        <button onClick={() => setShowImageGallery(null)} className="text-slate-600 hover:text-white"><X size={16} /></button>
                                    </div>
                                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">{galleryImages.map((src, i) => <img key={i} src={src} className="w-full h-28 object-cover rounded-xl cursor-pointer hover:ring-4 ring-purple-500/40 transition-all shadow-lg" onClick={() => window.open(src)} />)}</div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {hasChildren && isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            {item.subtopics.map((child: any) => renderRecursive(child, depth + 1))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    const activeData = useMemo(() => allCategories.find((c: any) => c.id === activeCategory), [allCategories, activeCategory]);

    const activeStats = useMemo(() => {
        let total = 0;
        let completed = 0;
        const traverse = (items: any[]) => {
            items.forEach(item => {
                total++;
                if (completedItems.has(item.id)) completed++;
                if (item.subtopics) traverse(item.subtopics);
            });
        };
        if (activeData?.topics) traverse(activeData.topics);
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { total, completed, percent };
    }, [activeData, completedItems]);

    const hasCurriculum = allCategories.length > 0;

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
            <TutorialOverlay forceRun={runTutorial} onComplete={() => setRunTutorial(false)} />
            <AboutModal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} />

            {showNewCurriculumModal && (
                <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 border border-slate-700 rounded-[40px] p-10 max-w-xl w-full shadow-2xl relative border-t-blue-500/50">
                        <button onClick={() => setShowNewCurriculumModal(false)} className="absolute right-8 top-8 text-slate-500 hover:text-white transition-colors"><X size={28} /></button>
                        <h3 className="text-3xl font-black text-white mb-10 tracking-tight uppercase flex items-center gap-4">
                            <Plus className="text-blue-400" size={32} /> YOL HARİTASI ÜRET
                        </h3>
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Öğrenme Hedefi</label>
                                <input type="text" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="Örn: Docker & Kubernetes, Modern Fizik..." className="w-full bg-slate-800/80 rounded-2xl p-6 text-xl font-bold text-white border border-slate-700 focus:border-blue-500 transition-all outline-none shadow-inner" />
                            </div>
                            <div className="bg-slate-800/40 p-8 rounded-3xl border border-slate-700/50">
                                <div className="flex justify-between items-end mb-4">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Kapsam Derinliği</label>
                                    <span className="text-blue-400 font-black text-xl">{topicCount} <span className="text-[10px] text-slate-500">BAŞLIK</span></span>
                                </div>
                                <input type="range" min="50" max="300" step="50" value={topicCount} onChange={(e) => setTopicCount(Number(e.target.value))} className="w-full h-3 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500" />
                            </div>
                            <button onClick={() => createCurriculum(aiPrompt, topicCount)} disabled={!aiPrompt.trim() || isGenerating} className="w-full py-6 bg-blue-600 hover:bg-blue-500 rounded-2xl text-white font-black text-lg transition-all shadow-xl shadow-blue-600/30 uppercase tracking-[0.1em]">
                                {isGenerating ? 'ANALİZ EDİLİYOR...' : 'SİSTEME EKLE'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            <HybridSidebar
                categories={allCategories} activeCategory={activeCategory} setActiveCategory={setActiveCategory}
                openAbout={() => setShowAboutModal(true)} setShowNewCurriculumModal={setShowNewCurriculumModal} deleteCategory={deleteCurriculum}
                ghostTopics={ghostTopics} onGenerateGhost={(id, title) => {
                    setLoadingGhost(p => ({ ...p, [id]: true }));
                    generateRelatedTopics(title).then(results => {
                        if (results) {
                            const newGhosts = { ...ghostTopics, [id]: results };
                            setGhostTopics(newGhosts);
                            localStorage.setItem("ghostTopics", JSON.stringify(newGhosts));
                        }
                    }).finally(() => setLoadingGhost(p => ({ ...p, [id]: false })));
                }}
                onCreateGhost={(topic) => createCurriculum(topic, 100)} loadingGhost={loadingGhost}
                isExpanded={sidebarExpanded} setIsExpanded={setSidebarExpanded}
            />

            {/* Desktop Sidebar Spacer */}
            <div className="hidden lg:block w-[60px] shrink-0" />

            <main className="flex-1 flex flex-col overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(30,41,59,0.3),transparent)] relative">
                {/* Header */}
                <header className="h-20 md:h-24 border-b border-white/5 bg-slate-950/40 backdrop-blur-2xl px-4 md:px-8 flex items-center gap-4 md:gap-8 z-10 shrink-0">
                    <button
                        onClick={() => setSidebarExpanded(true)}
                        className="lg:hidden p-3 bg-slate-800/80 rounded-xl text-amber-400 hover:bg-slate-700 transition-all border border-slate-700/50"
                    >
                        <Menu size={24} />
                    </button>
                    <div className="flex-1 flex flex-col justify-center">
                        <h1 className="text-xl font-black text-amber-500 tracking-[0.2em] uppercase font-[family-name:var(--font-syncopate)]">Master Tufan</h1>
                        <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Mühendislik İşletim Sistemi</p>
                    </div>
                    <button onClick={() => setRunTutorial(true)} className="p-4 bg-slate-800/80 hover:bg-slate-700 rounded-2xl text-slate-500 hover:text-white transition-all border border-slate-700/50"><HelpCircle size={28} /></button>
                </header>

                {/* Content Scroll Area */}
                <div className="flex-1 overflow-y-auto p-8 md:p-16 custom-scrollbar relative">
                    {!hasCurriculum ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-12 animate-in fade-in zoom-in duration-700">
                            <div className="relative">
                                <div className="absolute -inset-10 bg-blue-500/10 blur-[60px] rounded-full animate-pulse" />
                                <div className="w-24 h-24 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center text-blue-500 shadow-2xl relative">
                                    <Sparkles size={48} />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-4xl font-black text-white tracking-tight uppercase">Sistem Hazır</h2>
                                <p className="text-slate-500 font-medium max-w-sm mx-auto">Henüz yüklü bir müfredatın yok. Sol menüdeki <span className="text-blue-400 font-bold">+</span> butonunu kullanarak ilk öğrenme yolculuğuna başlayabilirsin.</p>
                            </div>
                            <button
                                onClick={() => setShowNewCurriculumModal(true)}
                                className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-95 uppercase tracking-widest text-sm"
                            >
                                İlk Müfredatını Oluştur
                            </button>
                        </div>
                    ) : (
                        <div className="max-w-5xl mx-auto">
                            {/* Dashboard Header */}
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20 animate-in fade-in slide-in-from-bottom-5 duration-700">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-500/20">Master Veri Seti v1.4</span>
                                        <span className="w-1.5 h-1.5 bg-slate-700 rounded-full"></span>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{activeData?.isCustom ? 'Özel Müfredat' : 'Sistem Klasörü'}</span>
                                    </div>
                                    <h2 className="text-6xl md:text-7xl font-black text-white tracking-tighter leading-[0.9]">{activeData?.title}</h2>
                                </div>

                                <div className="flex items-center gap-6 bg-slate-800/20 p-3 rounded-[32px] border border-white/5 backdrop-blur-xl">
                                    <div className="px-6 py-4 bg-slate-900/80 rounded-[24px] border border-slate-700 shadow-xl">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Toplam Konu</span>
                                        </div>
                                        <span className="text-3xl font-black text-white leading-none">{activeStats.total}</span>
                                    </div>
                                    <div className="px-6 py-4 bg-emerald-900/10 rounded-[24px] border border-emerald-500/20 shadow-xl">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">İlerleme</span>
                                        </div>
                                        <span className="text-3xl font-black text-emerald-400 leading-none">%{activeStats.percent}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Recursive Topic Tree */}
                            <div className="space-y-4">
                                {activeData?.topics?.slice(0, visibleCount[activeCategory] || 30).map((t: any) => renderRecursive(t))}
                            </div>

                            {activeData?.topics && activeData.topics.length > (visibleCount[activeCategory] || 30) && (
                                <button
                                    onClick={() => setVisibleCount(p => ({ ...p, [activeCategory]: (p[activeCategory] || 30) + 30 }))}
                                    className="w-full mt-16 py-8 bg-slate-800/30 hover:bg-slate-800 border-2 border-dashed border-slate-700 hover:border-blue-500/50 text-slate-500 hover:text-blue-400 font-black uppercase tracking-[0.2em] rounded-[32px] transition-all flex items-center justify-center gap-4"
                                >
                                    DAHA FAZLA VERİ YÜKLE <ChevronDown size={24} className="animate-bounce" />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
