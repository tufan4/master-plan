"use client";

import dynamic from 'next/dynamic';
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronDown, CheckCircle2, Circle, Youtube, FileText, Book,
    Globe, MessageCircle, Sparkles, BookOpen, Github, Lightbulb,
    Layout, Settings, Plus, HelpCircle, Menu, X, Zap
} from "lucide-react";
import { generateFullCurriculum } from "@/lib/geminiClient";

const AboutModal = dynamic(() => import("@/components/AboutModal"), { ssr: false });

const PLATFORMS = [
    { id: "youtube", name: "YouTube", icon: Youtube, url: (q: string, lang?: string) => `https://www.youtube.com/results?search_query=${q}` },
    { id: "google", name: "Google", icon: FileText, url: (q: string, lang?: string) => `https://www.google.com/search?q=${q}` },
    { id: "scholar", name: "Scholar", icon: BookOpen, url: (q: string, lang?: string) => `https://scholar.google.com/scholar?q=${q}` },
    { id: "github", name: "GitHub", icon: Github, url: (q: string, lang?: string) => `https://github.com/search?q=${q}` },
    { id: "stackoverflow", name: "Stack", icon: Layout, url: (q: string, lang?: string) => `https://stackoverflow.com/search?q=${q}` },
    { id: "reddit", name: "Reddit", icon: MessageCircle, url: (q: string, lang?: string) => `https://www.reddit.com/search/?q=${q}` },
    { id: "wikipedia", name: "Wiki", icon: Book, url: (q: string, lang: string = 'en') => `https://${lang}.wikipedia.org/wiki/Special:Search?search=${q}` },
    { id: "udemy", name: "Udemy", icon: Lightbulb, url: (q: string, lang?: string) => `https://www.udemy.com/courses/search/?q=${q}` },
    { id: "coursera", name: "Coursera", icon: Globe, url: (q: string, lang?: string) => `https://www.coursera.org/search?query=${q}` },
    { id: "mdn", name: "MDN", icon: FileText, url: (q: string, lang?: string) => `https://developer.mozilla.org/en-US/search?q=${q}` },
    { id: "arxiv", name: "ArXiv", icon: BookOpen, url: (q: string, lang?: string) => `https://arxiv.org/search/?query=${q}` },
    { id: "ieee", name: "IEEE", icon: Globe, url: (q: string, lang?: string) => `https://ieeexplore.ieee.org/search/searchresult.jsp?queryText=${q}` },
];

interface Topic {
    id: string;
    title: string;
    q_tr: string;
    q_en: string;
}

interface Curriculum {
    id: string;
    title: string;
    topics: Topic[];
    createdAt: number;
}

