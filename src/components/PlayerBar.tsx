import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Heart,
  Sliders,
  FileText,
  Download,
  CheckCircle2,
  Disc3,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export const PlayerBar: React.FC = () => {
  const {
    currentTrack,
    nextTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    activeDeck,
    autoMixEnabled,
    crossfadeDuration,
    setCrossfadeDuration,
    togglePlayPause,
    nextTrackAction,
    prevTrackAction,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    toggleAutoMix,
    likedTrackIds,
    toggleLikeTrack,
    downloadTrackForOffline,
    downloadedTracks,
    setIsLyricsModalOpen,
    currentView,
    setCurrentView,
    playbackSource,
    setPlaybackSource,
    showToast,
  } = useMusic();

  const [isHoveringSeek, setIsHoveringSeek] = useState(false);
  const [showCrossfadePopover, setShowCrossfadePopover] = useState(false);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isLiked = currentTrack ? likedTrackIds.includes(currentTrack.id) : false;
  const isDownloaded = currentTrack
    ? downloadedTracks.some((t) => t.id === currentTrack.id)
    : false;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <footer className="h-22 bg-[#181818] border-t border-white/5 px-4 flex items-center justify-between select-none z-30 shrink-0">
      {/* 1. Left: Track Info & Deck Status */}
      <div className="flex items-center gap-3.5 w-1/4 min-w-[220px]">
        {currentTrack ? (
          <>
            <div className="relative group shrink-0">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className={`w-14 h-14 rounded-lg object-cover shadow-md transition-transform ${
                  isPlaying ? 'ring-2 ring-[#1db954]/50' : ''
                }`}
              />
              <button
                onClick={() => setCurrentView('dj-console')}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity"
                title="Open DJ Deck"
              >
                <Sliders className="w-5 h-5 text-[#1db954]" />
              </button>
            </div>

            <div className="flex flex-col min-w-0 pr-1">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-xs text-white truncate hover:underline cursor-pointer">
                  {currentTrack.title}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-white/5">
                  DECK {activeDeck}
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 truncate hover:underline cursor-pointer">
                {currentTrack.artist}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <button
                  onClick={() => {
                    const next = playbackSource === 'youtube' ? 'spotify' : 'youtube';
                    setPlaybackSource(next);
                    showToast(`Switched streaming audio source to ${next.toUpperCase()}`);
                  }}
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition-all cursor-pointer flex items-center gap-1 ${
                    playbackSource === 'youtube'
                      ? 'bg-red-600/30 text-red-300 border border-red-500/40'
                      : 'bg-[#1db954]/30 text-[#1db954] border border-[#1db954]/40'
                  }`}
                  title="Click to toggle streaming between YouTube and Spotify"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${playbackSource === 'youtube' ? 'bg-red-400' : 'bg-[#1db954]'}`} />
                  {playbackSource === 'youtube' ? 'YouTube HD' : 'Spotify'}
                </button>
                <span className="text-[10px] text-zinc-500 font-mono">{currentTrack.bpm} BPM</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 ml-1">
              {/* Like Button */}
              <button
                onClick={() => currentTrack && toggleLikeTrack(currentTrack.id)}
                className={`p-1.5 rounded-full transition-colors ${
                  isLiked
                    ? 'text-[#1db954]'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title={isLiked ? 'Remove from Liked' : 'Save to Liked Songs'}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#1db954]' : ''}`} />
              </button>

              {/* Offline Download Button */}
              <button
                onClick={() => currentTrack && downloadTrackForOffline(currentTrack)}
                className={`p-1.5 rounded-full transition-colors ${
                  isDownloaded
                    ? 'text-emerald-400'
                    : 'text-zinc-400 hover:text-white'
                }`}
                title={isDownloaded ? 'Cached for Offline Playback' : 'Download for Offline'}
              >
                {isDownloaded ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="text-xs text-zinc-400">No track selected</div>
        )}
      </div>

      {/* 2. Center: Playback Controls & Scrubber */}
      <div className="flex flex-col items-center max-w-2xl w-2/4 px-4">
        {/* Upper Controls */}
        <div className="flex items-center gap-4 mb-1">
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            className={`p-1.5 rounded-full transition-colors relative ${
              isShuffle ? 'text-[#1db954]' : 'text-zinc-400 hover:text-white'
            }`}
            title="Shuffle (Smart Mix)"
          >
            <Shuffle className="w-4 h-4" />
            {isShuffle && (
              <span className="w-1 h-1 bg-[#1db954] rounded-full absolute bottom-0 left-1/2 -translate-x-1/2" />
            )}
          </button>

          {/* Prev */}
          <button
            onClick={prevTrackAction}
            className="p-1.5 text-zinc-300 hover:text-white transition-colors"
            title="Previous (Flip Cue)"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlayPause}
            className="w-9 h-9 rounded-full bg-white hover:scale-105 active:scale-95 text-black flex items-center justify-center transition-all shadow-md shadow-black/40 cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-black" />
            ) : (
              <Play className="w-4 h-4 fill-black translate-x-0.5" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={nextTrackAction}
            className="p-1.5 text-zinc-300 hover:text-white transition-colors"
            title="Next Track (Zero-Gap Deck Switch)"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          {/* Repeat */}
          <button
            onClick={toggleRepeat}
            className={`p-1.5 rounded-full transition-colors relative ${
              repeatMode !== 'off' ? 'text-[#1db954]' : 'text-zinc-400 hover:text-white'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-4 h-4" />
            ) : (
              <Repeat className="w-4 h-4" />
            )}
            {repeatMode !== 'off' && (
              <span className="w-1 h-1 bg-[#1db954] rounded-full absolute bottom-0 left-1/2 -translate-x-1/2" />
            )}
          </button>

          {/* AutoMix Continuous DJ Pill */}
          <button
            onClick={toggleAutoMix}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all ${
              autoMixEnabled
                ? 'bg-[#1db954]/20 text-[#1db954] border border-[#1db954]/30'
                : 'bg-zinc-800 text-zinc-400 border border-white/5'
            }`}
            title="AutoMix: Seamless Continuous Transition"
          >
            <Disc3 className={`w-3 h-3 ${autoMixEnabled ? 'animate-spin-slow' : ''}`} />
            AutoMix
          </button>

          {/* Crossfade Pill with Popover */}
          <div className="relative">
            <button
              onClick={() => setShowCrossfadePopover((prev) => !prev)}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-white/5 cursor-pointer"
              title="Configure Crossfade Duration"
            >
              Fade: {crossfadeDuration}s
            </button>

            {showCrossfadePopover && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 bg-zinc-900 border border-zinc-700 p-3 rounded-xl shadow-2xl z-50">
                <div className="flex justify-between text-xs text-zinc-300 mb-2 font-semibold">
                  <span>Crossfade Duration</span>
                  <span className="text-[#1db954]">{crossfadeDuration}s</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="1"
                  value={crossfadeDuration}
                  onChange={(e) => setCrossfadeDuration(Number(e.target.value))}
                  className="w-full accent-[#1db954] h-1.5 bg-zinc-700 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-400 mt-1.5">
                  <span onClick={() => setCrossfadeDuration(0)} className="cursor-pointer hover:text-white">0s</span>
                  <span onClick={() => setCrossfadeDuration(4)} className="cursor-pointer hover:text-white">4s</span>
                  <span onClick={() => setCrossfadeDuration(8)} className="cursor-pointer hover:text-white">8s</span>
                  <span onClick={() => setCrossfadeDuration(12)} className="cursor-pointer hover:text-white">12s</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Time Progress Bar */}
        <div className="w-full flex items-center gap-2 text-[11px] font-mono text-zinc-400">
          <span className="w-9 text-right">{formatTime(currentTime)}</span>
          <div
            className="flex-1 h-3 flex items-center cursor-pointer group"
            onMouseEnter={() => setIsHoveringSeek(true)}
            onMouseLeave={() => setIsHoveringSeek(false)}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              seekTo(pct * duration);
            }}
          >
            <div className="w-full h-1 bg-zinc-700 rounded-full overflow-hidden relative group-hover:h-1.5 transition-all">
              <div
                className="h-full bg-white group-hover:bg-[#1db954] transition-all rounded-full relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-white absolute right-0 top-1/2 -translate-y-1/2 shadow opacity-0 group-hover:opacity-100" />
              </div>
            </div>
          </div>
          <span className="w-9">{formatTime(duration)}</span>
        </div>
      </div>

      {/* 3. Right: Tools & Volume */}
      <div className="flex items-center justify-end gap-3 w-1/4 min-w-[220px]">
        {/* Next Track Preview */}
        {nextTrack && (
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 bg-zinc-900/60 rounded-lg border border-white/5 text-[10px] text-zinc-400">
            <span className="text-emerald-400 font-bold">NEXT:</span>
            <span className="truncate max-w-[100px] text-zinc-300">{nextTrack.title}</span>
          </div>
        )}

        {/* Lyrics Button */}
        <button
          onClick={() => setIsLyricsModalOpen(true)}
          className="p-2 text-zinc-400 hover:text-white transition-colors"
          title="Track Lyrics & DJ Cues"
        >
          <FileText className="w-4 h-4" />
        </button>

        {/* DJ Mixer Console Mode Button */}
        <button
          onClick={() => setCurrentView('dj-console')}
          className={`p-2 rounded-lg transition-all ${
            currentView === 'dj-console'
              ? 'bg-[#1db954] text-black font-bold'
              : 'text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-700'
          }`}
          title="Switch to DJ Decks Console"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Volume Controls */}
        <div className="flex items-center gap-2 group">
          <button
            onClick={toggleMute}
            className="text-zinc-400 hover:text-white transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-20 accent-[#1db954] h-1 bg-zinc-700 rounded-lg cursor-pointer group-hover:h-1.5 transition-all"
          />
        </div>
      </div>
    </footer>
  );
};
