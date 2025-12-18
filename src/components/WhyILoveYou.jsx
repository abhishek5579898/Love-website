import React, { useState, memo } from 'react';
import { Heart, Lock, RotateCcw } from 'lucide-react';

const CARDS = [
    { id: 1, icon: "✨", title: "The Peace", text: "Jab sab kuch wrong ja raha hota hai, bas tumhari ek call sab theek kar deti hai. You are my calm in the chaos." },
    { id: 2, icon: "🪞", title: "The Mirror", text: "You make me want to be better. Tumhare liye main best ban'na chahta hoon. You inspire me every day." },
    { id: 3, icon: "🤫", title: "The Silence", text: "Hamaari chup mein bhi baatein hoti hain. I don't need words with you. Just your presence is enough." },
    { id: 4, icon: "💪", title: "The Strength", text: "Tum sirf meri girlfriend nahi, meri taqat ho. My backbone. When I fall, you pick me up." },
    { id: 5, icon: "🔮", title: "The Soul", text: "Mujhe sirf tumse pyaar nahi hai... Mujhe tumhari rooh (soul) se pyaar hai. Forever and ever." },
];

const WhyILoveYou = memo(() => {
    const [showPopup, setShowPopup] = useState(true);
    const [isLocked, setIsLocked] = useState(false);
    const [flippedCardId, setFlippedCardId] = useState(null);

    const handleKnow = () => { setIsLocked(true); setShowPopup(false); };
    const handleDontKnow = () => setShowPopup(false);
    const handleUnlockRetry = () => { setIsLocked(false); setShowPopup(true); };

    if (isLocked) {
        return (
            <div className="min-h-screen bg-rose-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in-up">
                <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl max-w-sm border border-white">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-10 h-10 text-gray-400" />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-gray-800 mb-2">Access Denied</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Achha? Sab pata hai? <br /> Toh fir yahan kya karne aayi ho? 🤨 <br />
                        <span className="text-xs uppercase tracking-widest text-rose-400 mt-2 block">Permission Revoked</span>
                    </p>
                    <button onClick={handleUnlockRetry} className="flex items-center justify-center gap-2 w-full py-4 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 hover:scale-105 transition-all shadow-lg">
                        <RotateCcw size={18} /> Galti ho gayi! (Retry)
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-rose-100 py-20 px-4 relative overflow-hidden perspective-container">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-rose-300/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            </div>

            {showPopup && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-bounce-in border border-white/50">
                        <Heart className="w-20 h-20 text-rose-500 mx-auto mb-6 animate-pulse drop-shadow-lg" fill="currentColor" />
                        <h2 className="text-3xl font-serif text-gray-800 mb-3">One Question...</h2>
                        <p className="text-gray-600 mb-8 font-medium">Do you know exactly why I love you?</p>
                        <div className="space-y-4">
                            <button onClick={handleKnow} className="w-full py-4 bg-rose-50 text-rose-600 rounded-xl font-bold hover:bg-rose-100 transition-colors border-2 border-rose-100">
                                Yeah, I know everything! 😎
                            </button>
                            <button onClick={handleDontKnow} className="w-full py-4 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 shadow-lg hover:shadow-rose-500/30 transition-all transform hover:scale-105">
                                No, tell me please! 🥺
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className={`transition-opacity duration-1000 ${showPopup ? 'opacity-0' : 'opacity-100'}`}>
                <div className="text-center mb-16 relative z-10">
                    <span className="inline-block py-1 px-3 rounded-full bg-rose-100 text-rose-600 text-xs font-bold tracking-widest uppercase mb-4">Five Reasons</span>
                    <h2 className="text-4xl md:text-6xl font-serif text-rose-900 mb-6 drop-shadow-sm">Why You Are The One ❤️</h2>
                    <p className="text-rose-400 font-medium text-lg animate-pulse">Tap a card to flip it</p>
                </div>

                <div className="flex flex-wrap justify-center gap-8 md:gap-12 max-w-6xl mx-auto pb-32">
                    {CARDS.map((card) => (
                        <div key={card.id} className="group w-72 h-96 cursor-pointer perspective" onClick={() => setFlippedCardId(flippedCardId === card.id ? null : card.id)}>
                            <div className={`relative w-full h-full duration-700 preserve-3d transition-transform ${flippedCardId === card.id ? 'rotate-y-180' : ''}`}>
                                <div className="absolute inset-0 backface-hidden">
                                    <div className="w-full h-full bg-white/40 backdrop-blur-md rounded-3xl shadow-xl border border-white/60 flex flex-col items-center justify-center p-6 hover:shadow-2xl hover:bg-white/50 transition-all">
                                        <div className="w-32 h-32 bg-gradient-to-br from-rose-400 to-pink-600 rounded-full flex items-center justify-center text-6xl shadow-inner mb-8 transform group-hover:scale-110 transition-transform duration-500">{card.icon}</div>
                                        <h3 className="text-2xl font-serif font-bold text-gray-800 group-hover:text-rose-700 transition-colors">{card.title}</h3>
                                        <div className="mt-4 w-12 h-1 bg-rose-400 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="absolute inset-0 backface-hidden rotate-y-180">
                                    <div className="w-full h-full bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 text-center text-white relative overflow-hidden border border-white/20">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
                                        <Heart className="w-12 h-12 text-white/80 mb-6" fill="currentColor" />
                                        <p className="font-medium text-lg leading-relaxed font-serif tracking-wide border-l-2 border-white/30 pl-4">{card.text}</p>
                                        <div className="absolute bottom-6 text-xs text-white/60 uppercase tracking-widest">Always & Forever</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
        .perspective { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in { animation: bounce-in 0.6s cubic-bezier(0.215, 0.610, 0.355, 1.000) both; }
      `}</style>
        </div>
    );
});

export default WhyILoveYou;
