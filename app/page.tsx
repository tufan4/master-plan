"use client";

import dynamic from 'next/dynamic';

const TypewriterSlogan = dynamic(() => import("@/components/TypewriterSlogan"), { ssr: false });
const HybridSidebar = dynamic(() => import("@/components/HybridSidebar"), { ssr: false });
const TutorialOverlay = dynamic(() => import("@/components/TutorialOverlay"), { ssr: false });
const AboutModal = dynamic(() => import("@/components/AboutModal"), { ssr: false });

import {
    syncCompletedTopics, fetchCompletedTopics, cacheImage, getCachedImages, cacheKeywords, getCachedKeywords
} from "@/lib/supabaseClient";
import CURRICULUM from "@/data/master-curriculum.json";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, ChevronDown, ChevronRight, CheckCircle2, Circle,
    Youtube, FileText, Book, X, Image as ImageIcon,
    Globe, MessageCircle, Sparkles, BookOpen, Info, Instagram, Linkedin,
    Github, Lightbulb, HelpCircle, Layout, Settings, Download, Leaf, Plus, Wand2, Trash2
} from "lucide-react";
import { generateDiverseKeywords, generateFullCurriculum, generateRelatedTopics } from "@/lib/geminiClient";
import { getDeepDiscoveryLink } from "@/lib/deepDiscovery";

// ==================== PLATFORMS ====================
const PLATFORMS = [
    // --- CORE ---
    { id: "youtube", name: "YouTube", icon: Youtube, color: "red" },
    { id: "google", name: "PDF", icon: FileText, color: "green" },
    { id: "reddit", name: "Reddit", icon: MessageCircle, color: "orange" },
    { id: "wikipedia", name: "Wiki", icon: Book, color: "gray" },
    { id: "github", name: "GitHub", icon: Github, color: "slate" },

    // --- ACADEMIC / PAPERS ---
    { id: "arxiv", name: "ArXiv", icon: FileText, color: "red" },
    { id: "ieee", name: "IEEE", icon: Globe, color: "blue" },
    { id: "semantic", name: "Semantic", icon: BookOpen, color: "cyan" },
    { id: "researchgate", name: "R.Gate", icon: Globe, color: "emerald" },
    { id: "sciencedirect", name: "SciDirect", icon: Book, color: "orange" },

    // --- CODING / DEV ---
    { id: "stackoverflow", name: "StackOver", icon: Layout, color: "orange" },
    { id: "mdn", name: "MDN Docs", icon: FileText, color: "black" },
    { id: "devto", name: "Dev.to", icon: Layout, color: "black" },
    { id: "leetcode", name: "LeetCode", icon: Settings, color: "yellow" },

    // --- COURSES ---
    { id: "udemy", name: "Udemy", icon: Lightbulb, color: "purple" },
    { id: "coursera", name: "Coursera", icon: Globe, color: "blue" },
    { id: "mitocw", name: "MIT OCW", icon: BookOpen, color: "slate" },
    { id: "khan", name: "Khan Acad", icon: Leaf, color: "green" },

    // --- TOOLS & MATH ---
    { id: "wolfram", name: "Wolfram", icon: Sparkles, color: "red" },
    { id: "desmos", name: "Desmos", icon: Layout, color: "green" },
    { id: "geogebra", name: "GeoGebra", icon: Circle, color: "blue" },

    // --- HARDWARE / MAKER ---
    { id: "arduino", name: "Arduino", icon: Settings, color: "cyan" },
    { id: "hackster", name: "Hackster", icon: Layout, color: "pink" },
    { id: "instructables", name: "Instruct", icon: Lightbulb, color: "yellow" },
    { id: "pinterest", name: "Pinterest", icon: Layout, color: "red" }
];

