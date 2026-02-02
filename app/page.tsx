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
    Github, Lightbulb, HelpCircle, Layout, Settings, Download, Leaf
} from "lucide-react";
import { generateDiverseKeywords } from "@/lib/geminiClient";
import { getDeepDiscoveryLink } from "@/lib/deepDiscovery";

// ==================== PLATFORMS ====================
// ==================== PLATFORMS (25 ACADEMIC & ENGINEERING SITES) ====================
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
    const [searchPlaylist, setSearchPlaylist] = useState(false); // New state for playlist toggle



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





    // ==================== DEEP DIVE HANDLER (Level 2 Scraping) ====================
    const handleDeepDive = async (platformId: string, query: string, lang: 'tr' | 'en') => {
        const platform = PLATFORMS.find(p => p.id === platformId);
        if (!platform) return;

        // 1. Open Tab Immediately (Bypass Blockers)
        const newTab = window.open('', '_blank');
        if (newTab) {
            const color = platform.color || 'blue';
            newTab.document.write(`
                <style>
                    body{background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;flex-direction:column;margin:0} 
                    .loader{border:4px solid #334155;border-top:4px solid ${color === 'red' ? '#ef4444' : color === 'green' ? '#22c55e' : color === 'orange' ? '#f97316' : '#3b82f6'};border-radius:50%;width:50px;height:50px;animation:spin 0.8s linear infinite;margin-bottom:1.5rem} 
                    @keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}} 
                    .title{font-size:1.5rem;font-weight:bold;margin-bottom:0.5rem;text-align:center} 
                    .sub{font-size:0.9rem;opacity:0.6;text-transform:uppercase;letter-spacing:1px}
                    .status{font-size:0.8rem;margin-top:10px;color:#94a3b8;font-style:italic}
                </style>
                <div class="loader"></div>
                <div class="title">${query}</div>
                <div class="sub">Accessing ${platform.name}...</div>
                <div class="status" id="status">Connecting via Neural Link...</div>
            `);
        }

        try {
            // 2. Attempt Level 1 API Deep Link (Reddit/Wiki/YouTube/etc.)
            if (newTab && newTab.document.getElementById('status')) newTab.document.getElementById('status')!.innerText = "Connecting to Knowledge Base...";

            const apiLink = await getDeepDiscoveryLink(platformId, query, lang);

            if (apiLink && apiLink.success) {
                if (newTab) newTab.location.href = apiLink.url;
                return;
            }

            // 3. Fallback to Direct Search (No Random Scraping)
            if (newTab && newTab.document.getElementById('status')) newTab.document.getElementById('status')!.innerText = "Redirecting to Search Results...";

            let url: string;
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

            if (platformId === 'reddit') {
                query = `${query} site:reddit.com`;
            } else if (platformId === 'youtube') {
                const playlistParam = searchPlaylist ? '&sp=EgIQAw%253D%253D' : ''; // Filter for Playlists
                if (isMobile) {
                    // Mobile Deep Link
                    window.location.href = `vnd.youtube://results?search_query=${encodeURIComponent(query)}${playlistParam}`;
                    // Fallback timeout
                    setTimeout(() => {
                        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}${playlistParam}`, '_blank');
                    }, 1000);
                    return;
                } else {
                    url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}${playlistParam}`;
                }
            } else if (platformId === 'medium') {
                query = `${query} site:medium.com`;
            } else if (platformId === 'wikipedia') {
                url = `https://${lang}.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`;
            } else if (platformId === 'google') {
                url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            } else if (platformId === 'github') {
                url = `https://github.com/search?q=${encodeURIComponent(query)}`;
            } else if (platformId === 'arxiv') {
                url = `https://arxiv.org/search/?query=${encodeURIComponent(query)}&searchtype=all`;
            } else if (platformId === 'ieee') {
                url = `https://ieeexplore.ieee.org/search/searchresult.jsp?queryText=${encodeURIComponent(query)}`;
            } else if (platformId === 'semantic') {
                url = `https://www.semanticscholar.org/search?q=${encodeURIComponent(query)}`;
            } else if (platformId === 'researchgate') {
                url = `https://www.researchgate.net/search?q=${encodeURIComponent(query)}`;
            } else if (platformId === 'sciencedirect') {
                url = `https://www.sciencedirect.com/search?qs=${encodeURIComponent(query)}`;
            } else if (platformId === 'stackoverflow') {
                url = `https://stackoverflow.com/search?q=${encodeURIComponent(query)}`;
            } else if (platformId === 'mdn') {
                url = `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(query)}`;
            } else if (platformId === 'devto') {
                url = `https://dev.to/search?q=${encodeURIComponent(query)}`;
            } else if (platformId === 'leetcode') {
                url = `https://leetcode.com/problemset/all/?search=${encodeURIComponent(query)}`;
            } else if (platformId === 'udemy') {
                url = `https://www.udemy.com/courses/search/?q=${encodeURIComponent(query)}`;
            } else if (platformId === 'coursera') {
                url = `https://www.coursera.org/search?query=${encodeURIComponent(query)}`;
            } else if (platformId === 'mitocw') {
                url = `https://ocw.mit.edu/search/?q=${encodeURIComponent(query)}`;
            } else if (platformId === 'khan') {
                url = `https://www.khanacademy.org/search?page_search_query=${encodeURIComponent(query)}`;
            } else if (platformId === 'wolfram') {
                url = `https://www.wolframalpha.com/input?i=${encodeURIComponent(query)}`;
            } else if (platformId === 'desmos') {
                url = `https://www.google.com/search?q=site:desmos.com+${encodeURIComponent(query)}`;
            } else if (platformId === 'geogebra') {
                url = `https://www.geogebra.org/search/${encodeURIComponent(query)}`;
            } else if (platformId === 'arduino') {
                url = `https://www.arduino.cc/search?q=${encodeURIComponent(query)}`;
            } else if (platformId === 'hackster') {
                url = `https://www.hackster.io/search?q=${encodeURIComponent(query)}`;
            } else if (platformId === 'instructables') {
                url = `https://www.instructables.com/search/?q=${encodeURIComponent(query)}`;
            } else if (platformId === 'pinterest') {
                url = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`;
            } else {
                url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            }

            // Construct Direct Search URL
            const randomUrls: Record<string, string> = {
                youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
                google: `https://www.google.com/search?q=${encodeURIComponent(query)}+filetype:pdf`,
                reddit: `https://www.reddit.com/search/?q=${encodeURIComponent(query)}`,
                wikipedia: `https://${lang}.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`,
                github: `https://github.com/search?q=${encodeURIComponent(query)}`,
                arxiv: `https://arxiv.org/search/?query=${encodeURIComponent(query)}&searchtype=all`,
                ieee: `https://ieeexplore.ieee.org/search/searchresult.jsp?queryText=${encodeURIComponent(query)}`,
                semantic: `https://www.semanticscholar.org/search?q=${encodeURIComponent(query)}`,
                researchgate: `https://www.researchgate.net/search?q=${encodeURIComponent(query)}`,
                sciencedirect: `https://www.sciencedirect.com/search?qs=${encodeURIComponent(query)}`,
                stackoverflow: `https://stackoverflow.com/search?q=${encodeURIComponent(query)}`,
                mdn: `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(query)}`,
                devto: `https://dev.to/search?q=${encodeURIComponent(query)}`,
                leetcode: `https://leetcode.com/problemset/all/?search=${encodeURIComponent(query)}`,
                udemy: `https://www.udemy.com/courses/search/?q=${encodeURIComponent(query)}`,
                coursera: `https://www.coursera.org/search?query=${encodeURIComponent(query)}`,
                mitocw: `https://ocw.mit.edu/search/?q=${encodeURIComponent(query)}`,
                khan: `https://www.khanacademy.org/search?page_search_query=${encodeURIComponent(query)}`,
                wolfram: `https://www.wolframalpha.com/input?i=${encodeURIComponent(query)}`,
                desmos: `https://www.google.com/search?q=site:desmos.com+${encodeURIComponent(query)}`,
                geogebra: `https://www.geogebra.org/search/${encodeURIComponent(query)}`,
                arduino: `https://www.arduino.cc/search?q=${encodeURIComponent(query)}`,
                hackster: `https://www.hackster.io/search?q=${encodeURIComponent(query)}`,
                instructables: `https://www.instructables.com/search/?q=${encodeURIComponent(query)}`,
                pinterest: `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`
            };

            const fallbackUrl = randomUrls[platformId] || `https://www.google.com/search?q=${encodeURIComponent(query)}`;

            // Direct Redirect
            setTimeout(() => {
                if (newTab) newTab.location.href = fallbackUrl;
            }, 300);

        } catch (e) {
            console.warn("Deep scan failed");
            // Absolute final fallback to google if everything explodes
            if (newTab) newTab.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        }
    };
    const generateKeywordsWithAI = async (topic: string, topicId: string, threshold: number, baseKeywords: string[] = []): Promise<string[]> => {
        // Force threshold to be low since we only need 2 items (TR + EN)
        threshold = 1;
        setGeneratingKeywords(true);

        // Check memory cache first
        if (generatedKeywords[topicId] && generatedKeywords[topicId].length >= threshold) {
            setGeneratingKeywords(false);
            return generatedKeywords[topicId].slice(0, 2);
        }

        // Check localStorage cache
        const cached = getCachedKeywords(topicId);
        if (cached && cached.length >= threshold) {
            setGeneratedKeywords(prev => ({ ...prev, [topicId]: cached }));
            setGeneratingKeywords(false);
            return cached.slice(0, 2);
        }

        try {
            const result = await generateDiverseKeywords(topic, language);

            // Combine: [Original Title (TR), Translated Title (EN)]
            const combined = [topic, ...result];

            // Cache keywords in both memory and localStorage
            setGeneratedKeywords(prev => ({ ...prev, [topicId]: combined }));
            cacheKeywords(topicId, combined);

            setGeneratingKeywords(false);
            return combined;
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
                            className="ml-0 sm:ml-8 mt-2 bg-slate-800/50 rounded-lg p-2 sm:p-4 border border-slate-700/50"
                        >
                            {/* AI SMART KEY BUTTON */}


                            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2 mb-4">
                                {PLATFORMS.filter(p =>
                                    !activePlatformPanel ||
                                    activePlatformPanel.topicId !== item.id ||
                                    activePlatformPanel.platform === p.id
                                ).map(plat => {
                                    const Icon = plat.icon;
                                    const isActive = activePlatformPanel?.topicId === item.id && activePlatformPanel?.platform === plat.id;
                                    return (
                                        <button
                                            key={plat.id}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Toggle behavior: Close if already active, otherwise open
                                                if (isActive) {
                                                    setActivePlatformPanel(null);
                                                } else {
                                                    setActivePlatformPanel({ topicId: item.id, platform: plat.id });
                                                    // No need to call generateKeywordsWithAI anymore as we use static titles
                                                }
                                            }}
                                            className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border ${isActive
                                                ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                                                : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700 hover:border-slate-600'
                                                }`}
                                        >
                                            <Icon size={20} className={`mb-1 transition-colors ${isActive ? 'text-blue-400' : `text-${plat.color}-400`}`} />
                                            <span className={`text-[9px] font-medium tracking-wide uppercase ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                                                {plat.name}
                                            </span>
                                        </button>
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
                                        <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">Arama Dili Seçimi / Search Language</span>
                                        <div className="flex items-center gap-3">
                                            {/* YOUTUBE PLAYLIST TOGGLE */}
                                            {activePlatformPanel.platform === 'youtube' && (
                                                <label className="flex items-center gap-2 cursor-pointer bg-slate-800/50 px-2 py-1 rounded border border-slate-600 hover:border-red-500 transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        className="w-3 h-3 accent-red-500"
                                                        checked={searchPlaylist}
                                                        onChange={(e) => setSearchPlaylist(e.target.checked)}
                                                    />
                                                    <span className="text-[10px] sm:text-xs font-bold text-red-400 flex items-center gap-1">
                                                        <Youtube size={12} />
                                                        Oynatma Listesi
                                                    </span>
                                                </label>
                                            )}
                                            <button onClick={() => setActivePlatformPanel(null)} className="hover:bg-slate-600 rounded p-1">
                                                <X size={14} className="text-slate-400" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-2 bg-slate-800/30 rounded">
                                        {/* TURKISH BUTTON */}
                                        <button
                                            onClick={() => {
                                                if (!activePlatformPanel) return;
                                                handleDeepDive(activePlatformPanel.platform, item.title, 'tr');
                                            }}
                                            className="flex items-center justify-between p-3 bg-slate-800 border border-slate-600 hover:border-blue-500 hover:bg-slate-700/80 rounded-lg transition-all group w-full"
                                        >
                                            <div className="flex flex-col items-start overflow-hidden">
                                                <span className="text-[10px] font-bold uppercase mb-0.5 text-blue-400">
                                                    TÜRKÇE
                                                </span>
                                                <span className="text-sm font-medium text-slate-200 group-hover:text-white truncate w-full text-left">
                                                    {item.title}
                                                </span>
                                            </div>
                                            <ChevronRight size={16} className="text-slate-500 group-hover:text-white shrink-0 ml-2" />
                                        </button>

                                        {/* ENGLISH BUTTON */}
                                        <button
                                            onClick={() => {
                                                if (!activePlatformPanel) return;
                                                // Default to title if en is missing (fallback)
                                                handleDeepDive(activePlatformPanel.platform, item.en || item.title, 'en');
                                            }}
                                            className="flex items-center justify-between p-3 bg-slate-800 border border-slate-600 hover:border-emerald-500 hover:bg-slate-700/80 rounded-lg transition-all group w-full"
                                        >
                                            <div className="flex flex-col items-start overflow-hidden">
                                                <span className="text-[10px] font-bold uppercase mb-0.5 text-emerald-400">
                                                    ENGLISH (GLOBAL)
                                                </span>
                                                <span className="text-sm font-medium text-slate-200 group-hover:text-white truncate w-full text-left">
                                                    {item.en || item.title}
                                                </span>
                                            </div>
                                            <ChevronRight size={16} className="text-slate-500 group-hover:text-white shrink-0 ml-2" />
                                        </button>
                                    </div>
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
                <div className="absolute bottom-6 flex flex-col gap-3">
                    <button onClick={() => setRunTutorial(true)} className="p-3 bg-amber-500/10 rounded-xl text-amber-500 hover:text-amber-400 transition-colors border border-amber-500/50" title="Tutorial"><HelpCircle size={20} /></button>
                    <button onClick={() => setShowAboutModal(true)} className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors border border-slate-700" title="About"><Info size={20} /></button>
                </div>
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

                    <div className="space-y-4 text-xs text-slate-400">
                        {/* Developer Info Mini */}
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs ring-2 ring-slate-700">ET</div>
                            <div>
                                <p className="font-bold text-slate-200">Emre Tufan</p>
                                <p className="text-[10px] text-amber-500 leading-tight">Kontrol ve Otomasyon Teknolojisi<br />Önlisans Öğrencisi</p>
                            </div>
                        </div>

                        {/* Open Detailed Manual Button */}
                        <button
                            onClick={() => setShowAboutModal(true)}
                            className="w-full flex items-center justify-center gap-2 p-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-amber-500/50 rounded-xl transition-all group"
                        >
                            <Book size={16} className="text-amber-400 group-hover:scale-110 transition-transform" />
                            <span className="font-semibold text-slate-300 group-hover:text-white">Sistem Manuelini Aç</span>
                        </button>

                        {/* Social Links */}
                        <div className="flex gap-2">
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
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-lg text-white transition-all text-xs"
                            >
                                <Linkedin size={14} />
                                LinkedIn
                            </a>
                        </div>
                    </div>

                    <motion.div
                        className="pt-2 border-t border-slate-700/50 text-center"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: { staggerChildren: 0.05 }
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
                                className="group relative w-12 h-12 flex items-center justify-center bg-slate-800/50 rounded-lg hover:bg-slate-700/50 border border-slate-600 transition-all shadow-[0_0_15px_rgba(251,191,36,0.1)] hover:shadow-[0_0_20px_rgba(251,191,36,0.3)] animate-pulse"
                                title="Start Tutorial"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-amber-400 group-hover:scale-110 transition-transform">
                                    <path d="M4 6H20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                    <path d="M12 6V20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                    <path d="M12 6L6 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7" />
                                    <path d="M12 6L18 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7" />
                                </svg>
                            </button>
                            <p className="text-3xl font-black text-emerald-400">{Math.round(progress)}%</p>
                            <p className="text-xs text-slate-500 font-mono">{completedItems.size} / {TOTAL}</p>
                        </div>
                    </div>
                </div >

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
            </main >
        </div >
    );
}
