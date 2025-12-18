import React, { useState } from 'react';
import { X } from 'lucide-react';

const Letter = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="min-h-screen bg-rose-100 flex items-center justify-center p-4">
            {!isOpen ? (
                <div onClick={() => setIsOpen(true)} className="relative w-80 h-52 bg-rose-300 cursor-pointer shadow-2xl hover:scale-105 transition-transform flex items-center justify-center group">
                    <div className="absolute top-0 left-0 w-full h-full border-l-[160px] border-l-transparent border-t-[110px] border-t-rose-400 border-r-[160px] border-r-transparent origin-top transition-transform duration-500 z-20 group-hover:rotate-x-180"></div>
                    <div className="absolute bottom-0 left-0 w-full h-full border-l-[160px] border-l-rose-500 border-b-[100px] border-b-rose-400 border-r-[160px] border-r-rose-500 z-10"></div>
                    <div className="bg-white px-6 py-3 shadow-sm z-30 font-serif text-rose-800 font-bold rotate-[-2deg]">To Rodhni ❤️</div>
                    <span className="absolute -bottom-10 text-rose-500 text-sm animate-bounce">Tap to open</span>
                </div>
            ) : (
                <div className="relative w-full max-w-2xl bg-[#fffef0] shadow-2xl min-h-[60vh] p-8 md:p-12 animate-fade-in-up mx-4">
                    <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#e5e5e5 1px, transparent 1px)', backgroundSize: '100% 2em', marginTop: '4em' }}></div>
                    <div className="absolute top-0 bottom-0 left-8 md:left-12 w-px bg-red-200"></div>
                    <div className="relative z-10 font-serif text-gray-700 leading-[2em] text-lg md:text-xl">
                        <div className="flex justify-between items-start mb-8"><span className="font-bold text-rose-600 text-2xl">Dear Rodhni,</span><span className="text-sm text-gray-400">14 Dec 2025</span></div>
                        <p className="mb-4">I don't even know where to start. Jab se tum meri life mein aayi ho, sab kuch badal gaya hai. You are the most beautiful thing that has ever happened to me.</p>
                        <p className="mb-4">Har subah uth ke tumhe yaad karna, aur har raat sone se pehle tumhari awaaz sunna—yehi meri duniya ban gayi hai. I promise to love you, cherish you, and annoy you for the rest of my life.</p>
                        <p className="mb-4">Thank you for being you. Thank you for choosing me.</p>
                        <div className="mt-12 text-right"><p>Forever yours,</p><p className="font-bold text-rose-600 text-2xl font-signature">Abhi</p></div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-rose-500"><X size={24} /></button>
                </div>
            )}
            <style>{`.font-signature { font-family: 'Brush Script MT', cursive; }`}</style>
        </div>
    );
};

export default Letter;
