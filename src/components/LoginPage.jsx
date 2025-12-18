import React, { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebase';
import { Heart, Lock, User, RotateCcw } from 'lucide-react';
import { FloatingHearts } from './LoadingScreen';

const COUPLE_PHOTO_URL = "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=687&auto=format&fit=crop";

const LoginPage = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            let name = user.displayName;
            if (!name || name.trim() === "") {
                name = email.split('@')[0];
            }
            onLogin(name);
        } catch (err) {
            console.error(err);
            let msg = "Incorrect email or password.";
            if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
                msg = "Incorrect email or password.";
            } else if (err.code === "auth/too-many-requests") {
                msg = "Too many failed attempts. Please try again later.";
            }
            setError(msg);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-rose-50 flex items-center justify-center p-4 relative overflow-hidden">
            <FloatingHearts />
            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10 border border-white">
                <div className="flex flex-col items-center -mt-20 mb-6">
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-pink-200">
                        <img src={COUPLE_PHOTO_URL} alt="Us" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                </div>
                <h2 className="text-3xl font-serif text-center text-rose-800 mb-8">Our Secret Space</h2>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-rose-400" size={20} />
                        <input
                            type="email"
                            placeholder="Your email..."
                            className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-pink-200 focus:border-rose-400 focus:outline-none bg-pink-50 text-rose-700"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-rose-400" size={20} />
                        <input
                            type="password"
                            placeholder="Our secret password..."
                            className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-pink-200 focus:border-rose-400 focus:outline-none bg-pink-50 text-rose-700"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center font-medium animate-pulse">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 rounded-full shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-2"
                        disabled={isLoading}
                    >
                        {isLoading ? <RotateCcw className="animate-spin" /> : <>Login to my Heart <Heart fill="white" size={20} /></>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
