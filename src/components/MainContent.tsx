import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Sparkles,
  Disc3,
  Heart,
  Sliders,
  Flame,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Radio,
  WifiOff,
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { GENRES, MOODS } from '../data/mockTracks';
import { Genre, Mood, Track, Playlist } from '../types';
import { requestRecommendations } from '../services/geminiClient';
import { offlineStorage } from '../services/offlineStorage';

export const MainContent: React.FC = () => {
  const {
    playlists,
    setSelectedPlaylist,
    setCurrentView,
    playTrack,
    currentTrack,
    isPlaying,
    allTracks,
    selectedGenre,
    setSelectedGenre,
    selectedMood,
    setSelectedMood,
    isOfflineMode,
    downloadedTracks,
    likedTrackIds,
  } = useMusic();

  const [greeting, setGreeting] = useState('Good evening');
  const [recommendations, setRecommendations] = useState<Track[]>([]);
  const [recReason, setRecReason] = useState<string>('Curated based on your high-energy beats');
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    // Load recommendations
    fetchPersonalizedRecs();
  }, []);

  const fetchPersonalizedRecs = async () => {
    setIsLoadingRecs(true);
    try {
      const history = await offlineStorage.getHistory();
      const likedGenres = Array.from(new Set(allTracks.filter((t) => likedTrackIds.includes(t.id)).map((t) => t.genre)));
      const res = await requestRecommendations({
        history,
        likedGenres: likedGenres.length > 0 ? likedGenres : ['Electronic', 'Lo-Fi', 'Synthwave'],
        topTracks: allTracks.slice(0, 5),
      });
      setRecommendations(res.recommendations);
      setRecReason(res.reasoning);
    } catch {
      setRecommendations(allTracks.slice(0, 8));
    } finally {
      setIsLoadingRecs(false);
    }
  };

  // Filtered tracks by selected genre & mood
  const filteredCatalog = allTracks.filter((t) => {
    const matchGenre = selectedGenre === 'All' || t.genre === selectedGenre;
    const matchMood = selectedMood === 'All' || t.mood === selectedMood;
    const matchOffline = !isOfflineMode || downloadedTracks.some((dt) => dt.id === t.id);
    return matchGenre && matchMood && matchOffline;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#18141f] via-[#121212] to-[#121212] text-white p-6 md:p-8 space-y-8 select-none scrollbar-thin">
      {/* 1. Hero Greeting & Top Quick Play Cards */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h1 className="text-3xl font-black tracking-tight">{greeting}</h1>
          {isOfflineMode && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              <WifiOff className="w-3.5 h-3.5" />
              Showing Cached Offline Music
            </div>
          )}
        </div>

        {/* 6 Quick Play Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {playlists.slice(0, 6).map((playlist) => {
            const isPlayingThis = isPlaying && playlist.tracks.some((t) => t.id === currentTrack?.id);
            return (
              <div
                key={playlist.id}
                onClick={() => {
                  setSelectedPlaylist(playlist);
                  setCurrentView('playlist');
                }}
                className="group flex items-center bg-zinc-800/50 hover:bg-zinc-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer border border-white/5 pr-4"
              >
                <img
                  src={playlist.coverUrl}
                  alt={playlist.name}
                  className="w-16 h-16 object-cover shrink-0"
                />
                <div className="flex-1 px-3 min-w-0">
                  <div className="font-bold text-xs text-white truncate group-hover:text-[#1db954] transition-colors">
                    {playlist.name}
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate">
                    {playlist.tracks.length} tracks • {playlist.genre || 'All'}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (playlist.tracks.length > 0) {
                      playTrack(playlist.tracks[0], playlist.tracks);
                    }
                  }}
                  className="w-9 h-9 rounded-full bg-[#1db954] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 transition-all shadow-lg shrink-0 cursor-pointer"
                  title="Play"
                >
                  <Play className="w-4 h-4 fill-black translate-x-0.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Genre & Mood Filter Pills */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">
            Explore Genres & Moods
          </div>
          {(selectedGenre !== 'All' || selectedMood !== 'All') && (
            <button
              onClick={() => {
                setSelectedGenre('All');
                setSelectedMood('All');
              }}
              className="text-xs text-[#1db954] hover:underline cursor-pointer font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Genres */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedGenre === genre
                  ? 'bg-[#1db954] text-black shadow-md shadow-emerald-500/20'
                  : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-white/5'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Moods */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-2 scrollbar-none">
          {MOODS.map((mood) => (
            <button
              key={mood}
              onClick={() => setSelectedMood(mood)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                selectedMood === mood
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-white/5'
              }`}
            >
              #{mood}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Personalized Recommendation Engine (Made For You) */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/30 via-zinc-900 to-emerald-950/20 border border-purple-500/20 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300 border border-purple-500/30">
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                Personalized Recommendation Engine
                <span className="text-[10px] font-bold bg-purple-500/30 text-purple-300 px-2 py-0.5 rounded-full">
                  AI Affinity
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">{recReason}</p>
            </div>
          </div>
          <button
            onClick={fetchPersonalizedRecs}
            disabled={isLoadingRecs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold border border-white/5 transition-all cursor-pointer disabled:opacity-50"
            title="Refresh AI Recommendations"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRecs ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Recommendation Cards Carousel */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
          {recommendations.slice(0, 4).map((track) => (
            <div
              key={track.id}
              onClick={() => playTrack(track, recommendations)}
              className="p-3.5 rounded-2xl bg-zinc-950/70 hover:bg-zinc-900/90 border border-white/5 hover:border-purple-500/30 transition-all cursor-pointer group shadow-lg"
            >
              <div className="relative mb-3 rounded-xl overflow-hidden aspect-square">
                <img
                  src={track.coverUrl}
                  alt={track.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button className="w-10 h-10 rounded-full bg-[#1db954] text-black flex items-center justify-center absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 shadow-xl transition-all hover:scale-110">
                  <Play className="w-4 h-4 fill-black translate-x-0.5" />
                </button>
              </div>
              <h4 className="font-bold text-xs text-white truncate group-hover:text-[#1db954] transition-colors">
                {track.title}
              </h4>
              <p className="text-[11px] text-zinc-400 truncate">{track.artist}</p>
              <div className="flex items-center justify-between text-[10px] text-purple-300 font-mono mt-1">
                <span>{track.bpm} BPM</span>
                <span>{track.genre}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Filtered Tracks Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-white">
              {selectedGenre === 'All' ? 'Trending Tracks' : `${selectedGenre} Anthems`}
            </h2>
            <p className="text-xs text-zinc-400">
              {filteredCatalog.length} tracks available with 0-gap preloading
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredCatalog.map((track) => {
            const isPlayingThis = currentTrack?.id === track.id && isPlaying;
            return (
              <div
                key={track.id}
                onClick={() => playTrack(track, filteredCatalog)}
                className="p-3.5 rounded-2xl bg-zinc-900/50 hover:bg-zinc-800/80 border border-white/5 transition-all cursor-pointer group shadow-md"
              >
                <div className="relative mb-3 rounded-xl overflow-hidden aspect-square">
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 text-[9px] font-mono font-bold bg-black/70 px-1.5 py-0.5 rounded text-emerald-400 backdrop-blur-xs">
                    {track.bpm} BPM
                  </div>
                  <button className="w-10 h-10 rounded-full bg-[#1db954] text-black flex items-center justify-center absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 shadow-xl transition-all hover:scale-110">
                    {isPlayingThis ? (
                      <Pause className="w-4 h-4 fill-black" />
                    ) : (
                      <Play className="w-4 h-4 fill-black translate-x-0.5" />
                    )}
                  </button>
                </div>
                <h4 className="font-bold text-xs text-white truncate group-hover:text-[#1db954] transition-colors">
                  {track.title}
                </h4>
                <p className="text-[11px] text-zinc-400 truncate">{track.artist}</p>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-500">
                  <span>{track.genre}</span>
                  <span>•</span>
                  <span>{track.mood}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
