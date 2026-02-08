import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Layout, BookOpen, ArrowRight, CheckCircle2, Youtube, FileText, Globe, Zap, Sparkles, Image as ImageIcon } from "lucide-react";

interface TutorialProps {
    onComplete?: () => void;
    forceRun?: boolean;
}

export default function TutorialOverlay({ onComplete, forceRun }: TutorialProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (typeof window !== "undefined") {
            if (forceRun) {
                setIsVisible(true);
                setStep(0);
            } else {
                const done = localStorage.getItem("tutorial_v4_master");
                if (!done) setIsVisible(true);
            }
        }
    }, [forceRun]);

    const handleComplete = () => {
        setIsVisible(false);
        if (typeof window !== "undefined") {
            localStorage.setItem("tutorial_v4_master", "true");
        }
        if (onComplete) onComplete();
    };

    const steps = [
        {
            title: "Master Tufan OS v5.0",
            desc: "Sistem güncellendi. Artık iki güçlü motora sahip: 'Tokenless Wiki Engine' ve 'Expert AI Core'.",
            icon: <Zap size={50} className="text-slate-200" />
        },
        {
            title: "Müfredat Motorları",
            desc: "İster Ücretsiz (Wikipedia) ister Yapay Zeka (Expert) modunu kullanarak teknik müfredatlar oluştur. 50'den 500 başlığa kadar derinlik seçebilirsin.",
            icon: <Layout size={50} className="text-blue-400" />
        },
        {
            title: "Akıllı Sözlük",
            desc: "Her müfredatın kendine ait bir sözlüğü var. Çalıştığın konudaki teknik terimleri tek tıkla yapay zekaya döküm ettir.",
            icon: <BookOpen size={50} className="text-slate-400" />
        },
        {
            title: "Benzer Konu Önerileri (Ghost Mode)",
            desc: "Bir konuyu bitirdiğinde 'BENZER' butonuna bas. Sistem sana sıradaki adım için 10 yeni müfredat önersin.",
            icon: <Sparkles size={50} className="text-purple-400" />
        },
        {
            title: "Derinlemesine Keşif (Deep Link)",
            desc: "Platform seç (YouTube, PDF, GitHub). Seni arama sonuçlarına değil, direkt içeriğin kaynağına (Playlist, Makale, Repo) götürürüz.",
            icon: <Search size={50} className="text-slate-300" />
        },
        {
            title: "Başlamaya Hazırsın",
            desc: "Sol menüden müfredatlarını yönet, ilerlemeni takip et. İyi çalışmalar Master Tufan.",
            icon: <CheckCircle2 size={60} className="text-white animate-pulse" />
        }
    ];

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
            <motion.div
                key={step}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="bg-slate-900 border border-slate-700 p-6 md:p-10 rounded-3xl max-w-lg w-full shadow-2xl relative flex flex-col items-center text-center"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-purple-500 to-blue-500" />

                <button
                    onClick={handleComplete}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition bg-slate-800 p-2 rounded-full"
                    title="Skip Tutorial"
                >
                    <X size={20} />
                </button>

                <div className="mb-6 p-4 bg-slate-800/50 rounded-full border border-slate-700 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                    {steps[step].icon}
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
                    {steps[step].title}
                </h2>

                <p className="text-slate-400 mb-8 text-sm md:text-base leading-relaxed">
                    {steps[step].desc}
                </p>

                <div className="flex flex-col w-full gap-3 mt-auto">
                    <button
                        onClick={() => {
                            if (step < steps.length - 1) setStep(step + 1);
                            else handleComplete();
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-2"
                    >
                        {step === steps.length - 1 ? "BAŞLAT" : "DEVAM ET"} <ArrowRight size={18} />
                    </button>

                    <div className="flex justify-center gap-1 mt-2">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-6 bg-blue-500" : "w-1.5 bg-slate-700"}`}
                            />
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
