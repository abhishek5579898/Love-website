import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db } from '../firebase';
import { Lock, Image as ImageIcon, Upload, X } from 'lucide-react';

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

export const SecretSpaceModal = ({ isOpen, onClose, onSuccess }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [dbPassword, setDbPassword] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        const fetchPassword = async () => {
            try {
                const docRef = doc(db, "config", "secret_lock");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) setDbPassword(docSnap.data().password || '');
                else setDbPassword('');
            } catch { setDbPassword(''); }
        };
        fetchPassword();
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm relative animate-fade-in-up">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4"><Lock className="text-rose-500" size={32} /></div>
                    <h3 className="text-xl font-serif text-gray-800">Top Secret Area</h3>
                    <p className="text-sm text-gray-500 mt-2">Shh! This is just for us.</p>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); if (password === dbPassword) { onSuccess(); onClose(); setPassword(''); } else { setError(true); setTimeout(() => setError(false), 2000); } }} className="space-y-4">
                    <input type="password" placeholder="Enter the magic word..." className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-colors ${error ? 'border-red-400 bg-red-50' : 'border-pink-200 focus:border-rose-400'}`} value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
                    {error && <p className="text-xs text-red-500 text-center">Wrong password!</p>}
                    <button type="submit" className="w-full bg-rose-500 text-white py-3 rounded-xl font-medium hover:bg-rose-600 transition-colors">Unlock</button>
                </form>
            </div>
        </div>
    );
};

const SecretSpace = ({ onLock }) => {
    const [photos, setPhotos] = useState([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const q = query(collection(db, "secret_gallery"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const imgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setPhotos(imgs);
        });
        return () => unsubscribe();
    }, []);

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files).slice(0, 10);
        if (!files.length) return;
        setUploading(true);
        let errorOccurred = false;
        try {
            await Promise.all(files.map(async (file) => {
                try {
                    const url = await uploadToCloudinary(file);
                    await addDoc(collection(db, "secret_gallery"), { url, createdAt: serverTimestamp() });
                } catch { errorOccurred = true; }
            }));
            if (errorOccurred) alert("Some images failed to upload.");
        } catch { alert("Upload failed!"); }
        setUploading(false);
        e.target.value = null;
    };

    return (
        <div className="min-h-screen bg-rose-50 p-6 pb-32">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div><h2 className="text-3xl font-serif text-rose-800">Our Secret Gallery 🔒</h2><p className="text-gray-500">Only for our eyes.</p></div>
                    <button onClick={onLock} className="flex items-center gap-2 bg-rose-100 text-rose-600 px-4 py-2 rounded-full hover:bg-rose-200 transition-colors"><Lock size={16} /> Lock Space</button>
                </div>
                <div className="mb-10">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-rose-300 border-dashed rounded-2xl cursor-pointer bg-rose-50 hover:bg-rose-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6"><Upload className="w-8 h-8 text-rose-400 mb-2" /><p className="text-sm text-gray-500"><span className="font-semibold">Click to upload</span> your photo(s)</p></div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} multiple disabled={uploading} />
                    </label>
                </div>
                {photos.length === 0 ? (
                    <div className="text-center py-10 opacity-50"><ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" /><p>No secret photos yet. Upload one!</p></div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{photos.map((img) => (
                        <div key={img.id} className="aspect-square rounded-xl overflow-hidden shadow-md bg-white p-2"><img src={img.url} alt="Secret" className="w-full h-full object-cover rounded-lg" loading="lazy" /></div>
                    ))}</div>
                )}
            </div>
        </div>
    );
};

export default SecretSpace;
