
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
                        <div className="p-6 overflow-y-auto space-y-6">
                            {/* Section 1 */}
                            <div>
                                <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-2">Geliştirici Kimliği</h3>
                                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                                    <p className="text-lg font-bold text-white mb-1">Emre Tufan</p>
                                    <p className="text-slate-400 text-sm">Kontrol ve Otomasyon Mühendisliği</p>
                                    <div className="mt-3 flex gap-2">
                                        <a href="https://instagram.com/emretufan" target="_blank" className="p-2 bg-slate-700 hover:bg-pink-600 rounded-lg transition-colors text-white">
                                            <Instagram size={18} />
                                        </a>
                                        <a href="https://linkedin.com/in/emretufan" target="_blank" className="p-2 bg-slate-700 hover:bg-blue-600 rounded-lg transition-colors text-white">
                                            <Linkedin size={18} />
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2 */}
                            <div>
                                <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-2">Sistem Mimarisi</h3>
                                <ul className="space-y-2">
                                    {[
                                        "Next.js 14 App Router Core",
                                        "Real-time Supabase Sync",
                                        "Framer Motion Animation Engine",
                                        "Recursive Curriculum Data Structure",
                                        "Smart Caching & Offline Support"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2 text-slate-300 text-sm p-2 bg-slate-800/30 rounded-lg border border-slate-800">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Section 3 */}
                            <div>
                                <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-2">Misyon</h3>
                                <p className="text-slate-400 text-sm leading-relaxed italic border-l-2 border-amber-500/50 pl-4">
                                    "Mühendislik disiplinini dijital bir beyne dönüştürmek ve bilgiye erişimi ışık hızına çıkarmak."
                                </p>
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
