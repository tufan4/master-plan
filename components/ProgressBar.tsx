"use client";

import { TrendingUp } from "lucide-react";

export const ProgressBar = ({
    progress,
    categoryProgress
}: {
    progress: number;
    categoryProgress?: { name: string; percent: number }[];
}) => {
    return (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <TrendingUp className="text-emerald-400" size={24} />
                    <div>
                        <h3 className="text-lg font-bold text-slate-100">Genel İlerleme</h3>
                        <p className="text-xs text-slate-400">Tüm kategorilerdeki biriken başarınız</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-3xl font-black text-emerald-400">{Math.round(progress)}%</p>
                    <p className="text-xs text-slate-500">Tamamlandı</p>
                </div>
            </div>

            <div className="relative w-full h-3 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700 shadow-lg shadow-emerald-500/30"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {categoryProgress && categoryProgress.length > 0 && (
                <div className="mt-6 grid grid-cols-2 gap-3">
                    {categoryProgress.map((cat, idx) => (
                        <div key={idx} className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-slate-300">{cat.name}</span>
                                <span className="text-xs font-bold text-emerald-400">{Math.round(cat.percent)}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                    style={{ width: `${cat.percent}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
