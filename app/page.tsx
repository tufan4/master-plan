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
    Github, Lightbulb, HelpCircle, Layout, Settings, Plus, Wand2, Trash2
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

    const [globalSearch, setGlobalSearch] = useState("");
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
    const [parentMap, setParentMap] = useState<Map<string, string>>(new Map());
    const [visibleCount, setVisibleCount] = useState<Record<string, number>>({});
    const [pulsingMatch, setPulsingMatch] = useState<string | null>(null);

    const [ghostTopics, setGhostTopics] = useState<Record<string, string[]>>({});
    const [loadingGhost, setLoadingGhost] = useState<Record<string, boolean>>({});

    // LOAD SAVED STATE
    useEffect(() => {
        const savedCurriculums = localStorage.getItem("customCurriculums");
        if (savedCurriculums) {
            try {
                const parsed = JSON.parse(savedCurriculums);
                if (parsed.length > 0) {
                    setAllCategories(parsed);
                    setActiveCategory(parsed[0].id);
                }
            } catch (e) { console.error("Load failed", e); }
        }

        const savedGhosts = localStorage.getItem("ghostTopics");
        if (savedGhosts) {
            try { setGhostTopics(JSON.parse(savedGhosts)); } catch (e) { }
        }

        const savedCompleted = localStorage.getItem("completedTopics");
        if (savedCompleted) {
            try { setCompletedItems(new Set(JSON.parse(savedCompleted))); } catch (e) { }
        }
    }, []);

    // BUILD PARENT MAP FOR SEARCH
    useEffect(() => {
        const map = new Map<string, string>();
        const traverse = (items: any[], parentId: string | null) => {
            items.forEach(item => {
                if (parentId) map.set(item.id, parentId);
                if (item.subtopics) traverse(item.subtopics, item.id);
            });
        };
        allCategories.forEach(cat => { if (cat.topics) traverse(cat.topics, null); });
        setParentMap(map);
    }, [allCategories]);

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
            console.log("Generating curriculum for:", normalized);
            const result = await generateFullCurriculum(normalized, count);
            console.log("Generation result:", result);

            if (result && result.topics && result.topics.length > 0) {
                const mainContainer = {
                    id: `custom-${Date.now()}`,
                    title: result.title || normalized,
                    isCustom: true,
                    topics: result.topics
                };

                const updatedList = [...allCategories, mainContainer];
                setAllCategories(updatedList);
                localStorage.setItem("customCurriculums", JSON.stringify(updatedList.filter(c => c.isCustom)));

                setActiveCategory(mainContainer.id);
                setAiPrompt("");
                setShowNewCurriculumModal(false);
                setVisibleCount(prev => ({ ...prev, [mainContainer.id]: 20 }));
            } else {
                alert("AI geçerli bir müfredat üretemedi. Lütfen daha spesifik bir konu deneyin.");
            }
        } catch (error) {
            console.error("Critical Generation Error:", error);
            alert("Müfredat oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setIsGenerating(false);
        }
    };

    const deleteCurriculum = (id: string) => {
        if (!confirm("Bu müfredatı silmek istediğinize emin misiniz?")) return;
        const newList = allCategories.filter(cat => cat.id !== id);
        setAllCategories(newList);
        localStorage.setItem("customCurriculums", JSON.stringify(newList.filter(c => c.isCustom)));
        if (activeCategory === id) setActiveCategory(newList.length > 0 ? newList[0].id : "");
    };

    const handleDeepDive = (platformId: string, topic: any, lang: 'tr' | 'en') => {
        const qBase = topic.search_query || topic.title;
        let finalQuery = qBase;

        // Context Addons (Alt Kilit Anahtarlar)
        if (platformId === "youtube") finalQuery += " full course tutorial";
        if (platformId === "google") finalQuery += " technical documentation filetype:pdf";
        if (platformId === "reddit") finalQuery += " discussion review";
        if (platformId === "github") finalQuery += " source code example";

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
        syncCompletedTopics([...newSet]).catch(() => { });
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
        const isPulsing = pulsingMatch === item.id || (globalSearch.trim().length > 1 && item.title.toLowerCase().includes(globalSearch.toLowerCase().trim()));

        return (
            <div key={item.id} style={{ marginLeft: `${depth * 16}px` }} className="mb-1">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, boxShadow: isPulsing ? ['0 0 0px cyan', '0 0 20px cyan', '0 0 0px cyan'] : 'none' }}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${isPulsing ? 'bg-cyan-900/30 ring-2 ring-cyan-400' : isCompleted ? 'bg-emerald-900/20 border-l-2 border-emerald-500' : 'bg-slate-800/30 hover:bg-slate-700/30'}`}
                    onClick={() => setActiveControlPanel(showPanel ? null : item.id)}
                >
                    {hasChildren && <button onClick={(e) => { e.stopPropagation(); toggleExpand(item.id); }}>{isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</button>}
                    <button onClick={(e) => { e.stopPropagation(); toggleComplete(item.id); }} className={isCompleted ? "text-emerald-400" : "text-slate-500"}>{isCompleted ? <CheckCircle2 size={18} /> : <Circle size={18} />}</button>
                    <span className={`text-sm flex-1 ${isCompleted ? 'text-emerald-300 line-through' : 'text-slate-200'}`}>{item.title}</span>
                </motion.div>

                <AnimatePresence>
                    {showPanel && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="ml-4 mt-2 bg-slate-800/50 p-4 rounded-lg overflow-hidden border border-slate-700/50">
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                {PLATFORMS.map(plat => {
                                    const Icon = plat.icon;
                                    return (
                                        <button key={plat.id} onClick={(e) => { e.stopPropagation(); setActivePlatformPanel({ topicId: item.id, platform: plat.id }); }} className={`p-2 flex flex-col items-center rounded border transition-all ${activePlatformPanel?.topicId === item.id && activePlatformPanel?.platform === plat.id ? 'bg-blue-600/30 border-blue-400' : 'bg-slate-700/30 border-slate-600 hover:border-slate-500'}`}>
                                            <Icon size={16} className={activePlatformPanel?.platform === plat.id ? 'text-blue-400' : `text-${plat.color}-400`} />
                                            <span className="text-[9px] mt-1 uppercase text-slate-400">{plat.name}</span>
                                        </button>
                                    );
                                })}
                                <button onClick={(e) => { e.stopPropagation(); setShowImageGallery(item.id); loadImagesFromAPI(item.title, item.id, 10); }} className="p-2 flex flex-col items-center rounded border border-purple-500/30 bg-purple-900/20 hover:bg-purple-900/40"><ImageIcon size={16} className="text-purple-400" /><span className="text-[9px] mt-1">IMAGES</span></button>
                            </div>

                            {activePlatformPanel?.topicId === item.id && (
                                <div className="mt-3 p-3 bg-slate-900/80 rounded-xl border border-blue-500/20 flex flex-col gap-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-black text-blue-400 tracking-widest uppercase">Derin Arama / Deep Dive</span>
                                        <button onClick={() => setActivePlatformPanel(null)} className="text-slate-500 hover:text-white"><X size={14} /></button>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleDeepDive(activePlatformPanel!.platform, item, 'tr')} className="flex-1 p-3 bg-slate-800 hover:bg-blue-600/20 border border-slate-700 rounded-lg text-xs font-bold transition-all">🇹🇷 TÜRKÇE</button>
                                        <button onClick={() => handleDeepDive(activePlatformPanel!.platform, item, 'en')} className="flex-1 p-3 bg-slate-800 hover:bg-blue-600/20 border border-slate-700 rounded-lg text-xs font-bold transition-all">🇬🇧 ENGLISH</button>
                                    </div>
                                </div>
                            )}

                            {showImageGallery === item.id && (
                                <div className="mt-3">
                                    <div className="flex justify-between items-center mb-2 px-1">
                                        <span className="text-[10px] font-black text-purple-400 tracking-widest uppercase">Görsel Kütüphanesi</span>
                                        <button onClick={() => setShowImageGallery(null)} className="text-slate-500 hover:text-white"><X size={14} /></button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">{galleryImages.map((src, i) => <img key={i} src={src} className="w-full h-24 object-cover rounded-lg cursor-pointer hover:ring-2 ring-purple-500 transition-all" onClick={() => window.open(src)} />)}</div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {hasChildren && isExpanded && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                            {item.subtopics.map((child: any) => renderRecursive(child, depth + 1))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    const activeData = useMemo(() => allCategories.find((c: any) => c.id === activeCategory), [allCategories, activeCategory]);
    const hasCurriculum = allCategories.length > 0;

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
            {!hasCurriculum && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 p-4">
                    <div className="max-w-4xl w-full text-center space-y-16">
                        <div className="relative inline-block">
                            <motion.h1
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 font-[family-name:var(--font-syncopate)] tracking-[0.2em] uppercase"
                            >
                                MASTER TUFAN
                            </motion.h1>
                            <motion.div
                                className="absolute -inset-4 bg-amber-500/10 blur-3xl -z-10 rounded-full"
                                animate={{ opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 4, repeat: Infinity }}
                            />
                        </div>

                        <TypewriterSlogan />

                        <div className="relative group max-w-2xl mx-auto w-full">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
                            <div className="relative flex items-center bg-slate-900 rounded-2xl p-2 border border-slate-700/50">
                                <Sparkles className="ml-4 text-amber-400" size={32} />
                                <input
                                    type="text"
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && createCurriculum(aiPrompt, topicCount)}
                                    placeholder="Ne öğrenmek istersin? (Örn: PLC Programlama, Veri Bilimi...)"
                                    className="w-full bg-transparent border-none px-6 py-6 text-2xl text-slate-100 focus:outline-none placeholder:text-slate-600"
                                    autoFocus
                                />
                                <button
                                    onClick={() => createCurriculum(aiPrompt, topicCount)}
                                    disabled={!aiPrompt.trim() || isGenerating}
                                    className="p-5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white transition-all shadow-xl disabled:opacity-50"
                                >
                                    {isGenerating ? <div className="animate-spin border-4 border-white/20 border-t-white rounded-full w-8 h-8" /> : <ChevronRight size={32} />}
                                </button>
                            </div>
                            <div className="mt-6 flex justify-center gap-4 text-slate-500 text-sm font-bold">
                                <span>DERİNLİK / DEPTH:</span>
                                <input type="range" min="50" max="300" step="50" value={topicCount} onChange={(e) => setTopicCount(Number(e.target.value))} className="w-32 accent-blue-500" />
                                <span className="text-blue-400">{topicCount} MADDE</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {hasCurriculum && (
                <>
                    <TutorialOverlay forceRun={runTutorial} onComplete={() => setRunTutorial(false)} />
                    <AboutModal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} />

                    {showNewCurriculumModal && (
                        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-xl w-full shadow-2xl relative">
                                <button onClick={() => setShowNewCurriculumModal(false)} className="absolute right-6 top-6 text-slate-500 hover:text-white"><X size={24} /></button>
                                <h3 className="text-2xl font-black text-white mb-8 tracking-tight uppercase flex items-center gap-3">
                                    <Plus className="text-blue-400" /> Müfredat Oluşturucu
                                </h3>
                                <input type="text" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="Konu başlığı..." className="w-full bg-slate-800 rounded-2xl p-5 text-xl text-white mb-6 border border-slate-700 focus:border-blue-500 transition-all outline-none" />
                                <div className="bg-slate-800/50 p-6 rounded-2xl mb-8 border border-slate-700/50">
                                    <div className="flex justify-between mb-3"><label className="text-xs font-black text-slate-500 uppercase tracking-widest">Kapsam / Derinlik</label><span className="text-blue-400 font-bold">{topicCount} Başlık</span></div>
                                    <input type="range" min="50" max="300" step="50" value={topicCount} onChange={(e) => setTopicCount(Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                                </div>
                                <button onClick={() => createCurriculum(aiPrompt, topicCount)} disabled={!aiPrompt.trim() || isGenerating} className="w-full py-5 bg-blue-600 hover:bg-blue-500 rounded-2xl text-white font-black text-lg transition-all shadow-xl shadow-blue-600/20">
                                    {isGenerating ? 'YAPAY ZEKA ÇALIŞIYOR...' : 'YENİ MÜFREDAT OLUŞTUR'}
                                </button>
                            </motion.div>
                        </div>
                    )}

                    <HybridSidebar
                        categories={allCategories} activeCategory={activeCategory} setActiveCategory={setActiveCategory}
                        openAbout={() => setShowAboutModal(true)} setShowNewCurriculumModal={setShowNewCurriculumModal} deleteCategory={deleteCurriculum}
                        ghostTopics={ghostTopics} onGenerateGhost={(id, title) => {
                            setLoadingGhost(p => ({ ...p, [id]: true }));
                            generateRelatedTopics(title).then(results => {
                                const newGhosts = { ...ghostTopics, [id]: results };
                                setGhostTopics(newGhosts);
                                localStorage.setItem("ghostTopics", JSON.stringify(newGhosts));
                            }).finally(() => setLoadingGhost(p => ({ ...p, [id]: false })));
                        }}
                        onCreateGhost={(topic) => createCurriculum(topic, 100)} loadingGhost={loadingGhost}
                    />

                    <main className="flex-1 flex flex-col overflow-hidden bg-slate-900/40 relative">
                        <header className="h-20 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-6 flex items-center gap-6 z-10">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="Müfredat içinde ara..."
                                    className="w-full pl-12 pr-6 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-100 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                                    value={globalSearch}
                                    onChange={(e) => setGlobalSearch(e.target.value)}
                                />
                            </div>
                            <button onClick={() => setRunTutorial(true)} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-all"><HelpCircle size={24} /></button>
                        </header>

                        <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
                            {globalSearch ? (
                                <div className="max-w-5xl mx-auto space-y-12">
                                    <div className="flex items-center gap-3 text-blue-400 border-b border-blue-500/10 pb-4"><Search size={24} /><h2 className="text-xl font-black tracking-tight uppercase">ARAMA SONUÇLARI: "{globalSearch}"</h2></div>
                                    {allCategories.map(cat => {
                                        const matches = (node: any): boolean => node.title.toLowerCase().includes(globalSearch.toLowerCase()) || (node.keywords && node.keywords.some((k: string) => k.toLowerCase().includes(globalSearch.toLowerCase()))) || (node.subtopics && node.subtopics.some(matches));
                                        const filteredTopics = cat.topics?.filter(matches);
                                        if (!filteredTopics || filteredTopics.length === 0) return null;
                                        return (
                                            <div key={cat.id} className="bg-slate-800/20 rounded-3xl p-6 border border-slate-800/50">
                                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-6">{cat.title} KAYNAKLARI</h3>
                                                {filteredTopics.map((t: any) => renderRecursive(t))}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="max-w-5xl mx-auto">
                                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                                        <div>
                                            <p className="text-blue-500 font-black text-xs tracking-[0.4em] uppercase mb-2">Aktif Müfredat</p>
                                            <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none">{activeData?.title}</h2>
                                        </div>
                                        <div className="flex items-center gap-4 bg-slate-800/40 p-2 rounded-2xl border border-slate-700/30">
                                            <div className="px-4 py-2 bg-slate-900 rounded-xl border border-slate-700"><span className="text-blue-400 font-bold">{activeData?.topics?.length || 0}</span> <span className="text-slate-500 text-xs font-black uppercase ml-1">Konu</span></div>
                                            <div className="px-4 py-2 bg-emerald-900/20 rounded-xl border border-emerald-500/20"><span className="text-emerald-400 font-bold">{completedItems.size}</span> <span className="text-slate-500 text-xs font-black uppercase ml-1">Tamamlandı</span></div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {activeData?.topics?.slice(0, visibleCount[activeCategory] || 30).map((t: any) => renderRecursive(t))}
                                    </div>

                                    {activeData?.topics && activeData.topics.length > (visibleCount[activeCategory] || 30) && (
                                        <button onClick={() => setVisibleCount(p => ({ ...p, [activeCategory]: (p[activeCategory] || 30) + 30 }))} className="w-full mt-12 py-6 bg-slate-800/50 hover:bg-slate-800 border-2 border-dashed border-slate-700 hover:border-blue-500/50 text-slate-400 hover:text-blue-400 font-black uppercase tracking-widest rounded-3xl transition-all">DAHA FAZLA KONU YÜKLE <ChevronDown size={20} className="ml-2 inline" /></button>
                                    )}
                                </div>
                            )}
                        </div>
                    </main>
                </>
            )}
        </div>
    );
}
