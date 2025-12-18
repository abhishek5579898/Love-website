import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, updateDoc, deleteDoc, getDoc, setDoc } from "firebase/firestore";
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
const COUPLE_PHOTO_URL = "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=687&auto=format&fit=crop";
import AboutUsPhoto from './assets/about/HomePage.jpeg';
import MeetingPhoto from './assets/about/1st Meeting.jpg';
import DiwaliPhoto from './assets/about/1st Diwali.jpeg';
import ProposePhoto from './assets/about/Propose day.jpg';
import BirthdayPhoto from './assets/about/my birthday.jpeg';
import HomeVisitPhoto from './assets/about/You come home.jpg';
import BikePhoto from './assets/about/Bike breakdown.jpg';
import LeavingCityPhoto from './assets/about/Leaving city.jpg';
import YourBirthdayPhoto from './assets/about/Your Birthday.jpg';
import MyJobPhoto from './assets/about/My job.jpeg';
import FirstClubPhoto from './assets/about/1st club.jpg';
import GymProgressPhoto from './assets/about/Gym Progress.jpeg';
const ABOUT_US_PHOTO_URL = AboutUsPhoto;

// --- Gallery Data ---
const GALLERY_IMAGES = []; // Starts empty now. Upload photos to fill it!

// --- Import Cover Images (small, fast to load) ---
import BulleyaCover from './assets/covers/Bulleya.jpg.jpg';
import DilDiyanGallanCover from './assets/covers/Dil Diyan Gallan.jpg.jpg';
import GuzarishCover from './assets/covers/Guzarish.jpg.jpg';
import HumkoHumiseCover from './assets/covers/Humko Humise Chura Lo.jpg.jpeg';
import JugniCover from './assets/covers/Jugni.jpg.jpg';
import LagJaGaleCover from './assets/covers/Lag Ja Gale.jpg.jpg';
import MainAgarKahoonCover from './assets/covers/Main Agar Kahoon.jpg.jpg';
import NitKhairMangaCover from './assets/covers/Nit Khair Manga.jpg.jpg';
import PeeLoonCover from './assets/covers/Pee Loon.jpg.jpg';
import SajdaaCover from './assets/covers/Sajdaa.jpg.jpg';
import SanuEkPalCover from './assets/covers/Sanu Ek Pal Chain.jpg.jpeg';
import TereLiyeCover from './assets/covers/Tere Liye.jpg.jpg';
import TumAgarCover from './assets/covers/Tum Agar Saath.jpg.jpg';

// --- Songs Data (audio loaded dynamically, not bundled) ---
const SONGS_DATA = [
  { id: 1, title: "Bulleya", artist: "Amit Mishra, Shilpa Rao", cover: BulleyaCover, audioUrl: new URL('./assets/songs/Bulleya Ae Dil Hai Mushkil 320 Kbps.mp3', import.meta.url).href },
  { id: 2, title: "Dil Diyan Gallan", artist: "Atif Aslam", cover: DilDiyanGallanCover, audioUrl: new URL('./assets/songs/Dil Diyan Gallan Tiger Zinda Hai 320 Kbps.mp3', import.meta.url).href },
  { id: 3, title: "Guzarish", artist: "Javed Ali, Sonu Nigam", cover: GuzarishCover, audioUrl: new URL('./assets/songs/Guzarish Ghajini 320 Kbps.mp3', import.meta.url).href },
  { id: 4, title: "Humko Humise Chura Lo", artist: "Lata Mangeshkar, Udit Narayan", cover: HumkoHumiseCover, audioUrl: new URL('./assets/songs/Humko Humise Chura Lo Mohabbatein 320 Kbps.mp3', import.meta.url).href },
  { id: 5, title: "Jugni", artist: "Clinton Cerejo, Vishal Dadlani", cover: JugniCover, audioUrl: new URL('./assets/songs/Jugni Cocktail 320 Kbps.mp3', import.meta.url).href },
  { id: 6, title: "Lag Ja Gale", artist: "Rahat Fateh Ali Khan", cover: LagJaGaleCover, audioUrl: new URL('./assets/songs/Lag Ja Gale Bhoomi 320 Kbps.mp3', import.meta.url).href },
  { id: 7, title: "Main Agar Kahoon", artist: "Sonu Nigam, Shreya Ghoshal", cover: MainAgarKahoonCover, audioUrl: new URL('./assets/songs/Main Agar Kahoon Om Shanti Om 320 Kbps.mp3', import.meta.url).href },
  { id: 8, title: "Nit Khair Manga", artist: "Rahat Fateh Ali Khan", cover: NitKhairMangaCover, audioUrl: new URL('./assets/songs/Nit Khair Manga Raid 320 Kbps.mp3', import.meta.url).href },
  { id: 9, title: "Pee Loon", artist: "Mohit Chauhan", cover: PeeLoonCover, audioUrl: new URL('./assets/songs/Pee Loon Once Upon A Time In Mumbaai 320 Kbps.mp3', import.meta.url).href },
  { id: 10, title: "Sajdaa", artist: "Rahat Fateh Ali Khan, Richa Sharma", cover: SajdaaCover, audioUrl: new URL('./assets/songs/Sajdaa (PenduJatt.Com.Se) (2).mp3', import.meta.url).href },
  { id: 11, title: "Sanu Ek Pal Chain", artist: "Rahat Fateh Ali Khan", cover: SanuEkPalCover, audioUrl: new URL('./assets/songs/Sanu Ek Pal Chain Raid 320 Kbps.mp3', import.meta.url).href },
  { id: 12, title: "Tere Liye", artist: "Atif Aslam, Shreya Ghoshal", cover: TereLiyeCover, audioUrl: new URL('./assets/songs/Tere Liye Prince 320 Kbps.mp3', import.meta.url).href },
  { id: 13, title: "Tum Agar Saath Dene Ka Vada Karo", artist: "Mahendra Kapoor", cover: TumAgarCover, audioUrl: new URL('./assets/songs/Tum Agar Saath Dene Ka Vada Karo Hamraaz 320 Kbps.mp3', import.meta.url).href },
];

