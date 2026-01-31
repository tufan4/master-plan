"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Instagram, Linkedin, Code2, Cpu, Database, Sparkles } from "lucide-react";

interface AboutPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AboutPanel({ isOpen, onClose }: AboutPanelProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ type: "spring", damping: 25 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-4xl max-h-[85vh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-amber-500/30 z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-amber-600 to-yellow-600 p-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-white mb-1">📖 MASTER TUFAN OS - SİSTEM MANUELİ</h2>
                                <p className="text-sm text-amber-100">Bir Emre Tufan Klasiği...</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/20 rounded-lg transition-all"
                            >
                                <X className="text-white" size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8 overflow-y-auto max-h-[calc(85vh-180px)] custom-scrollbar">
                            {/* Developer Info */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="mb-8 p-6 bg-slate-800/50 rounded-xl border border-amber-500/20"
                            >
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-full flex items-center justify-center">
                                        <Code2 size={32} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-amber-400">Emre Tufan</h3>
                                        <p className="text-slate-300">Kontrol ve Otomasyon Öğrencisi</p>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-400 italic">
                                    <Sparkles className="inline mr-2" size={16} />
                                    Vizyon: Mühendislik kütüphanesini statik bir klasör yapısından çıkarıp,
                                    AI destekli dinamik bir araştırma istasyonuna dönüştürmek.
                                </p>
                            </motion.div>

                            {/* System Architecture */}
                            <div className="space-y-6">
                                {/* L0 */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="border-l-4 border-blue-500 pl-6 py-4 bg-slate-800/30 rounded-r-xl"
                                >
                                    <h4 className="text-xl font-bold text-blue-400 mb-2 flex items-center gap-2">
                                        <Cpu size={20} />
                                        L0 - Mekatronik Çekirdek (Core)
                                    </h4>
                                    <p className="text-slate-300 text-sm leading-relaxed">
                                        Sistemin görsel kimliği, tüm parçaları otonom hareket edebilen SVG tabanlı bir logo ile temsil edilir.
                                        Dişli çarklar ve devre yolları, mühendislik disiplinlerinin (Mekanik + Elektronik) birleşimini simgeler.
                                    </p>
                                </motion.div>

                                {/* L1 */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="border-l-4 border-purple-500 pl-6 py-4 bg-slate-800/30 rounded-r-xl"
                                >
                                    <h4 className="text-xl font-bold text-purple-400 mb-2">L1 - Dinamik Klasör Hiyerarşisi</h4>
                                    <div className="text-slate-300 text-sm leading-relaxed space-y-2">
                                        <p><strong className="text-purple-300">Sol Panel:</strong> Ana disiplinler (Matematik, PLC, Elektronik vb.) burada sabitlenmiştir.</p>
                                        <p><strong className="text-purple-300">Merkezi Akordiyon:</strong> 277+ alt konu başlığı, hiyerarşik bir ağaç yapısında sıralanır.
                                            Her düğüm (node) tıklandığında, ilgili alt katmanları otonom olarak genişletir.</p>
                                    </div>
                                </motion.div>

                                {/* L2 */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="border-l-4 border-emerald-500 pl-6 py-4 bg-slate-800/30 rounded-r-xl"
                                >
                                    <h4 className="text-xl font-bold text-emerald-400 mb-2 flex items-center gap-2">
                                        <Sparkles size={20} />
                                        L2 - AI Araştırma Katmanı (The Engine)
                                    </h4>
                                    <div className="text-slate-300 text-sm leading-relaxed space-y-2">
                                        <p><strong className="text-emerald-300">Gemini 1.5 Integration:</strong> Her konu başlığı altında çalışan "Eşik Kontrolü",
                                            yapay zekayı kullanarak "Özelden Genele" (Specific to General) mantığıyla 50 adet teknik anahtar kelime üretir.</p>
                                        <p><strong className="text-emerald-300">Contextual UI:</strong> Wikipedia, Reddit ve YouTube modülleri,
                                            üretilen bu anahtarları kullanarak platformlar arası derin arama yapar.</p>
                                    </div>
                                </motion.div>

                                {/* L3 */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="border-l-4 border-pink-500 pl-6 py-4 bg-slate-800/30 rounded-r-xl"
                                >
                                    <h4 className="text-xl font-bold text-pink-400 mb-2">L3 - Görsel İstihbarat Modülü</h4>
                                    <p className="text-slate-300 text-sm leading-relaxed">
                                        <strong className="text-pink-300">Unsplash Injection:</strong> Teknik kavramların zihinde canlanması için 0-25 eşik aralığında,
                                        doğrudan API üzerinden çekilen "Raw Image" galerisi sunulur.
                                    </p>
                                </motion.div>

                                {/* L4 */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="border-l-4 border-cyan-500 pl-6 py-4 bg-slate-800/30 rounded-r-xl"
                                >
                                    <h4 className="text-xl font-bold text-cyan-400 mb-2 flex items-center gap-2">
                                        <Database size={20} />
                                        L4 - Veri Kalıcılığı (Cloud Sync)
                                    </h4>
                                    <p className="text-slate-300 text-sm leading-relaxed">
                                        <strong className="text-cyan-300">Supabase Database:</strong> Kullanıcının eklediği linkler, tamamladığı dersler ve
                                        kişiselleştirilmiş ayarlar, bulut tabanlı bir veritabanında mühürlenir. Cihaz değişse de mühendislik hafızası silinmez.
                                    </p>
                                </motion.div>
                            </div>
                        </div>

                        {/* Footer - Social Links */}
                        <div className="bg-slate-800/80 border-t border-slate-700 p-6">
                            <p className="text-center text-slate-400 text-sm mb-4">
                                Bu sistem, gerçek bir mühendislik öğrencisinin hayallerini kodlara döktüğü bir çalışmadır.
                            </p>
                            <div className="flex justify-center gap-4">
                                <a
                                    href="https://instagram.com/emretufan"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 rounded-xl text-white font-semibold transition-all transform hover:scale-105 shadow-lg"
                                >
                                    <Instagram size={20} />
                                    Instagram
                                </a>
                                <a
                                    href="https://linkedin.com/in/emretufan"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl text-white font-semibold transition-all transform hover:scale-105 shadow-lg"
                                >
                                    <Linkedin size={20} />
                                    LinkedIn
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
