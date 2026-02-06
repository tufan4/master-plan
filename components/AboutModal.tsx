
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Instagram, Linkedin, Info } from "lucide-react";

interface AboutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                    onClick={onClose} // Click outside to close
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-500/20 rounded-lg">
                                    <Info className="text-amber-400" size={24} />
                                </div>
                                <h2 className="text-xl font-bold text-white">Sistem Manueli</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">

                            {/* Section: Developer */}
                            <div className="text-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-black text-white shadow-xl ring-4 ring-slate-800">
                                    ET
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1">Emre Tufan</h3>
                                <p className="text-amber-400 text-sm font-medium">Kontrol ve Otomasyon Teknolojisi<br />Önlisans Öğrencisi</p>
                                <p className="text-slate-500 text-xs mt-1">Designed & Developed by Emre Tufan</p>

                                <div className="mt-4 flex justify-center gap-3">
                                    <a href="https://instagram.com/emretufan" target="_blank" className="p-2.5 bg-slate-800 hover:bg-pink-600 rounded-lg transition-colors text-slate-400 hover:text-white border border-slate-700">
                                        <Instagram size={20} />
                                    </a>
                                    <a href="https://linkedin.com/in/emretufan" target="_blank" className="p-2.5 bg-slate-800 hover:bg-blue-600 rounded-lg transition-colors text-slate-400 hover:text-white border border-slate-700">
                                        <Linkedin size={20} />
                                    </a>
                                </div>
                            </div>

                            {/* Section: Mission & Vision */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Vizyon
                                    </h4>
                                    <p className="text-slate-400 text-xs leading-relaxed">
                                        Mühendislik eğitimini dijital bir beyne dönüştürerek, karmaşık bilgi yığınlarını sistematik ve erişilebilir bir yapıya kavuşturmak.
                                    </p>
                                </div>
                                <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Misyon
                                    </h4>
                                    <p className="text-slate-400 text-xs leading-relaxed">
                                        Öğrencilerin ve mühendislerin, ihtiyaç duydukları teknik bilgiye "nokta atışı" (Direct Deep Link) teknolojisi ile en hızlı şekilde ulaşmalarını sağlamak.
                                    </p>
                                </div>
                            </div>

                            {/* Section: System Usage Guide */}
                            <div>
                                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                    <Info size={16} className="text-purple-400" />
                                    Nasıl Kullanılır?
                                </h3>
                                <div className="space-y-3">
                                    <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                        <span className="text-xs font-bold text-amber-400 block mb-1">1. Müfredat Oluşturucu (AI Core)</span>
                                        <p className="text-xs text-slate-400">
                                            Ana sayfadaki veya sol menüdeki "Müfredat Ekle" butonu ile istediğiniz herhangi bir konuda (örn: "PLC Programlama", "Kuantum Fiziği") saniyeler içinde kapsamlı bir öğrenme haritası oluşturabilirsiniz.
                                        </p>
                                    </div>
                                    <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                        <span className="text-xs font-bold text-cyan-400 block mb-1">2. Akıllı platformlar (Smart Deep Link)</span>
                                        <p className="text-xs text-slate-400">
                                            Bir konuya tıkladığınızda açılan panelden platform seçin. Sistem, PDF'ler için 'filetype:pdf', YouTube için 'Playlist/Shorts' gibi özel filtrelerle nokta atışı kaynak bulur.
                                        </p>
                                    </div>
                                    <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                        <span className="text-xs font-bold text-pink-400 block mb-1">3. Dinamik Yapı</span>
                                        <p className="text-xs text-slate-400">
                                            Sol menü kirlilik yaratmaz. Oluşturduğunuz müfredatlar ana başlıklar altında toplanır. İstediğinizi tek tıkla silebilir, tamamladıklarınızı işaretleyerek ilerlemenizi takip edebilirsiniz.
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-slate-950/50 text-center border-t border-slate-800">
                            <p className="text-xs text-slate-600">v3.0.1 Stable • Master Tufan OS</p>
                        </div>

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