export default function MasterTufanOS() {
    // DYNAMIC CURRICULUM STATE
    const [allCategories, setAllCategories] = useState<any[]>([]);
    const [activeCategory, setActiveCategory] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiPrompt, setAiPrompt] = useState("");
    const [topicCount, setTopicCount] = useState(50); // User selectable count

    const [globalSearch, setGlobalSearch] = useState("");
    const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [activeControlPanel, setActiveControlPanel] = useState<string | null>(null);
    const [activePlatformPanel, setActivePlatformPanel] = useState<{ topicId: string; platform: string } | null>(null);
    const [showNewCurriculumModal, setShowNewCurriculumModal] = useState(false);

    const [language, setLanguage] = useState<'tr' | 'en'>('en');
    const [showImageGallery, setShowImageGallery] = useState<string | null>(null);
    const [imageThreshold, setImageThreshold] = useState(10);
    const [galleryImages, setGalleryImages] = useState<string[]>([]);
    const [generatingKeywords, setGeneratingKeywords] = useState(false);
    const [loadingImages, setLoadingImages] = useState(false);
    const [parentMap, setParentMap] = useState<Map<string, string>>(new Map());
    const [pulsingMatch, setPulsingMatch] = useState<string | null>(null);
    const [visibleCount, setVisibleCount] = useState<Record<string, number>>({});

    // GHOST CURRICULUM STATE (New Feature)
    const [ghostTopics, setGhostTopics] = useState<Record<string, string[]>>({});
    const [loadingGhost, setLoadingGhost] = useState<Record<string, boolean>>({});

    /**
     * Helper: Normalize Acronyms & Professional Casing
     */
    const normalizeTopic = (text: string): string => {
        const acronyms = ["plc", "kpss", "hmi", "scada", "api", "rest", "sql", "html", "css", "js", "vfd", "pid", "cad", "cam", "cnc", "iot", "ai", "ml", "nlp", "aws", "os", "ram", "cpu", "io", "usb", "tcp", "ip", "udp", "http", "https", "ssl", "tls", "git", "npm", "json", "xml", "pdf", "tyt", "ayt", "dgs", "ales", "yds", "yökdil", "lgs"];

        return text.split(' ').map(word => {
            const lower = word.toLowerCase().replace(/[.,!?;:]/g, '');
            if (acronyms.includes(lower)) return word.toUpperCase();
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join(' ');
    };

    // Load Ghost Topics from storage
    useEffect(() => {
        const saved = localStorage.getItem("ghostTopics");
        if (saved) setGhostTopics(JSON.parse(saved));
    }, []);

    // Initial Parent Map Calculation
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

    // LOAD CUSTOM CURRICULUMS
    useEffect(() => {
        const loadCustom = () => {
            try {
                const saved = localStorage.getItem("customCurriculums");
                if (saved) {
                    const parsed = JSON.parse(saved);
                    setAllCategories(parsed);
                    if (parsed.length > 0) setActiveCategory(parsed[0].id);
                }
            } catch (e) {
                console.error("Failed to load custom curriculums", e);
            }
        };
        loadCustom();
    }, []);

    const deleteCurriculum = (id: string) => {
        if (!confirm("Bu müfredatı silmek istediğinize emin misiniz?")) return;
        const updatedList = allCategories.filter(cat => cat.id !== id);
        setAllCategories(updatedList);
        localStorage.setItem("customCurriculums", JSON.stringify(updatedList.filter(c => c.isCustom)));

        // Remove ghost topics for this category
        const newGhosts = { ...ghostTopics };
        delete newGhosts[id];
        setGhostTopics(newGhosts);
        localStorage.setItem("ghostTopics", JSON.stringify(newGhosts));

        if (activeCategory === id) {
            if (updatedList.length > 0) setActiveCategory(updatedList[0].id);
            else setActiveCategory("");
        }
    };

    const createCurriculum = async (topic: string, count: number = 50) => {
        if (!topic.trim()) return;
        const finalPrompt = normalizeTopic(topic);
        setIsGenerating(true);
        try {
            const result = await generateFullCurriculum(finalPrompt, count);

            if (result && (result.categories || result.topics)) {
                let processedTopics = [];
                if (result.isMassive || result.topics) {
                    processedTopics = result.topics.map((t: any) => ({
                        ...t,
                        id: `t-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        subtopics: t.subtopics || []
                    }));
                } else if (result.categories) {
                    processedTopics = result.categories.map((cat: any) => ({
                        ...cat,
                        id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    }));
                }

                const mainContainer = {
                    id: `custom-${Date.now()}`,
                    title: finalPrompt,
                    isCustom: true,
                    topics: processedTopics
                };

                const updatedList = [...allCategories, mainContainer];
                setAllCategories(updatedList);
                localStorage.setItem("customCurriculums", JSON.stringify(updatedList.filter(c => c.isCustom)));

                setActiveCategory(mainContainer.id);
                setVisibleCount(prev => ({ ...prev, [mainContainer.id]: 20 }));
                setAiPrompt("");
                setShowNewCurriculumModal(false);
            } else {
                alert("AI geçerli bir müfredat üretemedi.");
            }
        } catch (error) {
            console.error("Generation error:", error);
            alert("Müfredat oluşturulurken hata oluştu.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateCurriculum = () => createCurriculum(aiPrompt, topicCount);

    const handleGenerateGhost = async (catId: string, title: string) => {
        setLoadingGhost(prev => ({ ...prev, [catId]: true }));
        try {
            const related = await generateRelatedTopics(title);
            if (related && related.length > 0) {
                const newGhosts = { ...ghostTopics, [catId]: related };
                setGhostTopics(newGhosts);
                localStorage.setItem("ghostTopics", JSON.stringify(newGhosts));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingGhost(prev => ({ ...prev, [catId]: false }));
        }
    };

    const handleCreateGhost = (topic: string) => {
        // Remove from ghost list potentially? Or keep? Keeping is safer.
        createCurriculum(topic, 50); // Default 50 depth for ghost topics
    };

    const [generatedKeywords, setGeneratedKeywords] = useState<Record<string, string[]>>({});
    const [showAboutModal, setShowAboutModal] = useState(false);
    const [runTutorial, setRunTutorial] = useState(false);
    const [searchPlaylist, setSearchPlaylist] = useState(false);
    const [searchShorts, setSearchShorts] = useState(false);

    // DATA RECOVERY
    useEffect(() => {
        const loadData = async () => {
            try {
                const supabaseData = await fetchCompletedTopics();
                if (supabaseData && supabaseData.length > 0) {
                    setCompletedItems(new Set(supabaseData));
                    return;
                }
            } catch (error) { console.log("Supabase unavailable"); }
            try {
                const localData = localStorage.getItem("completedTopics");
                if (localData) setCompletedItems(new Set(JSON.parse(localData)));
            } catch (error) { }
        };
        loadData();
    }, []);

    const levenshtein = (a: string, b: string): number => {
        const matrix = [];
        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
                }
            }
        }
        return matrix[b.length][a.length];
    };

    // SEARCH LOGIC
    useEffect(() => {
        if (globalSearch.trim()) {
            const searchLower = globalSearch.toLowerCase();
            const searchTerms = searchLower.split(' ').filter(t => t.length > 1);
            const expandAll = new Set<string>();
            const matchedIds: string[] = [];

            const searchCurriculum = (items: any[]) => {
                items.forEach(item => {
                    const match = item.title.toLowerCase().includes(searchLower) || (item.keywords && item.keywords.some((k: any) => k.toLowerCase().includes(searchLower)));
                    if (match) {
                        matchedIds.push(item.id);
                        expandAll.add(item.id);
                        let curr = parentMap.get(item.id);
                        while (curr) { expandAll.add(curr); curr = parentMap.get(curr); }
                    }
                    if (item.subtopics) searchCurriculum(item.subtopics);
                });
            };
            allCategories.forEach(cat => { if (cat.topics) searchCurriculum(cat.topics); }); // Include all categories in search

            if (matchedIds.length === 1) setPulsingMatch(matchedIds[0]);
            else setPulsingMatch(null);
            setExpandedItems(expandAll);
        } else {
            setExpandedItems(new Set());
            setPulsingMatch(null);
        }
    }, [globalSearch, parentMap, allCategories]); // Added allCategories dependency

    const getTotalCount = () => {
        let count = 0;
        const traverse = (items: any[]) => {
            items.forEach(item => {
                if (item.subtopics && item.subtopics.length > 0) traverse(item.subtopics);
                else count++;
            });
        };
        const activeData = allCategories.find((c: any) => c.id === activeCategory);
        if (activeData && activeData.topics) traverse(activeData.topics);
        return count;
    };

    const TOTAL = getTotalCount();
    const progress = TOTAL > 0 ? (completedItems.size / TOTAL) * 100 : 0;

    const toggleComplete = async (id: string) => {
        const newSet = new Set(completedItems);
        newSet.has(id) ? newSet.delete(id) : newSet.add(id);
        setCompletedItems(newSet);
        if (typeof window !== 'undefined') localStorage.setItem("completedTopics", JSON.stringify([...newSet]));
        try { await syncCompletedTopics([...newSet]); } catch (error) { }
    };

    const toggleExpand = (id: string) => {
        const newSet = new Set(expandedItems);
        newSet.has(id) ? newSet.delete(id) : newSet.add(id);
        setExpandedItems(newSet);
    };

    const resetApp = () => {
        setGlobalSearch("");
        setExpandedItems(new Set());
        setActiveControlPanel(null);
        setActivePlatformPanel(null);
        setShowImageGallery(null);
    };

    const handleDeepDive = async (platformId: string, query: string, lang: 'tr' | 'en') => {
        const platform = PLATFORMS.find(p => p.id === platformId);
        if (!platform) return;
        const newTab = window.open('', '_blank');
        if (newTab) {
            const color = platform.color || 'blue';
            newTab.document.write(`<style>body{background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:sans-serif}.loader{border:4px solid #334155;border-top:4px solid ${color};border-radius:50%;width:50px;height:50px;animation:spin 0.8s linear infinite}@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style><div class="loader"></div><div style="margin-top:20px;font-weight:bold">${query}</div>`);
        }
        try {
            const apiLink = await getDeepDiscoveryLink(platformId, query, lang);
            if (apiLink && apiLink.success && newTab) { newTab.location.href = apiLink.url; return; }

            // Fallback
            const searchUrlMap: Record<string, string> = {
                'youtube': `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}${searchShorts ? '&sp=EgIQCQ%253D%253D' : searchPlaylist ? '&sp=EgIQAw%253D%253D' : ''}`,
                'google': `https://www.google.com/search?q=${encodeURIComponent(query + ' filetype:pdf')}`,
                'wikipedia': `https://${lang}.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`,
                'reddit': `https://www.reddit.com/search/?q=${encodeURIComponent(query)}`,
                'github': `https://github.com/search?q=${encodeURIComponent(query)}`,
                'stackoverflow': `https://stackoverflow.com/search?q=${encodeURIComponent(query)}`,
                'medium': `https://medium.com/search?q=${encodeURIComponent(query)}`,
                'mdn': `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(query)}`,
                'arxiv': `https://arxiv.org/search/?query=${encodeURIComponent(query)}&searchtype=all`,
                'ieee': `https://ieeexplore.ieee.org/search/searchresult.jsp?newsearch=true&queryText=${encodeURIComponent(query)}`,
                'researchgate': `https://www.researchgate.net/search?q=${encodeURIComponent(query)}`,
                'sciencedirect': `https://www.sciencedirect.com/search?qs=${encodeURIComponent(query)}`,
                'coursera': `https://www.coursera.org/courses?query=${encodeURIComponent(query)}`,
                'udemy': `https://www.udemy.com/courses/search/?q=${encodeURIComponent(query)}`,
                'mitocw': `https://ocw.mit.edu/search/?q=${encodeURIComponent(query)}`,
                'khan': `https://www.khanacademy.org/search?page_search_query=${encodeURIComponent(query)}`,
                'wolfram': `https://www.wolframalpha.com/input/?i=${encodeURIComponent(query)}`,
                'desmos': `https://www.google.com/search?q=${encodeURIComponent(query + ' site:desmos.com/calculator')}`,
                'geogebra': `https://www.geogebra.org/search/${encodeURIComponent(query)}`,
                'arduino': `https://www.arduino.cc/search?q=${encodeURIComponent(query)}`,
                'hackster': `https://www.hackster.io/search?q=${encodeURIComponent(query)}`,
                'instructables': `https://www.instructables.com/howto/${encodeURIComponent(query)}/`,
                'pinterest': `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`,
                'leetcode': `https://leetcode.com/problemset/all/?search=${encodeURIComponent(query)}`,
                'devto': `https://dev.to/search?q=${encodeURIComponent(query)}`,
                'semantic': `https://www.semanticscholar.org/search?q=${encodeURIComponent(query)}`
            };

            let url = searchUrlMap[platformId] || `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            if (newTab) newTab.location.href = url;

        } catch (e) { if (newTab) newTab.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`; }
    };

    const loadImagesFromAPI = async (topic: string, topicId: string, count: number) => {
        setLoadingImages(true);
        const cached = getCachedImages(topicId);
        if (cached && cached.length >= count) { setGalleryImages(cached.slice(0, count)); setLoadingImages(false); return; }
        try {
            const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
            if (!accessKey) throw new Error("Key missing");
            const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(topic + ' engineering technical')}&per_page=${count}&client_id=${accessKey}`);
            const data = await response.json();
            const images = data.results.map((img: any) => img.urls.regular);
            cacheImage(topicId, images);
            setGalleryImages(images);
        } catch (error) {
            const placeholders = Array.from({ length: count }, (_, i) => `https://via.placeholder.com/400x300/1e293b/94a3b8?text=${encodeURIComponent(topic)}+${i + 1}`);
            setGalleryImages(placeholders);
        } finally { setLoadingImages(false); }
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
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="ml-4 mt-2 bg-slate-800/50 p-4 rounded-lg overflow-hidden">
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                {PLATFORMS.map(plat => (
                                    <button key={plat.id} onClick={(e) => { e.stopPropagation(); setActivePlatformPanel({ topicId: item.id, platform: plat.id }); }} className={`p-2 flex flex-col items-center rounded border ${activePlatformPanel?.topicId === item.id && activePlatformPanel?.platform === plat.id ? 'bg-blue-600/20 border-blue-500' : 'bg-slate-700/50 border-slate-600'}`}>
                                        <plat.icon size={16} className={activePlatformPanel?.platform === plat.id ? 'text-blue-400' : `text-${plat.color}-400`} />
                                        <span className="text-[9px] mt-1">{plat.name}</span>
                                    </button>
                                ))}
                                <button onClick={(e) => { e.stopPropagation(); setShowImageGallery(item.id); loadImagesFromAPI(item.title, item.id, 10); }} className="p-2 flex flex-col items-center rounded border border-purple-500/30 bg-purple-900/20"><ImageIcon size={16} className="text-purple-400" /><span className="text-[9px] mt-1">IMG</span></button>
                            </div>

                            {/* PLATFORM ACTIONS */}
                            {activePlatformPanel?.topicId === item.id && (
                                <div className="mt-3 p-2 bg-slate-900/50 rounded flex flex-col gap-2">
                                    <div className="flex gap-2 justify-between items-center text-xs text-blue-400 font-bold">
                                        <span>DİL / LANGUAGE</span>
                                        <button onClick={() => setActivePlatformPanel(null)}><X size={14} /></button>
                                    </div>
                                    <button onClick={() => handleDeepDive(activePlatformPanel!.platform, item.title, 'tr')} className="w-full text-left p-2 bg-slate-800 hover:bg-slate-700 rounded text-sm text-white">🇹🇷 Türkçe Ara</button>
                                    <button onClick={() => handleDeepDive(activePlatformPanel!.platform, item.en || item.title, 'en')} className="w-full text-left p-2 bg-slate-800 hover:bg-slate-700 rounded text-sm text-white">🇬🇧 English Search</button>
                                </div>
                            )}

                            {/* IMAGE GALLERY */}
                            {showImageGallery === item.id && (
                                <div className="mt-3">
                                    <div className="flex justify-between text-purple-400 text-xs font-bold mb-2"><span>GALLERY</span><button onClick={() => setShowImageGallery(null)}><X size={14} /></button></div>
                                    <div className="grid grid-cols-3 gap-2">{galleryImages.map((src, i) => <img key={i} src={src} className="w-full h-20 object-cover rounded cursor-pointer" onClick={() => window.open(src)} />)}</div>
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

    const activeData = allCategories.find((c: any) => c.id === activeCategory);
    const hasCurriculum = allCategories.length > 0;

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
            {!hasCurriculum && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 p-4">
                    <div className="max-w-3xl w-full text-center space-y-12">
                        <TypewriterSlogan />
                        <div className="relative group max-w-2xl mx-auto w-full mt-10">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-80 transition duration-1000"></div>
                            <div className="relative flex items-center bg-slate-900 rounded-2xl p-2 border border-slate-700/50">
                                <Sparkles className="ml-3 text-amber-400 animate-pulse" size={28} />
                                <input type="text" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleGenerateCurriculum()} placeholder="Ne öğrenmek istersin?" className="w-full bg-transparent border-none px-4 py-5 text-xl text-slate-100 focus:outline-none" autoFocus />
                                <button onClick={handleGenerateCurriculum} disabled={!aiPrompt.trim() || isGenerating} className="p-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-white transition-all shadow-lg">{isGenerating ? <div className="animate-spin border-2 border-white/30 border-t-white rounded-full w-6 h-6" /> : <ChevronRight size={28} />}</button>
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
                        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative">
                                <button onClick={() => setShowNewCurriculumModal(false)} className="absolute right-4 top-4 text-slate-500 hover:text-white"><X size={20} /></button>
                                <h3 className="text-xl font-bold text-white mb-6">Müfredat Oluşturucu</h3>
                                <input type="text" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleGenerateCurriculum()} placeholder="Konu başlığı..." className="w-full bg-slate-800 rounded-xl p-4 text-white mb-4 border border-slate-700 focus:border-blue-500 outline-none" />

                                <div className="bg-slate-800 p-4 rounded-xl mb-6">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Derinlik: {topicCount}</label>
                                    <input type="range" min="50" max="300" step="50" value={topicCount} onChange={(e) => setTopicCount(Number(e.target.value))} className="w-full mt-2 accent-blue-500" />
                                </div>
                                <button onClick={handleGenerateCurriculum} disabled={!aiPrompt.trim() || isGenerating} className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold">{isGenerating ? 'Üretiliyor...' : 'Oluştur'}</button>
                            </div>
                        </div>
                    )}

                    <HybridSidebar
                        categories={allCategories} activeCategory={activeCategory} setActiveCategory={setActiveCategory}
                        openAbout={() => setShowAboutModal(true)} setShowNewCurriculumModal={setShowNewCurriculumModal} deleteCategory={deleteCurriculum}
                        ghostTopics={ghostTopics} onGenerateGhost={handleGenerateGhost} onCreateGhost={handleCreateGhost} loadingGhost={loadingGhost}
                    />
                    <div className="lg:hidden w-[60px] shrink-0 bg-slate-900" />

                    <aside className="hidden lg:flex w-72 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700/50 flex-col overflow-y-auto custom-scrollbar">
                        <div className="p-6 border-b border-slate-700/50 mb-4 cursor-pointer" onClick={resetApp}>
                            <h1 className="text-2xl font-black text-slate-200 tracking-[0.2em] font-[family-name:var(--font-syncopate)] uppercase hover:text-white">MASTER TUFAN</h1>
                            <TypewriterSlogan />
                        </div>

                        <div className="px-4 space-y-4 flex-1">
                            <button onClick={() => setShowNewCurriculumModal(true)} className="w-full flex items-center justify-center gap-2 p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-500 rounded-lg transition-all font-medium"><Plus size={18} /><span>Müfredat Ekle</span></button>

                            {allCategories.map((cat: any) => (
                                <div key={cat.id} className="group">
                                    <div className={`rounded-lg transition-all ${activeCategory === cat.id ? 'bg-slate-800' : 'hover:bg-slate-800/50'}`}>
                                        <button onClick={() => setActiveCategory(cat.id)} className={`w-full text-left px-4 py-3 flex items-center justify-between ${activeCategory === cat.id ? 'text-blue-400 font-bold' : 'text-slate-400'}`}>
                                            <span className="truncate">{cat.title}</span>
                                        </button>

                                        {/* CUSTOM CATEGORY TOOLS */}
                                        {cat.isCustom && (
                                            <div className="px-4 pb-2">
                                                <div className="flex gap-3 border-t border-slate-700/50 pt-2 mb-2">
                                                    <button onClick={(e) => { e.stopPropagation(); deleteCurriculum(cat.id); }} className="text-[10px] text-red-500 hover:text-red-400 flex items-center gap-1 hover:bg-red-900/20 px-2 py-1 rounded"><Trash2 size={10} /> Sil</button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleGenerateGhost(cat.id, cat.title); }} className="text-[10px] text-purple-500 hover:text-purple-400 flex items-center gap-1 hover:bg-purple-900/20 px-2 py-1 rounded">
                                                        {loadingGhost[cat.id] ? <div className="w-2 h-2 rounded-full border border-purple-500 animate-spin" /> : <Wand2 size={10} />}
                                                        {loadingGhost[cat.id] ? '...' : 'Benzer Ekle'}
                                                    </button>
                                                </div>

                                                {/* GHOST TOPICS LIST */}
                                                {ghostTopics[cat.id] && ghostTopics[cat.id].length > 0 && (
                                                    <div className="space-y-1 pl-1 border-l border-slate-700/50 ml-1">
                                                        {ghostTopics[cat.id].map((topic, i) => (
                                                            <button key={i} onClick={() => handleCreateGhost(topic)} className="block w-full text-left text-[10px] text-slate-500 hover:text-blue-400 py-1 px-2 hover:bg-slate-700/30 rounded flex items-center gap-2">
                                                                <Plus size={8} /> {topic}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t border-slate-700/50 mt-auto">
                            <button onClick={() => setShowAboutModal(true)} className="w-full flex items-center justify-center gap-2 p-2 text-xs text-amber-500 hover:bg-slate-800 rounded"><Info size={14} /> Sistem Hakkında</button>
                        </div>
                    </aside>

                    <main className="flex-1 flex flex-col overflow-hidden bg-slate-900/50 relative">
                        <div className="border-b border-slate-800 bg-slate-900 p-4 flex gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input type="text" placeholder="Ara..." className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500" value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)} />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-600 font-mono">CMD+K</div>
                            </div>
                            <button onClick={() => setRunTutorial(true)} className="p-2 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-300"><HelpCircle size={20} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
                            {/* CONTENT RENDER */}
                            {globalSearch ? (
                                <div className="max-w-4xl mx-auto">
                                    <div className="mb-4 p-2 bg-blue-900/20 text-blue-400 text-sm font-bold rounded border border-blue-500/20 flex items-center gap-2"><Search size={16} /> SONUÇLAR: "{globalSearch}"</div>
                                    {/* SEARCH RESULTS LOGIC (Simplified for view) */}
                                    {allCategories.map(cat => {
                                        // Reuse recursive render
                                        const results = cat.topics?.map((t: any) => renderRecursive(t)).filter((x: any) => x != null); // Note: renderRecursive handles pulsing check internally
                                        if (!results) return null;
                                        // Need filter logic here actually?
                                        // The renderRecursive uses 'isPulsing' logic but doesn't hide non-matches unless we enforce it.
                                        // For correct search view, we should probably stick to previous logic or just let 'pulsing' guide users.
                                        // The previous logic filtered items. I will bring back concise filtering.
                                        const matches = (node: any): boolean => node.title.toLowerCase().includes(globalSearch.toLowerCase()) || (node.keywords && node.keywords.some((k: string) => k.toLowerCase().includes(globalSearch.toLowerCase()))) || (node.subtopics && node.subtopics.some(matches));

                                        if (matches({ title: cat.title, subtopics: cat.topics })) {
                                            return (
                                                <div key={cat.id} className="mb-8">
                                                    <h2 className="text-xl font-bold text-slate-200 mb-4 pb-2 border-b border-slate-800">{cat.title}</h2>
                                                    {cat.topics.filter(matches).map((t: any) => renderRecursive(t))}
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            ) : (
                                <div className="max-w-4xl mx-auto">
                                    <h2 className="text-3xl font-bold text-white mb-6 tracking-tight">{activeData?.title}</h2>
                                    <div className="space-y-4">
                                        {activeData?.topics?.slice(0, visibleCount[activeCategory] || 20).map((t: any) => renderRecursive(t))}
                                    </div>
                                    {activeData?.topics && activeData.topics.length > (visibleCount[activeCategory] || 20) && (
                                        <button onClick={() => setVisibleCount(p => ({ ...p, [activeCategory]: (p[activeCategory] || 20) + 20 }))} className="w-full py-4 mt-8 bg-slate-800 hover:bg-slate-700 text-blue-400 font-bold rounded-xl flex items-center justify-center gap-2">DAHA FAZLA GÖSTER <ChevronDown size={16} /></button>
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
