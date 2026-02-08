"use client";

import dynamic from 'next/dynamic';

const HybridSidebar = dynamic(() => import("@/components/HybridSidebar"), { ssr: false });
const TutorialOverlay = dynamic(() => import("@/components/TutorialOverlay"), { ssr: false });
const AboutModal = dynamic(() => import("@/components/AboutModal"), { ssr: false });

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronDown, CheckCircle2, Circle, Youtube, FileText, Book, X, Image as ImageIcon,
    Globe, MessageCircle, Sparkles, BookOpen, Github, Lightbulb, Layout, Settings, Plus, HelpCircle, Menu
} from "lucide-react";
import { generateFullCurriculum, generateRelatedTopics, generateSubtopicTree } from "@/lib/geminiClient";
import { cacheImage, getCachedImages } from "@/lib/supabaseClient";

// PLATFORMS
const PLATFORMS = [
    { id: "youtube", name: "YouTube", icon: Youtube }, { id: "google", name: "Google", icon: FileText },
    { id: "reddit", name: "Reddit", icon: MessageCircle }, { id: "wikipedia", name: "Wiki", icon: Book },
    { id: "github", name: "GitHub", icon: Github }, { id: "arxiv", name: "ArXiv", icon: FileText },
    { id: "ieee", name: "IEEE", icon: Globe }, { id: "semantic", name: "Semantic", icon: BookOpen },
    { id: "researchgate", name: "R.Gate", icon: Globe }, { id: "stackoverflow", name: "StackOver", icon: Layout },
    { id: "mdn", name: "MDN", icon: FileText }, { id: "udemy", name: "Udemy", icon: Lightbulb },
    { id: "coursera", name: "Coursera", icon: Globe }, { id: "mitocw", name: "MIT OCW", icon: BookOpen },
    { id: "khan", name: "Khan", icon: Sparkles }, { id: "wolfram", name: "Wolfram", icon: Sparkles },
    { id: "arduino", name: "Arduino", icon: Settings }, { id: "hackster", name: "Hackster", icon: Layout },
    { id: "pinterest", name: "Pinterest", icon: Layout }, { id: "instructables", name: "Instruct", icon: Lightbulb },
    { id: "geogebra", name: "GeoGebra", icon: Circle }, { id: "desmos", name: "Desmos", icon: Layout },
    { id: "sciencedirect", name: "SciDirect", icon: Book }, { id: "devto", name: "Dev.to", icon: Layout },
    { id: "leetcode", name: "LeetCode", icon: Settings }
];

