import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, deleteDoc } from "firebase/firestore";
import { db } from '../firebase';
import { Image as ImageIcon, Upload, RotateCcw, X, ChevronLeft, ChevronRight, Play, Pause, Trash2 } from 'lucide-react';

// Cloudinary upload helper
async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData
    });
    const data = await res.json();
    if (!data.secure_url) throw new Error('Cloudinary upload failed');
    return data.secure_url;
}

const Gallery = memo(() => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed] = useState(3000);
    const [galleryImages, setGalleryImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
    const intervalRef = useRef(null);

    useEffect(() => {
        const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const imgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
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

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files).slice(0, 90);
        if (!files.length) return;
        setUploading(true);
        setUploadProgress({ current: 0, total: files.length });
        let errorOccurred = false;
        const batchSize = 10;
        for (let i = 0; i < files.length; i += batchSize) {
            const batch = files.slice(i, i + batchSize);
            await Promise.all(batch.map(async (file) => {
                try {
                    const url = await uploadToCloudinary(file);
                    await addDoc(collection(db, "gallery"), { url, createdAt: serverTimestamp() });
                } catch { errorOccurred = true; }
                finally { setUploadProgress(prev => ({ current: prev.current + 1, total: prev.total })); }
            }));
        }
        if (errorOccurred) alert("Some images failed to upload.");
        setUploading(false);
        setUploadProgress({ current: 0, total: 0 });
        e.target.value = null;
    };

    const handleDeletePhoto = async (e, photoId) => {
        e.stopPropagation();
        if (!window.confirm("Delete this memory?")) return;
        try { await deleteDoc(doc(db, "gallery", photoId)); }
        catch { alert("Failed to delete photo."); }
    };

    return (
        <div className="w-full bg-rose-50 min-h-screen p-4 md:p-8 pb-32">
            <div className="text-center mb-10 animate-fade-in-up">
                <h2 className="text-4xl md:text-5xl font-serif text-rose-800 mb-4">Our Beautiful Memories</h2>
                <p className="text-rose-400 italic">Every picture tells a story of us.</p>
                <div className="mt-4 inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-rose-100">
                    <ImageIcon size={18} className="text-rose-500" />
                    <span className="text-rose-600 font-bold">{galleryImages.length}</span>
                    <span className="text-gray-500">memories</span>
                </div>
                <div className="mt-6 flex justify-center">
                    <label className="flex items-center gap-2 bg-rose-500 text-white px-6 py-3 rounded-full cursor-pointer hover:bg-rose-600 transition-colors shadow-lg">
                        {uploading ? <RotateCcw className="animate-spin" size={20} /> : <Upload size={20} />}
                        <span className="font-bold">{uploading ? `Uploading ${uploadProgress.current}/${uploadProgress.total}` : "Add Memory"}</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} multiple />
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {galleryImages.map((img, index) => (
                    <div key={img.id} className="group relative aspect-square overflow-hidden rounded-2xl cursor-pointer shadow-md bg-white" onClick={() => { setSelectedImageIndex(index); setIsPlaying(false); }}>
                        <img src={img.url} alt="Memory" loading="lazy" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                        <button onClick={(e) => handleDeletePhoto(e, img.id)} className="absolute top-2 right-2 p-2 bg-red-500/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600 shadow-lg z-10" title="Delete photo">
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
                {galleryImages.length === 0 && (
                    <div className="col-span-full text-center py-20 text-gray-400">No memories yet. Start by uploading one! 📸</div>
                )}
            </div>

            {selectedImageIndex !== null && galleryImages[selectedImageIndex] && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center animate-fade-in">
                    <button onClick={() => setSelectedImageIndex(null)} className="absolute top-4 right-4 text-white p-2 z-50"><X size={32} /></button>
                    <img src={galleryImages[selectedImageIndex].url} alt="Full" className="max-h-[85vh] max-w-full object-contain rounded-lg animate-zoom-in" />
                    <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 text-white p-3 rounded-full hover:bg-white/20"><ChevronLeft /></button>
                    <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 text-white p-3 rounded-full hover:bg-white/20"><ChevronRight /></button>
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

export default Gallery;
