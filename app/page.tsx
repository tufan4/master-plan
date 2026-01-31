"use client";

import dynamic from 'next/dynamic';

const TypewriterSlogan = dynamic(() => import("@/components/TypewriterSlogan"), { ssr: false });
const HybridSidebar = dynamic(() => import("@/components/HybridSidebar"), { ssr: false });
const TutorialOverlay = dynamic(() => import("@/components/TutorialOverlay"), { ssr: false });
const AboutModal = dynamic(() => import("@/components/AboutModal"), { ssr: false });

import {
    syncCompletedTopics, fetchCompletedTopics, cacheImage, getCachedImages, cacheKeywords, getCachedKeywords,
    saveLink, getSavedLinks, deleteLink, SavedLink
} from "@/lib/supabaseClient";
import CURRICULUM from "@/data/master-curriculum.json";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, ChevronDown, ChevronRight, CheckCircle2, Circle,
    Youtube, FileText, Book, X, Image as ImageIcon,
    Globe, MessageCircle, Sparkles, BookOpen, Info, Instagram, Linkedin,
    Github, Lightbulb, Pin, Trash2, HelpCircle, Layout
} from "lucide-react";

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
    const [keywordThreshold, setKeywordThreshold] = useState(25);
    const [language, setLanguage] = useState<'tr' | 'en'>('en');
    const [showImageGallery, setShowImageGallery] = useState<string | null>(null);
    const [imageThreshold, setImageThreshold] = useState(10);
    const [galleryImages, setGalleryImages] = useState<string[]>([]);
    const [generatingKeywords, setGeneratingKeywords] = useState(false);
    const [loadingImages, setLoadingImages] = useState(false);
    const [generatedKeywords, setGeneratedKeywords] = useState<Record<string, string[]>>({});
    const [showAboutModal, setShowAboutModal] = useState(false);
    // Explicit state to trigger re-run of tutorial
    const [runTutorial, setRunTutorial] = useState(false);
    const [savedLinks, setSavedLinks] = useState<Record<string, SavedLink[]>>({});

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

            const searchCurriculum = (items: any[]) => {
                items.forEach(item => {
                    const titleMatch = isFuzzyMatch(item.title);
                    const keywordMatch = item.keywords?.some((k: string) => isFuzzyMatch(k));

                    if (titleMatch || keywordMatch) {
                        expandAll.add(item.id);
                        // Smart Parent Expansion
                        if (item.id.includes('.')) {
                            const parts = item.id.split('.');
                            let runningId = parts[0];
                            expandAll.add(runningId);
                            for (let i = 1; i < parts.length; i++) {
                                runningId += '.' + parts[i];
                                expandAll.add(runningId);
                            }
                        }
                    }
                    if (item.subtopics) searchCurriculum(item.subtopics);
                });
            };

            CURRICULUM.categories.forEach(cat => {
                if (cat.topics) searchCurriculum(cat.topics);
            });

            setExpandedItems(expandAll);
        } else {
            setExpandedItems(new Set());
        }
    }, [globalSearch]);

    // ==================== SESSION HISTORY & PREVIEW SYSTEM ====================
    const [sessionLinks, setSessionLinks] = useState<Array<{
        id: string;
        topicId: string;
        platformId: string;
        title: string;
        originalTitle: string;
        url: string;
        thumbnail?: string;
        timestamp: number;
    }>>([]);

    const [showSessionPanel, setShowSessionPanel] = useState(false);
    const [showThresholdModal, setShowThresholdModal] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Auto-trigger threshold alert when 5 links are collected
    useEffect(() => {
        if (sessionLinks.length > 0 && sessionLinks.length % 5 === 0) {
            setShowThresholdModal(true);
        }
    }, [sessionLinks.length]);

    // Helper: Fetch Metadata (NoEmbed for Youtube, etc.)
    const fetchAndAddLink = async (platform: string, topic: string, topicId: string, url: string) => {
        let title = `${topic} (${PLATFORMS.find(p => p.id === platform)?.name})`;
        let thumbnail = "";

        // Attempt strict scraping via NoEmbed proxy
        if (url.includes('youtube') || url.includes('youtu.be')) {
            try {
                const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
                const data = await res.json();
                if (data.title) title = data.title;
                if (data.thumbnail_url) thumbnail = data.thumbnail_url;
            } catch (e) {
                console.warn("Metadata fetch failed", e);
            }
        } else if (platform === 'reddit') {
            title = `Reddit: ${topic}`;
        }

        const newLink = {
            id: Date.now().toString(),
            topicId,
            platformId: platform,
            title,
            originalTitle: topic,
            url,
            thumbnail,
            timestamp: Date.now()
        };

        setSessionLinks(prev => {
            if (prev.some(l => l.url === url)) return prev; // Avoid duplicates
            return [...prev, newLink];
        });
    };

    // --- COMPONENT: PREVIEW MODAL ---
    const PreviewModal = () => {
        if (!previewUrl) return null;
        const safeUrl = previewUrl.includes('youtube.com') || previewUrl.includes('youtu.be')
            ? previewUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')
            : `https://www.printfriendly.com/print?url=${encodeURIComponent(previewUrl)}`;

        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-[95%] sm:w-full sm:max-w-6xl h-[70vh] sm:h-[85vh] bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-700 flex flex-col shadow-2xl overflow-hidden">
                    <div className="p-3 border-b border-slate-700 flex justify-between items-center bg-slate-800">
                        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2"><BookOpen size={16} className="text-blue-400" /> Önizleme</h3>
                        <div className="flex gap-2">
                            <a href={previewUrl} target="_blank" className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-500 transition">Orjinalini Aç</a>
                            <button onClick={() => setPreviewUrl(null)} className="p-1 hover:bg-slate-700 rounded text-slate-400"><X size={20} /></button>
                        </div>
                    </div>
                    <div className="flex-1 bg-white relative">
                        <iframe src={safeUrl} className="w-full h-full" title="Preview" sandbox="allow-same-origin allow-scripts allow-popups allow-forms" />
                    </div>
                </motion.div>
            </div>
        );
    };

    // --- COMPONENT: THRESHOLD ALERT ---
    const ThresholdModal = () => {
        if (!showThresholdModal) return null;
        return (
            <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-slate-900 border border-amber-500/50 p-6 rounded-2xl w-[90%] max-w-lg shadow-2xl">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-amber-900/40 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-400"><Book size={32} /></div>
                        <h3 className="text-2xl font-bold text-white mb-2">Verimli Bir Oturum! 🔥</h3>
                        <p className="text-slate-300 mb-6">Şu ana kadar <span className="text-amber-400 font-bold">{sessionLinks.length} farklı kaynağa</span> göz attın. Oturum Çantanda biriktiler. İncelemek ister misin?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowThresholdModal(false)} className="flex-1 py-3 bg-slate-800 text-slate-400 rounded-xl hover:bg-slate-700 font-medium">Sonra</button>
                            <button onClick={() => { setShowThresholdModal(false); setShowSessionPanel(true); }} className="flex-1 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-500 font-bold shadow-lg">Listeyi İncele</button>
                        </div>
                    </div>
                </motion.div>
            </div>
        )
    }

    // --- COMPONENT: SESSION HISTORY PANEL ---
    const SessionHistoryPanel = () => {
        if (!showSessionPanel) return (
            <button onClick={() => setShowSessionPanel(true)} className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 bg-emerald-600 text-white p-3 sm:p-4 rounded-full shadow-2xl hover:bg-emerald-500 hover:scale-105 transition-all flex items-center gap-2 group">
                <div className="relative"><Layout size={24} />{sessionLinks.length > 0 && (<span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">{sessionLinks.length}</span>)}</div>
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap px-0 group-hover:px-2">Oturum Geçmişi</span>
            </button>
        );

        return (
            <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-0 left-0 right-0 sm:left-auto sm:right-6 sm:bottom-6 z-50 w-full sm:w-96 h-[60vh] sm:h-auto sm:max-h-[80vh] bg-slate-900 border-t sm:border border-slate-700 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-white flex items-center gap-2"><Layout size={18} className="text-emerald-400" /> Oturum Çantası</h3>
                    <div className="flex gap-2">
                        <button onClick={() => { if (confirm("Temizle?")) setSessionLinks([]); }} className="text-xs text-red-400 hover:text-red-300">Temizle</button>
                        <button onClick={() => setShowSessionPanel(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar bg-slate-900/95">
                    {sessionLinks.length === 0 ? (<div className="text-center py-10 text-slate-500 text-sm">Çanta boş.</div>) : (
                        sessionLinks.map((link) => (
                            <div key={link.id} className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 hover:border-emerald-500/30 transition group">
                                <div className="flex gap-3">
                                    {link.thumbnail ? (<img src={link.thumbnail} alt="thumb" className="w-16 h-16 object-cover rounded bg-black" />) : (<div className="w-16 h-16 bg-slate-800 rounded flex items-center justify-center text-slate-600"><Globe size={24} /></div>)}
                                    <div className="flex-1 min-w-0">
                                        <input value={link.title} onChange={(e) => { const val = e.target.value; setSessionLinks(prev => prev.map(p => p.id === link.id ? { ...p, title: val } : p)); }} className="w-full bg-transparent text-sm text-slate-200 font-medium focus:outline-none border-b border-transparent focus:border-emerald-500 pb-1 mb-1 truncate" />
                                        <p className="text-xs text-slate-500 truncate">{link.url}</p>
                                        <div className="flex gap-2 mt-2">
                                            <button onClick={async () => { await saveLink({ topic_id: link.topicId, title: link.title, url: link.url, platform: link.platformId }); loadLinksForTopic(link.topicId); setSessionLinks(prev => prev.filter(p => p.id !== link.id)); }} className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] px-2 py-1 rounded flex items-center gap-1"><Pin size={10} /> Kaydet</button>
                                            {(link.url.includes('youtube') || link.url.includes('youtu.be')) && (<button onClick={() => window.open(link.url.replace('youtube.com', 'ssyoutube.com').replace('youtu.be/', 'ssyoutube.com/'), '_blank')} className="bg-red-600 hover:bg-red-500 text-white text-[10px] px-2 py-1 rounded flex items-center gap-1"><Pin size={10} className="rotate-180" /> İndir</button>)}
                                            <button onClick={() => setSessionLinks(prev => prev.filter(p => p.id !== link.id))} className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-[10px] px-2 py-1 rounded ml-auto"><Trash2 size={10} /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </motion.div>
        );
    };








    const PreviewModal_OLD = () => {
        if (!previewUrl) return null;
        // Use PrintFriendly for article-like content as a proxy previewer
        const safeUrl = previewUrl.includes('youtube.com')
            ? previewUrl.replace('watch?v=', 'embed/')
            : `https://www.printfriendly.com/print?url=${encodeURIComponent(previewUrl)}`;

        return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-6xl h-[85vh] bg-slate-900 rounded-2xl border border-slate-700 flex flex-col shadow-2xl overflow-hidden"
                >
                    <div className="p-3 border-b border-slate-700 flex justify-between items-center bg-slate-800">
                        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                            <BookOpen size={16} className="text-blue-400" /> Quick Preview
                        </h3>
                        <div className="flex gap-2">
                            <a
                                href={previewUrl}
                                target="_blank"
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-500 transition"
                            >
                                Open Original
                            </a>
                            <button onClick={() => setPreviewUrl(null)} className="p-1 hover:bg-slate-700 rounded text-slate-400">
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 bg-white relative">
                        <iframe
                            src={safeUrl}
                            className="w-full h-full"
                            title="Preview"
                            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                        />
                    </div>
                </motion.div>
            </div>
        );
    };
    const loadLinksForTopic = async (topicId: string) => {
        const links = await getSavedLinks(topicId);
        setSavedLinks(prev => ({ ...prev, [topicId]: links }));
    };

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
            const keywords = new Set(baseKeywords);
            // Add language specific keywords
            const langSuffix = language === 'tr' ? ' ders anlatımı' : ' tutorial';
            keywords.add(topic + langSuffix);

            // AI-style keyword expansion (fallback logic until Gemini API is connected)
            const variations = [
                topic,
                `${topic} ${language === 'tr' ? 'nedir' : 'explained'}`,
                `${topic} ${language === 'tr' ? 'kullanımı' : 'guide'}`,
                `${topic} ${language === 'tr' ? 'örnekler' : 'examples'}`,
                `${topic} ${language === 'tr' ? 'uygulamalar' : 'applications'}`,
                `${topic} ${language === 'tr' ? 'mühendislik' : 'engineering'}`
            ];

            variations.forEach(v => {
                if (keywords.size < threshold) keywords.add(v);
            });

            const result = Array.from(keywords).slice(0, threshold);

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
            setGalleryImages(placeholders);
            setLoadingImages(false);
        }
    };

    const getPlatformUrl = (platform: string, topic: string, keywords: string[]) => {
        const isPDF = platform === "google";
        const enhancedKeywords = isPDF ? keywords.map(k => `${k} filetype:pdf`) : keywords;

        // Language filtering
        let langQuery = "";
        if (language === 'tr') langQuery = " site:tr OR language:tr";

        const query = enhancedKeywords.join(" OR ") + langQuery;

        // Detailed Language Params for specific sites
        const hl = language === 'tr' ? '&hl=tr&gl=tr' : '&hl=en&gl=us';

        switch (platform) {
            case "reddit": return `https://www.reddit.com/search/?q=${encodeURIComponent(query)}`;
            case "wikipedia": return `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(topic)}${language === 'tr' ? '&go=Git' : ''}`; // Wikipedia checks browser lang usually, or we prefix tr.wikipedia
            case "youtube": return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
            case "google": return `https://www.google.com/search?q=${encodeURIComponent(query)}${hl}`;
            case "github": return `https://github.com/search?q=${encodeURIComponent(query + " language:c OR language:python")}&type=code`;
            case "udemy": return `https://www.udemy.com/courses/search/?q=${encodeURIComponent(topic)}&lang=${language}`;
            case "ieee": return `https://ieeexplore.ieee.org/search/searchresult.jsp?newsearch=true&queryText=${encodeURIComponent(topic)}`;
            case "pinterest": return `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(topic + " schematics diagram")}`;
            default: return `https://google.com/search?q=${encodeURIComponent(query)}`;
        }
    };

    const handlePlatformClick = (platform: string, topic: string, topicId: string, keywords: string[]) => {
        const url = getPlatformUrl(platform, topic, keywords);
        window.open(url, '_blank');

        // Add to session history silently
        fetchAndAddLink(platform, topic, topicId, url);
    };

    // Old manual save function reserved for context menu if needed, but replaced by modal flow largely
    const saveCurrentResource = async (topicId: string, platformId: string, topicTitle: string, keywords: string[]) => {
        // ... existing implementation
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
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${isCompleted ? 'bg-emerald-900/20 border-l-2 border-emerald-500' : 'bg-slate-800/30 hover:bg-slate-700/30'
                        }`}
                    onClick={() => {
                        setActiveControlPanel(showPanel ? null : item.id);
                        if (!showPanel) loadLinksForTopic(item.id);
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
                            <div className="flex gap-2 mb-3 flex-wrap">
                                {PLATFORMS.map(plat => {
                                    const Icon = plat.icon;
                                    const isActive = activePlatformPanel?.topicId === item.id && activePlatformPanel?.platform === plat.id;
                                    return (
                                        <div key={plat.id} className="relative group/tooltip flex flex-col items-center gap-1">
                                            <button
                                                onClick={async () => {
                                                    setActivePlatformPanel({ topicId: item.id, platform: plat.id });
                                                    await generateKeywordsWithAI(item.title, item.id, keywordThreshold, item.keywords || []);
                                                    handlePlatformClick(plat.id, item.title, item.id, item.keywords || []);
                                                }}
                                                className={`p-2 rounded-lg transition-all relative ${isActive ? 'bg-blue-600' : 'bg-slate-700/30 hover:bg-slate-600/50'
                                                    }`}
                                            >
                                                <Icon size={16} className={`text-${plat.color}-400`} />

                                                {/* QUICK PIN BUTTON ON HOVER */}
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        saveCurrentResource(item.id, plat.id, item.title, item.keywords || []);
                                                    }}
                                                    className="absolute -right-2 -top-2 bg-slate-900 border border-slate-700 rounded-full p-1 opacity-0 group-hover/tooltip:opacity-100 transition-opacity hover:bg-emerald-600 z-10"
                                                    title="Pin to System"
                                                >
                                                    <Pin size={8} className="text-white" />
                                                </div>
                                            </button>

                                            {/* DYNAMIC LABEL (Click-to-Reveal / Hover) */}
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 text-white text-[10px] rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                                                {plat.name}
                                                <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black/90" />
                                            </div>
                                        </div>
                                    );
                                })}
                                <button
                                    onClick={() => {
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

                            {/* PLATFORM PANEL WITH SLIDER & LANGUAGE */}
                            {activePlatformPanel?.topicId === item.id && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mb-3 p-3 bg-slate-700/30 rounded-lg border border-blue-500/20"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-slate-400 font-semibold">Keyword Threshold: {keywordThreshold}</span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setLanguage('tr')}
                                                className={`px-3 py-1 rounded text-xs font-medium transition-all ${language === 'tr' ? 'bg-blue-600 text-white' : 'bg-slate-600 text-slate-300'
                                                    }`}
                                            >
                                                TR
                                            </button>
                                            <button
                                                onClick={() => setLanguage('en')}
                                                className={`px-3 py-1 rounded text-xs font-medium transition-all ${language === 'en' ? 'bg-blue-600 text-white' : 'bg-slate-600 text-slate-300'
                                                    }`}
                                            >
                                                EN
                                            </button>
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="50"
                                        value={keywordThreshold}
                                        onChange={async (e) => {
                                            const val = Number(e.target.value);
                                            setKeywordThreshold(val);
                                            if (activePlatformPanel) {
                                                await generateKeywordsWithAI(item.title, item.id, val, item.keywords || []);
                                            }
                                        }}
                                        className="w-full mb-3 accent-blue-500"
                                    />

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
                                            🔄 Generating keywords...
                                        </div>
                                    ) : (
                                        <div className="flex gap-2 flex-wrap max-h-48 overflow-y-auto p-2 bg-slate-800/30 rounded">
                                            {generatedKeywords[item.id]?.slice(0, keywordThreshold).map((kw, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => activePlatformPanel && handlePlatformClick(activePlatformPanel.platform, item.title, item.id, [kw])}
                                                    className="px-3 py-1 bg-blue-900/40 text-blue-300 rounded-full text-xs hover:bg-blue-900/60 transition-all hover:scale-105"
                                                >
                                                    {kw}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* SAVED LINKS SECTION */}
                            {savedLinks[item.id] && savedLinks[item.id].length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-3 p-3 bg-slate-900/40 rounded-lg border border-emerald-500/20"
                                >
                                    <h4 className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-2">
                                        <Pin size={12} /> SAVED RESOURCES
                                    </h4>
                                    <div className="space-y-1">
                                        {savedLinks[item.id].map((link) => (
                                            <div key={link.id} className="flex justify-between items-center group/link p-2 hover:bg-slate-800 rounded">
                                                <a
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-xs text-slate-300 hover:text-emerald-300 truncate flex-1 mr-2"
                                                >
                                                    {link.title}
                                                </a>
                                                <div className="flex gap-1 opacity-0 group-hover/link:opacity-100 transition-opacity">
                                                    {/* PRINT / PDF VIEW */}
                                                    <button
                                                        onClick={() => window.open(`https://www.printfriendly.com/print?url=${encodeURIComponent(link.url)}`, '_blank')}
                                                        className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-blue-400"
                                                        title="View as PDF / Print Friendly"
                                                    >
                                                        <FileText size={12} />
                                                    </button>
                                                    {/* DOWNLOAD (If applicable, attempts download) */}
                                                    <a
                                                        href={link.url}
                                                        download
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-emerald-400"
                                                        title="Download Source"
                                                    >
                                                        <Pin size={12} className="rotate-180" /> {/* Reuse Pin icon rotated as download symbol style */}
                                                    </a>
                                                    {/* DELETE */}
                                                    <button
                                                        onClick={() => {
                                                            deleteLink(link.id);
                                                            loadLinksForTopic(item.id);
                                                        }}
                                                        className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400"
                                                        title="Remove Pin"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* IMAGE GALLERY - DIRECT INJECTION */}
                            {showImageGallery === item.id && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-3 bg-slate-700/30 rounded-lg border border-purple-500/20"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-slate-400 font-semibold">Images: {imageThreshold}</span>
                                        <button
                                            onClick={() => setShowImageGallery(null)}
                                            className="hover:bg-slate-600 rounded p-1"
                                        >
                                            <X size={14} className="text-slate-400" />
                                        </button>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
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
                                        <div className="text-center text-purple-400 text-sm font-medium animate-pulse">
                                            🖼️ Loading images...
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto p-2 bg-slate-800/30 rounded">
                                            {galleryImages.slice(0, imageThreshold).map((imgUrl, i) => (
                                                <motion.img
                                                    key={i}
                                                    src={imgUrl}
                                                    alt={`${item.title} ${i + 1}`}
                                                    className="w-full aspect-video object-cover rounded-lg cursor-pointer shadow-lg"
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

                {/* RECURSIVE CHILDREN */}
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
            </div >
        );
    };

    const activeData = CURRICULUM.categories.find((c: any) => c.id === activeCategory);

    return (
        <div className="flex h-screen bg-slate-900 text-slate-100">
            {/* MODALS */}
            <PreviewModal />
            <ThresholdModal />
            <SessionHistoryPanel />

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
                        className="cursor-pointer group mb-2"
                        onClick={resetApp}
                    >
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 hover:from-amber-300 hover:via-yellow-400 hover:to-amber-300 transition-all">
                            MASTER TUFAN
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
