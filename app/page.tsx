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
import { generateFullCurriculum, generateRelatedTopics, generateSubtopicTree } from "@/lib/geminiClient";

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
    const [topicCount, setTopicCount] = useState(300);

    const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [isDeepening, setIsDeepening] = useState<Record<string, boolean>>({});
    const [activeControlPanel, setActiveControlPanel] = useState<string | null>(null);
    const [showNewCurriculumModal, setShowNewCurriculumModal] = useState(false);
    const [showAboutModal, setShowAboutModal] = useState(false);
    const [runTutorial, setRunTutorial] = useState(false);

    const [galleryImages, setGalleryImages] = useState<string[]>([]);
    const [loadingImages, setLoadingImages] = useState(false);
    const [showImageGallery, setShowImageGallery] = useState<string | null>(null);
    const [visibleCount, setVisibleCount] = useState<Record<string, number>>({});
    const [loadingGhost, setLoadingGhost] = useState<Record<string, boolean>>({});
    const [sidebarExpanded, setSidebarExpanded] = useState(false);
    const [ghostTopics, setGhostTopics] = useState<Record<string, string[]>>({});

    // LOAD SAVED STATE
    useEffect(() => {
        let customList = [];
        const savedCustom = localStorage.getItem("customCurriculums");
        if (savedCustom) {
            try { customList = JSON.parse(savedCustom); } catch (e) { }
        }
        setAllCategories(customList);
        if (customList.length > 0 && !activeCategory) setActiveCategory(customList[0].id);

        const savedCompleted = localStorage.getItem("completedTopics");
        if (savedCompleted) { try { setCompletedItems(new Set(JSON.parse(savedCompleted))); } catch (e) { } }

        const savedGhosts = localStorage.getItem("ghostTopics");
        if (savedGhosts) { try { setGhostTopics(JSON.parse(savedGhosts)); } catch (e) { } }
    }, []);

    const normalizeTopic = (text: string): string => {
        const acronyms = ["plc", "kpss", "hmi", "scada", "api", "rest", "sql", "html", "css", "js", "vfd", "pid", "cad", "cam", "cnc", "iot", "ai", "ml", "nlp", "aws", "os", "ram", "cpu", "io", "usb", "tcp", "ip", "udp", "http", "https", "ssl", "tls", "git", "npm", "json", "xml", "pdf", "tyt", "ayt", "dgs", "ales", "yds", "yökdil", "lgs"];
        return text.split(' ').map(word => {
            const lower = word.toLowerCase().replace(/[.,!?;:]/g, '');
            if (acronyms.includes(lower)) return word.toUpperCase();
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join(' ');
    };

    const createCurriculum = async (topic: string, count: number = 300) => {
        if (!topic.trim()) return;
        setIsGenerating(true);
        try {
            const result = await generateFullCurriculum(topic, count);
            if (result && result.topics) {
                const mainContainer = {
                    id: `custom-${Date.now()}`,
                    title: result.title || topic,
                    isCustom: true,
                    topics: result.topics
                };
                const updatedList = [...allCategories, mainContainer];
                setAllCategories(updatedList);
                localStorage.setItem("customCurriculums", JSON.stringify(updatedList.filter(c => c.isCustom)));
                setActiveCategory(mainContainer.id);
                setAiPrompt("");
                setShowNewCurriculumModal(false);
            }
        } catch (e) { console.error(e); } finally { setIsGenerating(false); }
    };

    const deleteCurriculum = (id: string) => {
        if (!confirm("Silmek istediğinize emin misiniz?")) return;
        const newList = allCategories.filter(c => c.id !== id);
        setAllCategories(newList);
        localStorage.setItem("customCurriculums", JSON.stringify(newList.filter(c => c.isCustom)));
        if (activeCategory === id) setActiveCategory(newList[0]?.id || "");
    };

    const handleDeepDive = (platformId: string, item: any, lang: 'tr' | 'en') => {
        const query = lang === 'en' ? (item.q_en || item.title) : (item.q_tr || item.title);
        const encoded = encodeURIComponent(query);
        const searchUrlMap: Record<string, string> = {
            'youtube': `https://www.youtube.com/results?search_query=${encoded}`,
            'google': `https://www.google.com/search?q=${encoded}`,
            'wikipedia': `https://${lang}.wikipedia.org/wiki/Special:Search?search=${encoded}`,
            'reddit': `https://www.reddit.com/search/?q=${encoded}`,
            'github': `https://github.com/search?q=${encoded}`,
            'stackoverflow': `https://stackoverflow.com/search?q=${encoded}`,
            'udemy': `https://www.udemy.com/courses/search/?q=${encoded}`,
            'mdn': `https://developer.mozilla.org/en-US/search?q=${encoded}`,
            'arxiv': `https://arxiv.org/search/?query=${encoded}&searchtype=all`,
        };
        window.open(searchUrlMap[platformId] || `https://www.google.com/search?q=${encoded}`, '_blank');
    };

    const loadImagesFromAPI = async (topic: string, topicId: string, count: number) => {
        setLoadingImages(true);
        const cached = getCachedImages(topicId);
        if (cached && cached.length >= count) { setGalleryImages(cached.slice(0, count)); setLoadingImages(false); return; }
        try {
            const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(topic + ' engineering')}&per_page=${count}&client_id=${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`);
            const data = await res.json();
            const imgs = data.results.map((img: any) => img.urls.regular);
            cacheImage(topicId, imgs);
            setGalleryImages(imgs);
        } catch (e) { setGalleryImages([]); } finally { setLoadingImages(false); }
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

    const handleDeepenBranch = async (itemId: string, topicTitle: string) => {
        setIsDeepening(p => ({ ...p, [itemId]: true }));
        try {
            const results = await generateSubtopicTree(topicTitle);
            const fixResults = (items: any[], parentLevel: number): any[] => items.map(t => ({
                id: t.id || `deep-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                title: t.title,
                q_tr: t.q_tr || t.title,
                q_en: t.q_en || t.title,
                level: parentLevel + 1,
                subtopics: t.subtopics ? fixResults(t.subtopics, parentLevel + 1) : []
            }));
            const updated = allCategories.map(cat => {
                if (cat.id !== activeCategory) return cat;
                const updateNode = (nodes: any[]): any[] => nodes.map(node => {
                    if (node.id === itemId) return { ...node, subtopics: [...(node.subtopics || []), ...fixResults(results, node.level)] };
                    if (node.subtopics) return { ...node, subtopics: updateNode(node.subtopics) };
                    return node;
                });
                return { ...cat, topics: updateNode(cat.topics || []) };
            });
            setAllCategories(updated);
            localStorage.setItem("customCurriculums", JSON.stringify(updated.filter(c => c.isCustom)));
            setExpandedItems(p => new Set(p).add(itemId));
        } catch (e) { } finally { setIsDeepening(p => ({ ...p, [itemId]: false })); }
    };

    const renderRecursive = (item: any, depth: number = 0) => {
        const isExpanded = expandedItems.has(item.id);
        const isCompleted = completedItems.has(item.id);
        const hasChildren = item.subtopics && item.subtopics.length > 0;
        const showPanel = activeControlPanel === item.id;
        const isMaster = depth === 0;

        const masterColors = ['border-l-blue-500 text-blue-400', 'border-l-amber-500 text-amber-400', 'border-l-emerald-500 text-emerald-400', 'border-l-purple-500 text-purple-400', 'border-l-rose-500 text-rose-400'];
        const colorClass = isMaster ? masterColors[item.title.length % masterColors.length] : 'border-l-slate-700 text-slate-100';

        return (
            <div key={item.id} className="w-full">
                <motion.div
                    initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
                    className={`relative group flex items-center gap-3 p-4 mb-1.5 rounded-2xl cursor-pointer transition-all duration-200
                        ${isMaster ? 'bg-slate-900/60 border-l-4 shadow-lg' : 'bg-slate-800/20 border-l-2 hover:bg-slate-800/40'}
                        ${isCompleted ? 'opacity-40 grayscale-[0.5]' : ''}
                        ${colorClass.split(' ')[0]} ${showPanel ? 'ring-2 ring-blue-500/30 bg-slate-800/80 shadow-2xl' : ''}`}
                    style={{ marginLeft: `${Math.min(depth * 8, 32)}px` }}
                    onClick={() => setActiveControlPanel(showPanel ? null : item.id)}
                >
                    <div className="flex items-center gap-2 shrink-0">
                        {hasChildren ? (
                            <button onClick={(e) => { e.stopPropagation(); toggleExpand(item.id); }} className={`p-1 transition-transform ${isExpanded ? '' : '-rotate-90'}`}>
                                <ChevronDown size={14} className="text-slate-500" />
                            </button>
                        ) : <div className="w-5 h-5 flex items-center justify-center"><div className="w-1 h-1 bg-slate-700 rounded-full" /></div>}
                        <button onClick={(e) => { e.stopPropagation(); toggleComplete(item.id); }} className={`transition-all ${isCompleted ? "text-emerald-500" : "text-slate-600 hover:text-slate-400"}`}>
                            {isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                        </button>
                    </div>
                    <span className={`text-sm font-bold flex-1 truncate ${isMaster ? 'text-base tracking-tight uppercase ' + colorClass.split(' ')[1] : 'text-slate-300'} ${isCompleted ? 'line-through opacity-50' : ''}`}>
                        {item.title}
                    </span>
                    {hasChildren && isMaster && <span className="hidden sm:block text-[9px] font-black text-slate-600 bg-slate-950/50 px-2 py-0.5 rounded-full">{item.subtopics.length} ALT</span>}
                </motion.div>

                <AnimatePresence>
                    {showPanel && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-3">
                            <div className="bg-slate-950/90 rounded-[28px] p-5 border border-white/5 shadow-2xl space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {PLATFORMS.slice(0, 8).map(plat => (
                                        <div key={plat.id} className="flex items-center bg-slate-900/40 rounded-xl p-1.5 border border-slate-800/50 group">
                                            <div className="flex items-center gap-2 px-2 min-w-[70px]">
                                                <plat.icon size={14} className="text-slate-500 group-hover:text-blue-400" />
                                                <span className="text-[8px] font-black uppercase text-slate-600">{plat.name}</span>
                                            </div>
                                            <div className="flex-1 flex gap-1">
                                                <button onClick={(e) => { e.stopPropagation(); handleDeepDive(plat.id, item, 'tr'); }} className="flex-1 py-2 bg-blue-600/10 hover:bg-blue-600 rounded-lg text-blue-400 hover:text-white text-[8px] font-black">🇹🇷 TR</button>
                                                <button onClick={(e) => { e.stopPropagation(); handleDeepDive(plat.id, item, 'en'); }} className="flex-1 py-2 bg-slate-800/50 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white text-[8px] font-black">🌍 EN</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <button onClick={(e) => { e.stopPropagation(); handleDeepenBranch(item.id, item.title); }} disabled={isDeepening[item.id]} className="flex items-center justify-center gap-2 py-3 bg-emerald-600/10 hover:bg-emerald-600/20 border border-dashed border-emerald-500/30 rounded-xl text-emerald-400 text-[9px] font-black uppercase tracking-widest disabled:opacity-30">
                                        <Sparkles size={14} className={isDeepening[item.id] ? "animate-spin" : ""} /> {isDeepening[item.id] ? 'ANALİZ...' : 'DERİNLEŞTİR'}
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); setShowImageGallery(item.id); loadImagesFromAPI(item.title, item.id, 4); }} className="flex items-center justify-center gap-2 py-3 bg-purple-900/10 hover:bg-purple-900/30 border border-dashed border-purple-500/30 rounded-xl text-purple-400 text-[9px] font-black uppercase tracking-widest">
                                        <ImageIcon size={14} /> GÖRSELLER
                                    </button>
                                </div>
                                {showImageGallery === item.id && galleryImages.length > 0 && (
                                    <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/5">
                                        {galleryImages.slice(0, 4).map((src, i) => <img key={i} src={src} className="w-full h-12 object-cover rounded-lg border border-white/5" onClick={() => window.open(src)} />)}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {isExpanded && hasChildren && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                            {item.subtopics.map((child: any) => renderRecursive(child, depth + 1))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    const activeData = useMemo(() => allCategories.find((c: any) => c.id === activeCategory), [allCategories, activeCategory]);
    const activeStats = useMemo(() => {
        let total = 0, completed = 0;
        const traverse = (items: any[]) => items.forEach(t => { total++; if (completedItems.has(t.id)) completed++; if (t.subtopics) traverse(t.subtopics); });
        if (activeData?.topics) traverse(activeData.topics);
        return { total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
    }, [activeData, completedItems]);

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
            <TutorialOverlay forceRun={runTutorial} onComplete={() => setRunTutorial(false)} />
            <AboutModal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} />

            {showNewCurriculumModal && (
                <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 border border-slate-700 rounded-[40px] p-8 max-w-xl w-full shadow-2xl relative border-t-blue-500/50">
                        <button onClick={() => setShowNewCurriculumModal(false)} className="absolute right-6 top-6 text-slate-500 hover:text-white"><X size={24} /></button>
                        <h3 className="text-2xl font-black text-white mb-8 tracking-tight uppercase flex items-center gap-3"><Plus className="text-blue-400" size={28} /> YOL HARİTASI ÜRET</h3>
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Öğrenme Hedefi</label>
                                <input type="text" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="Örn: PLC Programlama, Docker..." className="w-full bg-slate-800 rounded-2xl p-5 text-lg font-bold text-white border border-slate-700 focus:border-blue-500 transition-all outline-none" />
                            </div>
                            <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50">
                                <div className="flex justify-between items-end mb-4"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Derinlik</label><span className="text-blue-400 font-black text-lg">{topicCount} BAŞLIK</span></div>
                                <input type="range" min="50" max="1000" step="50" value={topicCount} onChange={(e) => setTopicCount(Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500" />
                            </div>
                            <button onClick={() => createCurriculum(aiPrompt, topicCount)} disabled={!aiPrompt.trim() || isGenerating} className="w-full py-5 bg-blue-600 hover:bg-blue-500 rounded-2xl text-white font-black transition-all shadow-xl shadow-blue-600/20 uppercase tracking-widest">
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
                    generateRelatedTopics(title).then(results => { if (results) setGhostTopics(p => { const n = { ...p, [id]: results }; localStorage.setItem("ghostTopics", JSON.stringify(n)); return n; }); }).finally(() => setLoadingGhost(p => ({ ...p, [id]: false })));
                }}
                onCreateGhost={(topic) => createCurriculum(topic, 100)} loadingGhost={loadingGhost}
                isExpanded={sidebarExpanded} setIsExpanded={setSidebarExpanded}
            />

            <main className="flex-1 flex flex-col overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(30,41,59,0.3),transparent)] lg:ml-[60px]">
                <header className="h-20 border-b border-white/5 bg-slate-950/40 backdrop-blur-2xl px-6 flex items-center gap-4 z-10">
                    <button onClick={() => setSidebarExpanded(true)} className="lg:hidden p-2.5 bg-slate-800 rounded-xl text-amber-500 border border-slate-700/50"><Menu size={20} /></button>
                    <div className="flex-1">
                        <h1 className="text-lg font-black text-amber-500 tracking-[0.2em] uppercase font-[family-name:var(--font-syncopate)]">Master Tufan</h1>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Engineering OS</p>
                    </div>
                    <button onClick={() => setRunTutorial(true)} className="p-3 bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all"><HelpCircle size={24} /></button>
                </header>

                <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
                    {!allCategories.length ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in duration-500">
                            <div className="relative"><div className="absolute -inset-10 bg-blue-500/10 blur-[60px] animate-pulse" /><div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center text-blue-500 shadow-2xl relative"><Sparkles size={40} /></div></div>
                            <div className="space-y-3"><h2 className="text-3xl font-black text-white uppercase">Sistem Hazır</h2><p className="text-slate-500 text-sm max-w-sm mx-auto">Henüz yüklü bir müfredatın yok. Sol menüdeki <span className="text-blue-400 font-bold">+</span> butonunu kullanarak başla.</p></div>
                            <button onClick={() => setShowNewCurriculumModal(true)} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl shadow-xl transition-all uppercase tracking-widest text-xs">İlk Müfredatını Oluştur</button>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto pb-20">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 animate-in fade-in slide-in-from-bottom-3">
                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="px-2.5 py-0.5 bg-blue-600/20 text-blue-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-blue-500/20">v1.5 Enterprise</span>
                                        <span className="text-[8px] font-black text-slate-600 uppercase">{activeData?.isCustom ? 'Özel Yol Haritası' : 'Sistem Verisi'}</span>
                                    </div>
                                    <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none">{activeData?.title}</h2>
                                </div>
                                <div className="flex gap-4">
                                    <div className="px-5 py-3 bg-slate-900 rounded-2xl border border-slate-800 shadow-lg text-center"><div className="text-[8px] font-black text-slate-500 uppercase mb-1">Konu</div><span className="text-2xl font-black text-white leading-none">{activeStats.total}</span></div>
                                    <div className="px-5 py-3 bg-emerald-900/10 rounded-2xl border border-emerald-500/20 shadow-lg text-center"><div className="text-[8px] font-black text-slate-500 uppercase mb-1">İlerleme</div><span className="text-2xl font-black text-emerald-400 leading-none">%{activeStats.percent}</span></div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {activeData?.topics?.slice(0, visibleCount[activeCategory] || 30).map((t: any) => renderRecursive(t))}
                            </div>
                            {activeData?.topics?.length > (visibleCount[activeCategory] || 30) && (
                                <button onClick={() => setVisibleCount(p => ({ ...p, [activeCategory]: (p[activeCategory] || 30) + 30 }))} className="w-full mt-12 py-6 bg-slate-900/50 hover:bg-slate-900 border border-dashed border-slate-800 text-slate-500 hover:text-blue-400 font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-3 text-xs">DAHA FAZLA YÜKLE <ChevronDown size={18} className="animate-bounce" /></button>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
