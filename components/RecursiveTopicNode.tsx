"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronDown, CheckCircle2, Circle } from "lucide-react";
import { SearchButtons } from "./SearchButtons";

interface TopicNode {
    id: string;
    title: string;
    subtopics?: TopicNode[];
    completed?: boolean;
}

interface RecursiveTopicNodeProps {
    node: TopicNode;
    depth?: number;
    completedItems: Record<string, boolean>;
    toggleComplete: (id: string) => void;
}

export const RecursiveTopicNode = ({
    node,
    depth = 0,
    completedItems,
    toggleComplete
}: RecursiveTopicNodeProps) => {
    const [isOpen, setIsOpen] = useState(true);
    const hasChildren = node.subtopics && node.subtopics.length > 0;
    const isCompleted = completedItems[node.id];

    return (
        <div className="select-none">
            <motion.div
                layout
                className={`group flex items-center justify-between p-3 px-4 hover:bg-slate-700/30 transition-colors relative overflow-visible rounded-lg mx-2 my-1 border border-transparent hover:border-slate-600 hover:shadow-sm
                    ${isCompleted ? "bg-emerald-900/20 hover:bg-emerald-900/30 border-emerald-700/30" : ""}
                `}
                style={{ marginLeft: `${depth * 24}px` }}
            >
                {/* Visual Indicator for Completed */}
                {isCompleted && (
                    <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500/50 rounded-l-lg" />
                )}

                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(!isOpen);
                        }}
                        className={`text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-md hover:bg-slate-600 ${!hasChildren ? 'invisible' : ''}`}
                    >
                        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>

                    <button
                        onClick={() => toggleComplete(node.id)}
                        className={`transition-all duration-300 ${isCompleted ? "text-emerald-400 scale-110" : "text-slate-500 hover:text-slate-300"}`}
                    >
                        {isCompleted ? <CheckCircle2 size={20} className="fill-emerald-900/50" /> : <Circle size={20} />}
                    </button>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                            <span className="text-xs font-mono text-slate-500 opacity-70 min-w-[3rem] text-right">{node.id}</span>
                            <span className={`font-medium truncate transition-all duration-300 ${isCompleted ? "text-emerald-300 line-through decoration-emerald-500/30" : "text-slate-200"}`}>
                                {node.title}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Floating Search Buttons - Visible on Group Hover */}
                <div className="relative ml-4">
                    <SearchButtons topic={node.title} />
                </div>
            </motion.div>

            {/* Recursion */}
            <AnimatePresence>
                {isOpen && hasChildren && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        {node.subtopics!.map((child) => (
                            <RecursiveTopicNode
                                key={child.id}
                                node={child}
                                depth={depth + 1}
                                completedItems={completedItems}
                                toggleComplete={toggleComplete}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
