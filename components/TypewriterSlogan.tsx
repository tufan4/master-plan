"use client";

import { useEffect, useState } from "react";

export default function TypewriterSlogan() {
    const [text, setText] = useState("");
    const fullText = "Bir Emre Tufan Klasiği...";

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
                className="slogan-responsive italic text-amber-400 whitespace-nowrap"
                style={{
                    fontFamily: "'Dancing Script', cursive",
                    letterSpacing: text.length > 10 ? '0.05em' : '0.1em',
                    transition: 'letter-spacing 0.3s ease',
                    fontSize: 'clamp(0.75rem, 3vw, 0.875rem)'
                }}
            >
                {text}
                {text.length < fullText.length && (
                    <span className="animate-pulse">|</span>
                )}
            </p>
        </div>
    );
}
