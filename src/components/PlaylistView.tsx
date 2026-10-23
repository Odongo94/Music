import React, { useState, useMemo } from 'react';
import {
  Play,
  Pause,
  Shuffle,
  Download,
  CheckCircle2,
  Heart,
  Clock,
  Sparkles,
  Sliders,
  MoreHorizontal,
  ArrowUpDown,
  Search,
  Disc3,
  Flame,
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { Playlist, Track } from '../types';

export const PlaylistView: React.FC = () => {
  const {
    selectedPlaylist,
    playTrack,
    currentTrack,
    isPlaying,
    togglePlayPause,
    likedTrackIds,
    toggleLikeTrack,
    downloadTrackForOffline,
    downloadPlaylistForOffline,
    downloadedTracks,
    addTrackToQueue,
    autoMixEnabled,
    toggleAutoMix,
  } = useMusic();

  const [searchFilter, setSearchFilter] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'title' | 'bpm' | 'energy' | 'duration'>('default');
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  if (!selectedPlaylist) return null;

  // Filter & Sort
  const processedTracks = useMemo(() => {
    let list = [...selectedPlaylist.tracks];
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          t.genre.toLowerCase().includes(q) ||
          t.mood.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'title') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'bpm') {
      list.sort((a, b) => b.bpm - a.bpm);
    } else if (sortBy === 'energy') {
      list.sort((a, b) => (b.energy || 70) - (a.energy || 70));
    } else if (sortBy === 'duration') {
      list.sort((a, b) => b.duration - a.duration);
    }

    return list;
  }, [selectedPlaylist, searchFilter, sortBy]);

  const totalDurationSecs = selectedPlaylist.tracks.reduce((acc, t) => acc + t.duration, 0);
  const totalMins = Math.floor(totalDurationSecs / 60);
  const totalHours = Math.floor(totalMins / 60);
  const remMins = totalMins % 60;

  const isCurrentPlaylistPlaying =
    isPlaying && selectedPlaylist.tracks.some((t) => t.id === currentTrack?.id);

  const handleDownloadAll = async () => {
    setIsDownloadingAll(true);
    await downloadPlaylistForOffline(selectedPlaylist);
    setIsDownloadingAll(false);
  };

  const formatTrackDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-gradient-to-b from-zinc-900 via-[#121212] to-[#121212] text-white select-none scrollbar-thin">
      {/* 1. Spotify-Style Hero Header */}
      <div className="p-8 pb-6 flex flex-col md:flex-row items-end gap-6 bg-gradient-to-b from-emerald-950/40 to-transparent">
        <div className="relative group shrink-0 shadow-2xl">
          <img
            src={selectedPlaylist.coverUrl}
            alt={selectedPlaylist.name}
            className="w-48 h-48 md:w-56 md:h-56 rounded-2xl object-cover shadow-2xl shadow-black/80"
          />
          {selectedPlaylist.isAiGenerated && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-600/90 text-white font-bold text-[10px] shadow-lg backdrop-blur-md">
              <Sparkles className="w-3 h-3" />
              AI 50+ Mix
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <span className="text-xs font-black uppercase tracking-widest text-[#1db954]">
            {selectedPlaylist.isAiGenerated ? 'AI Continuous DJ Mix' : 'Playlist'}
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mt-1 mb-2 line-clamp-2">
            {selectedPlaylist.name}
          </h1>
          <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed mb-3">
            {selectedPlaylist.description}
          </p>

          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-zinc-400">
            <span className="font-bold text-white">{selectedPlaylist.author}</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">{selectedPlaylist.tracks.length} tracks</span>
            <span>•</span>
            <span>
              {totalHours > 0 ? `${totalHours} hr ${remMins} min` : `${totalMins} min`}
            </span>
            {selectedPlaylist.isOfflineAvailable && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-400 text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Offline Cached
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Playlist Action Bar */}
      <div className="px-8 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-white/5 bg-[#121212]/80 backdrop-blur-md sticky top-0 z-20">
        {/* Left Actions */}
        <div className="flex items-center gap-4">
          {/* Main Play Button */}
          <button
            onClick={() => {
              if (isCurrentPlaylistPlaying) {
                togglePlayPause();
              } else if (selectedPlaylist.tracks.length > 0) {
                playTrack(selectedPlaylist.tracks[0], selectedPlaylist.tracks);
              }
            }}
            className="w-14 h-14 rounded-full bg-[#1db954] hover:bg-emerald-400 hover:scale-105 active:scale-95 text-black flex items-center justify-center shadow-xl shadow-emerald-500/20 transition-all cursor-pointer"
            title={isCurrentPlaylistPlaying ? 'Pause' : 'Play Playlist'}
          >
            {isCurrentPlaylistPlaying ? (
              <Pause className="w-6 h-6 fill-black" />
            ) : (
              <Play className="w-6 h-6 fill-black translate-x-0.5" />
            )}
          </button>

          {/* Shuffle Play */}
          <button
            onClick={() => {
              if (selectedPlaylist.tracks.length > 0) {
                const shuffled = [...selectedPlaylist.tracks].sort(() => Math.random() - 0.5);
                playTrack(shuffled[0], shuffled);
              }
            }}
            className="p-3 rounded-full hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Shuffle Play"
          >
            <Shuffle className="w-5 h-5" />
          </button>

          {/* Download Entire Playlist for Offline */}
          <button
            onClick={handleDownloadAll}
            disabled={isDownloadingAll || selectedPlaylist.isOfflineAvailable}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
              selectedPlaylist.isOfflineAvailable
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border-white/10'
            }`}
            title="Cache all tracks in this playlist for offline listening"
          >
            {selectedPlaylist.isOfflineAvailable ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Downloaded for Offline</span>
              </>
            ) : (
              <>
                <Download className={`w-4 h-4 ${isDownloadingAll ? 'animate-bounce' : ''}`} />
                <span>{isDownloadingAll ? 'Downloading...' : 'Download for Offline'}</span>
              </>
            )}
          </button>

          {/* Continuous Mix Mode Toggle */}
          <button
            onClick={toggleAutoMix}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
              autoMixEnabled
                ? 'bg-purple-600/30 text-purple-300 border-purple-500/40'
                : 'bg-zinc-800 text-zinc-400 border-white/5'
            }`}
          >
            <Disc3 className={`w-3.5 h-3.5 ${autoMixEnabled ? 'animate-spin-slow' : ''}`} />
            <span>Mix Mode {autoMixEnabled ? 'Active' : 'Off'}</span>
          </button>
        </div>

        {/* Right Search & Sort */}
        <div className="flex items-center gap-3">
          {/* Quick filter in playlist */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Find in playlist..."
              className="bg-zinc-900/90 text-white placeholder-zinc-500 text-xs pl-8 pr-3 py-1.5 rounded-full border border-white/10 focus:outline-none focus:border-[#1db954] w-40 sm:w-48 transition-all"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-zinc-900 text-xs text-zinc-300 border border-white/10 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#1db954] cursor-pointer"
            >
              <option value="default">Custom Order</option>
              <option value="title">Title (A-Z)</option>
              <option value="bpm">BPM (Tempo)</option>
              <option value="energy">Energy Level</option>
              <option value="duration">Duration</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Tracks Table */}
      <div className="px-8 py-4 flex-1">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-white/5 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-5 md:col-span-4">Title</div>
          <div className="hidden md:block col-span-3">Album / Genre</div>
          <div className="col-span-3 md:col-span-2 text-center">BPM / Vibe</div>
          <div className="col-span-3 md:col-span-2 text-right flex items-center justify-end gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Time</span>
          </div>
        </div>

        {/* Tracks List */}
        <div className="space-y-0.5 mt-2">
          {processedTracks.map((track, index) => {
            const isPlayingThis = currentTrack?.id === track.id && isPlaying;
            const isLiked = likedTrackIds.includes(track.id);
            const isDownloaded = downloadedTracks.some((t) => t.id === track.id);

            return (
              <div
                key={track.id}
                onDoubleClick={() => playTrack(track, selectedPlaylist.tracks)}
                className={`grid grid-cols-12 gap-4 items-center px-4 py-2.5 rounded-xl text-xs transition-colors group cursor-pointer ${
                  currentTrack?.id === track.id
                    ? 'bg-zinc-800/80 text-[#1db954]'
                    : 'hover:bg-zinc-900/60 text-zinc-300'
                }`}
              >
                {/* Index / Play Trigger */}
                <div className="col-span-1 text-center font-mono">
                  {isPlayingThis ? (
                    <div className="flex items-center justify-center gap-0.5 h-3.5">
                      <span className="w-0.5 h-full bg-[#1db954] animate-pulse" />
                      <span className="w-0.5 h-2 bg-[#1db954] animate-pulse delay-75" />
                      <span className="w-0.5 h-3 bg-[#1db954] animate-pulse delay-150" />
                    </div>
                  ) : (
                    <>
                      <span className="group-hover:hidden text-zinc-500">{index + 1}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playTrack(track, selectedPlaylist.tracks);
                        }}
                        className="hidden group-hover:inline-block text-white hover:scale-110 transition-transform"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </>
                  )}
                </div>

                {/* Title & Artist */}
                <div className="col-span-5 md:col-span-4 flex items-center gap-3 min-w-0">
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    className="w-10 h-10 rounded-lg object-cover shrink-0 shadow-sm"
                  />
                  <div className="truncate">
                    <div
                      className={`font-semibold truncate ${
                        currentTrack?.id === track.id ? 'text-[#1db954]' : 'text-white'
                      }`}
                    >
                      {track.title}
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate">{track.artist}</div>
                  </div>
                </div>

                {/* Album & Genre */}
                <div className="hidden md:block col-span-3 truncate text-zinc-400">
                  <span className="hover:text-white transition-colors">{track.album}</span>
                  <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400 border border-white/5">
                    {track.genre}
                  </span>
                </div>

                {/* BPM & Energy */}
                <div className="col-span-3 md:col-span-2 text-center font-mono text-zinc-400">
                  <span className="text-emerald-400 font-bold">{track.bpm} BPM</span>
                  <span className="text-[10px] text-zinc-500 block">{track.mood}</span>
                </div>

                {/* Duration & Actions */}
                <div className="col-span-3 md:col-span-2 flex items-center justify-end gap-2 text-zinc-400">
                  {/* Like Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLikeTrack(track.id);
                    }}
                    className={`p-1.5 rounded-full transition-colors ${
                      isLiked ? 'text-[#1db954]' : 'hover:text-white opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-[#1db954]' : ''}`} />
                  </button>

                  {/* Offline Download Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadTrackForOffline(track);
                    }}
                    className={`p-1.5 rounded-full transition-colors ${
                      isDownloaded
                        ? 'text-emerald-400'
                        : 'hover:text-white opacity-0 group-hover:opacity-100'
                    }`}
                    title={isDownloaded ? 'Downloaded' : 'Download track'}
                  >
                    {isDownloaded ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <span className="font-mono text-xs w-9 text-right">
                    {formatTrackDuration(track.duration)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
