import React from 'react';
import { Search, Play, Heart, Download, CheckCircle2, Disc3 } from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { GENRES, MOODS } from '../data/mockTracks';
import { Genre, Mood } from '../types';

export const SearchView: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    allTracks,
    playTrack,
    likedTrackIds,
    toggleLikeTrack,
    downloadTrackForOffline,
    downloadedTracks,
    selectedGenre,
    setSelectedGenre,
    selectedMood,
    setSelectedMood,
    addTrackToQueue,
  } = useMusic();

  const results = allTracks.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchText =
      !q ||
      t.title.toLowerCase().includes(q) ||
      t.artist.toLowerCase().includes(q) ||
      t.album.toLowerCase().includes(q) ||
      t.genre.toLowerCase().includes(q) ||
      t.mood.toLowerCase().includes(q);
    const matchGenre = selectedGenre === 'All' || t.genre === selectedGenre;
    const matchMood = selectedMood === 'All' || t.mood === selectedMood;
    return matchText && matchGenre && matchMood;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-[#121212] text-white p-6 md:p-8 space-y-6 select-none scrollbar-thin">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black tracking-tight">Search & Music Explorer</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Explore ad-free YouTube audio tracks sorted by BPM, mood, and genre
        </p>
      </div>

      {/* Filter Chips */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedGenre === g
                  ? 'bg-[#1db954] text-black'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Results Grid */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
          Found {results.length} Tracks
        </div>

        {results.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-sm">
            No tracks found matching "{searchQuery}". Try selecting another genre or clearing the search.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {results.map((track) => {
              const isLiked = likedTrackIds.includes(track.id);
              const isDownloaded = downloadedTracks.some((t) => t.id === track.id);
              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track, results)}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/5 transition-all cursor-pointer group"
                >
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 shadow">
                    <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Play className="w-5 h-5 text-white fill-white" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs text-white truncate group-hover:text-[#1db954] transition-colors">
                      {track.title}
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate">{track.artist}</div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-500 font-mono">
                      <span className="text-emerald-400 font-semibold">{track.bpm} BPM</span>
                      <span>•</span>
                      <span>{track.genre}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLikeTrack(track.id);
                      }}
                      className={`p-1.5 rounded-full transition-colors ${
                        isLiked ? 'text-[#1db954]' : 'text-zinc-500 hover:text-white'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#1db954]' : ''}`} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadTrackForOffline(track);
                      }}
                      className={`p-1.5 rounded-full transition-colors ${
                        isDownloaded ? 'text-emerald-400' : 'text-zinc-500 hover:text-white'
                      }`}
                      title={isDownloaded ? 'Downloaded' : 'Download for offline'}
                    >
                      {isDownloaded ? <CheckCircle2 className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