export default function MasterTufanOS() {
    const [allCategories, setAllCategories] = useState<any[]>([]);
    const [activeCategory, setActiveCategory] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiPrompt, setAiPrompt] = useState("");
    const [topicCount, setTopicCount] = useState(500);
    const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
    const [activeControlPanel, setActiveControlPanel] = useState<string | null>(null);
    const [showNewCurriculumModal, setShowNewCurriculumModal] = useState(false);
    const [showAboutModal, setShowAboutModal] = useState(false);
    const [runTutorial, setRunTutorial] = useState(false);
    const [galleryImages, setGalleryImages] = useState<string[]>([]);
    const [loadingImages, setLoadingImages] = useState(false);
    const [showImageGallery, setShowImageGallery] = useState<string | null>(null);
    const [sidebarExpanded, setSidebarExpanded] = useState(false);
    const [ghostTopics, setGhostTopics] = useState<Record<string, string[]>>({});
    const [loadingGhost, setLoadingGhost] = useState<Record<string, boolean>>({});
    const [isDeepening, setIsDeepening] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const savedCustom = localStorage.getItem("customCurriculums");
        if (savedCustom) {
            try {
                const customList = JSON.parse(savedCustom);
                setAllCategories(customList);
                if (customList.length > 0 && !activeCategory) setActiveCategory(customList[0].id);
            } catch (e) { }
        }
        const savedCompleted = localStorage.getItem("completedTopics");
        if (savedCompleted) { try { setCompletedItems(new Set(JSON.parse(savedCompleted))); } catch (e) { } }
        const savedGhosts = localStorage.getItem("ghostTopics");
        if (savedGhosts) { try { setGhostTopics(JSON.parse(savedGhosts)); } catch (e) { } }
    }, []);

    const createCurriculum = async (topic: string, count: number = 500) => {
        if (!topic.trim()) return;
        setIsGenerating(true);
        try {
            const result = await generateFullCurriculum(topic, count);
            if (result?.topics) {
                const flattenTopics = (topics: any[]): any[] => {
                    let flat: any[] = [];
                    const traverse = (items: any[]) => {
                        items.forEach(t => {
                            flat.push({ id: t.id, title: t.title, q_tr: t.q_tr, q_en: t.q_en });
                            if (t.subtopics?.length) traverse(t.subtopics);
                        });
                    };
                    traverse(topics);
                    return flat;
                };
                const mainContainer = {
                    id: `custom-${Date.now()}`,
                    title: result.title || topic,
                    isCustom: true,
                    topics: flattenTopics(result.topics)
                };
                const updatedList = [...allCategories, mainContainer];
                setAllCategories(updatedList);
                localStorage.setItem("customCurriculums", JSON.stringify(updatedList.filter(c => c.isCustom)));
                setActiveCategory(mainContainer.id);
                setAiPrompt("");
                setShowNewCurriculumModal(false);
            }
        } catch (e) { } finally { setIsGenerating(false); }
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

    const handleDeepenBranch = async (itemId: string, topicTitle: string) => {
        setIsDeepening(p => ({ ...p, [itemId]: true }));
        try {
            const results = await generateSubtopicTree(topicTitle);
            const fixResults = (items: any[]): any[] => {
                let flat: any[] = [];
                const traverse = (topics: any[]) => {
                    topics.forEach(t => {
                        flat.push({ id: t.id || `deep-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`, title: t.title, q_tr: t.q_tr || t.title, q_en: t.q_en || t.title });
                        if (t.subtopics?.length) traverse(t.subtopics);
                    });
                };
                traverse(items);
                return flat;
            };
            const updated = allCategories.map(cat => {
                if (cat.id !== activeCategory) return cat;
                const idx = cat.topics.findIndex((t: any) => t.id === itemId);
                if (idx === -1) return cat;
                const newTopics = [...cat.topics];
                newTopics.splice(idx + 1, 0, ...fixResults(results));
                return { ...cat, topics: newTopics };
            });
            setAllCategories(updated);
            localStorage.setItem("customCurriculums", JSON.stringify(updated.filter(c => c.isCustom)));
        } catch (e) { } finally { setIsDeepening(p => ({ ...p, [itemId]: false })); }
    };

    const activeData = useMemo(() => allCategories.find((c: any) => c.id === activeCategory), [allCategories, activeCategory]);
    const activeStats = useMemo(() => {
        const total = activeData?.topics?.length || 0;
        const completed = activeData?.topics?.filter((t: any) => completedItems.has(t.id)).length || 0;
        return { total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
    }, [activeData, completedItems]);

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
            <TutorialOverlay forceRun={runTutorial} onComplete={() => setRunTutorial(false)} />
            <AboutModal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} />

            {showNewCurriculumModal && (
                <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 border border-slate-700 rounded-[40px] p-8 max-w-xl w-full shadow-2xl">
                        <button onClick={() => setShowNewCurriculumModal(false)} className="absolute right-6 top-6 text-slate-500 hover:text-white"><X size={24} /></button>
                        <h3 className="text-2xl font-black text-white mb-8 uppercase flex items-center gap-3"><Plus className="text-blue-400" size={28} /> YOL HARİTASI ÜRET</h3>
                        <div className="space-y-6">
                            <div><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Konu</label><input type="text" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="Örn: PLC Programlama..." className="w-full bg-slate-800 rounded-2xl p-5 text-lg font-bold text-white border border-slate-700 focus:border-blue-500 outline-none" /></div>
                            <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50">
                                <div className="flex justify-between mb-4"><label className="text-[10px] font-black text-slate-500 uppercase">Derinlik</label><span className="text-blue-400 font-black text-lg">{topicCount} BAŞLIK</span></div>
                                <input type="range" min="50" max="1000" step="50" value={topicCount} onChange={(e) => setTopicCount(Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-full cursor-pointer accent-blue-500" />
                            </div>
                            <button onClick={() => createCurriculum(aiPrompt, topicCount)} disabled={!aiPrompt.trim() || isGenerating} className="w-full py-5 bg-blue-600 hover:bg-blue-500 rounded-2xl text-white font-black uppercase tracking-widest disabled:opacity-50">{isGenerating ? 'ANALİZ EDİLİYOR...' : 'SİSTEME EKLE'}</button>
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

            <main className="flex-1 flex flex-col overflow-hidden lg:ml-[60px]">
                <header className="h-20 border-b border-white/5 bg-slate-950/40 backdrop-blur-2xl px-6 flex items-center gap-4">
                    <button onClick={() => setSidebarExpanded(true)} className="lg:hidden p-2.5 bg-slate-800 rounded-xl text-amber-500"><Menu size={20} /></button>
                    <div className="flex-1"><h1 className="text-lg font-black text-amber-500 tracking-[0.2em] uppercase">Master Tufan</h1><p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Engineering OS</p></div>
                    <button onClick={() => setRunTutorial(true)} className="p-3 bg-slate-800 rounded-xl text-slate-500 hover:text-white"><HelpCircle size={24} /></button>
                </header>

                <div className="flex-1 overflow-y-auto p-6 md:p-12">
                    {!allCategories.length ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
                            <div className="relative"><div className="absolute -inset-10 bg-blue-500/10 blur-[60px] animate-pulse" /><div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center text-blue-500 shadow-2xl relative"><Sparkles size={40} /></div></div>
                            <div className="space-y-3"><h2 className="text-3xl font-black text-white uppercase">Sistem Hazır</h2><p className="text-slate-500 text-sm max-w-sm mx-auto">Sol menüdeki <span className="text-blue-400 font-bold">+</span> ile başla.</p></div>
                            <button onClick={() => setShowNewCurriculumModal(true)} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl uppercase tracking-widest text-xs">İlk Müfredatını Oluştur</button>
                        </div>
                    ) : (
                        <div className="max-w-6xl mx-auto pb-20">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                                <div>
                                    <div className="flex items-center gap-3 mb-3"><span className="px-2.5 py-0.5 bg-blue-600/20 text-blue-400 text-[8px] font-black uppercase rounded-full border border-blue-500/20">v1.6 FLAT</span><span className="text-[8px] font-black text-slate-600 uppercase">{activeData?.isCustom ? 'Özel' : 'Sistem'}</span></div>
                                    <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none">{activeData?.title}</h2>
                                </div>
                                <div className="flex gap-4">
                                    <div className="px-5 py-3 bg-slate-900 rounded-2xl border border-slate-800 text-center"><div className="text-[8px] font-black text-slate-500 uppercase mb-1">Konu</div><span className="text-2xl font-black text-white">{activeStats.total}</span></div>
                                    <div className="px-5 py-3 bg-emerald-900/10 rounded-2xl border border-emerald-500/20 text-center"><div className="text-[8px] font-black text-slate-500 uppercase mb-1">İlerleme</div><span className="text-2xl font-black text-emerald-400">%{activeStats.percent}</span></div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {activeData?.topics?.map((item: any, idx: number) => {
                                    const isCompleted = completedItems.has(item.id);
                                    const showPanel = activeControlPanel === item.id;
                                    return (
                                        <div key={item.id} className="w-full">
                                            <motion.div
                                                className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all ${isCompleted ? 'bg-emerald-900/20 opacity-50' : 'bg-slate-800/40 hover:bg-slate-800'} ${showPanel ? 'ring-2 ring-blue-500/30 shadow-2xl' : ''}`}
                                                onClick={() => setActiveControlPanel(showPanel ? null : item.id)}
                                            >
                                                <button onClick={(e) => { e.stopPropagation(); toggleComplete(item.id); }} className={`transition-all ${isCompleted ? "text-emerald-500" : "text-slate-600 hover:text-slate-400"}`}>
                                                    {isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                                                </button>
                                                <span className={`text-sm font-bold flex-1 ${isCompleted ? 'line-through text-emerald-300' : 'text-slate-200'}`}>{item.title}</span>
                                                <span className="text-[9px] font-black text-slate-700 bg-slate-900/50 px-2 py-0.5 rounded-full">#{idx + 1}</span>
                                            </motion.div>

                                            <AnimatePresence>
                                                {showPanel && (
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-2">
                                                        <div className="bg-slate-950/90 rounded-3xl p-6 border border-white/5">
                                                            <div className="flex flex-wrap gap-2 mb-4">
                                                                {PLATFORMS.map(plat => {
                                                                    const Icon = plat.icon;
                                                                    const isOpen = showImageGallery === `${item.id}-${plat.id}`;
                                                                    return (
                                                                        <div key={plat.id} className="relative">
                                                                            <button
                                                                                onClick={(e) => { e.stopPropagation(); setShowImageGallery(isOpen ? null : `${item.id}-${plat.id}`); }}
                                                                                className={`p-2.5 rounded-xl border transition-all ${isOpen ? 'bg-blue-600 border-blue-500 shadow-lg' : 'bg-slate-900/50 border-slate-800 hover:border-blue-500/50'}`}
                                                                            >
                                                                                <Icon size={16} className={isOpen ? 'text-white' : 'text-slate-500'} />
                                                                            </button>
                                                                            {isOpen && (
                                                                                <div className="absolute top-full left-0 mt-2 flex gap-2 z-50">
                                                                                    <button onClick={(e) => { e.stopPropagation(); handleDeepDive(plat.id, item, 'tr'); }} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-white text-xs font-black">🇹🇷 TR</button>
                                                                                    <button onClick={(e) => { e.stopPropagation(); handleDeepDive(plat.id, item, 'en'); }} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-white text-xs font-black">🌍 EN</button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <button onClick={(e) => { e.stopPropagation(); handleDeepenBranch(item.id, item.title); }} disabled={isDeepening[item.id]} className="py-3 bg-emerald-600/10 hover:bg-emerald-600/20 border border-dashed border-emerald-500/30 rounded-xl text-emerald-400 text-[9px] font-black uppercase disabled:opacity-30">
                                                                    <Sparkles size={14} className={isDeepening[item.id] ? "animate-spin inline mr-2" : "inline mr-2"} />{isDeepening[item.id] ? 'ANALİZ...' : 'DERİNLEŞTİR'}
                                                                </button>
                                                                <button onClick={(e) => { e.stopPropagation(); setShowImageGallery(`${item.id}-gallery`); loadImagesFromAPI(item.title, item.id, 4); }} className="py-3 bg-purple-900/10 hover:bg-purple-900/30 border border-dashed border-purple-500/30 rounded-xl text-purple-400 text-[9px] font-black uppercase">
                                                                    <ImageIcon size={14} className="inline mr-2" />GÖRSELLER
                                                                </button>
                                                            </div>
                                                            {showImageGallery === `${item.id}-gallery` && galleryImages.length > 0 && (
                                                                <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-white/5">
                                                                    {galleryImages.slice(0, 4).map((src, i) => <img key={i} src={src} className="w-full h-12 object-cover rounded-lg" onClick={() => window.open(src)} />)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
