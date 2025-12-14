import React, { useState, useEffect, useRef, useCallback } from 'react';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from './firebase';

import {
  Heart, Music, Image as ImageIcon, Gamepad2, Play, Lock, User,
  Calendar, ArrowRight, Home, Map, Mail, Star, Menu, X, KeyRound,
  CloudLightning, Zap, ChevronLeft, ChevronRight, Pause, Gauge, Maximize2,
  Shuffle, Repeat, SkipBack, SkipForward, ChevronDown, ListMusic, Mic2,
  Upload, Plus, Check, RotateCcw, Unlock, Trash2
} from 'lucide-react';

// --- Assets & Constants ---
// --- Assets & Constants ---
// Placeholders - You can replace these with your own links manually if you wish, 
// OR use the upload feature to add them securely to the database.
const COUPLE_PHOTO_URL = "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=687&auto=format&fit=crop";
const ABOUT_US_PHOTO_URL = "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=1469&auto=format&fit=crop";

// --- Gallery Data ---
const GALLERY_IMAGES = []; // Starts empty now. Upload photos to fill it!

// --- Music Playlist Data ---
// --- Music Playlist Data ---
const SONGS_DATA = [
  { id: 1, title: "Perfect", artist: "Ed Sheeran", cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=1000", audioUrl: "" /* Paste Audio URL */ },
  { id: 2, title: "All of Me", artist: "John Legend", cover: "https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=1000", audioUrl: "" },
  { id: 3, title: "A Thousand Years", artist: "Christina Perri", cover: "https://images.unsplash.com/photo-1459749411177-d2899036da0b?q=80&w=1000", audioUrl: "" },
  { id: 4, title: "Just The Way You Are", artist: "Bruno Mars", cover: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000", audioUrl: "" },
  { id: 5, title: "Thinking Out Loud", artist: "Ed Sheeran", cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000", audioUrl: "" },
  { id: 6, title: "At My Worst", artist: "Pink Sweat$", cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000", audioUrl: "" },
  { id: 7, title: "Lover", artist: "Taylor Swift", cover: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=1000", audioUrl: "" },
  { id: 8, title: "Can't Help Falling in Love", artist: "Elvis Presley", cover: "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=1000", audioUrl: "" },
  { id: 9, title: "Until I Found You", artist: "Stephen Sanchez", cover: "https://images.unsplash.com/photo-1621360841013-c768371e93cf?q=80&w=1000", audioUrl: "" },
  { id: 10, title: "Tum Hi Ho", artist: "Arijit Singh", cover: "https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=1000", audioUrl: "" }
];

// --- Journey Data ---
// --- Journey Data ---
const JOURNEY_DATA = [
  { title: "1st Meeting", date: "The beginning", description: "Woh pehli mulakaat...", img: "" /* Paste Image URL here */ },
  { title: "1st Diwali", date: "Festival of Lights", description: "Hamari pehli Diwali...", img: "" },
  { title: "Propose Day", date: "Taking the leap", description: "Jab maine finally himmat ki...", img: "" },
  { title: "My Birthday", date: "Special day", description: "Tumne mere din ko khaas banaya...", img: "" },
  { title: "You Come Home", date: "Meeting family", description: "Tum mere ghar aayi...", img: "" },
  { title: "You Accepted", date: "The Yes", description: "The moment you said yes...", img: "" },
  { title: "The Ring", date: "Tokens of love", description: "Chhota sa gift...", img: "" },
  { title: "Bike Breakdown", date: "Adventure", description: "Bike kharab ho gayi...", img: "" },
  { title: "Leaving City", date: "Distance", description: "Greater Noida chhodna...", img: "" },
  { title: "Gym Progress", date: "Support", description: "Tumhare support se...", img: "" },
  { title: "Your Birthday", date: "Celebration", description: "Celebrating you...", img: "" },
  { title: "My Job", date: "New start", description: "Finally got the job...", img: "" },
  { title: "1st Club", date: "Party", description: "Meri pehli clubbing...", img: "" },
  { title: "Birthday Again", date: "Another year", description: "Ek aur saal saath...", img: "" }
];

const REASONS_TO_LOVE = [
  "Tumhari smile jo mera din bana deti hai.",
  "Jis tarah tum meri care karti ho.",
  "Tumhara bachpana aur cute baatein.",
  "Tumhari aankhein jo sab kuch keh deti hain.",
  "Kyuki tum tum ho, aur tum sirf meri ho."
];

const formatTime = (time) => {
  if (isNaN(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

// --- Components ---

const FloatingHearts = React.memo(() => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    // Optimize particle count for mobile
    setCount(window.innerWidth < 768 ? 6 : 15);
  }, []);

  if (count === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="absolute text-pink-300 opacity-0 animate-float-custom"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${100 + Math.random() * 50}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${10 + Math.random() * 10}s`, // Slower animation for less CPU usage
            transform: `scale(${0.3 + Math.random() * 0.7})`,
            willChange: 'transform, opacity' // Hardware acceleration hint
          }}
        >
          <Heart fill="currentColor" size={Math.random() > 0.5 ? 24 : 16} />
        </div>
      ))}
    </div>
  );
});

const LoadingScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress timer
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 1;
      });
    }, 40);

    // Cleanup
    return () => clearInterval(progressTimer);
  }, []);

  // Completion effect - separates navigation from progress calculation logic
  useEffect(() => {
    if (progress >= 100) {
      // Small buffer to show 100% then content
      const completionTimer = setTimeout(() => {
        onComplete();
      }, 500);
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

          {/* Hollow Heart Outline */}
          <path d="M50,88.9 C20,58 0,38 0,22.5 C0,9 10,0 23.5,0 C31.5,0 39,5 50,15 C61,5 68.5,0 76.5,0 C90,0 100,9 100,22.5 C100,38 80,58 50,88.9 Z"
            fill="none"
            stroke="#e11d48"
            strokeWidth="2"
            className="drop-shadow-sm"
          />

          {/* Liquid Fill */}
          <g mask="url(#heartMask)">
            <g className="transition-transform duration-100 ease-linear" style={{ transform: `translateY(${100 - progress}%)` }}>

              {/* Main Red Water Body (extends downwards) */}
              <rect x="-50" y="0" width="200" height="200" fill="#e11d48" className="opacity-90" />

              {/* Back Wave (Lighter) */}
              <path d="M0,0 C30,10 50,0 80,5 C110,10 130,0 160,5 V20 H0 Z"
                fill="#fda4af"
                className="animate-wave-slow absolute -top-4 opacity-60"
                transform="translate(0, -5)"
              />

              {/* Front Wave (Darker) */}
              <path d="M0,0 C30,5 50,15 80,5 C110,-5 130,5 160,0 V20 H0 Z"
                fill="#e11d48"
                className="animate-wave absolute -top-4"
                transform="translate(0, -3)"
              />
            </g>
          </g>
        </svg>

        {/* Floating Particles/Bubbles inside heart if desired, but sticking to clean user request */}
      </div>

      {/* Percentage Text Below */}
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
      await signInWithEmailAndPassword(auth, email, password);
      onLogin(email.split('@')[0]); // Use part of email as name
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
            <img src={COUPLE_PHOTO_URL} alt="Us" className="w-full h-full object-cover" />
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

const Countdown = ({ date, title }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      let target = new Date(now.getFullYear(), date.month - 1, date.day);
      if (now > target) target = new Date(now.getFullYear() + 1, date.month - 1, date.day);
      const diff = target - now;
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [date]);
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-md border border-pink-100 flex flex-col items-center w-full">
      <h3 className="text-rose-600 font-bold mb-2 flex items-center gap-2"><Calendar size={16} /> {title}</h3>
      <div className="grid grid-cols-4 gap-2 text-center w-full">
        {Object.entries(timeLeft).map(([unit, value]) => (
          <div key={unit} className="flex flex-col"><span className="text-xl md:text-2xl font-bold text-gray-700">{value}</span><span className="text-[10px] text-gray-500 uppercase">{unit}</span></div>
        ))}
      </div>
    </div>
  );
};

// ... Gallery (Updated Animation) ...
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

async function uploadToCloudinary(file) {
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  const res = await fetch(url, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!data.secure_url) throw new Error('Cloudinary upload failed');
  return data.secure_url;
}

const Gallery = React.memo(() => {

  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(3000);
  const [galleryImages, setGalleryImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  const intervalRef = useRef(null);

  // Fetch Gallery Images (real-time)
  useEffect(() => {
    const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const imgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGalleryImages(imgs);
    });
    return () => unsubscribe();
  }, []);

  const nextImage = useCallback(() => setSelectedImageIndex(prev => (prev + 1) % galleryImages.length), [galleryImages.length]);
  const prevImage = useCallback(() => setSelectedImageIndex(prev => (prev - 1 + galleryImages.length) % galleryImages.length), [galleryImages.length]);

  useEffect(() => {
    if (isPlaying && galleryImages.length > 0) intervalRef.current = setInterval(nextImage, speed);
    else clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, speed, nextImage, galleryImages.length]);

  // Multi-image upload (up to 90) using Cloudinary, batched for speed
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files).slice(0, 90); // Max 90
    if (!files.length) return;
    setUploading(true);
    setUploadProgress({ current: 0, total: files.length });
    let errorOccurred = false;
    const batchSize = 10;
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      await Promise.all(batch.map(async (file, idx) => {
        try {
          const url = await uploadToCloudinary(file);
          await addDoc(collection(db, "gallery"), {
            url,
            createdAt: serverTimestamp()
          });
        } catch (err) {
          errorOccurred = true;
        } finally {
          setUploadProgress(prev => ({ current: prev.current + 1, total: prev.total }));
        }
      }));
    }
    if (errorOccurred) alert("Some images failed to upload.");
    setUploading(false);
    setUploadProgress({ current: 0, total: 0 });
    e.target.value = null; // Reset file input
  };

  return (
    <div className="w-full bg-rose-50 min-h-screen p-4 md:p-8 pb-32">
      <div className="text-center mb-10 animate-fade-in-up">
        <h2 className="text-4xl md:text-5xl font-serif text-rose-800 mb-4">Our Beautiful Memories</h2>
        <p className="text-rose-400 italic">Every picture tells a story of us.</p>

        <div className="mt-6 flex justify-center">
          <label className="flex items-center gap-2 bg-rose-500 text-white px-6 py-3 rounded-full cursor-pointer hover:bg-rose-600 transition-colors shadow-lg">
            {uploading ? <RotateCcw className="animate-spin" size={20} /> : <Upload size={20} />}
            <span className="font-bold">
              {uploading
                ? `Uploading ${uploadProgress.current}/${uploadProgress.total}`
                : "Add Memory"}
            </span>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} multiple />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {galleryImages.map((img, index) => (
          <div key={img.id} className="group relative aspect-square overflow-hidden rounded-2xl cursor-pointer shadow-md bg-white" onClick={() => { setSelectedImageIndex(index); setIsPlaying(false); }}>
            <img src={img.url} alt="Memory" loading="lazy" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
          </div>
        ))}
        {galleryImages.length === 0 && (
          <div className="col-span-full text-center py-20 text-gray-400">
            No memories yet. Start by uploading one! 📸
          </div>
        )}
      </div>

      {/* Lightbox with Center Zoom Animation */}
      {selectedImageIndex !== null && galleryImages[selectedImageIndex] && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center animate-fade-in">
          <button onClick={() => setSelectedImageIndex(null)} className="absolute top-4 right-4 text-white p-2 z-50"><X size={32} /></button>

          <img
            src={galleryImages[selectedImageIndex].url}
            alt="Full"
            className="max-h-[85vh] max-w-full object-contain rounded-lg animate-zoom-in"
          />

          <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 text-white p-3 rounded-full hover:bg-white/20"><ChevronLeft /></button>
          <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 text-white p-3 rounded-full hover:bg-white/20"><ChevronRight /></button>

          {/* Controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full flex items-center gap-6 z-50">
            <button onClick={() => setIsPlaying(!isPlaying)} className="flex items-center gap-2 text-white font-medium">{isPlaying ? <Pause size={20} /> : <Play size={20} />} {isPlaying ? 'Pause' : 'Slideshow'}</button>
          </div>
        </div>
      )}
      <style>{`
        @keyframes zoom-in { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-zoom-in { animation: zoom-in 0.3s ease-out forwards; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
});

const JourneyEvent = ({ event, index }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();
  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => setIsVisible(entry.isIntersecting)));
    if (domRef.current) observer.observe(domRef.current);
    return () => domRef.current && observer.unobserve(domRef.current);
  }, []);
  const isEven = index % 2 === 0;
  return (
    <div ref={domRef} className={`min-h-[85vh] flex items-center justify-center p-6 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 max-w-6xl w-full ${isEven ? '' : 'md:flex-row-reverse'}`}>
        <div className={`flex-1 w-full transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0' : (isEven ? '-translate-x-20' : 'translate-x-20')}`}>
          <div className="relative group rounded-3xl overflow-hidden shadow-2xl border-4 border-white rotate-2 hover:rotate-0 transition-transform bg-white">
            {event.img ? (
              <img src={event.img} alt={event.title} className="w-full h-auto object-cover max-h-[500px]" />
            ) : (
              <div className="w-full h-64 bg-rose-100 flex items-center justify-center text-rose-400">
                <div className="text-center">
                  <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No Image Added</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className={`flex-1 text-center md:text-left transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
          <span className="inline-block px-4 py-2 bg-rose-100 text-rose-600 rounded-full text-sm font-bold mb-4">{event.date}</span>
          <h2 className="text-4xl md:text-6xl font-serif text-rose-800 mb-6">{event.title}</h2>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-light">{event.description}</p>
        </div>
      </div>
    </div>
  )
}
const Journey = React.memo(() => {
  return (
    <div className="w-full bg-gradient-to-b from-rose-50 to-white pb-32">
      <div className="h-[40vh] flex items-center justify-center bg-rose-50"><h2 className="text-4xl md:text-6xl font-serif text-rose-800 animate-fade-in-up">Our Beautiful Journey ❤️</h2></div>
      <div>{JOURNEY_DATA.map((event, i) => <JourneyEvent key={i} event={event} index={i} />)}</div>

      {/* Updated Fights & Ending Section */}
      <div className="relative py-24 bg-rose-50 text-rose-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <CloudLightning className="w-16 h-16 mx-auto mb-6 text-rose-400 animate-pulse" />
          <h2 className="text-4xl font-serif text-rose-800 mb-8">The Storms We Weathered</h2>
          <p className="text-lg text-gray-600 mb-12">
            Haan, hum ladte hain. Sometimes a lot. But you know what? That's the best part.
            Kyunki har ladai ke baad wala pyaar aur bhi gehra hota hai.
            Fights hoti rahengi, manana chalta rahega, bas tum saath rehna.
          </p>

          <div className="border-t border-rose-200 pt-12 mt-12">
            <Heart className="w-16 h-16 text-rose-500 mx-auto mb-4 animate-bounce" fill="currentColor" />
            <h2 className="text-3xl md:text-5xl font-serif mb-4 text-rose-800">And the journey continues...</h2>
            <p className="text-rose-500 text-xl font-medium">Till my last breath. ❤️</p>
          </div>
        </div>
      </div>
    </div>
  );
});

// ... Music Components (Added Play All & Shuffle Button) ...
const MusicPlayer = ({ songs, currentSongIndex, isPlaying, isFullScreen, onPlayPause, onNext, onPrev, onToggleFullScreen, onSeek, currentTime, duration, onShuffle, isShuffle, onRepeat, repeatMode }) => {
  const currentSong = songs[currentSongIndex];
  const [showBar, setShowBar] = React.useState(true);
  if (!currentSong) return null;
  // Only show the bottom bar if playing and showBar is true
  if (!isFullScreen && isPlaying && showBar) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-rose-100 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-[90] px-4 py-3 cursor-pointer transition-all duration-300 overflow-hidden" onClick={onToggleFullScreen}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-12 h-12 rounded-lg overflow-hidden shadow-md shrink-0"><img src={currentSong.cover} alt="Art" className={`w-full h-full object-cover ${isPlaying ? 'animate-spin-slow' : ''}`} /></div>
            <div className="flex flex-col min-w-0"><span className="font-bold text-gray-800 truncate">{currentSong.title}</span><span className="text-xs text-rose-500 truncate">{currentSong.artist}</span></div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-rose-50 text-gray-600" onClick={(e) => { e.stopPropagation(); onPlayPause(); }}>{isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}</button>
            <button className="p-2 rounded-full hover:bg-rose-50 text-gray-600 hidden md:block" onClick={(e) => { e.stopPropagation(); onNext(); }}><SkipForward size={24} fill="currentColor" /></button>
            {/* Cross button to hide the bar */}
            <button className="p-2 rounded-full hover:bg-rose-100 text-gray-400 ml-2" onClick={(e) => { e.stopPropagation(); setShowBar(false); }} title="Close"><X size={22} /></button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 h-1 bg-rose-100 w-full"><div className="h-full bg-rose-500" style={{ width: `${(currentTime / duration) * 100}%` }}></div></div>
      </div>
    );
  }
  // Fullscreen player: no scroll, perfect fit
  if (isFullScreen) {
    return (
      <div className="fixed inset-0 bg-white z-[100] flex flex-col animate-fade-in-up overflow-hidden" style={{ height: '100vh', overflow: 'hidden' }}>
        <div className="absolute inset-0 bg-cover bg-center opacity-30 blur-3xl scale-110" style={{ backgroundImage: `url(${currentSong.cover})` }}></div>
        <div className="absolute inset-0 bg-white/50 backdrop-blur-3xl"></div>
        <div className="relative z-10 flex items-center justify-between p-6">
          <button onClick={onToggleFullScreen} className="p-2 bg-white/50 rounded-full hover:bg-white transition-colors"><ChevronDown size={28} className="text-gray-700" /></button>
          <span className="text-gray-500 font-medium tracking-widest uppercase text-xs">Now Playing</span>
          <button className="p-2 bg-white/50 rounded-full hover:bg-white transition-colors"><ListMusic size={24} className="text-gray-700" /></button>
        </div>
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8 overflow-hidden" style={{ height: '100%', overflow: 'hidden' }}>
          <div className="w-72 h-72 md:w-96 md:h-96 rounded-3xl overflow-hidden shadow-2xl border-8 border-white/50 relative"><img src={currentSong.cover} alt="Album Art" className={`w-full h-full object-cover transition-transform duration-[10s] ${isPlaying ? 'scale-110' : 'scale-100'}`} /></div>
          <div className="space-y-2"><h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-800">{currentSong.title}</h2><p className="text-lg text-rose-600 font-medium">{currentSong.artist}</p></div>
          <div className="w-full max-w-md space-y-2"><input type="range" min="0" max={duration || 0} value={currentTime} onChange={(e) => onSeek(Number(e.target.value))} className="w-full h-2 bg-rose-200 rounded-lg appearance-none cursor-pointer accent-rose-500" /><div className="flex justify-between text-xs text-gray-500 font-medium"><span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span></div></div>
          <div className="flex items-center justify-center gap-6 md:gap-10"><button onClick={onShuffle} className={`p-3 rounded-full transition-all ${isShuffle ? 'text-rose-600 bg-rose-100' : 'text-gray-400 hover:text-gray-600'}`}><Shuffle size={24} /></button><button onClick={() => onPrev()} className="text-gray-800 hover:text-rose-600 transition-colors"><SkipBack size={36} fill="currentColor" /></button><button onClick={onPlayPause} className="w-20 h-20 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-105 hover:bg-rose-600 transition-all">{isPlaying ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-2" />}</button><button onClick={() => onNext()} className="text-gray-800 hover:text-rose-600 transition-colors"><SkipForward size={36} fill="currentColor" /></button><button onClick={onRepeat} className={`p-3 rounded-full transition-all ${repeatMode !== 'off' ? 'text-rose-600 bg-rose-100' : 'text-gray-400 hover:text-gray-600'}`}><Repeat size={24} />{repeatMode === 'one' && <span className="absolute text-[8px] font-bold -mt-2 ml-3">1</span>}</button></div>
        </div>
      </div>
    );
  }
  return null;
};
const PlaylistView = ({ onPlaySong, onShufflePlay }) => {
  return (
    <div className="w-full bg-gradient-to-b from-rose-50 to-white min-h-screen pb-32">
      <div className="pt-10 px-6 pb-6">
        <h2 className="text-4xl font-serif text-rose-800 mb-2">Our Playlist 🎵</h2>
        <p className="text-gray-500 mb-6">Songs that remind me of you.</p>

        {/* Play All / Shuffle Buttons */}
        <div className="flex gap-4 mb-6">
          <button onClick={() => onPlaySong(0)} className="flex-1 bg-rose-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-rose-600 transition-colors">
            <Play fill="currentColor" size={20} /> Play All
          </button>
          <button onClick={onShufflePlay} className="flex-1 bg-rose-100 text-rose-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-rose-200 transition-colors">
            <Shuffle size={20} /> Shuffle
          </button>
        </div>
      </div>
      <div className="px-4 space-y-2">{SONGS_DATA.map((song, index) => (<div key={song.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer group bg-white shadow-sm border border-transparent hover:border-rose-100" onClick={() => onPlaySong(index)}><span className="text-gray-400 w-6 text-center font-medium group-hover:text-rose-500">{index + 1}</span><div className="w-14 h-14 rounded-lg overflow-hidden relative shadow-md"><img src={song.cover} alt={song.title} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Play size={20} className="text-white fill-white" /></div></div><div className="flex-1 min-w-0"><h3 className="font-bold text-gray-800 truncate group-hover:text-rose-600">{song.title}</h3><p className="text-sm text-gray-500 truncate">{song.artist}</p></div><button className="p-2 text-gray-300 hover:text-rose-500"><Heart size={20} /></button></div>))}</div>
    </div>
  );
};

// --- 3D Glass Hearts Section (Redesigned v2) ---
const WhyILoveYou = () => {
  const [showPopup, setShowPopup] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [flippedCardId, setFlippedCardId] = useState(null);

  // Logic Restoration
  const handleKnow = () => { setIsLocked(true); setShowPopup(false); };
  const handleDontKnow = () => setShowPopup(false);
  const handleUnlockRetry = () => { setIsLocked(false); setShowPopup(true); };

  const CARDS = [
    { id: 1, icon: "✨", title: "The Peace", text: "Jab sab kuch wrong ja raha hota hai, bas tumhari ek call sab theek kar deti hai. You are my calm in the chaos." },
    { id: 2, icon: "🪞", title: "The Mirror", text: "You make me want to be better. Tumhare liye main best ban'na chahta hoon. You inspire me every day." },
    { id: 3, icon: "🤫", title: "The Silence", text: "Hamaari chup mein bhi baatein hoti hain. I don't need words with you. Just your presence is enough." },
    { id: 4, icon: "💪", title: "The Strength", text: "Tum sirf meri girlfriend nahi, meri taqat ho. My backbone. When I fall, you pick me up." },
    { id: 5, icon: "🔮", title: "The Soul", text: "Mujhe sirf tumse pyaar nahi hai... Mujhe tumhari rooh (soul) se pyaar hai. Forever and ever." },
  ];

  /* Access Denied View */
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
          <button
            onClick={handleUnlockRetry}
            className="flex items-center justify-center gap-2 w-full py-4 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 hover:scale-105 transition-all shadow-lg"
          >
            <RotateCcw size={18} /> Galti ho gayi! (Retry)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-rose-100 py-20 px-4 relative overflow-hidden perspective-container">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-300/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      </div>

      {/* Intro Popup */}
      {showPopup && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-bounce-in border border-white/50">
            <Heart className="w-20 h-20 text-rose-500 mx-auto mb-6 animate-pulse drop-shadow-lg" fill="currentColor" />
            <h2 className="text-3xl font-serif text-gray-800 mb-3">One Question...</h2>
            <p className="text-gray-600 mb-8 font-medium">Do you know exactly why I love you?</p>
            <div className="space-y-4">
              <button
                onClick={handleKnow}
                className="w-full py-4 bg-rose-50 text-rose-600 rounded-xl font-bold hover:bg-rose-100 transition-colors border-2 border-rose-100"
              >
                Yeah, I know everything! 😎
              </button>
              <button
                onClick={handleDontKnow}
                className="w-full py-4 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 shadow-lg hover:shadow-rose-500/30 transition-all transform hover:scale-105"
              >
                No, tell me please! 🥺
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`transition-opacity duration-1000 ${showPopup ? 'opacity-0' : 'opacity-100'}`}>
        <div className="text-center mb-16 relative z-10">
          <span className="inline-block py-1 px-3 rounded-full bg-rose-100 text-rose-600 text-xs font-bold tracking-widest uppercase mb-4">Five Reasons</span>
          <h2 className="text-4xl md:text-6xl font-serif text-rose-900 mb-6 drop-shadow-sm">Why You Are The One ❤️</h2>
          <p className="text-rose-400 font-medium text-lg animate-pulse">Tap a card to flip it</p>
        </div>

        <div className="flex flex-wrap justify-center gap-8 md:gap-12 max-w-6xl mx-auto pb-32">
          {CARDS.map((card) => (
            <div
              key={card.id}
              className="group w-72 h-96 cursor-pointer perspective"
              onClick={() => setFlippedCardId(flippedCardId === card.id ? null : card.id)}
            >
              <div className={`relative w-full h-full duration-700 preserve-3d transition-transform ${flippedCardId === card.id ? 'rotate-y-180' : ''}`}>

                {/* Front Side */}
                <div className="absolute inset-0 backface-hidden">
                  <div className="w-full h-full bg-white/40 backdrop-blur-md rounded-3xl shadow-xl border border-white/60 flex flex-col items-center justify-center p-6 hover:shadow-2xl hover:bg-white/50 transition-all">
                    <div className="w-32 h-32 bg-gradient-to-br from-rose-400 to-pink-600 rounded-full flex items-center justify-center text-6xl shadow-inner mb-8 transform group-hover:scale-110 transition-transform duration-500">
                      {card.icon}
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-gray-800 group-hover:text-rose-700 transition-colors">{card.title}</h3>
                    <div className="mt-4 w-12 h-1 bg-rose-400 rounded-full"></div>
                  </div>
                </div>

                {/* Back Side */}
                <div className="absolute inset-0 backface-hidden rotate-y-180">
                  <div className="w-full h-full bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 text-center text-white relative overflow-hidden border border-white/20">
                    {/* Decorative Circles */}
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
};

// ... Letter, SecretSpace (Same as before) ...
const Letter = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="min-h-screen bg-rose-100 flex items-center justify-center p-4">
      {!isOpen ? (
        <div onClick={() => setIsOpen(true)} className="relative w-80 h-52 bg-rose-300 cursor-pointer shadow-2xl hover:scale-105 transition-transform flex items-center justify-center group">
          <div className="absolute top-0 left-0 w-full h-full border-l-[160px] border-l-transparent border-t-[110px] border-t-rose-400 border-r-[160px] border-r-transparent origin-top transition-transform duration-500 z-20 group-hover:rotate-x-180"></div>
          <div className="absolute bottom-0 left-0 w-full h-full border-l-[160px] border-l-rose-500 border-b-[100px] border-b-rose-400 border-r-[160px] border-r-rose-500 z-10"></div>
          <div className="bg-white px-6 py-3 shadow-sm z-30 font-serif text-rose-800 font-bold rotate-[-2deg]">To Rodhni ❤️</div><span className="absolute -bottom-10 text-rose-500 text-sm animate-bounce">Tap to open</span>
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

const SecretSpace = ({ onLock }) => {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Real-time fetch from Firestore
  useEffect(() => {
    const q = query(collection(db, "secret_gallery"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const imgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPhotos(imgs);
    });
    return () => unsubscribe();
  }, []);

  // Multi-image upload (up to 10) using Cloudinary
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files).slice(0, 10); // Max 10
    if (!files.length) return;
    setUploading(true);
    let errorOccurred = false;
    try {
      await Promise.all(files.map(async (file) => {
        try {
          const url = await uploadToCloudinary(file);
          await addDoc(collection(db, "secret_gallery"), {
            url,
            createdAt: serverTimestamp()
          });
        } catch (err) {
          errorOccurred = true;
        }
      }));
      if (errorOccurred) alert("Some images failed to upload.");
    } catch (err) {
      alert("Upload failed!");
    }
    setUploading(false);
    e.target.value = null; // Reset file input
  };

  return (
    <div className="min-h-screen bg-rose-50 p-6 pb-32">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8"><div><h2 className="text-3xl font-serif text-rose-800">Our Secret Gallery 🔒</h2><p className="text-gray-500">Only for our eyes.</p></div><button onClick={onLock} className="flex items-center gap-2 bg-rose-100 text-rose-600 px-4 py-2 rounded-full hover:bg-rose-200 transition-colors"><Lock size={16} /> Lock Space</button></div>
        <div className="mb-10"><label className="flex flex-col items-center justify-center w-full h-32 border-2 border-rose-300 border-dashed rounded-2xl cursor-pointer bg-rose-50 hover:bg-rose-100 transition-colors"><div className="flex flex-col items-center justify-center pt-5 pb-6"><Upload className="w-8 h-8 text-rose-400 mb-2" /><p className="text-sm text-gray-500"><span className="font-semibold">Click to upload</span> your photo(s)</p></div><input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} multiple disabled={uploading} /></label></div>
        {photos.length === 0 ? (<div className="text-center py-10 opacity-50"><ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" /><p>No secret photos yet. Upload one!</p></div>) : (<div className="grid grid-cols-2 md:grid-cols-3 gap-4">{photos.map((img) => (<div key={img.id} className="aspect-square rounded-xl overflow-hidden shadow-md bg-white p-2"><img src={img.url} alt="Secret" className="w-full h-full object-cover rounded-lg" /></div>))}</div>)}
      </div>
    </div>
  );
};

// --- New Bucket List Component ---
// --- New Bucket List Component ---
const BucketList = () => {
  const [wishes, setWishes] = useState([]);
  const [newWish, setNewWish] = useState("");

  // Real-time fetch from Firestore
  useEffect(() => {
    const q = query(collection(db, "wishes"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const wishList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWishes(wishList);
    });
    return () => unsubscribe();
  }, []);

  const addWish = async (e) => {
    e.preventDefault();
    if (!newWish.trim()) return;
    try {
      await addDoc(collection(db, "wishes"), {
        text: newWish,
        completed: false,
        createdAt: serverTimestamp()
      });
      setNewWish("");
    } catch (err) {
      alert("Failed to add dream.");
    }
  };

  const toggleWish = async (id, currentStatus) => {
    try {
      await updateDoc(doc(db, "wishes", id), {
        completed: !currentStatus
      });
    } catch (err) {
      alert("Failed to update dream.");
    }
  };

  const deleteWish = async (id) => {
    if (!window.confirm("Are you sure you want to delete this dream?")) return;
    try {
      await deleteDoc(doc(db, "wishes", id));
    } catch (err) {
      alert("Failed to delete dream.");
    }
  };

  return (
    <div className="min-h-screen bg-rose-50 py-20 px-4 relative overflow-hidden">
      {/* Soft Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-rose-200 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-200 rounded-full blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2 animate-pulse delay-1000"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-12 animate-fade-in-up">
          <Heart className="w-16 h-16 text-rose-500 mx-auto mb-4 animate-bounce" fill="currentColor" />
          <h2 className="text-4xl md:text-5xl font-serif text-rose-800 mb-4">Our Sweet Dreams ☁️</h2>
          <p className="text-rose-400 text-lg italic">"Every dream we imagine is a memory waiting to happen."</p>
        </div>

        {/* Add New Wish */}
        <form onSubmit={addWish} className="mb-12 flex gap-4 max-w-xl mx-auto animate-fade-in-up">
          <input
            type="text"
            value={newWish}
            onChange={(e) => setNewWish(e.target.value)}
            placeholder="What's our next adventure?... ✨"
            className="flex-1 px-6 py-4 rounded-full bg-white border-2 border-rose-100 text-rose-800 placeholder-rose-300 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all shadow-sm"
          />
          <button type="submit" className="bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-rose-500/30 transition-all transform hover:scale-105">
            <Plus size={24} />
          </button>
        </form>

        {/* Wishes Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {wishes.map(wish => (
            <div
              key={wish.id}
              className={`p-6 rounded-2xl border-2 transition-all duration-300 group flex items-center justify-between
                ${wish.completed
                  ? 'bg-rose-100 border-rose-200'
                  : 'bg-white border-white hover:border-rose-100 hover:shadow-md'}`}
            >
              <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => toggleWish(wish.id, wish.completed)}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors
                  ${wish.completed ? 'bg-rose-500 border-rose-500' : 'border-rose-200 group-hover:border-rose-400'}`}>
                  {wish.completed && <Check size={16} className="text-white" strokeWidth={3} />}
                </div>
                <span className={`text-lg font-medium transition-all ${wish.completed ? 'text-rose-400 line-through decoration-rose-300' : 'text-gray-700'}`}>
                  {wish.text}
                </span>
              </div>

              <button onClick={() => deleteWish(wish.id)} className="p-2 text-rose-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- World Container (Main Logic) ---
const World = ({ onBackHome }) => {
  const [activeTab, setActiveTab] = useState('journey');
  const [isSecretUnlocked, setIsSecretUnlocked] = useState(false);
  const [isSecretModalOpen, setIsSecretModalOpen] = useState(false);

  // Music State
  const [currentSongIndex, setCurrentSongIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerFullScreen, setIsPlayerFullScreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off');
  const audioRef = useRef(new Audio());

  // ... (Music Effects) ...
  useEffect(() => { const audio = audioRef.current; const handleTimeUpdate = () => setCurrentTime(audio.currentTime); const handleLoadedMetadata = () => setDuration(audio.duration); const handleEnded = () => { if (repeatMode === 'one') { audio.currentTime = 0; audio.play(); } else { handleNext(); } }; audio.addEventListener('timeupdate', handleTimeUpdate); audio.addEventListener('loadedmetadata', handleLoadedMetadata); audio.addEventListener('ended', handleEnded); return () => { audio.removeEventListener('timeupdate', handleTimeUpdate); audio.removeEventListener('loadedmetadata', handleLoadedMetadata); audio.removeEventListener('ended', handleEnded); }; }, [currentSongIndex, repeatMode, isShuffle]);
  useEffect(() => { if (currentSongIndex !== null) { const audio = audioRef.current; audio.src = SONGS_DATA[currentSongIndex].audioUrl; if (isPlaying) audio.play().catch(e => console.log(e)); } }, [currentSongIndex]);
  useEffect(() => { const audio = audioRef.current; if (isPlaying) audio.play().catch(() => setIsPlaying(false)); else audio.pause(); }, [isPlaying]);
  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleNext = () => { if (isShuffle) setCurrentSongIndex(Math.floor(Math.random() * SONGS_DATA.length)); else setCurrentSongIndex(prev => (prev + 1) % SONGS_DATA.length); setIsPlaying(true); };
  const handlePrev = () => { setCurrentSongIndex(prev => (prev - 1 + SONGS_DATA.length) % SONGS_DATA.length); setIsPlaying(true); };
  const handleSeek = (time) => { audioRef.current.currentTime = time; setCurrentTime(time); };
  const playSongFromList = (index) => { setCurrentSongIndex(index); setIsPlaying(true); setIsPlayerFullScreen(true); };
  const handleShufflePlay = () => { setIsShuffle(true); handleNext(); setIsPlayerFullScreen(true); };
  const toggleShuffle = () => setIsShuffle(!isShuffle);
  const toggleRepeat = () => { const modes = ['off', 'all', 'one']; setRepeatMode(modes[(modes.indexOf(repeatMode) + 1) % modes.length]); };

  // Tab Logic
  const handleTabChange = (tabId) => { if (tabId === 'secret') { if (isSecretUnlocked) setActiveTab(tabId); else setIsSecretModalOpen(true); } else { setActiveTab(tabId); } };
  const handleSecretSuccess = () => { setIsSecretUnlocked(true); setActiveTab('secret'); };

  return (
    <div className="min-h-screen bg-rose-50">
      <WorldNavbar activeTab={activeTab} onTabChange={handleTabChange} onHomeClick={onBackHome} />
      <SecretSpaceModal isOpen={isSecretModalOpen} onClose={() => setIsSecretModalOpen(false)} onSuccess={handleSecretSuccess} />

      <main className="animate-fade-in-up">
        {activeTab === 'journey' && <Journey />}
        {activeTab === 'gallery' && <Gallery />}
        {activeTab === 'playlist' && <PlaylistView onPlaySong={playSongFromList} onShufflePlay={handleShufflePlay} />}
        {activeTab === 'why-love' && <WhyILoveYou />}
        {activeTab === 'dreams' && <BucketList />}
        {activeTab === 'letter' && <Letter />}
        {activeTab === 'secret' && <SecretSpace onLock={() => { setIsSecretUnlocked(false); setActiveTab('journey'); }} />}
      </main>

      {/* Only show MusicPlayer if playing or full screen, and not paused with bar closed */}
      {(currentSongIndex !== null && (isPlaying || isPlayerFullScreen)) && (
        <MusicPlayer
          songs={SONGS_DATA} currentSongIndex={currentSongIndex} isPlaying={isPlaying} isFullScreen={isPlayerFullScreen} currentTime={currentTime} duration={duration} isShuffle={isShuffle} repeatMode={repeatMode} onPlayPause={handlePlayPause} onNext={handleNext} onPrev={handlePrev} onSeek={handleSeek} onToggleFullScreen={() => setIsPlayerFullScreen(!isPlayerFullScreen)} onShuffle={toggleShuffle} onRepeat={toggleRepeat}
        />
      )}
    </div>
  );
};

// ... WorldNavbar, SecretSpaceModal (Hamburger Logic Added) ...
const WorldNavbar = ({ activeTab, onTabChange, onHomeClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'journey', label: 'Our Journey', icon: Map },
    { id: 'gallery', label: 'Gallery', icon: ImageIcon },
    { id: 'playlist', label: 'Playlist', icon: Music },
    { id: 'dreams', label: 'Our Dreams', icon: Star },
    { id: 'why-love', label: 'Why I Love You', icon: Heart },
    { id: 'letter', label: 'Letter', icon: Mail },
    { id: 'secret', label: 'Secret Space', icon: Lock },
  ];

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-md shadow-md sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Home Link */}
          <button onClick={onHomeClick} className="flex items-center gap-2 text-rose-600 hover:text-rose-700 font-serif font-bold text-lg">
            <Home size={24} /> <span className="font-medium">Home</span>
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1 bg-rose-50/50 p-1 rounded-full">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 
                      ${isActive ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500 hover:text-rose-500 hover:bg-white/50'}`}
                >
                  <Icon size={16} className={isActive ? 'fill-current' : ''} />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:bg-rose-50 rounded-full transition-colors"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu size={28} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsMenuOpen(false)}></div>

          {/* Menu Drawer */}
          <div className="absolute top-0 right-0 h-full w-3/4 max-w-sm bg-white shadow-2xl p-6 transform transition-transform duration-300 ease-out animate-slide-in-right">
            <div className="flex justify-between items-center mb-8">
              <span className="text-2xl font-serif font-bold text-rose-600">Our World ❤️</span>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-rose-50 rounded-full text-gray-500 hover:text-rose-600">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { onTabChange(item.id); setIsMenuOpen(false); }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 
                       ${isActive ? 'bg-rose-100 text-rose-700 font-bold' : 'bg-gray-50 text-gray-600 hover:bg-rose-50'}`}
                  >
                    <div className={`p-2 rounded-full ${isActive ? 'bg-white' : 'bg-gray-200'}`}>
                      <Icon size={20} className={isActive ? 'fill-rose-600' : ''} />
                    </div>
                    <span className="text-lg">{item.label}</span>
                    {isActive && <div className="ml-auto w-2 h-2 bg-rose-500 rounded-full"></div>}
                  </button>
                );
              })}
            </div>

            <div className="absolute bottom-8 left-6 right-6">
              <button onClick={onHomeClick} className="w-full py-4 border-2 border-rose-100 text-rose-600 font-bold rounded-2xl hover:bg-rose-50 transition-colors flex items-center justify-center gap-2">
                <Home size={20} /> Back to Home
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-slide-in-right { animation: slide-in-right 0.3s ease-out forwards; }
      `}</style>
    </>
  );
};

import { doc, getDoc } from "firebase/firestore";

const SecretSpaceModal = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [dbPassword, setDbPassword] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    // Fetch password from Firestore
    const fetchPassword = async () => {
      try {
        const docRef = doc(db, "config", "secret_lock");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setDbPassword(docSnap.data().password || '');
        } else {
          setDbPassword('');
        }
      } catch {
        setDbPassword('');
      }
    };
    fetchPassword();
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
        <div className="text-center mb-6"><div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4"><Lock className="text-rose-500" size={32} /></div><h3 className="text-xl font-serif text-gray-800">Top Secret Area</h3><p className="text-sm text-gray-500 mt-2">Shh! This is just for us.</p></div>
        <form onSubmit={(e) => { e.preventDefault(); if (password === dbPassword) { onSuccess(); onClose(); setPassword(''); } else { setError(true); setTimeout(() => setError(false), 2000); } }} className="space-y-4">
          <input type="password" placeholder="Enter the magic word..." className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-colors ${error ? 'border-red-400 bg-red-50' : 'border-pink-200 focus:border-rose-400'}`} value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
          {error && <p className="text-xs text-red-500 text-center">Wrong password!</p>}
          <button type="submit" className="w-full bg-rose-500 text-white py-3 rounded-xl font-medium hover:bg-rose-600 transition-colors">Unlock</button>
        </form>
      </div>
    </div>
  );
};

const LoveTicketDispenser = () => {
  const [ticket, setTicket] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const MESSAGES = [
    "You are my favorite notification 🔔",
    "Drink some water, cutie! 💧",
    "I miss you 3000 ❤️",
    "You look beautiful today (I know it) ✨",
    "Can I have a hug? 🫂",
    "Smile, it suits you! 😊",
    "You are the best thing in my life 🌟",
    "Thinking of you... always 💭",
    "You + Me = Perfect 💑",
    "Send me a selfie? 📸"
  ];

  const getTicket = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTicket(null);
    setTimeout(() => {
      const randomMsg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
      setTicket(randomMsg);
      setIsAnimating(false);
    }, 600);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl text-center relative overflow-hidden border border-rose-100">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-200 via-pink-400 to-rose-200"></div>
      <h3 className="text-2xl font-serif text-rose-800 mb-2">Need some love? 💌</h3>
      <p className="text-gray-500 text-sm mb-6">Grab a ticket!</p>

      <div className="relative h-24 mb-6 flex items-center justify-center">
        {/* Ticket Hole */}
        <div className="absolute top-0 w-32 h-2 bg-gray-200 rounded-full"></div>

        {/* The Ticket */}
        <div className={`absolute top-0 w-64 bg-yellow-100 border-2 border-yellow-200 p-4 rounded-lg shadow-sm transform transition-all duration-500 ease-out origin-top
            ${ticket ? 'translate-y-2 opacity-100 rotate-1' : '-translate-y-20 opacity-0 rotate-0'}
            ${isAnimating ? 'animate-pulse' : ''}
        `}>
          <div className="border-2 border-dashed border-yellow-300 p-2 rounded relative">
            <div className="flex gap-2 justify-center mb-1">
              <Star size={12} className="text-yellow-500" fill="currentColor" />
              <Star size={12} className="text-yellow-500" fill="currentColor" />
              <Star size={12} className="text-yellow-500" fill="currentColor" />
            </div>
            <p className="font-handwriting text-rose-600 font-bold text-lg">{ticket || "Printing love..."}</p>
          </div>
        </div>
      </div>

      <button
        onClick={getTicket}
        className="bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-rose-500/30 transition-all flex items-center justify-center gap-2 mx-auto"
        disabled={isAnimating}
      >
        {isAnimating ? <RotateCcw className="animate-spin" size={20} /> : <Zap size={20} fill="currentColor" />}
        {isAnimating ? "Dispensing..." : "Get a Ticket!"}
      </button>
    </div>
  );
};

const LandingPage = ({ userName, onEnterWorld }) => {
  const myBirthday = { month: 12, day: 17 }; // Updated: 17 Dec
  const herBirthday = { month: 7, day: 7 };   // Updated: 7 July
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-rose-100 overflow-x-hidden relative">
      <nav className="bg-white/80 backdrop-blur-md p-4 sticky top-0 z-50 shadow-sm"><div className="max-w-4xl mx-auto flex justify-between items-center text-rose-600"><h1 className="font-serif text-xl font-bold">Us ❤️</h1><span className="text-sm font-medium bg-pink-100 px-3 py-1 rounded-full">Hi, {userName}</span></div></nav>
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-12 pb-32">
        <section className="text-center space-y-4 animate-fade-in-up"><h1 className="text-4xl md:text-6xl font-serif text-rose-800">Welcome Home, Love</h1><p className="text-gray-600 max-w-md mx-auto leading-relaxed">I made this little corner of the internet just for us. Everything here is a memory, a promise, and a piece of my heart.</p></section>
        <section className="bg-white rounded-3xl shadow-xl overflow-hidden transform hover:-translate-y-1 transition-transform duration-500"><div className="md:flex"><div className="md:w-1/2 h-64 md:h-auto relative"><img src={ABOUT_US_PHOTO_URL} alt="Couple Moment" className="absolute inset-0 w-full h-full object-cover" /></div><div className="p-8 md:w-1/2 flex flex-col justify-center"><h2 className="hidden md:block text-3xl font-serif text-rose-800 mb-4">About Us</h2><p className="text-gray-600 leading-relaxed mb-4">From the first "Hello" to every "I love you" in between, our journey has been my favorite story.</p><div className="flex gap-2"><span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-xs font-medium">#Love</span><span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-xs font-medium">#Forever</span></div></div></div></section>

        <section className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4"><Countdown date={myBirthday} title="My Birthday" /><Countdown date={herBirthday} title="Your Birthday" /></div>
        </section>

        {/* Love Ticket Dispenser */}
        <section className="animate-fade-in-up delay-200">
          <LoveTicketDispenser />
        </section>
      </div>
      <div className="fixed bottom-8 left-0 right-0 flex justify-center z-40 px-4"><button className="group relative bg-rose-600 hover:bg-rose-700 text-white text-lg font-medium py-4 px-12 rounded-full shadow-2xl hover:shadow-rose-500/50 transition-all duration-300 transform hover:scale-105 overflow-hidden" onClick={onEnterWorld}><div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div><span className="flex items-center gap-2">Enter to Our World <ArrowRight size={20} /></span></button></div>
      <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } } .group-hover\\:animate-shimmer { animation: shimmer 1.5s infinite; } .animate-fade-in-up { animation: fadeInUp 1s ease-out; } @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
};

export default function App() {
  const [currentStep, setCurrentStep] = useState('loading');
  const [userName, setUserName] = useState('');
  return (
    <div className="font-sans text-gray-800 antialiased">
      {currentStep === 'loading' && <LoadingScreen onComplete={() => setCurrentStep('login')} />}
      {currentStep === 'login' && <LoginPage onLogin={(name) => { setUserName(name); setCurrentStep('landing'); }} />}
      {currentStep === 'landing' && <LandingPage userName={userName} onEnterWorld={() => setCurrentStep('world')} />}
      {currentStep === 'world' && <World onBackHome={() => setCurrentStep('landing')} />}
      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; } @keyframes float { 0% { transform: translateY(0) scale(1); opacity: 0; } 50% { opacity: 0.6; } 100% { transform: translateY(-100px) scale(1.2); opacity: 0; } } .animate-float { animation: float 10s infinite ease-in; } .animate-fade-in-up { animation: fadeInUp 0.8s ease-out; } @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

