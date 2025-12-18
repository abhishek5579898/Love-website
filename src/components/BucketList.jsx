import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from '../firebase';
import { Heart, Plus, Check, Trash2 } from 'lucide-react';

const BucketList = () => {
    const [wishes, setWishes] = useState([]);
    const [newWish, setNewWish] = useState("");

    useEffect(() => {
        const q = query(collection(db, "wishes"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const wishList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setWishes(wishList);
        });
        return () => unsubscribe();
    }, []);

    const addWish = async (e) => {
        e.preventDefault();
        if (!newWish.trim()) return;
        try {
            await addDoc(collection(db, "wishes"), { text: newWish, completed: false, createdAt: serverTimestamp() });
            setNewWish("");
        } catch { alert("Failed to add dream."); }
    };

    const toggleWish = async (id, currentStatus) => {
        try { await updateDoc(doc(db, "wishes", id), { completed: !currentStatus }); }
        catch { alert("Failed to update dream."); }
    };

    const deleteWish = async (id) => {
        if (!window.confirm("Are you sure you want to delete this dream?")) return;
        try { await deleteDoc(doc(db, "wishes", id)); }
        catch { alert("Failed to delete dream."); }
    };

    return (
        <div className="min-h-screen bg-rose-50 py-20 px-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-200 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-200 rounded-full blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2 animate-pulse delay-1000"></div>

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="text-center mb-12 animate-fade-in-up">
                    <Heart className="w-16 h-16 text-rose-500 mx-auto mb-4 animate-bounce" fill="currentColor" />
                    <h2 className="text-4xl md:text-5xl font-serif text-rose-800 mb-4">Our Sweet Dreams ☁️</h2>
                    <p className="text-rose-400 text-lg italic">"Every dream we imagine is a memory waiting to happen."</p>
                </div>

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

                <div className="grid gap-4 md:grid-cols-2">
                    {wishes.map(wish => (
                        <div
                            key={wish.id}
                            className={`p-6 rounded-2xl border-2 transition-all duration-300 group flex items-center justify-between
                ${wish.completed ? 'bg-rose-100 border-rose-200' : 'bg-white border-white hover:border-rose-100 hover:shadow-md'}`}
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

export default BucketList;
