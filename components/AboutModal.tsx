
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Instagram, Linkedin, Info, Target, Eye, GraduationCap } from "lucide-react";

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
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 30 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-500/20 shadow-inner">
                                    <GraduationCap className="text-blue-400" size={32} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-tight">SİSTEM MANUELİ</h2>
                                    <p className="text-xs text-slate-500 font-bold tracking-widest uppercase">Master Tufan OS v3.0.1</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-3 hover:bg-slate-800 rounded-2xl transition-all text-slate-500 hover:text-white border border-transparent hover:border-slate-700"
                            >
                                <X size={28} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8 overflow-y-auto space-y-10 custom-scrollbar">

                            {/* Section: Mission & Vision */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-blue-600/5 p-6 rounded-3xl border border-blue-500/20 relative overflow-hidden group">
                                    <Target className="absolute -right-4 -bottom-4 text-blue-500/10 group-hover:text-blue-500/20 transition-all" size={120} />
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-blue-500/20 rounded-xl"><Target className="text-blue-400" size={20} /></div>
                                        <h3 className="font-black text-white uppercase text-sm tracking-widest">Misyonumuz</h3>
                                    </div>
                                    <p className="text-sm text-slate-400 leading-relaxed relative z-10">
                                        Teknik eğitimi demokratikleştirmek ve karmaşık konuları atomik parçalara bölerek her mühendis adayının kendi hızında uzmanlaşmasını sağlamak.
                                    </p>
                                </div>

                                <div className="bg-amber-600/5 p-6 rounded-3xl border border-amber-500/20 relative overflow-hidden group">
                                    <Eye className="absolute -right-4 -bottom-4 text-amber-500/10 group-hover:text-amber-500/20 transition-all" size={120} />
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-amber-500/20 rounded-xl"><Eye className="text-amber-400" size={20} /></div>
                                        <h3 className="font-black text-white uppercase text-sm tracking-widest">Vizyonumuz</h3>
                                    </div>
                                    <p className="text-sm text-slate-400 leading-relaxed relative z-10">
                                        Yapay zeka ve veriye dayalı öğrenme yolları ile Türkiye'nin en kapsamlı ve erişilebilir "Mühendislik İşletim Sistemi" olmak.
                                    </p>
                                </div>
                            </div>

                            {/* Section: Developer */}
                            <div className="bg-slate-800/30 p-8 rounded-[40px] border border-slate-700/50 relative overflow-hidden">
                                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                                    <div className="relative group">
                                        <div className="absolute -inset-2 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full blur opacity-40 group-hover:opacity-100 transition duration-1000"></div>
                                        <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center text-4xl font-black text-white relative border-2 border-slate-700 shadow-2xl">
                                            ET
                                        </div>
                                    </div>

                                    <div className="flex-1 text-center md:text-left">
                                        <h3 className="text-2xl font-black text-white mb-2">Emre Tufan</h3>
                                        <p className="text-blue-400 font-black text-xs uppercase tracking-[0.2em] mb-4">
                                            Kontrol ve Otomasyon Teknolojisi Öğrencisi
                                        </p>
                                        <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-sm">
                                            Bu platform, bir mühendislik öğrencisinin öğrenme sürecini optimize etmek için geliştirdiği kişisel bir "Kendi Kendini Eğitme" (Auto-Didact) projesidir.
                                        </p>

                                        <div className="flex justify-center md:justify-start gap-4">
                                            <a href="https://instagram.com/emretufan" target="_blank" className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-pink-600 rounded-2xl transition-all text-slate-400 hover:text-white border border-slate-700 shadow-xl group">
                                                <Instagram size={18} className="group-hover:scale-110 transition-transform" />
                                                <span className="text-xs font-bold uppercase tracking-widest">Instagram</span>
                                            </a>
                                            <a href="https://linkedin.com/in/emretufan" target="_blank" className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-blue-600 rounded-2xl transition-all text-slate-400 hover:text-white border border-slate-700 shadow-xl group">
                                                <Linkedin size={18} className="group-hover:scale-110 transition-transform" />
                                                <span className="text-xs font-bold uppercase tracking-widest">LinkedIn</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Usage Details */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] px-2 mb-4">Sistem Fonksiyonları</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-5 bg-slate-800/30 rounded-3xl border border-slate-700/50 hover:border-blue-500/30 transition-all group">
                                        <h4 className="text-xs font-black text-blue-400 uppercase mb-2">Deep Dive Engines</h4>
                                        <p className="text-[11px] text-slate-500 leading-relaxed group-hover:text-slate-400 transition-colors">
                                            20+ platformda çapraz arama yaparak konu bazlı akademik ve teknik kaynakları süzgeçten geçirir.
                                        </p>
                                    </div>
                                    <div className="p-5 bg-slate-800/30 rounded-3xl border border-slate-700/50 hover:border-purple-500/30 transition-all group">
                                        <h4 className="text-xs font-black text-purple-400 uppercase mb-2">Ghost Curriculum</h4>
                                        <p className="text-[11px] text-slate-500 leading-relaxed group-hover:text-slate-400 transition-colors">
                                            Yapay zeka mevcut müfredatınızı analiz ederek size en yakın "Tamamlayıcı" öğrenme yollarını önerir.
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-slate-950/50 text-center border-t border-slate-800 flex justify-between items-center px-10">
                            <p className="text-[10px] font-bold text-slate-600 tracking-widest uppercase">Master Tufan OS © 2026</p>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-bold text-emerald-500/70 tracking-tighter uppercase">Sistem Aktif ve Kararlı</span>
                            </div>
                        </div>

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
