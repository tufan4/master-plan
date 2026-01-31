"use client";

import { motion } from "framer-motion";
import { RecursiveTopicNode } from "./RecursiveTopicNode";

export const TopicList = ({
    topic,
    completedItems,
    toggleComplete,
    embeddedLinks,
    onAddLink
}: {
    topic: any;
    completedItems: Record<string, boolean>;
    toggleComplete: (id: string) => void;
    embeddedLinks?: Array<{ name: string; url: string }>;
    onAddLink?: (name: string, url: string) => void;
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-visible mb-6"
        >
            <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 flex gap-2">
                    <span className="text-slate-400 font-mono text-base">{topic.id}</span>
                    {topic.title}
                </h3>
            </div>

            <div className="py-2">
                {topic.subtopics && topic.subtopics.map((sub: any) => (
                    <RecursiveTopicNode
                        key={sub.id}
                        node={sub}
                        depth={0}
                        completedItems={completedItems}
                        toggleComplete={toggleComplete}
                    />
                ))}
                {(!topic.subtopics || topic.subtopics.length === 0) && (
                    <div className="p-8 text-center text-slate-400 italic">
                        Alt başlık bulunmuyor.
                    </div>
                )}
            </div>
        </motion.div>
    );
};
