import React, { useState, useEffect, memo } from 'react';
import { Heart } from 'lucide-react';

// Floating Hearts - Memoized for performance
export const FloatingHearts = memo(() => {
    const hearts = Array.from({ length: 12 }); // Reduced from 15 for performance
    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {hearts.map((_, i) => (
                <div
                    key={i}
                    className="absolute text-pink-300 opacity-0 animate-float-custom"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${100 + Math.random() * 50}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        animationDuration: `${10 + Math.random() * 10}s`,
                        transform: `scale(${0.3 + Math.random() * 0.7})`,
                        willChange: 'transform, opacity'
                    }}
                >
                    <Heart fill="currentColor" size={Math.random() > 0.5 ? 24 : 16} />
                </div>
            ))}
        </div>
    );
});

// Loading Screen Component
const LoadingScreen = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const progressTimer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) return 100;
                return prev + 2; // Faster progress
            });
        }, 30);
        return () => clearInterval(progressTimer);
    }, []);

    useEffect(() => {
        if (progress >= 100) {
            const completionTimer = setTimeout(() => {
                onComplete();
            }, 300); // Reduced delay
            return () => clearTimeout(completionTimer);
        }
    }, [progress, onComplete]);

    return (
        <div className="fixed inset-0 bg-rose-50 flex flex-col items-center justify-center z-50 overflow-hidden">
            <div className="relative w-40 h-40 md:w-56 md:h-56">
                <svg viewBox="0 0 100 90" className="w-full h-full overflow-visible drop-shadow-2xl">
                    <defs>
                        <mask id="heartMask">
                            <path d="M50,88.9 C20,58 0,38 0,22.5 C0,9 10,0 23.5,0 C31.5,0 39,5 50,15 C61,5 68.5,0 76.5,0 C90,0 100,9 100,22.5 C100,38 80,58 50,88.9 Z" fill="white" />
                        </mask>
                    </defs>
                    <path d="M50,88.9 C20,58 0,38 0,22.5 C0,9 10,0 23.5,0 C31.5,0 39,5 50,15 C61,5 68.5,0 76.5,0 C90,0 100,9 100,22.5 C100,38 80,58 50,88.9 Z"
                        fill="none"
                        stroke="#e11d48"
                        strokeWidth="2"
                        className="drop-shadow-sm"
                    />
                    <g mask="url(#heartMask)">
                        <g className="transition-transform duration-100 ease-linear" style={{ transform: `translateY(${100 - progress}%)` }}>
                            <rect x="-50" y="0" width="200" height="200" fill="#e11d48" className="opacity-90" />
                            <path d="M0,0 C30,10 50,0 80,5 C110,10 130,0 160,5 V20 H0 Z"
                                fill="#fda4af"
                                className="animate-wave-slow absolute -top-4 opacity-60"
                                transform="translate(0, -5)"
                            />
                            <path d="M0,0 C30,5 50,15 80,5 C110,-5 130,5 160,0 V20 H0 Z"
                                fill="#e11d48"
                                className="animate-wave absolute -top-4"
                                transform="translate(0, -3)"
                            />
                        </g>
                    </g>
                </svg>
            </div>
            <div className="mt-8 relative">
                <span className="text-4xl md:text-5xl font-serif font-bold text-rose-600 tabular-nums">
                    {Math.round(progress)}%
                </span>
                <div className="h-1 w-full bg-rose-200 mt-2 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 transition-all duration-200" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
            <p className="mt-4 text-rose-400 font-medium animate-pulse">Filling with love...</p>
            <style>{`
        @keyframes wave-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-wave {
          animation: wave-scroll 2s linear infinite;
          width: 200%; 
        }
        .animate-wave-slow {
          animation: wave-scroll 3s linear infinite reverse;
          width: 200%;
        }
      `}</style>
        </div>
    );
};

export default LoadingScreen;
