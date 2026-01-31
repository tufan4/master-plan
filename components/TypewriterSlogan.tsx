"use client";

import { useEffect, useState } from "react";

export default function TypewriterSlogan() {
    const [text, setText] = useState("");
    const fullText = "An Emre Tufan Masterpiece...";

    useEffect(() => {
        let currentIndex = 0;
        const interval = setInterval(() => {
            if (currentIndex <= fullText.length) {
                setText(fullText.substring(0, currentIndex));
                currentIndex++;
            } else {
                clearInterval(interval);
            }
        }, 80); // 80ms per character

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="overflow-hidden">
            <p
                className="slogan-responsive text-amber-500 whitespace-nowrap font-bold uppercase tracking-widest"
                style={{
                    fontFamily: 'var(--font-syncopate), sans-serif',
                    fontSize: 'clamp(0.65rem, 2vw, 0.75rem)',
                    textShadow: '0 0 10px rgba(245, 158, 11, 0.3)'
                }}
            >
                {text}
                {text.length < fullText.length && (
                    <span className="animate-pulse ml-1 text-amber-300">|</span>
                )}
            </p>
        </div>
    );
}
