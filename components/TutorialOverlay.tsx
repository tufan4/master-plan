import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Layout, Pin, BookOpen, ArrowRight, CheckCircle2 } from "lucide-react";

interface TutorialProps {
    onComplete?: () => void;
    forceRun?: boolean; // Prop to manually trigger tutorial
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
                const done = localStorage.getItem("tutorial_v3"); // Updated version key
                if (!done) {
                    setIsVisible(true);
                }
            }
        }
    }, [forceRun]);

    const handleComplete = () => {
        setIsVisible(false);
        if (typeof window !== "undefined") {
            localStorage.setItem("tutorial_v3", "true");
        }
        if (onComplete) onComplete();
    };

    const steps = [
        {
            title: "Master Tufan OS'e Hoşgeldin",
            desc: "Burası senin mühendislik komuta merkezin. Kaynak yönetimi artık çok daha zeki. Hazır mısın?",
            icon: <Layout size={48} className="text-emerald-400" />
        },
        {
            title: "Akıllı Arama & Keşif",
            desc: "İstediğin konuyu yaz (örn: 'elektirik'). Sistem sadece konuyu değil, alt başlıkları ve sözlüğü de tarayıp sana en uygun haritayı açar.",
            icon: <Search size={48} className="text-blue-400" />
        },
        {
            title: "Oturum Çantası & Geçmiş",
            desc: "Linklere tıkladığında işin bölünmez. Sistem onları sağ alttaki 'Oturum Çantasına' atar. Biriktir, sonra hepsini tek seferde incele.",
            icon: <BookOpen size={48} className="text-amber-400" />
        },
        {
            title: "Otomatik Başlık & İndirme",
            desc: "YouTube linki mi? Başlığı ve kapağı otomatik gelir, indirme butonu belirir. Reddit mi? Başlığı temizlenir. Her şey senin için.",
            icon: <Pin size={48} className="text-purple-400" />
        },
        {
            title: "5'li Limit Uyarısı",
            desc: "Çok fazla sekme açıp kaybolma diye, 5 link biriktirdiğinde sistem seni nazikçe uyarır: 'Hey, bunları kaydetmek ister misin?'",
            icon: <CheckCircle2 size={48} className="text-red-400" />
        }
    ];

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900 border border-slate-700 p-8 rounded-3xl max-w-2xl w-full shadow-2xl relative overflow-hidden"
            >
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500" />

                <button
                    onClick={handleComplete}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition"
                >
                    <X size={24} />
                </button>

                <div className="flex flex-col items-center text-center mt-4">
                    <motion.div
                        key={step}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="mb-6 p-6 bg-slate-800/50 rounded-full border border-slate-700"
                    >
                        {steps[step].icon}
                    </motion.div>

                    <motion.h2
                        key={`h-${step}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-3xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400"
                    >
                        {steps[step].title}
                    </motion.h2>

                    <motion.p
                        key={`p-${step}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-lg text-slate-300 mb-10 max-w-lg leading-relaxed"
                    >
                        {steps[step].desc}
                    </motion.p>

                    <div className="flex items-center justify-between w-full mt-auto gap-4">
                        <button
                            onClick={() => setStep(Math.max(0, step - 1))}
                            disabled={step === 0}
                            className={`px-4 py-2 rounded-lg font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-2 hover:bg-slate-800 ${step === 0 ? 'opacity-0 pointer-events-none' : ''}`}
                        >
                            Geri
                        </button>

                        <div className="flex gap-2 justify-center">
                            {steps.map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-2 rounded-full transition-all duration-300 ${i === step ? "w-8 bg-emerald-500" : "w-2 bg-slate-700"}`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={() => {
                                if (step < steps.length - 1) {
                                    setStep(step + 1);
                                } else {
                                    handleComplete();
                                }
                            }}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all hover:scale-105 shadow-lg shadow-emerald-900/20"
                        >
                            {step === steps.length - 1 ? "Sistemi Başlat" : "Devam Et"}
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