export default function MasterTufanOS() {
    const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
    const [activeCurriculumId, setActiveCurriculumId] = useState<string>("");
    const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());
    const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showNewModal, setShowNewModal] = useState(false);
    const [showAboutModal, setShowAboutModal] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [newTopic, setNewTopic] = useState("");
    const [topicCount, setTopicCount] = useState(500);

    useEffect(() => {
        try {
            const saved = localStorage.getItem("mt_curriculums");
            if (saved) {
                const parsed = JSON.parse(saved);
                setCurriculums(parsed);
                if (parsed.length > 0 && !activeCurriculumId) {
                    setActiveCurriculumId(parsed[0].id);
                }
            }
        } catch (e) {
            console.error("Load error:", e);
        }

        try {
            const savedCompleted = localStorage.getItem("mt_completed");
            if (savedCompleted) {
                setCompletedTopics(new Set(JSON.parse(savedCompleted)));
            }
        } catch (e) {
            console.error("Completed load error:", e);
        }
    }, []);

    const saveCurriculums = (data: Curriculum[]) => {
        try {
            localStorage.setItem("mt_curriculums", JSON.stringify(data));
            setCurriculums(data);
        } catch (e) {
            console.error("Save error:", e);
        }
    };

    const saveCompleted = (completed: Set<string>) => {
        try {
            localStorage.setItem("mt_completed", JSON.stringify([...completed]));
            setCompletedTopics(completed);
        } catch (e) {
            console.error("Completed save error:", e);
        }
    };

    const handleCreateCurriculum = async () => {
        if (!newTopic.trim() || isGenerating) return;

        setIsGenerating(true);
        try {
            const result = await generateFullCurriculum(newTopic.trim(), topicCount);

            if (!result?.topics || result.topics.length === 0) {
                alert("Müfredat oluşturulamadı. Lütfen tekrar deneyin.");
                return;
            }

            const flatTopics: Topic[] = [];
            const traverse = (items: any[]) => {
                items.forEach((item: any) => {
                    flatTopics.push({
                        id: item.id || `topic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        title: item.title,
                        q_tr: item.q_tr || item.title,
                        q_en: item.q_en || item.title
                    });
                    if (item.subtopics?.length) traverse(item.subtopics);
                });
            };
            traverse(result.topics);

            const newCurriculum: Curriculum = {
                id: `curr-${Date.now()}`,
                title: result.title || newTopic.trim(),
                topics: flatTopics,
                createdAt: Date.now()
            };

            const updated = [...curriculums, newCurriculum];
            saveCurriculums(updated);
            setActiveCurriculumId(newCurriculum.id);
            setNewTopic("");
            setShowNewModal(false);
        } catch (error) {
            console.error("Generation error:", error);
            alert("Bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDeleteCurriculum = (id: string) => {
        if (!confirm("Bu müfredatı silmek istediğinize emin misiniz?")) return;
        const updated = curriculums.filter(c => c.id !== id);
        saveCurriculums(updated);
        if (activeCurriculumId === id) {
            setActiveCurriculumId(updated[0]?.id || "");
        }
    };

    const toggleComplete = (topicId: string) => {
        const newSet = new Set(completedTopics);
        if (newSet.has(topicId)) {
            newSet.delete(topicId);
        } else {
            newSet.add(topicId);
        }
        saveCompleted(newSet);
    };

    const openPlatform = (platformId: string, topic: Topic, lang: 'tr' | 'en') => {
        const platform = PLATFORMS.find(p => p.id === platformId);
        if (!platform) return;

        const query = encodeURIComponent(lang === 'en' ? topic.q_en : topic.q_tr);
        const url = platformId === 'wikipedia'
            ? platform.url(query, lang)
            : platform.url(query);

        window.open(url, '_blank');
    };

    const activeCurriculum = useMemo(
        () => curriculums.find(c => c.id === activeCurriculumId),
        [curriculums, activeCurriculumId]
    );

    const stats = useMemo(() => {
        if (!activeCurriculum) return { total: 0, completed: 0, percent: 0 };
        const total = activeCurriculum.topics.length;
        const completed = activeCurriculum.topics.filter(t => completedTopics.has(t.id)).length;
        return {
            total,
            completed,
            percent: total > 0 ? Math.round((completed / total) * 100) : 0
        };
    }, [activeCurriculum, completedTopics]);

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
            <AboutModal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} />

            {/* Sidebar */}
            <AnimatePresence>
                {(sidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
                    <motion.aside
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        className="fixed lg:sticky top-0 left-0 h-full w-72 bg-slate-900 border-r border-slate-800 z-50 flex flex-col"
                    >
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-black text-amber-500 tracking-wider">MASTER TUFAN</h2>
                                <p className="text-[8px] text-slate-600 uppercase font-bold tracking-widest">Engineering OS</p>
                            </div>
                            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-600 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {curriculums.map(curr => (
                                <button
                                    key={curr.id}
                                    onClick={() => {
                                        setActiveCurriculumId(curr.id);
                                        setSidebarOpen(false);
                                    }}
                                    className={`w-full text-left p-4 rounded-xl transition-all ${activeCurriculumId === curr.id
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                                        }`}
                                >
                                    <div className="font-bold text-sm truncate">{curr.title}</div>
                                    <div className="text-[10px] opacity-60 mt-1">{curr.topics.length} konu</div>
                                </button>
                            ))}
                        </div>

                        <div className="p-4 border-t border-slate-800 space-y-2">
                            <button
                                onClick={() => { setShowNewModal(true); setSidebarOpen(false); }}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2"
                            >
                                <Plus size={18} /> Yeni Müfredat
                            </button>
                            <button
                                onClick={() => { setShowAboutModal(true); setSidebarOpen(false); }}
                                className="w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                            >
                                <HelpCircle size={16} /> Sistem Manueli
                            </button>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 border-b border-slate-800 px-6 flex items-center gap-4 bg-slate-950/50 backdrop-blur">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 bg-slate-900 rounded-lg hover:bg-slate-800"
                    >
                        <Menu size={20} />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-lg font-black text-white">{activeCurriculum?.title || "Master Tufan OS"}</h1>
                    </div>
                    {activeCurriculum && (
                        <button
                            onClick={() => handleDeleteCurriculum(activeCurriculum.id)}
                            className="text-red-400 hover:text-red-300 text-xs font-bold uppercase tracking-wider"
                        >
                            Sil
                        </button>
                    )}
                </header>

                <div className="flex-1 overflow-y-auto">
                    {!activeCurriculum ? (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                            <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center mb-6">
                                <Sparkles size={40} className="text-blue-500" />
                            </div>
                            <h2 className="text-3xl font-black text-white mb-3">Hoş Geldin</h2>
                            <p className="text-slate-500 text-sm max-w-md mb-8">
                                AI destekli müfredat oluşturmak için "Yeni Müfredat" butonuna tıkla.
                            </p>
                            <button
                                onClick={() => setShowNewModal(true)}
                                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl uppercase tracking-wider"
                            >
                                Başlayalım
                            </button>
                        </div>
                    ) : (
                        <div className="max-w-5xl mx-auto p-6 md:p-12">
                            <div className="flex items-end justify-between mb-8">
                                <div>
                                    <h2 className="text-4xl font-black text-white mb-2">{activeCurriculum.title}</h2>
                                    <p className="text-slate-600 text-sm font-bold uppercase tracking-wider">
                                        {new Date(activeCurriculum.createdAt).toLocaleDateString('tr-TR')}
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="text-center px-4 py-2 bg-slate-900 rounded-xl border border-slate-800">
                                        <div className="text-[10px] text-slate-600 font-bold uppercase">Konu</div>
                                        <div className="text-2xl font-black text-white">{stats.total}</div>
                                    </div>
                                    <div className="text-center px-4 py-2 bg-emerald-900/20 rounded-xl border border-emerald-500/30">
                                        <div className="text-[10px] text-slate-600 font-bold uppercase">Tamamlanan</div>
                                        <div className="text-2xl font-black text-emerald-400">{stats.percent}%</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {activeCurriculum.topics.map((topic, idx) => {
                                    const isCompleted = completedTopics.has(topic.id);
                                    const isExpanded = expandedTopicId === topic.id;

                                    return (
                                        <div key={topic.id}>
                                            <motion.div
                                                className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all ${isCompleted
                                                    ? 'bg-emerald-900/10 opacity-60'
                                                    : 'bg-slate-900/50 hover:bg-slate-900'
                                                    } ${isExpanded ? 'ring-2 ring-blue-500/30' : ''}`}
                                                onClick={() => setExpandedTopicId(isExpanded ? null : topic.id)}
                                            >
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleComplete(topic.id);
                                                    }}
                                                    className={`transition-all ${isCompleted ? 'text-emerald-500' : 'text-slate-600 hover:text-slate-400'
                                                        }`}
                                                >
                                                    {isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                                                </button>
                                                <span className={`flex-1 font-bold text-sm ${isCompleted ? 'line-through text-slate-500' : 'text-slate-200'
                                                    }`}>
                                                    {topic.title}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-700 bg-slate-800 px-2 py-1 rounded">
                                                    #{idx + 1}
                                                </span>
                                            </motion.div>

                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="ml-8 mt-2 p-6 bg-slate-950/80 rounded-2xl border border-slate-800">
                                                            <div className="grid grid-cols-4 md:grid-cols-6 gap-3 mb-4">
                                                                {PLATFORMS.map(platform => (
                                                                    <div key={platform.id} className="flex flex-col gap-2">
                                                                        <div className="flex items-center justify-center gap-1 p-2 bg-slate-900 rounded-lg border border-slate-800">
                                                                            <platform.icon size={14} className="text-slate-500" />
                                                                            <span className="text-[9px] font-bold text-slate-600 uppercase">
                                                                                {platform.name}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex gap-1">
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    openPlatform(platform.id, topic, 'tr');
                                                                                }}
                                                                                className="flex-1 py-1.5 bg-blue-600/20 hover:bg-blue-600 rounded text-[8px] font-black text-blue-400 hover:text-white transition-all"
                                                                            >
                                                                                TR
                                                                            </button>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    openPlatform(platform.id, topic, 'en');
                                                                                }}
                                                                                className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-[8px] font-black text-slate-400 hover:text-white transition-all"
                                                                            >
                                                                                EN
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
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

            {/* New Curriculum Modal */}
            <AnimatePresence>
                {showNewModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur flex items-center justify-center p-6"
                        onClick={() => setShowNewModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-900 rounded-3xl p-8 max-w-lg w-full border border-slate-800 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-black text-white uppercase">Yeni Müfredat</h3>
                                <button onClick={() => setShowNewModal(false)} className="text-slate-500 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
                                        Konu
                                    </label>
                                    <input
                                        type="text"
                                        value={newTopic}
                                        onChange={(e) => setNewTopic(e.target.value)}
                                        placeholder="Örn: PLC Programlama, Modern Fizik..."
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white font-bold focus:outline-none focus:border-blue-500"
                                        onKeyPress={(e) => e.key === 'Enter' && handleCreateCurriculum()}
                                    />
                                </div>

                                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                                    <div className="flex justify-between items-end mb-4">
                                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                                            Derinlik
                                        </label>
                                        <span className="text-blue-400 font-black text-lg">
                                            {topicCount} <span className="text-[10px] text-slate-600">BAŞLIK</span>
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="50"
                                        max="1000"
                                        step="50"
                                        value={topicCount}
                                        onChange={(e) => setTopicCount(Number(e.target.value))}
                                        className="w-full h-2 bg-slate-700 rounded-full cursor-pointer accent-blue-500"
                                    />
                                </div>

                                <button
                                    onClick={handleCreateCurriculum}
                                    disabled={!newTopic.trim() || isGenerating}
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 rounded-xl font-black uppercase tracking-wider transition-all"
                                >
                                    {isGenerating ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Zap size={18} className="animate-spin" /> Oluşturuluyor...
                                        </span>
                                    ) : (
                                        'Oluştur'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
