"use client";

import { useEffect, useState } from "react";

export default function LiveLogo({ onClick }: { onClick?: () => void }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="relative w-24 h-24 cursor-pointer group" onClick={onClick}>
            {/* SVG Logo with animations */}
            <svg
                viewBox="0 0 1024 1024"
                className="w-full h-full"
                style={{ filter: 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.5))' }}
            >
                {/* Hexagon frame with pulse */}
                <path
                    d="M 512 100 L 750 250 L 750 650 L 512 800 L 274 650 L 274 250 Z"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    fill="none"
                    className="animate-pulse"
                />

                {/* Circuit paths with flow animation */}
                <g className="circuits">
                    {[...Array(8)].map((_, i) => (
                        <line
                            key={i}
                            x1={512}
                            y1={450}
                            x2={512 + Math.cos(i * Math.PI / 4) * 200}
                            y2={450 + Math.sin(i * Math.PI / 4) * 200}
                            stroke="#3b82f6"
                            strokeWidth="2"
                            opacity="0.6"
                            strokeDasharray="10,5"
                            className="animate-circuit-flow"
                            style={{
                                animation: `circuitFlow 2s infinite ${i * 0.25}s`
                            }}
                        />
                    ))}
                </g>

                {/* Gears - rotating */}
                <g className="gears">
                    {/* Top small gear */}
                    <g className="animate-spin-slow" style={{ transformOrigin: '512px 350px' }}>
                        <circle cx="512" cy="350" r="40" fill="#fbbf24" opacity="0.3" />
                        {[...Array(8)].map((_, i) => (
                            <rect
                                key={i}
                                x="508"
                                y={350 - 45}
                                width="8"
                                height="10"
                                fill="#fbbf24"
                                transform={`rotate(${i * 45} 512 350)`}
                            />
                        ))}
                    </g>

                    {/* Bottom gear */}
                    <g className="animate-spin-reverse" style={{ transformOrigin: '512px 550px' }}>
                        <circle cx="512" cy="550" r="50" fill="#fbbf24" opacity="0.3" />
                        {[...Array(10)].map((_, i) => (
                            <rect
                                key={i}
                                x="508"
                                y={550 - 55}
                                width="8"
                                height="10"
                                fill="#fbbf24"
                                transform={`rotate(${i * 36} 512 550)`}
                            />
                        ))}
                    </g>
                </g>

                {/* MASTER Text */}
                <text
                    x="512"
                    y="430"
                    textAnchor="middle"
                    fill="#fbbf24"
                    fontSize="80"
                    fontWeight="900"
                    className="select-none"
                >
                    MASTER
                </text>

                {/* TUFAN Text */}
                <text
                    x="512"
                    y="510"
                    textAnchor="middle"
                    fill="#fbbf24"
                    fontSize="80"
                    fontWeight="900"
                    className="select-none"
                >
                    TUFAN
                </text>
            </svg>

            <style jsx>{`
                @keyframes circuitFlow {
                    0% {
                        stroke-dashoffset: 0;
                        opacity: 0.3;
                    }
                    50% {
                        opacity: 1;
                    }
                    100% {
                        stroke-dashoffset: -30;
                        opacity: 0.3;
                    }
                }

                .animate-spin-slow {
                    animation: spin 8s linear infinite;
                }

                .animate-spin-reverse {
                    animation: spin-reverse 6s linear infinite;
                }

                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }

                @keyframes spin-reverse {
                    from {
                        transform: rotate(360deg);
                    }
                    to {
                        transform: rotate(0deg);
                    }
                }

                .animate-circuit-flow {
                    animation: circuitFlow 2s infinite;
                }
            `}</style>
        </div>
    );
}
