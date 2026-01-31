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
    Github, Lightbulb, HelpCircle, Layout, Settings, Download
} from "lucide-react";
import { generateDiverseKeywords } from "@/lib/geminiClient";

// ==================== PLATFORMS ====================
const PLATFORMS = [
    { id: "reddit", name: "Reddit", icon: MessageCircle, color: "orange" },
    { id: "wikipedia", name: "Wiki", icon: Book, color: "gray" },
    { id: "youtube", name: "YouTube", icon: Youtube, color: "red" },
    { id: "google", name: "PDF", icon: FileText, color: "green" },
    { id: "github", name: "GitHub", icon: Github, color: "slate" },
    { id: "udemy", name: "Course", icon: Lightbulb, color: "purple" },
    { id: "ieee", name: "IEEE", icon: Globe, color: "blue" },
    { id: "pinterest", name: "Pinterest", icon: Layout, color: "pink" }
];

export default function MasterTufanOS() {
    const [activeCategory, setActiveCategory] = useState(CURRICULUM.categories[0].id);
    const [globalSearch, setGlobalSearch] = useState("");
    const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [activeControlPanel, setActiveControlPanel] = useState<string | null>(null);
    const [showDictionary, setShowDictionary] = useState(false);
    const [activePlatformPanel, setActivePlatformPanel] = useState<{ topicId: string; platform: string } | null>(null);

    const [language, setLanguage] = useState<'tr' | 'en'>('en');
    const [showImageGallery, setShowImageGallery] = useState<string | null>(null);
    const [imageThreshold, setImageThreshold] = useState(10);
    const [galleryImages, setGalleryImages] = useState<string[]>([]);
    const [generatingKeywords, setGeneratingKeywords] = useState(false);
    const [loadingImages, setLoadingImages] = useState(false);
    const [parentMap, setParentMap] = useState<Map<string, string>>(new Map());
    const [pulsingMatch, setPulsingMatch] = useState<string | null>(null);

    useEffect(() => {
        const map = new Map<string, string>();
        const traverse = (items: any[], parentId: string | null) => {
            items.forEach(item => {
                if (parentId) map.set(item.id, parentId);
                if (item.subtopics) traverse(item.subtopics, item.id);
            });
        };
        CURRICULUM.categories.forEach(cat => { if (cat.topics) traverse(cat.topics, null); });
        setParentMap(map);
    }, []);

    const [generatedKeywords, setGeneratedKeywords] = useState<Record<string, string[]>>({});
    const [showAboutModal, setShowAboutModal] = useState(false);
    const [runTutorial, setRunTutorial] = useState(false);



    // DATA RECOVERY: Supabase → localStorage → Default
    useEffect(() => {
        const loadData = async () => {
            try {
                // Try Supabase first
                const supabaseData = await fetchCompletedTopics();
                if (supabaseData && supabaseData.length > 0) {
                    setCompletedItems(new Set(supabaseData));
                    return;
                }
            } catch (error) {
                console.log("Supabase unavailable, trying localStorage");
            }

            // Fallback to localStorage
            try {
                const localData = localStorage.getItem("completedTopics");
                if (localData) {
                    setCompletedItems(new Set(JSON.parse(localData)));
                }
            } catch (error) {
                console.error("Data recovery failed:", error);
            }
        };
        loadData();
    }, []);



    // ==================== HELPER: LEVENSHTEIN DISTANCE ====================
    const levenshtein = (a: string, b: string): number => {
        const matrix = [];
        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    };

    // ==================== UNIFIED SEARCH LOGIC (FUZZY) ====================
    useEffect(() => {
        if (globalSearch.trim()) {
            const searchLower = globalSearch.toLowerCase();
            const searchTerms = searchLower.split(' ').filter(t => t.length > 1); // Allow shorter words (2 chars)
            const expandAll = new Set<string>();

            // Fuzzy Match Config
            const MAX_DISTANCE = 2;

            const isFuzzyMatch = (text: string) => {
                if (!text) return false;
                const lower = text.toLowerCase();
                const words = lower.split(/[\s-]+/); // Split by space or dash

                // Check if ALL search terms match SOMETHING in the text
                return searchTerms.every(term =>
                    words.some(w => {
                        // Exact match or substring
                        if (w.includes(term)) return true;
                        // Fuzzy match (only if term is long enough)
                        if (term.length > 3 && levenshtein(w, term) <= MAX_DISTANCE) return true;
                        return false;
                    })
                );
            };

            // Dynamic Search with Progressive Filtering
            const matchedIds: string[] = [];

            const searchCurriculum = (items: any[]) => {
                items.forEach(item => {
                    const term = globalSearch.toLowerCase();
                    const match = item.title.toLowerCase().includes(term) || (item.keywords && item.keywords.some((k: any) => k.toLowerCase().includes(term)));

                    if (match) {
                        matchedIds.push(item.id);
                        expandAll.add(item.id);
                        // Smart Parent Expansion using parentMap
                        let curr = parentMap.get(item.id);
                        while (curr) { expandAll.add(curr); curr = parentMap.get(curr); }
                    }
                    if (item.subtopics) searchCurriculum(item.subtopics);
                });
            };

            CURRICULUM.categories.forEach(cat => {
                if (cat.topics) searchCurriculum(cat.topics);
            });

            // If only ONE result, trigger neon pulsing
            if (matchedIds.length === 1) {
                setPulsingMatch(matchedIds[0]);
            } else {
                setPulsingMatch(null);
            }

            setExpandedItems(expandAll);
        } else {
            setExpandedItems(new Set());
            setPulsingMatch(null);
        }
    }, [globalSearch, parentMap]);





    const getTotalCount = () => {
        let count = 0;
        const traverse = (items: any[]) => {
            items.forEach(item => {
                if (item.subtopics && item.subtopics.length > 0) {
                    traverse(item.subtopics);
                } else {
                    count++;
                }
            });
        };
        CURRICULUM.categories.forEach(cat => {
            if (cat.topics) traverse(cat.topics);
        });
        return count;
    };

    const TOTAL = getTotalCount();
    const progress = TOTAL > 0 ? (completedItems.size / TOTAL) * 100 : 0;

    const toggleComplete = async (id: string) => {
        const newSet = new Set(completedItems);
        newSet.has(id) ? newSet.delete(id) : newSet.add(id);
        setCompletedItems(newSet);

        // Save to localStorage immediately
        if (typeof window !== 'undefined') {
            localStorage.setItem("completedTopics", JSON.stringify([...newSet]));
        }

        // Try Supabase sync in background
        try {
            await syncCompletedTopics([...newSet]);
        } catch (error) {
            console.log("Supabase sync failed, data saved locally");
        }
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





    // Gemini AI keyword generation with cache-first approach
    const generateKeywordsWithAI = async (topic: string, topicId: string, threshold: number, baseKeywords: string[] = []): Promise<string[]> => {
        setGeneratingKeywords(true);

        // Check memory cache first
        if (generatedKeywords[topicId] && generatedKeywords[topicId].length >= threshold) {
            setGeneratingKeywords(false);
            return generatedKeywords[topicId].slice(0, threshold);
        }

        // Check localStorage cache
        const cached = getCachedKeywords(topicId);
        if (cached && cached.length >= threshold) {
            setGeneratedKeywords(prev => ({ ...prev, [topicId]: cached }));
            setGeneratingKeywords(false);
            return cached.slice(0, threshold);
        }

        try {
            const result = await generateDiverseKeywords(topic, language);

            // Cache keywords in both memory and localStorage
            setGeneratedKeywords(prev => ({ ...prev, [topicId]: result }));
            cacheKeywords(topicId, result);

            setGeneratingKeywords(false);
            return result;
        } catch (error) {
            console.error('Keyword generation error:', error);
            setGeneratingKeywords(false);
            return [topic];
        }
    };

    // Unsplash API direct image injection
    const loadImagesFromAPI = async (topic: string, topicId: string, count: number) => {
        setLoadingImages(true);

        // Check cache first
        const cached = getCachedImages(topicId);
        if (cached && cached.length >= count) {
            setGalleryImages(cached.slice(0, count));
            setLoadingImages(false);
            return;
        }

        try {
            const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
            if (!accessKey) {
                throw new Error("Unsplash API key not found");
            }

            const response = await fetch(
                `https://api.unsplash.com/search/photos?query=${encodeURIComponent(topic + ' engineering diagram technical')}&per_page=${count}&client_id=${accessKey}`
            );

            if (!response.ok) throw new Error('Unsplash API error');

            const data = await response.json();
            const images = data.results.map((img: any) => img.urls.regular);

            // Cache images
            cacheImage(topicId, images);

            setGalleryImages(images);
            setLoadingImages(false);
        } catch (error) {
            console.error('Image loading error:', error);
            // Fallback to placeholders
            const placeholders = Array.from({ length: count }, (_, i) =>
                `https://via.placeholder.com/400x300/1e293b/94a3b8?text=${encodeURIComponent(topic)}+${i + 1}`
            );
        }
    };

    const renderRecursive = (item: any, depth: number = 0) => {
        const isExpanded = expandedItems.has(item.id);
        const isCompleted = completedItems.has(item.id);
        const hasChildren = item.subtopics && item.subtopics.length > 0;
        const showPanel = activeControlPanel === item.id;
        const isPulsing = pulsingMatch === item.id;

        return (
            <div key={item.id} style={{ marginLeft: `${depth * 16}px` }} className="mb-1">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: 1,
                        boxShadow: isPulsing ? ['0 0 0px rgba(6, 182, 212, 0)', '0 0 20px rgba(6, 182, 212, 0.8)', '0 0 0px rgba(6, 182, 212, 0)'] : 'none'
                    }}
                    transition={isPulsing ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : {}}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${isPulsing ? 'bg-cyan-900/30 border-2 border-cyan-400 ring-2 ring-cyan-400/50' :
                        isCompleted ? 'bg-emerald-900/20 border-l-2 border-emerald-500' :
                            'bg-slate-800/30 hover:bg-slate-700/30'
                        }`}
                    onClick={() => {
                        setActiveControlPanel(showPanel ? null : item.id);
                    }}
                >
                    {hasChildren && (
                        <button onClick={(e) => { e.stopPropagation(); toggleExpand(item.id); }}>
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                    )}

                    <button
                        onClick={(e) => { e.stopPropagation(); toggleComplete(item.id); }}
                        className={isCompleted ? "text-emerald-400" : "text-slate-500"}
                    >
                        {isCompleted ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                    </button>

                    <div className="flex-1">
                        <span className="text-xs font-mono text-slate-500 mr-2">{item.id}</span>
                        <span className={`text-sm ${isCompleted ? 'text-emerald-300 line-through' : 'text-slate-200'}`}>
                            {item.title}
                        </span>
                    </div>
                </motion.div>

                {/* CONTROL PANEL */}
                <AnimatePresence>
                    {showPanel && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="ml-8 mt-2 bg-slate-800/50 rounded-lg p-4 border border-slate-700/50"
                        >
                            {/* AI SMART KEY BUTTON */}


                            <div className="flex gap-2 mb-3 flex-wrap">
                                {PLATFORMS.map(plat => {
                                    const Icon = plat.icon;
                                    const isActive = activePlatformPanel?.topicId === item.id && activePlatformPanel?.platform === plat.id;
                                    return (
                                        <div key={plat.id} className="relative group/tooltip flex flex-col items-center gap-1">
                                            <button
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    setActivePlatformPanel({ topicId: item.id, platform: plat.id });
                                                    await generateKeywordsWithAI(item.title, item.id, 20, item.keywords || []);
                                                }}
                                                className={`p-2 rounded-lg transition-all relative ${isActive ? 'bg-blue-600' : 'bg-slate-700/30 hover:bg-slate-600/50'
                                                    }`}
                                            >
                                                <Icon size={16} className={`text-${plat.color}-400`} />
                                            </button>

                                            {/* DYNAMIC LABEL */}
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 text-white text-[10px] rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                                                {plat.name}
                                                <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black/90" />
                                            </div>
                                        </div>
                                    );
                                })}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const newState = showImageGallery === item.id ? null : item.id;
                                        setShowImageGallery(newState);
                                        if (newState) {
                                            loadImagesFromAPI(item.title, item.id, imageThreshold);
                                        }
                                    }}
                                    className={`p-2 rounded-lg transition-all ${showImageGallery === item.id ? 'bg-purple-600' : 'bg-purple-900/30 hover:bg-purple-900/50'
                                        }`}
                                    title="Görselleştir"
                                >
                                    <ImageIcon size={16} className="text-purple-400" />
                                </button>
                            </div>

                            {/* PLATFORM PANEL WITH KEYWORDS */}
                            {activePlatformPanel?.topicId === item.id && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mb-3 p-3 bg-slate-700/30 rounded-lg border border-blue-500/20"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">AI Anahtar Kelimeler (20)</span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setLanguage('tr')}
                                                className={`px-3 py-1 rounded text-xs font-medium transition-all ${language === 'tr' ? 'bg-blue-600 text-white' : 'bg-slate-600 text-slate-300'
                                                    }`}
                                            >TR</button>
                                            <button
                                                onClick={() => setLanguage('en')}
                                                className={`px-3 py-1 rounded text-xs font-medium transition-all ${language === 'en' ? 'bg-blue-600 text-white' : 'bg-slate-600 text-slate-300'
                                                    }`}
                                            >EN</button>
                                        </div>
                                    </div>

                                    {/* LOADING BAR */}
                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-3">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500"
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: generatingKeywords ? '50%' : '100%',
                                                backgroundPosition: generatingKeywords ? ['0%', '100%'] : '0%'
                                            }}
                                            transition={{
                                                width: { duration: 1 },
                                                backgroundPosition: { duration: 2, repeat: Infinity }
                                            }}
                                        />
                                    </div>

                                    {generatingKeywords ? (
                                        <div className="text-center text-blue-400 text-sm font-medium animate-pulse">
                                            🔄 Generating 20 keywords with AI...
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-800/30 rounded">
                                            {generatedKeywords[item.id]?.slice(0, 20).map((kw, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={async () => {
                                                        if (!activePlatformPanel) return;
                                                        const platform = activePlatformPanel.platform;
                                                        const searchQuery = `${kw} ${item.title}`;
                                                        const randomUrls: Record<string, string> = {
                                                            youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}&sp=CAI%253D`,
                                                            google: `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}+filetype:pdf`,
                                                            reddit: `https://www.reddit.com/search/?q=${encodeURIComponent(searchQuery)}&sort=relevance`,
                                                            pinterest: `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(searchQuery)}`,
                                                            wikipedia: `https://${language}.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(kw)}`,
                                                            ieee: `https://ieeexplore.ieee.org/search/searchresult.jsp?queryText=${encodeURIComponent(searchQuery)}`,
                                                            udemy: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(searchQuery)}`,
                                                            github: `https://github.com/search?q=${encodeURIComponent(searchQuery)}&type=repositories`
                                                        };
                                                        const url = randomUrls[platform] || randomUrls.youtube;
                                                        window.open(url, '_blank');
                                                    }}
                                                    className="px-3 py-1 bg-blue-900/40 text-blue-300 rounded-full text-[10px] hover:bg-blue-900/60 transition-all hover:scale-105 truncate text-left"
                                                    title={kw}
                                                >{kw}</button>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* IMAGE GALLERY */}
                            {showImageGallery === item.id && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-3 p-3 bg-slate-700/30 rounded-lg border border-purple-500/20"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-purple-400 font-bold uppercase tracking-wider">Engineering Diagrams ({imageThreshold})</span>
                                        <button onClick={() => setShowImageGallery(null)} className="hover:bg-slate-600 rounded p-1">
                                            <X size={14} className="text-slate-400" />
                                        </button>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="25"
                                        value={imageThreshold}
                                        onChange={(e) => {
                                            const val = Number(e.target.value);
                                            setImageThreshold(val);
                                            loadImagesFromAPI(item.title, item.id, val);
                                        }}
                                        className="w-full mb-3 accent-purple-500"
                                    />
                                    {loadingImages ? (
                                        <div className="text-center text-purple-400 text-sm font-medium animate-pulse">🖼️ Loading images...</div>
                                    ) : (
                                        <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto p-1">
                                            {galleryImages.slice(0, imageThreshold).map((imgUrl, i) => (
                                                <motion.img
                                                    key={i}
                                                    src={imgUrl}
                                                    alt={`${item.title} ${i + 1}`}
                                                    className="w-full aspect-video object-cover rounded-lg cursor-pointer shadow-lg hover:ring-2 hover:ring-purple-500 transition-all"
                                                    whileHover={{ scale: 1.05 }}
                                                    onClick={() => window.open(imgUrl, '_blank')}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {hasChildren && isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            {item.subtopics.map((child: any) => renderRecursive(child, depth + 1))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    const activeData = CURRICULUM.categories.find((c: any) => c.id === activeCategory);

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">

            {/* MOBILE STRIP SIDEBAR (ALWAYS VISIBLE ON MOBILE) */}
            <div className="lg:hidden fixed left-0 top-0 bottom-0 w-[60px] bg-slate-900/90 backdrop-blur border-r border-slate-700/50 z-[45] flex flex-col items-center py-6 gap-4" onClick={(e) => e.stopPropagation()}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center font-black text-slate-900 text-xl shadow-lg shadow-amber-500/20 mb-2">M</div>
                <div className="flex flex-col gap-3 w-full items-center overflow-y-auto custom-scrollbar no-scrollbar flex-1 pb-20">
                    {CURRICULUM.categories.slice(0, 6).map((cat: any) => (
                        <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${activeCategory === cat.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-400/50' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}>
                            {cat.id.substring(0, 2)}
                        </button>
                    ))}
                </div>
                <button onClick={() => setShowAboutModal(true)} className="absolute bottom-6 p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors border border-slate-700"><Info size={20} /></button>
            </div>

            {/* MODALS */}


            {/* SessionHistoryPanel Removed - Integrated into topic view */}

            {/* TUTORIAL & ABOUT MODALS */}
            <TutorialOverlay
                forceRun={runTutorial}
                onComplete={() => setRunTutorial(false)}
            />
            <AboutModal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} />

            {/* HYBRID SIDEBAR (REPLACES MOBILE MENU) */}
            <HybridSidebar
                categories={CURRICULUM.categories}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                setShowDictionary={setShowDictionary}
                showDictionary={showDictionary}
                dictionaryCount={CURRICULUM.dictionary.length}
                openAbout={() => setShowAboutModal(true)}
            />
            {/* Main content padding adjustment for mobile sidebar space */}
            <div className="lg:hidden w-[60px] shrink-0 bg-slate-900" />

            {/* SIDEBAR */}
            <aside className="hidden lg:flex w-72 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700/50 flex-col overflow-y-auto custom-scrollbar">
                <div className="p-6 border-b border-slate-700/50">
                    {/* MASTER TUFAN HEADER */}
                    <div
                        className="cursor-pointer group mb-4"
                        onClick={resetApp}
                    >
                        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 hover:to-yellow-400 transition-all font-[family-name:var(--font-syncopate)] tracking-[0.15em] uppercase drop-shadow-sm">
                            Master Tufan
                        </h1>
                    </div>
                    <div className="mt-2">
                        <TypewriterSlogan />
                    </div>
                </div>

                <div className="p-4 space-y-2 flex-1">
                    {CURRICULUM.categories.map((cat: any) => (
                        <button
                            key={cat.id}
                            onClick={() => {
                                setActiveCategory(cat.id);
                                setShowDictionary(false);
                            }}
                            className={`w-full text-left px-4 py-3 rounded-xl transition-all ${activeCategory === cat.id && !showDictionary
                                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                                : 'bg-slate-700/30 hover:bg-slate-700/50 text-slate-300'
                                }`}
                        >
                            <span className="text-sm font-medium truncate block">{cat.id} {cat.title.split(' ')[0].replace(',', '')}</span>
                        </button>
                    ))}

                    {/* DICTIONARY MENU BUTTON */}
                    <button
                        onClick={() => {
                            setShowDictionary(true);
                            setActiveCategory('');
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${showDictionary
                            ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg'
                            : 'bg-slate-700/30 hover:bg-slate-700/50 text-slate-300'
                            }`}
                    >
                        <BookOpen size={18} />
                        <span className="text-sm font-medium">Sözlük ({CURRICULUM.dictionary.length})</span>
                    </button>
                </div>

                {/* ABOUT SECTION - BOTTOM OF SIDEBAR */}
                <div className="border-t border-slate-700/50 p-4 bg-slate-800/80">
                    <h3 className="text-xs font-bold text-amber-400 mb-3 flex items-center gap-2">
                        <Info size={16} />
                        HAKKINDA
                    </h3>

                    <div className="space-y-3 text-xs text-slate-400">
                        <div>
                            <p className="font-semibold text-amber-300 mb-1">Geliştirici</p>
                            <p className="text-slate-300">Emre Tufan</p>
                            <p className="text-slate-500">Kontrol ve Otomasyon</p>
                        </div>

                        <div>
                            <p className="font-semibold text-blue-300 mb-1">Sistem Özellikleri</p>
                            <ul className="space-y-1 text-slate-400">
                                <li>• 277+ Mühendislik Konusu</li>
                                <li>• AI Destekli Arama</li>
                                <li>• Unsplash Görseller</li>
                                <li>• Cloud Sync (Supabase)</li>
                            </ul>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <a
                                href="https://instagram.com/emretufan"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 rounded-lg text-white transition-all text-xs"
                            >
                                <Instagram size={14} />
                                Instagram
                            </a>
                            <a
                                href="https://linkedin.com/in/emretufan"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-lg text-white transition-all text-xs"
                            >
                                <Linkedin size={14} />
                                LinkedIn
                            </a>
                        </div>

                        <motion.div
                            className="pt-2 border-t border-slate-700/50 text-center"
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                    opacity: 1,
                                    transition: {
                                        staggerChildren: 0.05
                                    }
                                }
                            }}
                        >
                            <p className="italic text-slate-500 text-xs">
                                {Array.from("An Emre Tufan Masterpiece...").map((char, index) => (
                                    <motion.span
                                        key={index}
                                        variants={{
                                            hidden: { opacity: 0, x: -10 },
                                            visible: { opacity: 1, x: 0 }
                                        }}
                                    >
                                        {char}
                                    </motion.span>
                                ))}
                            </p>
                        </motion.div>
                    </div>
                </div>
            </aside>

            {/* MAIN */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* GLOBAL SEARCH TERMINAL - FIXED TOP */}
                <div className="bg-gradient-to-r from-slate-800 via-slate-800/95 to-slate-800 backdrop-blur-sm border-b border-amber-500/20 p-3 md:p-4 shadow-lg">
                    <div className="flex items-center gap-2 md:gap-3">
                        <Sparkles className="hidden sm:block text-amber-400 animate-pulse" size={24} />
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="🔍 MASTER SEARCH..."
                                className="w-full px-4 py-3 pl-10 md:pl-12 rounded-xl bg-slate-900/70 border-2 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-sm md:text-base"
                                value={globalSearch}
                                onChange={(e) => setGlobalSearch(e.target.value)}
                            />
                            <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-amber-400" size={18} />
                        </div>
                        <div className="hidden md:flex flex-col items-end gap-1 px-4">
                            <button
                                onClick={() => setRunTutorial(true)}
                                className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full text-xs font-bold shadow-lg hover:scale-105 transition-all mb-1"
                            >
                                <HelpCircle size={14} /> HOW TO USE?
                            </button>
                            <p className="text-3xl font-black text-emerald-400">{Math.round(progress)}%</p>
                            <p className="text-xs text-slate-500 font-mono">{completedItems.size} / {TOTAL}</p>
                        </div>
                    </div>
                </div>

                <header className="border-b border-slate-800 bg-slate-900/50 p-6">
                    <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                        {showDictionary ? "📖 Mühendislik Sözlüğü" : activeData?.title}
                    </h2>
                    {!showDictionary && (
                        <div className="h-3 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                            <motion.div
                                className="h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500"
                                animate={{
                                    width: `${progress}%`,
                                    backgroundPosition: ['0%', '200%']
                                }}
                                transition={{
                                    width: { duration: 0.5 },
                                    backgroundPosition: { duration: 3, repeat: Infinity }
                                }}
                            />
                        </div>
                    )}
                </header>

                <div className="flex-1 overflow-y-auto p-6">
                    {showDictionary ? (
                        /* DICTIONARY VIEW */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {CURRICULUM.dictionary
                                .sort((a: any, b: any) => a.term.localeCompare(b.term))
                                .filter((entry: any) => {
                                    if (!globalSearch.trim()) return true;
                                    const searchLower = globalSearch.toLowerCase();
                                    return (
                                        entry.term.toLowerCase().includes(searchLower) ||
                                        entry.tr.toLowerCase().includes(searchLower) ||
                                        entry.category.toLowerCase().includes(searchLower)
                                    );
                                })
                                .map((entry: any, idx: number) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.02 }}
                                        className="bg-slate-800/50 border border-purple-500/20 rounded-xl p-4 hover:bg-slate-800/70 hover:border-purple-500/40 transition-all"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-lg font-bold text-purple-300">{entry.term}</h3>
                                            <span className="text-xs px-2 py-1 bg-purple-900/30 rounded-full text-purple-400">
                                                {entry.category}
                                            </span>
                                        </div>
                                        <p className="text-sm text-amber-400 mb-2">🇹🇷 {entry.tr}</p>
                                        {entry.definition && (
                                            <p className="text-xs text-slate-400 italic">{entry.definition}</p>
                                        )}
                                    </motion.div>
                                ))}
                        </div>
                    ) : (
                        /* TOPICS VIEW */
                        activeData?.topics?.map((topic: any) => renderRecursive(topic))
                    )}
                </div>
            </main>
        </div>
    );
}
