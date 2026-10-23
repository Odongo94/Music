import React, { useState } from 'react';
import {
  Search,
  Play,
  Pause,
  Heart,
  Download,
  CheckCircle2,
  Disc3,
  Sparkles,
  ExternalLink,
  Flame,
  ArrowRight,
  Music2,
  Radio,
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { GENRES, MOODS } from '../data/mockTracks';
import { Genre, Mood, Track } from '../types';

export const SearchView: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    allTracks,
    playTrack,
    currentTrack,
    isPlaying,
    likedTrackIds,
    toggleLikeTrack,
    downloadTrackForOffline,
    downloadedTracks,
    selectedGenre,
    setSelectedGenre,
    selectedMood,
    setSelectedMood,
    addTrackToQueue,
    playbackSource,
    setPlaybackSource,
    searchSource,
    setSearchSource,
    searchResults,
    isSearchingLive,
    executeLiveSearch,
  } = useMusic();

  const [inputVal, setInputVal] = useState(searchQuery || '');

  const QUICK_SEARCH_PILLS = [
    'Kendrick Lamar',
    'The Weeknd Blinding Lights',
    'Taylor Swift Cruel Summer',
    'Dua Lipa Houdini',
    'Burna Boy Afrobeats',
    'Travis Scott FE!N',
    'Alan Walker Faded',
    'Lofi Hip Hop Study',
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(inputVal);
    executeLiveSearch(inputVal);
  };

  const handleQuickPill = (term: string) => {
    setInputVal(term);
    setSearchQuery(term);
    executeLiveSearch(term);
  };

  // Determine which tracks to display
  const displayList = searchResults && searchResults.length > 0 ? searchResults : allTracks;

  // Filter by source if needed
  const filteredList = displayList.filter((track) => {
    if (searchSource === 'youtube') return track.source !== 'spotify';
    if (searchSource === 'spotify') return track.source !== 'youtube';
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-[#121212] text-white p-6 md:p-8 space-y-6 select-none scrollbar-thin">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2.5">
            Music Search & Streamer
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-red-500/20 to-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              YouTube + Spotify
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Search any song across YouTube and Spotify, paste track links, or discover by mood & BPM
          </p>
        </div>

        {/* Global Playback Source Selector Toggle */}
        <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-white/10 rounded-2xl">
          <span className="text-[11px] font-bold text-zinc-400 px-2">Default Source:</span>
          <button
            onClick={() => setPlaybackSource('youtube')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              playbackSource === 'youtube'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            YouTube
          </button>
          <button
            onClick={() => setPlaybackSource('spotify')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              playbackSource === 'spotify'
                ? 'bg-[#1db954] text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-black" />
            Spotify
          </button>
        </div>
      </div>

      {/* Main Search Input Form */}
      <form onSubmit={handleSearchSubmit} className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={inputVal}
              onChange={(e) => {
                setInputVal(e.target.value);
                setSearchQuery(e.target.value);
              }}
              placeholder="Search artist, song, album, or paste YouTube / Spotify URL..."
              className="w-full bg-zinc-900/90 text-white placeholder-zinc-500 text-sm font-medium pl-12 pr-4 py-3.5 rounded-2xl border border-white/10 focus:border-[#1db954] focus:outline-none transition-all shadow-inner"
            />
          </div>
          <button
            type="submit"
            disabled={isSearchingLive}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#1db954] hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 shrink-0"
          >
            {isSearchingLive ? (
              <>
                <Disc3 className="w-4 h-4 animate-spin-slow" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Search & Play</span>
              </>
            )}
          </button>
        </div>

        {/* Source Filter Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mr-1">
              Source Filter:
            </span>
            <button
              type="button"
              onClick={() => setSearchSource('all')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                searchSource === 'all'
                  ? 'bg-white text-black'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              All Sources
            </button>
            <button
              type="button"
              onClick={() => setSearchSource('youtube')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                searchSource === 'youtube'
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              YouTube Only
            </button>
            <button
              type="button"
              onClick={() => setSearchSource('spotify')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                searchSource === 'spotify'
                  ? 'bg-[#1db954] text-black'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-black" />
              Spotify Only
            </button>
          </div>

          <span className="text-[11px] text-zinc-500 font-medium hidden sm:inline">
            Paste any <span className="text-emerald-400">Spotify track URL</span> or{' '}
            <span className="text-red-400">YouTube link</span> to stream instantly
          </span>
        </div>
      </form>

      {/* Popular Trending Search Pills */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
          Trending Live Searches
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {QUICK_SEARCH_PILLS.map((pill) => (
            <button
              key={pill}
              onClick={() => handleQuickPill(pill)}
              className="px-3 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-xs font-medium text-zinc-300 hover:text-white border border-white/5 transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <Flame className="w-3 h-3 text-amber-400" />
              {pill}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div>
        <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            {isSearchingLive ? (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <Disc3 className="w-3.5 h-3.5 animate-spin-slow" /> Searching YouTube & Spotify...
              </span>
            ) : (
              <span>Matching Tracks ({filteredList.length})</span>
            )}
          </div>
        </div>

        {/* Results List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredList.map((track) => {
            const isPlayingThis = currentTrack?.id === track.id && isPlaying;
            const isLiked = likedTrackIds.includes(track.id);
            const isDownloaded = downloadedTracks.some((t) => t.id === track.id);

            return (
              <div
                key={track.id}
                onClick={() => playTrack(track, filteredList)}
                className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-zinc-900/70 hover:bg-zinc-800/90 border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer group shadow-md"
              >
                {/* Artwork */}
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow">
                  <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    {isPlayingThis ? (
                      <Pause className="w-6 h-6 text-[#1db954] fill-[#1db954]" />
                    ) : (
                      <Play className="w-6 h-6 text-white fill-white translate-x-0.5" />
                    )}
                  </div>
                </div>

                {/* Track Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-bold text-xs text-white truncate group-hover:text-[#1db954] transition-colors">
                      {track.title}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 truncate">{track.artist}</div>

                  {/* Dual Badges: YouTube & Spotify Ready */}
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/30">
                      YouTube
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#1db954]/20 text-[#1db954] border border-[#1db954]/30">
                      Spotify
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono ml-auto">
                      {track.bpm} BPM
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLikeTrack(track.id);
                    }}
                    className={`p-1.5 rounded-full transition-colors ${
                      isLiked ? 'text-[#1db954]' : 'text-zinc-500 hover:text-white'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-[#1db954]' : ''}`} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadTrackForOffline(track);
                    }}
                    className={`p-1.5 rounded-full transition-colors ${
                      isDownloaded ? 'text-emerald-400' : 'text-zinc-500 hover:text-white'
                    }`}
                    title={isDownloaded ? 'Cached Offline' : 'Download for offline'}
                  >
                    {isDownloaded ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
