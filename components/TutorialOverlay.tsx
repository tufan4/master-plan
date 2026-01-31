
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, ChevronRight, ChevronLeft, BookOpen,
    Youtube, MessageCircle, Book, FileText
} from "lucide-react";

export default function TutorialOverlay({ onComplete }: { onComplete: () => void }) {
    const [step, setStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check for v2 specific tutorial completion
        const done = localStorage.getItem("tutorial_v2");
        if (!done) {
            setIsVisible(true);
        }
    }, []);

    const finishTutorial = () => {
        localStorage.setItem("tutorial_v2", "true");
        setIsVisible(false);
        onComplete();
    };

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
        else finishTutorial();
    };

    const handlePrev = () => {
        if (step > 0) setStep(step - 1);
    };

    if (!isVisible) return null;

    // STEP CONTENT DEFINITIONS
    const steps = [
        {
            // CATEGORIES (Sidebar)
            title: "Mühendislik Kütüphanesi",
            desc: "Sol menüdeki kategoriler (PLC, Elektronik, Mekanik) senin ana navigasyonun. Buradan dilediğin alana hızlıca geçiş yapabilirsin.",
            targetClass: "sidebar-spotlight", // Conceptual class logic
            align: "left"
        },
        {
            // TOPICS
            title: "Ders Konuları",
            desc: "Her bir başlık, Gemini AI tarafından üretilen 50 özel teknik anahtar kelimeyi tetikler. Konuya tıkladığında dünyanın en geniş veri tabanına erişirsin.",
            targetClass: "topic-spotlight",
            align: "center"
        },
        {
            // PLATFORMS
            title: "Platform Motorları",
            desc: "Bu ikonlar seni doğrudan o konunun eğitim videolarına, akademik makalelerine ve tartışmalarına uçurur. Üstüne gel ve sihirli etiketleri gör!",
            targetClass: "platform-spotlight",
            align: "center"
        },
        {
            // MOBILE MENU
            title: "Kompakt Kontrol",
            desc: "Mobil cihazlarda menü seni yormaz. Yarı-açık tasarım sayesinde tek elle rahatça kontrol edebilirsin. İhtiyaç duyduğunda dokunman yeterli.",
            targetClass: "mobile-spotlight",
            align: "top-left"
        }
    ];

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[100] overflow-hidden flex flex-col"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* BACKDROP BLUR & DARKENING */}
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" />

                {/* SPOTLIGHT HOLES (SIMULATED) */}
                {/* Dynamically adjust the "Hole" or "Highlight" based on step */}
                {step === 0 && (
                    // Sidebar Highlight (Left Strip)
                    <motion.div
                        layoutId="spotlight"
                        className="absolute left-0 top-0 bottom-0 w-[60px] lg:w-72 bg-white/5 border-r border-amber-500/50 shadow-[0_0_100px_rgba(245,158,11,0.2)] z-10"
                    />
                )}

                {step === 3 && (
                    // Mobile Menu Trigger Highlight (Top Left)
                    <motion.div
                        layoutId="spotlight"
                        className="absolute left-0 top-0 w-[60px] h-[60px] bg-white/10 rounded-br-2xl border-r border-b border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.5)] z-10 lg:hidden"
                    />
                )}

                {/* MAIN TUTORIAL CARD CONTAINER */}
                <div className="relative z-20 flex-1 flex items-center justify-center p-6 pointer-events-none">
                    <motion.div
                        key={step}
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: -20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="bg-slate-900 border border-slate-700 p-6 md:p-8 rounded-3xl max-w-lg w-full shadow-2xl pointer-events-auto relative overflow-hidden"
                    >
                        {/* DECORATIVE GRADIENTS */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-blue-500 to-purple-500" />

                        {/* HEADER */}
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-xs font-mono text-blue-400 bg-blue-900/20 px-3 py-1 rounded-full border border-blue-500/20">
                                ADIM {step + 1} / {steps.length}
                            </span>
                            <button onClick={finishTutorial} className="text-slate-500 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* CONTENT VISUALS (DEMO UI) */}
                        <div className="mb-6 h-32 flex items-center justify-center bg-slate-950/50 rounded-xl border border-slate-800 relative overflow-hidden group">

                            {step === 0 && (
                                <div className="flex flex-col gap-2 w-full px-4 opacity-70">
                                    <div className="h-4 w-3/4 bg-slate-700 rounded animate-pulse" />
                                    <div className="h-4 w-1/2 bg-slate-800 rounded animate-pulse" />
                                    <div className="h-4 w-5/6 bg-slate-700 rounded animate-pulse" />
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 shadow-[0_0_20px_orange]" />
                                </div>
                            )}

                            {step === 1 && (
                                <div className="flex items-center gap-3 w-full px-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50">
                                        <BookOpen className="text-emerald-400" size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="h-3 w-20 bg-emerald-900/50 mb-2 rounded" />
                                        <h4 className="text-emerald-300 font-bold">Step Motorlar</h4>
                                    </div>
                                    <ChevronRight className="text-slate-600" />
                                </div>
                            )}

                            {step === 2 && (
                                <div className="flex gap-4">
                                    {[
                                        { i: Youtube, c: "red", l: "YouTube" },
                                        { i: MessageCircle, c: "orange", l: "Reddit" },
                                        { i: Book, c: "gray", l: "Wiki" }
                                    ].map((Item, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="relative group/icon"
                                        >
                                            <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 hover:border-blue-500 transition-colors cursor-pointer">
                                                <Item.i className={`text-${Item.c}-500`} size={24} />
                                            </div>
                                            {/* DEMO TOOLTIP */}
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/icon:opacity-100 transition-opacity whitespace-nowrap">
                                                {Item.l}
                                            </div>
                                            {/* Auto-show tooltip animation */}
                                            <motion.div
                                                className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded whitespace-nowrap"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: [0, 1, 1, 0] }}
                                                transition={{ duration: 2, repeat: Infinity, delay: idx * 1.5 }}
                                            >
                                                {Item.l}
                                            </motion.div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {step === 3 && (
                                <div className="relative w-full h-full bg-slate-900 flex">
                                    <div className="w-[60px] h-full border-r border-slate-700 bg-slate-800 flex flex-col items-center pt-4 gap-4">
                                        <div className="w-8 h-8 rounded bg-slate-700 animate-pulse" />
                                        <div className="w-8 h-8 rounded bg-slate-700 animate-pulse" />
                                        <div className="w-8 h-8 rounded bg-slate-700 animate-pulse" />
                                    </div>
                                    <div className="flex-1 p-4">
                                        <div className="w-full h-full bg-slate-900/50 rounded flex items-center justify-center text-slate-700 text-xs">
                                            İçerik Alanı
                                        </div>
                                    </div>
                                    {/* Finger Tap Animation */}
                                    <motion.div
                                        className="absolute left-[30px] top-[40px] w-8 h-8 rounded-full border-2 border-amber-500 bg-amber-500/30"
                                        animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                    />
                                </div>
                            )}

                        </div>

                        {/* TEXT CONTENT */}
                        <h3 className="text-2xl font-bold text-white mb-2">
                            {steps[step].title}
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-8">
                            {steps[step].desc}
                        </p>

                        {/* NAV BUTTONS */}
                        <div className="flex justify-between items-center mt-auto">
                            <button
                                onClick={finishTutorial}
                                className="text-slate-500 text-sm font-medium hover:text-white px-4 py-2 transition-colors"
                            >
                                Şimdilik Geç
                            </button>

                            <div className="flex gap-2">
                                <button
                                    onClick={handlePrev}
                                    disabled={step === 0}
                                    className={`p-3 rounded-xl border border-slate-700 transition-all ${step === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-800 text-white'}`}
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold shadow-lg shadow-blue-900/20 flex items-center gap-2 transition-all"
                                >
                                    {step === steps.length - 1 ? 'Başla' : 'Sonraki'}
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>

                    </motion.div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
