import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Filter, User, Eye, Play, X, ChevronDown, Star, Tv, Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { collection, query, where, getDocs, setDoc, deleteDoc, doc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';

// ============================
// JIKAN API HELPERS
// ============================
const JIKAN_BASE = 'https://api.jikan.moe/v4';

let lastFetchTime = 0;
const jikanFetch = async (url) => {
    const now = Date.now();
    const timeSinceLast = now - lastFetchTime;
    if (timeSinceLast < 350) {
        await new Promise(r => setTimeout(r, 350 - timeSinceLast));
    }
    lastFetchTime = Date.now();
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Jikan API error: ${res.status}`);
    return res.json();
};

// ============================
// ANIME CARD COMPONENT
// ============================
const AnimeCard = ({ anime, watchStatus, onStatusChange }) => {
    const [expanded, setExpanded] = useState(false);
    const [imgLoaded, setImgLoaded] = useState(false);
    const [saving, setSaving] = useState(false);

    const statusConfig = {
        watched: { label: 'Watched', color: 'bg-emerald-500', textColor: 'text-emerald-600', bgLight: 'bg-emerald-50', border: 'border-emerald-200', icon: <Check size={12} /> },
        resuming: { label: 'Resuming', color: 'bg-amber-500', textColor: 'text-amber-600', bgLight: 'bg-amber-50', border: 'border-amber-200', icon: <Play size={12} /> },
        not_watched: { label: 'Not Watched', color: 'bg-gray-400', textColor: 'text-gray-500', bgLight: 'bg-gray-50', border: 'border-gray-200', icon: <Eye size={12} /> },
    };

    const currentStatus = statusConfig[watchStatus] || statusConfig.not_watched;

    const handleMark = async (e, status) => {
        e.stopPropagation();
        e.preventDefault();
        if (saving) return;
        setSaving(true);
        try {
            await onStatusChange(anime, status);
        } catch (err) {
            console.error('Mark error:', err);
            alert('Failed to save! Go to Firebase Console → Firestore → Rules, and set:\n\nrules_version = \'2\';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if request.auth != null;\n    }\n  }\n}');
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <div
                onClick={() => setExpanded(true)}
                className="group relative bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-rose-200/50 shadow-md border border-pink-100/50"
            >
                {/* Image */}
                <div className="relative aspect-[3/4] overflow-hidden">
                    {!imgLoaded && (
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-100 to-pink-50 animate-pulse" />
                    )}
                    <img
                        src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url}
                        alt={anime.title_english || anime.title}
                        className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                        loading="lazy"
                        onLoad={() => setImgLoaded(true)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Score badge */}
                    {anime.score && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm shadow-sm">
                            <Star size={11} className="text-yellow-500 fill-yellow-500" />
                            <span className="text-gray-700 text-xs font-bold">{anime.score}</span>
                        </div>
                    )}

                    {/* Status badge */}
                    {watchStatus && watchStatus !== 'not_watched' && (
                        <div className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full ${currentStatus.color} text-white text-[10px] font-bold shadow-md`}>
                            {currentStatus.icon}
                            {currentStatus.label}
                        </div>
                    )}

                    {/* Bottom title overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3 className="text-white font-semibold text-sm line-clamp-2 leading-tight drop-shadow-lg">
                            {anime.title_english || anime.title}
                        </h3>
                    </div>
                </div>

                {/* Info below image */}
                <div className="p-2.5 space-y-1">
                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                        {anime.episodes && <span>{anime.episodes} eps</span>}
                        {anime.type && <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-500 font-medium">{anime.type}</span>}
                    </div>
                    {anime.genres?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {anime.genres.slice(0, 2).map(g => (
                                <span key={g.mal_id} className="text-[10px] px-1.5 py-0.5 rounded-full bg-pink-50 text-rose-400 border border-pink-100">
                                    {g.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Expanded Detail Modal */}
            {expanded && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => setExpanded(false)}>
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                    <div
                        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-pink-100"
                        onClick={e => e.stopPropagation()}
                    >
                        <button onClick={() => setExpanded(false)} className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-500 hover:bg-rose-100 hover:text-rose-600 transition-colors shadow-sm">
                            <X size={20} />
                        </button>

                        <div className="relative h-64 overflow-hidden rounded-t-3xl">
                            <img
                                src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url}
                                alt={anime.title_english || anime.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                        </div>

                        <div className="p-6 space-y-4 -mt-8 relative">
                            <h2 className="text-2xl font-serif font-bold text-gray-800 leading-tight">{anime.title_english || anime.title}</h2>
                            {anime.title && anime.title_english && anime.title !== anime.title_english && (
                                <p className="text-rose-400 text-sm">{anime.title}</p>
                            )}

                            <div className="flex flex-wrap gap-2 text-sm">
                                {anime.score && (
                                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-yellow-50 border border-yellow-200">
                                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                        <span className="text-yellow-700 font-bold">{anime.score}</span>
                                    </div>
                                )}
                                {anime.episodes && (
                                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600">
                                        <Tv size={14} />
                                        <span>{anime.episodes} episodes</span>
                                    </div>
                                )}
                                {anime.status && (
                                    <div className="px-3 py-1.5 rounded-full bg-pink-50 border border-pink-200 text-pink-600 text-sm">
                                        {anime.status}
                                    </div>
                                )}
                            </div>

                            {anime.genres?.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {anime.genres.map(g => (
                                        <span key={g.mal_id} className="text-xs px-3 py-1 rounded-full bg-rose-50 text-rose-500 border border-rose-100 font-medium">
                                            {g.name}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {anime.synopsis && (
                                <div className="text-gray-600 text-sm leading-relaxed max-h-40 overflow-y-auto pr-2">
                                    {anime.synopsis}
                                </div>
                            )}

                            {/* MARK STATUS BUTTONS */}
                            <div className="space-y-2 pt-2 border-t border-pink-100">
                                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider pt-2">Mark as:</p>
                                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                                    {['watched', 'resuming', 'not_watched'].map(status => {
                                        const cfg = statusConfig[status];
                                        const isActive = watchStatus === status || (!watchStatus && status === 'not_watched');
                                        return (
                                            <button
                                                key={status}
                                                disabled={saving}
                                                onClick={(e) => handleMark(e, status)}
                                                className={`flex items-center justify-center gap-1 sm:gap-2 py-2.5 sm:py-3 rounded-xl text-[11px] sm:text-sm font-bold transition-all duration-300 ${isActive
                                                    ? `${cfg.color} text-white shadow-md`
                                                    : `${cfg.bgLight} ${cfg.textColor} border ${cfg.border} hover:shadow-sm`
                                                    } ${saving ? 'opacity-50 cursor-wait' : ''}`}
                                            >
                                                {saving ? <Loader2 size={12} className="animate-spin" /> : cfg.icon}
                                                <span className="hidden xs:inline sm:inline">{cfg.label}</span>
                                                <span className="xs:hidden sm:hidden">{status === 'not_watched' ? '✕' : status === 'watched' ? '✓' : '▶'}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// ============================
// MAIN ANIME SECTION COMPONENT
// ============================
const AnimeSection = () => {
    const [viewMode, setViewMode] = useState('browse');
    const [animeList, setAnimeList] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('');
    const [genres, setGenres] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);
    const [error, setError] = useState('');
    const [genreDropdownOpen, setGenreDropdownOpen] = useState(false);

    const [watchlist, setWatchlist] = useState({});
    const [watchlistAnime, setWatchlistAnime] = useState([]);
    const [profileFilter, setProfileFilter] = useState('all');
    const [profileLoading, setProfileLoading] = useState(false);

    const genreRef = useRef(null);
    const observerRef = useRef(null);
    const sentinelRef = useRef(null);

    // Debounce search — reset list on new search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
            setAnimeList([]);
            setPage(1);
            setHasMore(true);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Reset list on genre change
    useEffect(() => {
        setAnimeList([]);
        setPage(1);
        setHasMore(true);
    }, [selectedGenre]);

    // Fetch genres once
    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const data = await jikanFetch(`${JIKAN_BASE}/genres/anime`);
                setGenres(data.data || []);
            } catch (err) {
                console.error('Failed to fetch genres:', err);
            }
        };
        fetchGenres();
    }, []);

    // Fetch anime list (supports infinite scroll — appends to existing list)
    useEffect(() => {
        if (!hasMore) return;

        const fetchAnime = async () => {
            if (page === 1) setLoading(true);
            else setLoadingMore(true);
            setError('');

            try {
                let url;
                if (debouncedQuery) {
                    url = `${JIKAN_BASE}/anime?q=${encodeURIComponent(debouncedQuery)}&page=${page}&limit=20&sfw=true`;
                    if (selectedGenre) url += `&genres=${selectedGenre}`;
                } else if (selectedGenre) {
                    url = `${JIKAN_BASE}/anime?genres=${selectedGenre}&page=${page}&limit=20&order_by=score&sort=desc&sfw=true`;
                } else {
                    url = `${JIKAN_BASE}/top/anime?page=${page}&limit=20&sfw=true`;
                }

                const data = await jikanFetch(url);
                const newAnime = data.data || [];

                if (page === 1) {
                    setAnimeList(newAnime);
                } else {
                    setAnimeList(prev => {
                        // Deduplicate by mal_id
                        const existing = new Set(prev.map(a => a.mal_id));
                        const unique = newAnime.filter(a => !existing.has(a.mal_id));
                        return [...prev, ...unique];
                    });
                }

                setHasMore(data.pagination?.has_next_page || false);
            } catch (err) {
                console.error('Failed to fetch anime:', err);
                setError('Failed to load anime. Please try again.');
            } finally {
                setLoading(false);
                setLoadingMore(false);
                setInitialLoad(false);
            }
        };

        fetchAnime();
    }, [debouncedQuery, selectedGenre, page, hasMore]);

    // Infinite scroll — IntersectionObserver on sentinel element
    useEffect(() => {
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
                    setPage(prev => prev + 1);
                }
            },
            { rootMargin: '400px' }
        );

        if (sentinelRef.current) {
            observerRef.current.observe(sentinelRef.current);
        }

        return () => {
            if (observerRef.current) observerRef.current.disconnect();
        };
    }, [hasMore, loading, loadingMore]);

    // Load user watchlist from Firestore (realtime listener)
    // Structure: anime_watchlist/{userId}/items/{animeId}
    useEffect(() => {
        if (!auth.currentUser) return;
        try {
            const userItemsRef = collection(db, 'anime_watchlist', auth.currentUser.uid, 'items');
            const unsubscribe = onSnapshot(userItemsRef, (snapshot) => {
                const wl = {};
                snapshot.docs.forEach(d => {
                    const data = d.data();
                    wl[d.id] = { ...data, animeId: d.id, docId: d.id };
                });
                setWatchlist(wl);
            }, (err) => {
                console.error('Failed to load watchlist:', err);
            });
            return () => unsubscribe();
        } catch (err) {
            console.error('Failed to setup watchlist listener:', err);
        }
    }, []);

    // Load profile watchlist
    const loadProfileWatchlist = useCallback(async () => {
        if (!auth.currentUser) return;
        setProfileLoading(true);
        try {
            const userItemsRef = collection(db, 'anime_watchlist', auth.currentUser.uid, 'items');
            const snapshot = await getDocs(userItemsRef);
            const items = snapshot.docs.map(d => ({ ...d.data(), animeId: d.id, docId: d.id }));
            setWatchlistAnime(items);
        } catch (err) {
            console.error('Failed to load profile watchlist:', err);
        } finally {
            setProfileLoading(false);
        }
    }, []);

    useEffect(() => {
        if (viewMode === 'profile') {
            loadProfileWatchlist();
        }
    }, [viewMode, loadProfileWatchlist]);

    // Handle status change
    // Structure: anime_watchlist/{userId}/items/{animeId}
    const handleStatusChange = async (anime, status) => {
        if (!auth.currentUser) {
            alert('Please login first to mark anime!');
            return;
        }
        const animeId = String(anime.mal_id || anime.animeId);
        const itemRef = doc(db, 'anime_watchlist', auth.currentUser.uid, 'items', animeId);

        if (status === 'not_watched') {
            await deleteDoc(itemRef);
        } else {
            const entry = {
                title: anime.title_english || anime.title,
                imageUrl: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || anime.imageUrl || '',
                score: anime.score || 0,
                episodes: anime.episodes || 0,
                status: status,
                updatedAt: serverTimestamp(),
            };
            await setDoc(itemRef, entry);
        }

        // Refresh profile if open
        if (viewMode === 'profile') {
            loadProfileWatchlist();
        }
    };

    // Close genre dropdown on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (genreRef.current && !genreRef.current.contains(e.target)) {
                setGenreDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Profile stats
    const watchedCount = watchlistAnime.filter(a => a.status === 'watched').length;
    const resumingCount = watchlistAnime.filter(a => a.status === 'resuming').length;
    const filteredProfileAnime = profileFilter === 'all'
        ? watchlistAnime
        : watchlistAnime.filter(a => a.status === profileFilter);

    return (
        <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white pb-32">

            {/* ======= HEADER ======= */}
            <div className="sticky top-16 z-40 bg-white/90 backdrop-blur-md border-b border-pink-100 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-3">
                    {/* Top row */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-md">
                                <Tv size={20} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-serif font-bold text-rose-800">Anime World</h1>
                                <p className="text-rose-300 text-[11px]">Powered by MyAnimeList</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-full">
                            <button
                                onClick={() => setViewMode('browse')}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${viewMode === 'browse'
                                    ? 'bg-white text-rose-600 shadow-sm'
                                    : 'text-gray-400 hover:text-rose-500'
                                    }`}
                            >
                                <Search size={14} />
                                Browse
                            </button>
                            <button
                                onClick={() => setViewMode('profile')}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${viewMode === 'profile'
                                    ? 'bg-white text-rose-600 shadow-sm'
                                    : 'text-gray-400 hover:text-rose-500'
                                    }`}
                            >
                                <User size={14} />
                                My List
                            </button>
                        </div>
                    </div>

                    {/* Search & Filter (browse mode only) */}
                    {viewMode === 'browse' && (
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-300" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search anime... (e.g. Naruto, One Piece)"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-full bg-rose-50 border border-pink-200 text-gray-700 placeholder-rose-300 text-sm focus:outline-none focus:border-rose-400 focus:bg-white transition-all"
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rose-500">
                                        <X size={16} />
                                    </button>
                                )}
                            </div>

                            <div className="relative" ref={genreRef}>
                                <button
                                    onClick={() => setGenreDropdownOpen(!genreDropdownOpen)}
                                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-rose-50 border border-pink-200 text-gray-600 text-sm hover:bg-rose-100 transition-all whitespace-nowrap"
                                >
                                    <Filter size={14} className="text-rose-400" />
                                    {selectedGenre ? genres.find(g => g.mal_id == selectedGenre)?.name || 'Genre' : 'Genre'}
                                    <ChevronDown size={14} className={`transition-transform text-rose-400 ${genreDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {genreDropdownOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-56 max-h-72 overflow-y-auto rounded-2xl bg-white border border-pink-100 shadow-xl z-50">
                                        <button
                                            onClick={() => { setSelectedGenre(''); setGenreDropdownOpen(false); }}
                                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors rounded-t-2xl ${!selectedGenre ? 'text-rose-600 bg-rose-50 font-medium' : 'text-gray-500 hover:bg-rose-50'
                                                }`}
                                        >
                                            All Genres
                                        </button>
                                        {genres.map(g => (
                                            <button
                                                key={g.mal_id}
                                                onClick={() => { setSelectedGenre(String(g.mal_id)); setGenreDropdownOpen(false); }}
                                                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${selectedGenre == g.mal_id ? 'text-rose-600 bg-rose-50 font-medium' : 'text-gray-500 hover:bg-rose-50'
                                                    }`}
                                            >
                                                {g.name} <span className="text-gray-300 text-xs">({g.count})</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ======= BROWSE VIEW ======= */}
            {viewMode === 'browse' && (
                <div className="max-w-6xl mx-auto px-4 pt-6">
                    {/* Active filters */}
                    {(debouncedQuery || selectedGenre) && (
                        <div className="flex items-center gap-2 mb-4 flex-wrap">
                            <span className="text-gray-400 text-xs">Filters:</span>
                            {debouncedQuery && (
                                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-600 text-xs font-medium">
                                    &ldquo;{debouncedQuery}&rdquo;
                                    <X size={12} className="cursor-pointer hover:text-rose-700" onClick={() => setSearchQuery('')} />
                                </span>
                            )}
                            {selectedGenre && (
                                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-100 text-pink-600 text-xs font-medium">
                                    {genres.find(g => g.mal_id == selectedGenre)?.name}
                                    <X size={12} className="cursor-pointer hover:text-pink-700" onClick={() => setSelectedGenre('')} />
                                </span>
                            )}
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="text-center py-12">
                            <p className="text-red-400 mb-4">{error}</p>
                            <button onClick={() => { setError(''); setAnimeList([]); setPage(1); setHasMore(true); }} className="px-6 py-2 rounded-full bg-rose-500 text-white text-sm hover:bg-rose-600 transition-colors shadow-md">
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Initial loading skeleton */}
                    {loading && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {[...Array(20)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-pink-50">
                                    <div className="aspect-[3/4] bg-gradient-to-br from-rose-100 to-pink-50 animate-pulse" />
                                    <div className="p-3 space-y-2">
                                        <div className="h-4 bg-rose-100 rounded-full animate-pulse" />
                                        <div className="h-3 w-2/3 bg-pink-50 rounded-full animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Anime grid */}
                    {!loading && !error && (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {animeList.map(anime => (
                                    <AnimeCard
                                        key={anime.mal_id}
                                        anime={anime}
                                        watchStatus={watchlist[anime.mal_id]?.status}
                                        onStatusChange={handleStatusChange}
                                    />
                                ))}
                            </div>

                            {animeList.length === 0 && !initialLoad && (
                                <div className="text-center py-20">
                                    <Tv size={48} className="mx-auto text-rose-200 mb-4" />
                                    <p className="text-gray-500 text-lg font-medium">No anime found</p>
                                    <p className="text-gray-400 text-sm mt-1">Try a different search or filter</p>
                                </div>
                            )}

                            {/* Infinite scroll sentinel + loading indicator */}
                            {hasMore && animeList.length > 0 && (
                                <div ref={sentinelRef} className="flex items-center justify-center py-10">
                                    {loadingMore && (
                                        <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white shadow-md border border-pink-100">
                                            <Loader2 size={20} className="animate-spin text-rose-500" />
                                            <span className="text-rose-500 text-sm font-medium">Loading more anime...</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {!hasMore && animeList.length > 0 && (
                                <div className="text-center py-8">
                                    <p className="text-gray-400 text-sm">✨ You've seen all the results!</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* ======= PROFILE VIEW ======= */}
            {viewMode === 'profile' && (
                <div className="max-w-6xl mx-auto px-4 pt-6">
                    {/* Profile header */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-pink-100 shadow-md">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg">
                                <User size={24} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-serif font-bold text-rose-800">My Anime List</h2>
                                <p className="text-rose-300 text-sm">Your personal watchlist</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-2xl p-3 text-center bg-rose-50 border border-pink-100">
                                <p className="text-2xl font-bold text-rose-700">{watchlistAnime.length}</p>
                                <p className="text-rose-400 text-xs">Total</p>
                            </div>
                            <div className="rounded-2xl p-3 text-center bg-emerald-50 border border-emerald-100">
                                <p className="text-2xl font-bold text-emerald-600">{watchedCount}</p>
                                <p className="text-emerald-400 text-xs">Watched</p>
                            </div>
                            <div className="rounded-2xl p-3 text-center bg-amber-50 border border-amber-100">
                                <p className="text-2xl font-bold text-amber-600">{resumingCount}</p>
                                <p className="text-amber-400 text-xs">Resuming</p>
                            </div>
                        </div>
                    </div>

                    {/* Filter tabs */}
                    <div className="flex gap-2 mb-6 bg-rose-50/50 p-1 rounded-full w-fit">
                        {[
                            { id: 'all', label: 'All', count: watchlistAnime.length },
                            { id: 'watched', label: '✅ Watched', count: watchedCount },
                            { id: 'resuming', label: '▶️ Resuming', count: resumingCount },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setProfileFilter(tab.id)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${profileFilter === tab.id
                                    ? 'bg-white text-rose-600 shadow-sm'
                                    : 'text-gray-400 hover:text-rose-500'
                                    }`}
                            >
                                {tab.label} <span className="text-xs opacity-60">({tab.count})</span>
                            </button>
                        ))}
                    </div>

                    {/* Profile anime grid */}
                    {profileLoading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-pink-50">
                                    <div className="aspect-[3/4] bg-gradient-to-br from-rose-100 to-pink-50 animate-pulse" />
                                    <div className="p-3 space-y-2">
                                        <div className="h-4 bg-rose-100 rounded-full animate-pulse" />
                                        <div className="h-3 w-2/3 bg-pink-50 rounded-full animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredProfileAnime.length === 0 ? (
                        <div className="text-center py-20">
                            <Tv size={48} className="mx-auto text-rose-200 mb-4" />
                            <p className="text-gray-500 text-lg font-medium">
                                {profileFilter === 'all' ? 'Your watchlist is empty' : `No ${profileFilter} anime`}
                            </p>
                            <p className="text-gray-400 text-sm mt-1">
                                Browse anime and mark them to build your list!
                            </p>
                            <button
                                onClick={() => setViewMode('browse')}
                                className="mt-4 px-6 py-2.5 rounded-full bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition-all shadow-md"
                            >
                                Browse Anime
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {filteredProfileAnime.map(item => {
                                const animeObj = {
                                    mal_id: item.animeId,
                                    animeId: item.animeId,
                                    title: item.title,
                                    title_english: item.title,
                                    images: { jpg: { large_image_url: item.imageUrl, image_url: item.imageUrl } },
                                    score: item.score,
                                    episodes: item.episodes,
                                };
                                return (
                                    <AnimeCard
                                        key={item.animeId}
                                        anime={animeObj}
                                        watchStatus={item.status}
                                        onStatusChange={handleStatusChange}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AnimeSection;
