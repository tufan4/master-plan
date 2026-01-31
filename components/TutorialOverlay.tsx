
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, ChevronRight, CheckCircle2 } from "lucide-react";

export default function TutorialOverlay({ onComplete }: { onComplete: () => void }) {
    const [step, setStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const done = localStorage.getItem("tutorial_done");
        if (!done) {
            setIsVisible(true);
        }
    }, []);

    const handleNext = () => {
        if (step < 2) {
            setStep(step + 1);
        } else {
            finishTutorial();
        }
    };

    const finishTutorial = () => {
        localStorage.setItem("tutorial_done", "true");
        setIsVisible(false);
        onComplete();
    };

    if (!isVisible) return null;

    const steps = [
        {
            title: "Hoşgeldin Mühendis!",
            desc: "Master Tufan OS'e hoşgeldin. Burası senin kişisel mühendislik veritabanın.",
            highlight: "logo-highlight" // Not strictly used with selector here but conceptual
        },
        {
            title: "Kategoriler & Navigasyon",
            desc: "Soldaki menüden (veya mobilde ikona tıklayarak) konular arasında gezinebilirsin.",
            highlight: "sidebar-highlight"
        },
        {
            title: "Akıllı Etkileşim",
            desc: "Konuların içine girip platform butonlarını kullanarak kaynaklara hızlıca eriş.",
            highlight: "platform-highlight"
        }
    ];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
            >
                <motion.div
                    key={step}
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: -20 }}
                    transition={{ type: "spring" }}
                    className="bg-slate-900 border border-blue-500/30 p-8 rounded-2xl max-w-md w-full relative shadow-[0_0_50px_rgba(59,130,246,0.2)]"
                >
                    {/* SPOTLIGHT EFFECT DECORATION */}
                    <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full" />
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full" />

                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-xs font-mono text-blue-400 bg-blue-900/30 px-2 py-1 rounded">
                                ADIM {step + 1} / 3
                            </span>
                            <button onClick={finishTutorial} className="text-slate-500 hover:text-slate-300">
                                <X size={20} />
                            </button>
                        </div>

                        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-3">
                            {steps[step].title}
                        </h3>

                        <p className="text-slate-400 leading-relaxed mb-8">
                            {steps[step].desc}
                        </p>

                        <div className="flex gap-4">
                            <button
                                onClick={finishTutorial}
                                className="flex-1 py-3 rounded-xl text-slate-400 hover:bg-slate-800 transition-colors font-medium"
                            >
                                Atla
                            </button>
                            <button
                                onClick={handleNext}
                                className="flex-[2] py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
                            >
                                {step === 2 ? 'Başla' : 'Sonraki'}
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
