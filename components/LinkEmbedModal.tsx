"use client";
import { useState } from "react";
import { X, Link as LinkIcon, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LinkEmbedModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, url: string) => void;
    topicId: string;
    topicTitle: string;
}

export const LinkEmbedModal = ({ isOpen, onClose, onSave, topicId, topicTitle }: LinkEmbedModalProps) => {
    const [linkName, setLinkName] = useState("");
    const [linkUrl, setLinkUrl] = useState("");

    const handleSave = () => {
        if (linkName && linkUrl) {
            onSave(linkName, linkUrl);
            setLinkName("");
            setLinkUrl("");
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-50 p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                                    <LinkIcon size={20} className="text-blue-400" />
                                    Link Göm
                                </h3>
                                <p className="text-sm text-slate-400 mt-1">{topicTitle}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Link Adı (Kaynak İsmi)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Örn: MIT OpenCourseWare PDF"
                                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    value={linkName}
                                    onChange={(e) => setLinkName(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    URL
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                />
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={!linkName || !linkUrl}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
                            >
                                <Plus size={18} />
                                Kaydet
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