// --- Journey Data ---
// --- Journey Data ---
const JOURNEY_DATA = [
  {
    title: "1st Meeting",
    date: "The beginning",
    description: (
      <>
        Mujhe aaj bhi yaad hai…<br />
        main bike par tumse milne aaya tha,<br />
        aur tum bahar aayi thi mujhe milne.<br /><br />
        Tumne mujhe dekhte hi soch liya tha —<br />
        “Iske saath toh relation mein bilkul nahi aana.” 😅😢<br /><br />
        Par kismat ko kuch aur hi manzoor tha.<br />
        Hum mile, baatein hui,<br />
        thoda ghoome, thoda hase,<br />
        aur bina jaane hi ek dusre ke kareeb aa gaye.<br /><br />
        Us din shayad sirf ek meeting thi,<br />
        lekin wahi pal<br />
        hamari kahani ki shuruaat ban gaya.
      </>
    ),
    img: MeetingPhoto
  },
  {
    title: "1st Diwali",
    date: "Festival of Lights",
    description: (
      <>
        Haan, photos Diwali ki nahi hain…<br />
        kyunki tumne photo lene se mana kar diya tha 😅<br />
        par yaqeen maano,<br />
        mere dimaag me wo Diwali aaj bhi bilkul clear hai.<br /><br />
        Tumhara green suit,<br />
        tumhari chalne ki adaa,<br />
        aur tumhe dekhte hi mujhe samajh aa gaya tha —<br />
        iss baar ki Diwali meri life ki best Diwali hone wali hai 💚✨<br /><br />
        Aur haan…<br />
        wo hickey 😶‍🌫️<br />
        usko kaise bhool sakta hoon?<br />
        Ghar par poora din<br />
        dara-dara ghoom raha tha 😂
      </>
    ),
    img: DiwaliPhoto
  },
  {
    title: "My Birthday",
    date: "The Midnight Surprise",
    description: (
      <>
        Mera pehla birthday tumhare saath…<br />
        aur tum bhool gayi thi 😅<br /><br />
        Raat ke 2 baje call aaya,<br />
        “sorry… sorry…” bol rahi thi tum.<br />
        Aur main?<br />
        main toh tanhaiyon me, yaadon me hi dooba hua tha…<br />
        thoda hurt hua tha, sach kahun toh 💔<br /><br />
        Par phir…<br />
        jab 2 baje tum aa gayi,<br />
        sab kuch theek ho gaya.<br />
        Us ek pal ne<br />
        saari narazgi mita di.<br /><br />
        Tab samajh aaya —<br />
        kabhi kabhi der ho jaati hai,<br />
        par tumhara aana hi sabse bada gift tha 🎁❤️
      </>
    ),
    img: BirthdayPhoto,
    imgPos: "object-cover object-top"
  },
  {
    title: "You Come Home",
    date: "Home Sweet Home",
    description: (
      <>
        Wo din jab tum pehli baar mere ghar aayi…<br />
        hum saath baithe,<br />
        movie dekhi, baatein ki,<br />
        aur waqt ka pata hi nahi chala 🎬✨<br /><br />
        Sach bolun,<br />
        pehli baar kisi ladki ko apne ghar laya tha,<br />
        aur dil thoda nervous bhi tha.<br /><br />
        Par tumhare saath<br />
        sab kuch itna natural, itna comfortable lag raha tha…<br />
        jaise tum hamesha se yahin thi.<br /><br />
        Bas ek hi hope hai —<br />
        tumhe bhi accha laga ho,<br />
        kyunki wo pal<br />
        meri yaadon me hamesha special rahega ❤️
      </>
    ),
    img: HomeVisitPhoto,
    imgPos: "object-cover object-top"
  },
  {
    title: "Propose Day",
    date: "1st January",
    description: (
      <>
        Yaad hai…<br />
        jab aakhirkaar tumne mera proposal accept kar liya —<br />
        wo bhi 1 January ko 💫<br /><br />
        Wo din sirf ek proposal nahi tha,<br />
        wo ek nayi zindagi ki shuruaat thi.<br />
        Best day of my life ❤️<br /><br />
        Aur promise hai,<br />
        aise hi infinite New Years<br />
        hum saath-saath celebrate karenge❤️
      </>
    ),
    img: ProposePhoto
  },
  {
    title: "Bike Breakdown",
    date: "The Unplanned Adventure",
    description: (
      <>
        Yaad hai jab hum bike se ghoom rahe the<br />
        aur socha tha kahi door chalte hain…<br />
        par kismat ko kuch aur hi plan tha 😅<br /><br />
        Pehle toh full photoshoot, hasi-mazaak chala,<br />
        sab kuch mast lag raha tha.<br />
        Phir jab pata chala<br />
        bike sach me kharab ho gayi hai…<br />
        dono ki halat hi kharab 😂<br /><br />
        Kitna paidal chale hum,<br />
        thakaan, tension, aur ek dusre ko dekh kar hasi bhi.<br />
        Par end me…<br />
        bike on ho hi gayi 🙏<br />
        Thank God!<br />
        Warna shayad ye memory aur bhi lambi ho jaati 😄
      </>
    ),
    img: BikePhoto
  },
  {
    title: "Leaving City",
    date: "The Hardest Goodbye",
    description: (
      <>
        Ye wo din hai<br />
        jo kaash kabhi na aata…<br />
        par aaya bhi toh<br />
        shayad accha hi tha,<br />
        tumne bohot kuch seekh liya ❤️<br /><br />
        Jab tum<br />
        Greater Noida se Delhi ja rahi thi,<br />
        pehle kaise saath rahe…<br />
        aur phir main<br />
        tumhe itni door bike se chhodne gaya.<br /><br />
        Sach bolun,<br />
        main bohot thak gaya tha,<br />
        soch kar hi kamar me dard badh jaata hai 😅<br />
        Aur wapas aakar<br />
        bas tumhare baare me sochta raha…<br />
        aur emotional hota raha 💔<br /><br />
        Tabse<br />
        tum wapas idhar aa hi nahi paayi…
      </>
    ),
    img: LeavingCityPhoto
  },
  {
    title: "Your Birthday",
    date: "Princess Treatment",
    description: (
      <>
        Ek aisi cheez<br />
        jo tum kabhi nahi bhool paogi ❤️<br /><br />
        Bohot soch-samajh kar<br />
        wo gift diya tha… 😅<br />
        Tumhare liye sab kuch plan karna,<br />
        idhar-udhar bhaagna,<br />
        aur waha tumhare liye khana banana —<br />
        pure princess treatment 👑<br /><br />
        Kasam se,<br />
        kisi aur ke liye itna nahi kiya.<br />
        Agar kiya hota,<br />
        toh shayad aaj mera swayamvar chal raha hota 😂
      </>
    ),
    img: YourBirthdayPhoto
  },
  {
    title: "My Job",
    date: "Turning Point",
    description: (
      <>
        Meri job lagna<br />
        hamari life ka bohot bada turn tha.<br /><br />
        Us din humari<br />
        bohot badi wali ladai chal rahi thi…<br />
        aur tabhi<br />
        job ka call aa gaya,<br />
        joining date aa gayi.<br /><br />
        Maine tumhe bataya<br />
        aur bas…<br />
        ladai the end 😌<br /><br />
        Sach me,<br />
        upar wale ne bhi kya timing set ki thi.<br />
        Ab job ke baad<br />
        tumhe thoda kam time de paata hoon…<br />
        par shayad<br />
        tumhari 11:11 wali wish<br />
        us din poori ho hi gayi thi ✨❤️
      </>
    ),
    img: MyJobPhoto,
    imgPos: "object-cover object-top"
  },
  {
    title: "1st Club",
    date: "Party Night",
    description: (
      <>
        Mera pehla club… wow!<br />
        City me reh kar bhi<br />
        first time club gaya —<br />
        wo bhi apni gf ke saath 💃🕺<br /><br />
        Zyada khaas kuch nahi tha,<br />
        par experience bura bhi nahi tha.<br />
        Tumhare saath dance karna,<br />
        baithna, hasna, baatein karna…<br />
        ek club se dusre club.<br /><br />
        Wo raat<br />
        yaad rakhne wali raat ban gayi 🌙✨
      </>
    ),
    img: FirstClubPhoto
  },
  {
    title: "Gym Progress",
    date: "My Motivation",
    description: (
      <>
        Meri gym ki progress<br />
        sirf tumhari wajah se hai ❤️<br /><br />
        Tum na hoti,<br />
        toh gym bhi shayad na hoti.<br />
        Ye saari muscles pe<br />
        haq tumhara hi toh hai 💪😌<br /><br />
        Har rep, har pain,<br />
        har progress ke peeche<br />
        tum ho —<br />
        meri motivation ✨
      </>
    ),
    img: GymProgressPhoto,
    imgPos: "object-cover object-top"
  }
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

// Skeleton Loader with shimmer effect
const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-gradient-to-r from-rose-100 via-rose-50 to-rose-100 bg-[length:200%_100%] animate-shimmer-move rounded-lg ${className}`}>
    <style>{`
      @keyframes shimmer-move {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      .animate-shimmer-move { animation: shimmer-move 1.5s ease-in-out infinite; }
    `}</style>
  </div>
);

// Gallery Skeleton
const GallerySkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
    {[...Array(8)].map((_, i) => (
      <Skeleton key={i} className="aspect-square rounded-2xl" />
    ))}
  </div>
);

// Love Messages Component (Mini Chat)
const LoveMessages = ({ userName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Fetch messages in real-time
  useEffect(() => {
    const q = query(collection(db, "love_messages"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setMessages(msgs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await addDoc(collection(db, "love_messages"), {
        text: newMessage,
        sender: userName,
        createdAt: serverTimestamp()
      });
      setNewMessage('');
    } catch { alert('Failed to send message'); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white pb-32">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-6 pt-8">
          <h2 className="text-3xl font-serif text-rose-800 mb-2">💌 Love Notes</h2>
          <p className="text-rose-400 italic">Little messages from the heart</p>
        </div>

        {/* Messages Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-rose-100 p-4 min-h-[50vh] max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-3/4" />)}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <Heart size={40} className="mb-2 text-rose-200" />
              <p>No messages yet. Start the conversation! 💕</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => {
                const isMe = msg.sender?.toLowerCase().includes('abhi') || msg.sender?.toLowerCase().includes('abhishek');
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${isMe ? 'bg-rose-500 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <p className={`text-[10px] mt-1 ${isMe ? 'text-rose-200' : 'text-gray-400'}`}>
                        {msg.sender} • {msg.createdAt?.toDate?.()?.toLocaleTimeString?.([], { hour: '2-digit', minute: '2-digit' }) || 'now'}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="mt-4 flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Write something sweet... 💕"
            className="flex-1 px-5 py-4 rounded-full bg-white border-2 border-rose-100 focus:border-rose-300 focus:outline-none text-gray-700 placeholder-rose-300"
          />
          <button type="submit" className="px-6 py-4 bg-rose-500 text-white rounded-full font-bold hover:bg-rose-600 transition-colors shadow-lg">
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

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
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + 1.5; // Slightly faster
      });
    }, 35);
    return () => clearInterval(progressTimer);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const completionTimer = setTimeout(() => {
        onComplete();
      }, 400);
      return () => clearTimeout(completionTimer);
    }
  }, [progress, onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200 flex flex-col items-center justify-center z-50 overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-400/30 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/20 rounded-full blur-[80px] animate-pulse delay-500"></div>
      </div>

      {/* 3D Heart Container with Shadow */}
      <div className="relative w-48 h-48 md:w-64 md:h-64" style={{ perspective: '1000px' }}>
        {/* Outer Glow */}
        <div className="absolute inset-0 blur-xl bg-rose-500/30 rounded-full scale-110 animate-pulse"></div>

        {/* Main Heart SVG */}
        <svg viewBox="0 0 100 90" className="w-full h-full overflow-visible relative z-10" style={{ filter: 'drop-shadow(0 10px 30px rgba(225, 29, 72, 0.4))' }}>
          <defs>
            <mask id="heartMask">
              <path d="M50,88.9 C20,58 0,38 0,22.5 C0,9 10,0 23.5,0 C31.5,0 39,5 50,15 C61,5 68.5,0 76.5,0 C90,0 100,9 100,22.5 C100,38 80,58 50,88.9 Z" fill="white" />
            </mask>
            {/* Gradient for water */}
            <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="50%" stopColor="#e11d48" />
              <stop offset="100%" stopColor="#be123c" />
            </linearGradient>
            {/* Shimmer gradient */}
            <linearGradient id="shimmerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.3)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>

          {/* Heart Glass Outline with 3D effect */}
          <path d="M50,88.9 C20,58 0,38 0,22.5 C0,9 10,0 23.5,0 C31.5,0 39,5 50,15 C61,5 68.5,0 76.5,0 C90,0 100,9 100,22.5 C100,38 80,58 50,88.9 Z"
            fill="rgba(255,255,255,0.1)"
            stroke="url(#waterGradient)"
            strokeWidth="3"
          />

          {/* Inner highlight for glass effect */}
          <path d="M50,88.9 C20,58 0,38 0,22.5 C0,9 10,0 23.5,0 C31.5,0 39,5 50,15 C61,5 68.5,0 76.5,0 C90,0 100,9 100,22.5 C100,38 80,58 50,88.9 Z"
            fill="none"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="1"
            transform="translate(2, 2) scale(0.95)"
          />

          {/* Liquid Fill with gradient */}
          <g mask="url(#heartMask)">
            <g className="transition-transform duration-150 ease-out" style={{ transform: `translateY(${100 - progress}%)` }}>
              {/* Main gradient water body */}
              <rect x="-50" y="0" width="200" height="200" fill="url(#waterGradient)" />

              {/* Shimmer effect layer */}
              <rect x="-50" y="0" width="200" height="200" fill="url(#shimmerGrad)" className="animate-shimmer" />

              {/* Back Wave (Lighter, more visible) */}
              <path d="M-50,0 C-20,12 10,0 40,8 C70,16 100,4 130,10 C160,16 180,6 200,12 V30 H-50 Z"
                fill="#fda4af"
                className="animate-wave-back"
              />

              {/* Middle Wave */}
              <path d="M-50,5 C-10,15 20,3 50,10 C80,17 110,5 140,12 C170,19 190,8 220,14 V30 H-50 Z"
                fill="#fb7185"
                className="animate-wave-mid"
              />

              {/* Front Wave (Darker, prominent) */}
              <path d="M-50,8 C0,18 30,6 60,14 C90,22 120,10 150,16 C180,22 200,12 230,18 V30 H-50 Z"
                fill="#e11d48"
                className="animate-wave-front"
              />

              {/* Bubbles */}
              <circle cx="25" cy="40" r="3" fill="rgba(255,255,255,0.6)" className="animate-bubble-1" />
              <circle cx="55" cy="60" r="2" fill="rgba(255,255,255,0.5)" className="animate-bubble-2" />
              <circle cx="75" cy="50" r="2.5" fill="rgba(255,255,255,0.4)" className="animate-bubble-3" />
              <circle cx="40" cy="70" r="1.5" fill="rgba(255,255,255,0.5)" className="animate-bubble-4" />
            </g>
          </g>

          {/* Sparkle effects on heart */}
          <circle cx="25" cy="20" r="2" fill="white" opacity="0.8" className="animate-sparkle" />
          <circle cx="75" cy="18" r="1.5" fill="white" opacity="0.6" className="animate-sparkle delay-300" />
        </svg>
      </div>

      {/* Percentage Text with Glow */}
      <div className="mt-10 relative z-10">
        <span className="text-5xl md:text-6xl font-serif font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 bg-clip-text text-transparent tabular-nums"
          style={{ textShadow: '0 0 40px rgba(225, 29, 72, 0.3)' }}>
          {Math.round(progress)}%
        </span>
      </div>

      {/* Progress Bar with Glow */}
      <div className="w-48 h-2 bg-white/50 mt-4 rounded-full overflow-hidden backdrop-blur-sm shadow-inner">
        <div className="h-full bg-gradient-to-r from-rose-400 via-rose-500 to-pink-500 transition-all duration-200 relative"
          style={{ width: `${progress}%` }}>
          <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
        </div>
      </div>

      <p className="mt-6 text-rose-500 font-medium tracking-wider uppercase text-sm animate-pulse">
        Filling with love...
      </p>

      {/* Floating Hearts in Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <Heart key={i} fill="#fda4af" size={20 + i * 4}
            className="absolute animate-float-up"
            style={{
              left: `${15 + i * 15}%`,
              bottom: `-${20 + i * 10}px`,
              animationDelay: `${i * 0.8}s`,
              opacity: 0.4
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes wave-front {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-25%); }
        }
        @keyframes wave-mid {
          0%, 100% { transform: translateX(-10%); }
          50% { transform: translateX(-35%); }
        }
        @keyframes wave-back {
          0%, 100% { transform: translateX(-20%); }
          50% { transform: translateX(5%); }
        }
        .animate-wave-front { animation: wave-front 2s ease-in-out infinite; }
        .animate-wave-mid { animation: wave-mid 2.5s ease-in-out infinite; }
        .animate-wave-back { animation: wave-back 3s ease-in-out infinite; }
        
        @keyframes bubble {
          0% { transform: translateY(0) scale(1); opacity: 0.6; }
          100% { transform: translateY(-80px) scale(0.5); opacity: 0; }
        }
        .animate-bubble-1 { animation: bubble 2s ease-out infinite; }
        .animate-bubble-2 { animation: bubble 2.5s ease-out infinite 0.5s; }
        .animate-bubble-3 { animation: bubble 2s ease-out infinite 1s; }
        .animate-bubble-4 { animation: bubble 2.2s ease-out infinite 1.5s; }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .animate-sparkle { animation: sparkle 1.5s ease-in-out infinite; }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer { animation: shimmer 2s ease-in-out infinite; }
        
        @keyframes float-up {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.4; }
          90% { opacity: 0.4; }
          100% { transform: translateY(-100vh) rotate(20deg); opacity: 0; }
        }
        .animate-float-up { animation: float-up 8s ease-in-out infinite; }
        
        .delay-300 { animation-delay: 0.3s; }
        .delay-500 { animation-delay: 0.5s; }
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Prefer displayName, fallback to first part of email if not set
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

// Image compression utility - reduces size by 60-80%
async function compressImage(file, maxWidth = 1200, quality = 0.8) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Scale down if larger than maxWidth
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, { type: 'image/jpeg' }));
        }, 'image/jpeg', quality);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

async function uploadToCloudinary(file) {
  // Compress image before uploading
  const compressedFile = await compressImage(file);

  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  const formData = new FormData();
  formData.append('file', compressedFile);
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

  // Delete photo from gallery
  const handleDeletePhoto = async (e, photoId) => {
    e.stopPropagation();
    if (!window.confirm("Delete this memory?")) return;
    try {
      await deleteDoc(doc(db, "gallery", photoId));
    } catch (err) {
      alert("Failed to delete photo.");
    }
  };

  return (
    <div className="w-full bg-rose-50 min-h-screen p-4 md:p-8 pb-32">
      <div className="text-center mb-10 animate-fade-in-up">
        <h2 className="text-4xl md:text-5xl font-serif text-rose-800 mb-4">Our Beautiful Memories</h2>
        <p className="text-rose-400 italic">Every picture tells a story of us.</p>

        {/* Total Photos Count */}
        <div className="mt-4 inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-rose-100">
          <ImageIcon size={18} className="text-rose-500" />
          <span className="text-rose-600 font-bold">{galleryImages.length}</span>
          <span className="text-gray-500">memories</span>
        </div>

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
            {/* Delete Button */}
            <button
              onClick={(e) => handleDeletePhoto(e, img.id)}
              className="absolute top-2 right-2 p-2 bg-red-500/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600 shadow-lg z-10"
              title="Delete photo"
            >
              <Trash2 size={16} />
            </button>
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

// --- Mobile Premium Journey Event (Timeline Style) ---
const JourneyEventMobile = ({ event, index, isLast }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => setIsVisible(entry.isIntersecting)), { threshold: 0.15 });
    if (domRef.current) observer.observe(domRef.current);
    return () => domRef.current && observer.unobserve(domRef.current);
  }, []);

  return (
    <div ref={domRef} className="relative flex gap-4 pl-2 pb-12">
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-[19px] top-8 bottom-0 w-0.5 bg-gradient-to-b from-rose-300 to-rose-100/50"></div>
      )}

      {/* Timeline Marker (Heart) */}
      <div className={`relative z-10 shrink-0 mt-1 transition-all duration-700 delay-100 ${isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
        <div className="w-10 h-10 rounded-full bg-rose-100 border-2 border-rose-300 flex items-center justify-center shadow-md">
          <Heart size={18} className="text-rose-500 fill-rose-500" />
        </div>
      </div>

      {/* Glassmorphic Content Card */}
      <div className={`flex-1 min-w-0 transform transition-all duration-700 ease-out 
          ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>

        <div className="bg-white/60 backdrop-blur-xl border border-white/60 p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-lg transition-shadow">
          <span className="inline-block px-3 py-1 bg-white text-rose-500 text-[10px] font-bold tracking-widest uppercase rounded-full mb-3 shadow-sm border border-rose-100">
            {event.date}
          </span>

          {/* Photo Frame */}
          <div className="relative mb-4 rotate-1 hover:rotate-0 transition-transform duration-300">
            <div className="absolute inset-0 bg-gray-200 rounded-2xl transform translate-y-1 translate-x-1"></div>
            <div className="relative rounded-2xl overflow-hidden shadow-sm aspect-[4/3] bg-white border-4 border-white">
              {event.img ? (
                <img src={event.img} alt={event.title} className={`w-full h-full ${event.imgPos || 'object-cover object-center'}`} loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-rose-50 text-rose-300">
                  <ImageIcon size={32} />
                </div>
              )}
            </div>
          </div>

          <h3 className="text-2xl font-serif text-gray-800 mb-2 leading-tight">
            {event.title}
          </h3>
          <div className="text-sm text-gray-600 font-light leading-relaxed">
            {event.description}
          </div>
        </div>
      </div>
    </div>
  );
};

const JourneyEventDesktop = ({ event, index }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => setIsVisible(entry.isIntersecting)), { threshold: 0.2 });
    if (domRef.current) observer.observe(domRef.current);
    return () => domRef.current && observer.unobserve(domRef.current);
  }, []);

  const isEven = index % 2 === 0;

  return (
    <div ref={domRef} className={`hidden md:flex min-h-[60vh] items-center justify-center p-8 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`flex flex-row items-center gap-16 max-w-6xl w-full ${isEven ? '' : 'flex-row-reverse'}`}>
        <div className={`flex-1 w-full transform transition-all duration-1000 delay-300 
            ${isVisible ? 'translate-x-0 opacity-100' : (isEven ? '-translate-x-20 opacity-0' : 'translate-x-20 opacity-0')}`}>
          <div className="relative group rounded-3xl overflow-hidden shadow-2xl border-4 border-white rotate-2 hover:rotate-0 transition-transform bg-white">
            {event.img ? (
              <img src={event.img} alt={event.title} className={`w-full h-auto max-h-[500px] ${event.imgPos || 'object-cover object-center'}`} />
            ) : (
              <div className="w-full h-64 bg-rose-100 flex items-center justify-center text-rose-400">
                <p>No Image</p>
              </div>
            )}
          </div>
        </div>
        <div className={`flex-1 text-left transform transition-all duration-1000 delay-500 
            ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
          <span className="inline-block px-4 py-2 bg-rose-100 text-rose-600 rounded-full text-sm font-bold mb-4">{event.date}</span>
          <h2 className="text-6xl font-serif text-rose-800 mb-6">{event.title}</h2>
          <div className="text-xl text-gray-600 leading-relaxed font-light">{event.description}</div>
        </div>
      </div>
    </div>
  )
}

const Journey = React.memo(() => {
  return (
    <div className="w-full bg-gradient-to-b from-rose-50 to-white pb-32">
      <div className="h-[30vh] md:h-[40vh] flex items-center justify-center bg-rose-50">
        <h2 className="text-4xl md:text-6xl font-serif text-rose-800 animate-fade-in-up">Our Beautiful Journey ❤️</h2>
      </div>

      {/* Mobile View (Premium Timeline) */}
      <div className="md:hidden px-4">
        <div className="max-w-md mx-auto relative">
          {JOURNEY_DATA.map((event, i) => (
            <JourneyEventMobile key={i} event={event} index={i} isLast={i === JOURNEY_DATA.length - 1} />
          ))}
        </div>
      </div>

      {/* Desktop View (Classic Split) */}
      <div className="hidden md:block">
        {JOURNEY_DATA.map((event, i) => <JourneyEventDesktop key={i} event={event} index={i} />)}
      </div>

      {/* Updated Fights & Ending Section */}
      <div className="relative py-24 bg-rose-50 text-rose-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <CloudLightning className="w-16 h-16 mx-auto mb-6 text-rose-400 animate-pulse" />
          <h2 className="text-4xl font-serif text-rose-800 mb-8">The Storms We Weathered</h2>
          <div className="text-lg text-gray-600 mb-12">
            <p className="mb-2">Haan, hum ladte hain. Sometimes a lot. But you know what? That's the best part.</p>
            <p>Kyunki har ladai ke baad wala pyaar aur bhi gehra hota hai.</p>
            <p>Fights hoti rahengi, manana chalta rahega, bas tum saath rehna.</p>
          </div>

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
    { id: 5, icon: "🔮", title: "The Soul", text: "Mujhe sirf tumse pyaar nahi hai... Mujhe tumhari har aadato se pyaar hai ( example - meri care krna). Forever and ever." },
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
          <div className="bg-white px-6 py-3 shadow-sm z-30 font-serif text-rose-800 font-bold rotate-[-2deg]">To Roshni ❤️</div><span className="absolute -bottom-10 text-rose-500 text-sm animate-bounce">Tap to open</span>
        </div>
      ) : (
        <div className="relative w-full max-w-2xl bg-[#fffef0] shadow-2xl min-h-[60vh] p-8 md:p-12 animate-fade-in-up mx-4">
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#e5e5e5 1px, transparent 1px)', backgroundSize: '100% 2em', marginTop: '4em' }}></div>
          <div className="absolute top-0 bottom-0 left-8 md:left-12 w-px bg-red-200"></div>
          <div className="relative z-10 font-serif text-gray-700 leading-[2em] text-lg md:text-xl">
            <div className="flex justify-between items-start mb-8"><span className="font-bold text-rose-600 text-2xl">Dear Roshni,</span><span className="text-sm text-gray-400">14 Dec 2025</span></div>
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

// --- Secret Photos Component (Gallery) ---
const SecretPhotos = ({ onBack }) => {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isSlideshow, setIsSlideshow] = useState(false);
  const slideshowRef = useRef(null);

  // Real-time fetch from Firestore
  useEffect(() => {
    const q = query(collection(db, "secret_gallery"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const imgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPhotos(imgs);
    });
    return () => unsubscribe();
  }, []);

  // Slideshow auto-advance
  useEffect(() => {
    if (isSlideshow && photos.length > 0) {
      slideshowRef.current = setInterval(() => {
        setSelectedIndex(prev => (prev + 1) % photos.length);
      }, 3000);
    }
    return () => clearInterval(slideshowRef.current);
  }, [isSlideshow, photos.length]);

  const nextPhoto = useCallback(() => {
    setSelectedIndex(prev => (prev + 1) % photos.length);
  }, [photos.length]);

  const prevPhoto = useCallback(() => {
    setSelectedIndex(prev => (prev - 1 + photos.length) % photos.length);
  }, [photos.length]);

  // Multi-image upload with progress (up to 130 images, batch processing)
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files).slice(0, 130);
    if (!files.length) return;
    setUploading(true);
    setUploadProgress({ current: 0, total: files.length });
    let errorOccurred = false;

    // Process in batches of 10 to avoid overwhelming network
    const batchSize = 10;
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      await Promise.all(batch.map(async (file) => {
        try {
          const url = await uploadToCloudinary(file);
          await addDoc(collection(db, "secret_gallery"), {
            url,
            createdAt: serverTimestamp()
          });
        } catch { errorOccurred = true; }
        finally { setUploadProgress(prev => ({ ...prev, current: prev.current + 1 })); }
      }));
    }
    if (errorOccurred) alert("Some images failed to upload.");
    setUploading(false);
    setUploadProgress({ current: 0, total: 0 });
    e.target.value = null;
  };

  return (
    <div className="min-h-screen bg-rose-50 p-6 pb-32">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 bg-white rounded-full shadow-md hover:bg-rose-50 transition-colors">
              <ChevronLeft size={24} className="text-rose-600" />
            </button>
            <div>
              <h2 className="text-3xl font-serif text-rose-800">Secret Photos 📸</h2>
              <p className="text-gray-500">Only for our eyes.</p>
            </div>
          </div>
        </div>

        {/* Photo Count */}
        <div className="mb-6 inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-rose-100">
          <ImageIcon size={18} className="text-rose-500" />
          <span className="text-rose-600 font-bold">{photos.length}</span>
          <span className="text-gray-500">secret memories</span>
        </div>

        {/* Upload Area */}
        <div className="mb-10">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-rose-300 border-dashed rounded-2xl cursor-pointer bg-rose-50 hover:bg-rose-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {uploading ? (
                <>
                  <RotateCcw className="w-8 h-8 text-rose-400 mb-2 animate-spin" />
                  <p className="text-sm text-rose-600 font-medium">Uploading {uploadProgress.current}/{uploadProgress.total}...</p>
                </>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-rose-400 mb-2" />
                  <p className="text-sm text-gray-500"><span className="font-semibold">Click to upload</span> your photo(s)</p>
                </>
              )}
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} multiple disabled={uploading} />
          </label>
        </div>

        {/* Photo Grid */}
        {photos.length === 0 ? (
          <div className="text-center py-10 opacity-50">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No secret photos yet. Upload one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((img, index) => (
              <div
                key={img.id}
                className="group relative aspect-square rounded-xl overflow-hidden shadow-md bg-white p-2 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => { setSelectedIndex(index); setIsSlideshow(false); }}
              >
                <img src={img.url} alt="Secret" className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && photos[selectedIndex] && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center animate-fade-in">
          <button onClick={() => { setSelectedIndex(null); setIsSlideshow(false); }} className="absolute top-4 right-4 text-white p-2 z-50 hover:bg-white/10 rounded-full">
            <X size={32} />
          </button>
          <div className="absolute top-4 left-4 text-white/70 text-sm font-medium z-50">
            {selectedIndex + 1} / {photos.length}
          </div>
          <img src={photos[selectedIndex].url} alt="Secret Photo" className="max-h-[85vh] max-w-full object-contain rounded-lg animate-zoom-in" />
          <button onClick={(e) => { e.stopPropagation(); prevPhoto(); }} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 text-white p-3 rounded-full hover:bg-white/20 transition-colors">
            <ChevronLeft size={28} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); nextPhoto(); }} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 text-white p-3 rounded-full hover:bg-white/20 transition-colors">
            <ChevronRight size={28} />
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-full flex items-center gap-6 z-50">
            <button onClick={() => setIsSlideshow(!isSlideshow)} className="flex items-center gap-2 text-white font-medium hover:text-rose-300 transition-colors">
              {isSlideshow ? <Pause size={20} /> : <Play size={20} />}
              {isSlideshow ? 'Pause' : 'Slideshow'}
            </button>
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
};

// --- Love Talks Component (Private Chat with Auto-Delete) ---
const LoveTalks = ({ onBack, userName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewingImage, setViewingImage] = useState(null);
  const [otherTyping, setOtherTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Normalize username for comparison
  const normalizeUser = (name) => name?.toLowerCase().replace(/\s+/g, '') || '';
  const myNormalizedName = normalizeUser(userName);

  // Fetch messages in real-time & auto-delete expired ones
  useEffect(() => {
    const q = query(collection(db, "secret_chat"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const now = new Date();
      const msgs = [];
      snapshot.docs.forEach(docSnap => {
        const data = docSnap.data();
        const expiresAt = data.expiresAt?.toDate?.();
        // Delete expired messages
        if (expiresAt && expiresAt < now) {
          deleteDoc(doc(db, "secret_chat", docSnap.id));
        } else {
          msgs.push({ id: docSnap.id, ...data });
        }
      });
      setMessages(msgs);
      setLoading(false);

      // Mark messages as seen that are from others
      msgs.forEach(async (m) => {
        const msgSender = normalizeUser(m.sender);
        if (msgSender !== myNormalizedName && !m.seen) {
          try { await updateDoc(doc(db, "secret_chat", m.id), { seen: true }); } catch { }
        }
      });
    });
    return () => unsubscribe();
  }, [myNormalizedName]);

  // Listen for typing status
  useEffect(() => {
    const typingRef = doc(db, "secret_chat_typing", "status");
    const unsubscribe = onSnapshot(typingRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const typingUser = normalizeUser(data.user);
        const typingTime = data.timestamp?.toDate?.();
        const now = new Date();
        if (typingUser && typingUser !== myNormalizedName && typingTime && (now - typingTime) < 3000) {
          setOtherTyping(true);
        } else {
          setOtherTyping(false);
        }
      }
    });
    return () => unsubscribe();
  }, [myNormalizedName]);

  // Cleanup interval for expired messages
  useEffect(() => {
    const cleanup = setInterval(async () => {
      const now = new Date();
      messages.forEach(async (msg) => {
        const expiresAt = msg.expiresAt?.toDate?.();
        if (expiresAt && expiresAt < now) {
          try { await deleteDoc(doc(db, "secret_chat", msg.id)); } catch { }
        }
      });
    }, 30000); // Check every 30 seconds
    return () => clearInterval(cleanup);
  }, [messages]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, otherTyping]);

  // Update typing status
  const updateTypingStatus = async () => {
    try {
      await setDoc(doc(db, "secret_chat_typing", "status"), { user: userName, timestamp: serverTimestamp() });
    } catch { }
  };

  // Handle input change with typing indicator
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    updateTypingStatus();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(async () => {
      try { await setDoc(doc(db, "secret_chat_typing", "status"), { user: "", timestamp: serverTimestamp() }); } catch { }
    }, 2000);
  };

  // Send text message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 6 * 60 * 60 * 1000); // 6 hours
    try {
      await addDoc(collection(db, "secret_chat"), {
        text: newMessage,
        imageUrl: null,
        isPhoto: false,
        sender: userName,
        createdAt: serverTimestamp(),
        expiresAt: expiresAt,
        seen: false
      });
      setNewMessage('');
      // Clear typing status
      await setDoc(doc(db, "secret_chat_typing", "status"), { user: "", timestamp: serverTimestamp() });
    } catch { alert('Failed to send message'); }
  };

  // Send photo message
  const sendPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 1 * 60 * 1000); // 1 minute
      await addDoc(collection(db, "secret_chat"), {
        text: null,
        imageUrl: url,
        isPhoto: true,
        sender: userName,
        createdAt: serverTimestamp(),
        expiresAt: expiresAt,
        seen: false
      });
    } catch { alert('Failed to send photo'); }
    setUploading(false);
    e.target.value = null;
  };

  // Delete single message
  const deleteMessage = async (id) => {
    try { await deleteDoc(doc(db, "secret_chat", id)); }
    catch { alert('Failed to delete'); }
  };

  // Clear all chat
  const clearAllChat = async () => {
    if (!window.confirm("Delete ALL messages? This cannot be undone!")) return;
    try {
      const batch = messages.map(msg => deleteDoc(doc(db, "secret_chat", msg.id)));
      await Promise.all(batch);
    } catch { alert('Failed to clear chat'); }
  };

  // Get remaining time for message
  const getRemainingTime = (expiresAt) => {
    if (!expiresAt?.toDate) return '';
    const now = new Date();
    const exp = expiresAt.toDate();
    const diff = exp - now;
    if (diff <= 0) return 'Expiring...';
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) return `${hrs}h ${mins % 60}m`;
    const secs = Math.floor((diff % 60000) / 1000);
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-rose-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 bg-rose-50 rounded-full hover:bg-rose-100 transition-colors">
            <ChevronLeft size={24} className="text-rose-600" />
          </button>
          <div>
            <h2 className="text-xl font-serif text-rose-800 font-bold">💬 Love Talks</h2>
            <p className="text-xs text-gray-400">
              {otherTyping ? <span className="text-rose-500 animate-pulse">typing...</span> : 'Photos: 1min • Texts: 6hrs'}
            </p>
          </div>
        </div>
        <button onClick={clearAllChat} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Clear All">
          <Trash2 size={20} />
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="space-y-4 pt-10">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-3/4" />)}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 text-gray-400">
            <Heart size={48} className="mb-3 text-rose-200" />
            <p className="text-center">No messages yet.<br />Start a secret convo! 🤫</p>
          </div>
        ) : (
          messages.map((msg) => {
            // Check if current user sent this message
            const isMe = normalizeUser(msg.sender) === myNormalizedName;
            const remaining = getRemainingTime(msg.expiresAt);
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                <div className={`relative max-w-[80%] px-4 py-3 rounded-2xl shadow-sm ${isMe ? 'bg-gradient-to-br from-rose-500 to-pink-500 text-white rounded-br-sm' : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'}`}>
                  {msg.isPhoto && msg.imageUrl ? (
                    <div className="relative">
                      <img
                        src={msg.imageUrl}
                        alt="Secret"
                        className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        style={{ maxHeight: '200px' }}
                        onClick={() => setViewingImage(msg.imageUrl)}
                      />
                      <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${isMe ? 'bg-white/30 text-white' : 'bg-red-100 text-red-600'}`}>
                        ⏱ {remaining}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  )}
                  <div className={`flex items-center justify-between gap-3 mt-2 ${isMe ? 'text-rose-200' : 'text-gray-400'}`}>
                    <span className="text-[10px]">
                      {msg.sender} • {msg.createdAt?.toDate?.()?.toLocaleTimeString?.([], { hour: '2-digit', minute: '2-digit' }) || 'now'}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px]">⏱ {remaining}</span>
                      {isMe && (
                        <span className="text-[10px] ml-1">
                          {msg.seen ? <span title="Seen" className="text-blue-300">✓✓</span> : <span title="Sent" className="opacity-60">✓</span>}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Delete button - only for own messages */}
                  {isMe && (
                    <button
                      onClick={() => deleteMessage(msg.id)}
                      className="absolute -top-2 -left-2 opacity-0 group-hover:opacity-100 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all transform hover:scale-110"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
        {/* Typing indicator bubble */}
        {otherTyping && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-500 px-4 py-3 rounded-2xl rounded-bl-sm border border-gray-100 shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-gray-100 p-4 pb-8">
        <form onSubmit={sendMessage} className="flex items-center gap-2">
          {/* Photo Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="p-3 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200 transition-colors disabled:opacity-50"
          >
            {uploading ? <RotateCcw size={20} className="animate-spin" /> : <ImageIcon size={20} />}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={sendPhoto}
          />

          {/* Text Input */}
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type a secret message... 🤫"
            className="flex-1 px-5 py-3 rounded-full bg-gray-50 border-2 border-gray-100 focus:border-rose-300 focus:outline-none text-gray-700 placeholder-gray-400"
          />

          {/* Send Button */}
          <button
            type="submit"
            className="p-3 bg-rose-500 text-white rounded-full font-bold hover:bg-rose-600 transition-colors shadow-lg disabled:opacity-50"
            disabled={!newMessage.trim()}
          >
            <ArrowRight size={20} />
          </button>
        </form>
        <p className="text-center text-xs text-gray-400 mt-2">📸 Photos vanish in 1 min • 💬 Texts in 6 hrs</p>
      </div>

      {/* Image Viewer Modal */}
      {viewingImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={() => setViewingImage(null)}>
          <button className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full">
            <X size={32} />
          </button>
          <img src={viewingImage} alt="Secret" className="max-h-[90vh] max-w-full object-contain" />
        </div>
      )}
    </div>
  );
};

// --- Secret Space Main Container (Section Chooser) ---
const SecretSpace = ({ onLock, userName }) => {
  const [activeSection, setActiveSection] = useState(null); // null = chooser, 'photos', 'chat'

  // Section Chooser View
  if (!activeSection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-purple-100 flex flex-col items-center justify-center p-6">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-rose-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-300/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 text-center mb-12 animate-fade-in-up">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Lock className="w-10 h-10 text-rose-500" />
          </div>
          <h1 className="text-4xl font-serif text-rose-800 mb-3">Secret Space 🔐</h1>
          <p className="text-gray-500">Choose what you want to explore...</p>
        </div>

        <div className="relative z-10 grid gap-6 max-w-md w-full">
          {/* Photos Option */}
          <button
            onClick={() => setActiveSection('photos')}
            className="group bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/50 hover:shadow-2xl hover:scale-[1.02] transition-all text-left"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <ImageIcon size={32} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-serif text-gray-800 mb-1">Secret Photos</h3>
                <p className="text-gray-500 text-sm">Our private gallery • Forever saved</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-rose-500 font-medium">
              <span>Open Gallery</span>
              <ChevronRight size={20} className="ml-2 group-hover:translate-x-2 transition-transform" />
            </div>
          </button>

          {/* Chat Option */}
          <button
            onClick={() => setActiveSection('chat')}
            className="group bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/50 hover:shadow-2xl hover:scale-[1.02] transition-all text-left"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Mail size={32} className="text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-serif text-gray-800 mb-1">Love Talks</h3>
                <p className="text-gray-500 text-sm">Private chat • Auto-deleting messages</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-purple-500 font-medium">
              <span>Start Chatting</span>
              <ChevronRight size={20} className="ml-2 group-hover:translate-x-2 transition-transform" />
            </div>
          </button>
        </div>

        {/* Lock Button */}
        <button
          onClick={onLock}
          className="relative z-10 mt-12 flex items-center gap-2 bg-white/60 backdrop-blur-sm text-gray-600 px-6 py-3 rounded-full hover:bg-white/80 transition-colors shadow-md"
        >
          <Lock size={16} /> Lock & Exit
        </button>
      </div>
    );
  }

  // Render active section
  if (activeSection === 'photos') {
    return <SecretPhotos onBack={() => setActiveSection(null)} />;
  }

  if (activeSection === 'chat') {
    return <LoveTalks onBack={() => setActiveSection(null)} userName={userName} />;
  }

  return null;
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
const World = ({ onBackHome, userName }) => {
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
        {activeTab === 'secret' && <SecretSpace onLock={() => { setIsSecretUnlocked(false); setActiveTab('journey'); }} userName={userName} />}
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
    { id: 'letter', label: 'Letter', icon: KeyRound },
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

            <div className="absolute bottom-8 left-6 right-6 space-y-3">
              <button onClick={onHomeClick} className="w-full py-4 border-2 border-rose-100 text-rose-600 font-bold rounded-2xl hover:bg-rose-50 transition-colors flex items-center justify-center gap-2">
                <Home size={20} /> Back to Home
              </button>
              <button
                onClick={async () => { await signOut(auth); window.location.reload(); }}
                className="w-full py-3 bg-gray-100 text-gray-600 font-medium rounded-2xl hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowRight size={18} className="rotate-180" /> Logout
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

const MoodCare = () => {
  const [selectedMood, setSelectedMood] = useState(null);

  const MOODS = [
    { id: 'miss', icon: '🥺', label: 'Missing You', color: 'bg-blue-100 text-blue-600', msg: "Aww, I miss you too! 🫂 Virtual hug sending... 3... 2... 1... *SQUEEZE*! Call me now? ❤️" },
    { id: 'sad', icon: '😢', label: 'Sad', color: 'bg-indigo-100 text-indigo-600', msg: "Don't be sad panda. 🐼 Remember I'm always with you. Smile for me? Ek baar?" },
    { id: 'angry', icon: '😡', label: 'Angry', color: 'bg-red-100 text-red-600', msg: "Gussa thook do na cutie! 😤 I'm sorry if I annoyed you. Love you infinitely! ❤️" },
    { id: 'bored', icon: '🥱', label: 'Bored', color: 'bg-yellow-100 text-yellow-600', msg: "Bored? Let's play a game! Or... you can stare at my photo? 😜" },
    { id: 'happy', icon: '🥰', label: 'Happy', color: 'bg-green-100 text-green-600', msg: "Yay! Your happiness is my favorite thing! Keep smiling, sunshine! ☀️" },
    { id: 'tired', icon: '😫', label: 'Tired', color: 'bg-purple-100 text-purple-600', msg: "You worked hard today! 🌟 Time to relax. Lay down, close your eyes, and imagine I'm cuddling you." }
  ];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-rose-100 relative overflow-hidden">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-serif text-rose-800 mb-2">How is my baby feeling? 🩺</h3>
        <p className="text-gray-500 text-sm">Select your mood for a special dose of love.</p>
      </div>

      {selectedMood ? (
        <div className="bg-rose-50 rounded-2xl p-6 text-center animate-fade-in-up">
          <div className="text-4xl mb-4">{selectedMood.icon}</div>
          <p className="text-lg font-medium text-rose-700 mb-6 font-serif">"{selectedMood.msg}"</p>
          <button
            onClick={() => setSelectedMood(null)}
            className="bg-white text-rose-500 font-bold py-2 px-6 rounded-full shadow-sm hover:shadow-md transition-all text-sm uppercase tracking-wide"
          >
            Check Another Mood
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {MOODS.map((mood) => (
            <button
              key={mood.id}
              onClick={() => setSelectedMood(mood)}
              className={`${mood.color} p-4 rounded-2xl flex flex-col items-center gap-2 hover:scale-105 transition-transform duration-300 shadow-sm`}
            >
              <span className="text-2xl">{mood.icon}</span>
              <span className="font-bold text-sm">{mood.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const LandingPage = ({ userName, onEnterWorld }) => {
  const myBirthday = { month: 12, day: 17 }; // Updated: 17 Dec
  const herBirthday = { month: 7, day: 7 };   // Updated: 7 July

  // Secure name display - decoded at runtime to hide from inspect
  // "Abhishek" = QWJoaXNoZWs=, "Roshni" = Um9zaG5p
  const getSecureDisplayName = (rawName) => {
    if (!rawName) return '';
    const lowerName = rawName.toLowerCase();
    // Check patterns and return decoded names
    if (lowerName.includes('abhishek') || lowerName.includes('abhi')) {
      return atob('QWJoaXNoZWs='); // Abhishek
    }
    if (lowerName.includes('rosh') || lowerName.includes('rodhni')) {
      return atob('Um9zaG5p'); // Roshni
    }
    // Fallback to first letter uppercase
    return rawName.charAt(0).toUpperCase() + rawName.slice(1);
  };

  const displayName = getSecureDisplayName(userName);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-rose-100 overflow-x-hidden relative">
      <nav className="bg-white/80 backdrop-blur-md p-4 sticky top-0 z-50 shadow-sm"><div className="max-w-4xl mx-auto flex justify-between items-center text-rose-600"><h1 className="font-serif text-xl font-bold">Us ❤️</h1><span className="text-sm font-medium bg-pink-100 px-3 py-1 rounded-full">Hi, {displayName}</span></div></nav>
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-12 pb-32">
        <section className="text-center space-y-4 animate-fade-in-up"><h1 className="text-4xl md:text-6xl font-serif text-rose-800">Welcome Home, Love</h1><p className="text-gray-600 max-w-md mx-auto leading-relaxed">I made this little corner of the internet just for us. Everything here is a memory, a promise, and a piece of my heart.</p></section>
        <section className="bg-white rounded-3xl shadow-xl overflow-hidden transform hover:-translate-y-1 transition-transform duration-500"><div className="md:flex"><div className="md:w-1/2 h-64 md:h-auto relative"><img src={ABOUT_US_PHOTO_URL} alt="Couple Moment" className="absolute inset-0 w-full h-full object-cover" /></div><div className="p-8 md:w-1/2 flex flex-col justify-center"><h2 className="hidden md:block text-3xl font-serif text-rose-800 mb-4">About Us</h2><div className="text-gray-600 leading-relaxed mb-4"><p className="mb-2">Hum koi perfect couple nahi hain,<br />lekin ek dusre ke liye perfect hain.</p><p className="mb-2">Hamari kahani kisi fairy tale jaisi shuru nahi hui,<br />par aaj har din ek khubsurat kahani ban chuki hai.</p><p>Ye sirf ek website nahi,<br />ye hamare pyaar ka ek chhota sa hissa hai,<br />jahan har photo, har line aur har feeling<br />sirf ek hi cheez ke liye hai…<br />tum ❤️</p></div><div className="flex gap-2"><span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-xs font-medium">#Love</span><span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-xs font-medium">#Forever</span></div></div></div></section>

        <section className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4"><Countdown date={myBirthday} title="My Birthday" /><Countdown date={herBirthday} title="Your Birthday" /></div>
        </section>

        {/* Mood Care Station */}
        <section className="animate-fade-in-up delay-200">
          <MoodCare />
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

  // Listen for auth state changes to auto-fill name if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        let name = user.displayName;
        if (!name || name.trim() === "") {
          name = user.email ? user.email.split('@')[0] : "User";
        }
        setUserName(name);
        setCurrentStep('landing');
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="font-sans text-gray-800 antialiased">
      {currentStep === 'loading' && <LoadingScreen onComplete={() => setCurrentStep('login')} />}
      {currentStep === 'login' && <LoginPage onLogin={(name) => { setUserName(name); setCurrentStep('landing'); }} />}
      {currentStep === 'landing' && <LandingPage userName={userName} onEnterWorld={() => setCurrentStep('world')} />}
      {currentStep === 'world' && <World onBackHome={() => setCurrentStep('landing')} userName={userName} />}
      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; } @keyframes float { 0% { transform: translateY(0) scale(1); opacity: 0; } 50% { opacity: 0.6; } 100% { transform: translateY(-100px) scale(1.2); opacity: 0; } } .animate-float { animation: float 10s infinite ease-in; } .animate-fade-in-up { animation: fadeInUp 0.8s ease-out; } @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

