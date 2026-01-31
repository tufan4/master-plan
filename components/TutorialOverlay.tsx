import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Layout, BookOpen, ArrowRight, CheckCircle2, Youtube, FileText, Globe, Zap, Image as ImageIcon } from "lucide-react";

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
            title: "Master Tufan OS v4.1'e Hoşgeldin",
            desc: "Sistem tamamen yenilendi. Artık bir 'Arama Motoru' değil, bir 'Keşif Motoru'. Hazır mısın?",
            icon: <Zap size={50} className="text-yellow-400" />
        },
        {
            title: "Derinlemesine Keşif (Deep Discovery)",
            desc: "Artık arama sayfalarıyla zaman kaybetme yok! Bazı platformlarda (YouTube, PDF, Reddit) seni direkt içeriğin içine ışınlıyoruz.",
            icon: <Search size={50} className="text-blue-400" />
        },
        {
            title: "25 Süper Platform",
            desc: "Mühendislik için özenle seçilmiş 25 kaynak. ArXiv'den StackOverflow'a, MIT OCW'den Hackster'a kadar her şey elinin altında.",
            icon: <Globe size={50} className="text-emerald-400" />
        },
        {
            title: "Akıllı Anahtar (AI 2.0)",
            desc: "Bir konuya tıkladığında AI sadece tekrar etmez; 'PID Tuning', 'State-Space' gibi teknik alt dalları senin için bulur.",
            icon: <Layout size={50} className="text-purple-400" />
        },
        {
            title: "YouTube: Rastgele Video",
            desc: "YouTube ikonuna tıklayıp bir anahtar kelime seçersen, arama listesi yerine KONUYLA İLGİLİ RASTGELE BİR VİDEO direkt başlar.",
            icon: <Youtube size={50} className="text-red-500" />
        },
        {
            title: "Akademik PDF & Makale",
            desc: "IEEE veya PDF (Google) seçersen, sistem seni direkt olarak o konudaki akademik makalenin PDF'ine götürmeye çalışır.",
            icon: <FileText size={50} className="text-green-400" />
        },
        {
            title: "Reddit & Wiki: Şanslı Keşif",
            desc: "Sıkıcı listeler yok. Reddit'te rastgele bir tartışmanın ortasına veya Wikipedia'da detaylı bir makaleye dalış yap.",
            icon: <BookOpen size={50} className="text-orange-400" />
        },
        {
            title: "Görsel Galeri (Engineering Diagrams)",
            desc: "Her konunun yanındaki 'Görsel' butonuna basarak o konuyla ilgili teknik şemaları ve diyagramları anında inceleyebilirsin.",
            icon: <ImageIcon size={50} className="text-pink-400" />
        },
        {
            title: "GitHub Repo Avcısı",
            desc: "GitHub modunda arama yaparsan, proje listesi yerine direkt olarak popüler ve açık kaynaklı bir Repo'nun kodlarına gidersin.",
            icon: <Layout size={50} className="text-slate-400" />
        },
        {
            title: "Hızlı Geçiş & Minimalizm",
            desc: "Sol menüdeki kategoriler arasında hızla gezin. Sistem tamamen klavye dostu ve mobil uyumlu hale getirildi.",
            icon: <Zap size={50} className="text-amber-400" />
        },
        {
            title: "İlerleme Takibi",
            desc: "Bitirdiğin konuları işaretle. İlerleme çubuğun dolsun. Hangi konularda eksiksin, sistem sana göstersin.",
            icon: <CheckCircle2 size={50} className="text-cyan-400" />
        },
        {
            title: "Keşfe Başla!",
            desc: "Artık hazırsın. Sağ üstteki yanıp sönen 'T' logosuna tıklayarak bu eğitimi tekrar izleyebilirsin. İyi çalışmalar Master Tufan.",
            icon: <Zap size={60} className="text-white animate-pulse" />
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
