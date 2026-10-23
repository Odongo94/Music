import React from 'react';
import {
  Home,
  Search,
  Library,
  Disc3,
  Sparkles,
  Sliders,
  Moon,
  Heart,
  Download,
  Share2,
  PlusCircle,
  Radio,
  Clock,
  WifiOff,
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export const Sidebar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    playlists,
    setSelectedPlaylist,
    selectedPlaylist,
    likedTrackIds,
    downloadedTracks,
    isOfflineMode,
    toggleOfflineMode,
    setIsAiModalOpen,
    setIsShareModalOpen,
    setSleepTimer,
    sleepTimer,
    createCustomPlaylist,
  } = useMusic();

  const handleCreatePlaylist = () => {
    const num = playlists.length + 1;
    const newP = createCustomPlaylist(`My Playlist #${num}`);
    setSelectedPlaylist(newP);
    setCurrentView('playlist');
  };

  return (
    <aside className="w-64 bg-black/90 flex flex-col border-r border-white/5 select-none h-full z-20 shrink-0">
      {/* Brand Header */}
      <div className="p-5 pb-3 flex items-center justify-between">
        <button
          onClick={() => setCurrentView('home')}
          className="flex items-center gap-2.5 group text-left transition-all"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1db954] to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Disc3 className="w-5 h-5 text-black animate-spin-slow" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
              SoundVibe
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#1db954]/20 text-[#1db954] px-1.5 py-0.5 rounded-full border border-[#1db954]/30">
                DJ PRO
              </span>
            </span>
            <p className="text-[11px] text-zinc-400 font-medium">Ad-Free • Zero-Gap Stream</p>
          </div>
        </button>
      </div>

      {/* Main Navigation */}
      <div className="px-3 py-2 space-y-1">
        <button
          onClick={() => setCurrentView('home')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            currentView === 'home'
              ? 'bg-zinc-800 text-[#1db954]'
              : 'text-zinc-300 hover:text-white hover:bg-zinc-900/60'
          }`}
        >
          <Home className="w-4 h-4" />
          Home
        </button>

        <button
          onClick={() => setCurrentView('search')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            currentView === 'search'
              ? 'bg-zinc-800 text-[#1db954]'
              : 'text-zinc-300 hover:text-white hover:bg-zinc-900/60'
          }`}
        >
          <Search className="w-4 h-4" />
          Search & Explorer
        </button>

        <button
          onClick={() => setCurrentView('library')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            currentView === 'library'
              ? 'bg-zinc-800 text-[#1db954]'
              : 'text-zinc-300 hover:text-white hover:bg-zinc-900/60'
          }`}
        >
          <Library className="w-4 h-4" />
          Your Library
        </button>
      </div>

      {/* DJ Decks & RaveDJ Studio Navigation */}
      <div className="px-3 pt-2 pb-1">
        <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-3 py-1">
          Mix & Production
        </div>
        <div className="space-y-1 mt-1">
          <button
            onClick={() => setCurrentView('dj-console')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              currentView === 'dj-console'
                ? 'bg-gradient-to-r from-emerald-950/70 to-zinc-800 text-[#1db954] border border-[#1db954]/30'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-900/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <Sliders className="w-4 h-4 text-[#1db954]" />
              DJ Mixer Decks
            </div>
            <span className="text-[10px] font-bold bg-[#1db954] text-black px-1.5 py-0.5 rounded-md">
              LIVE
            </span>
          </button>

          <button
            onClick={() => setCurrentView('mashup-studio')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              currentView === 'mashup-studio'
                ? 'bg-gradient-to-r from-purple-950/70 to-zinc-800 text-purple-400 border border-purple-500/30'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-900/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <Disc3 className="w-4 h-4 text-purple-400" />
              RaveDJ Mashups
            </div>
            <span className="text-[10px] font-bold bg-purple-500 text-white px-1.5 py-0.5 rounded-md">
              MASH
            </span>
          </button>
        </div>
      </div>

      {/* AI 50+ Song Playlist Generator Card */}
      <div className="px-3 py-2">
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-purple-900/30 via-zinc-900 to-emerald-950/20 border border-purple-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mt-2 -mr-2 w-12 h-12 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-all" />
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            <span className="text-xs font-bold text-white tracking-wide">AI Mix Creator</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-tight mb-3">
            Generate 50+ seamless, gapless tracks tailored to any mood or BPM.
          </p>
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-purple-600 to-emerald-500 text-white font-bold text-xs shadow-md hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Generate 50+ Playlist
          </button>
        </div>
      </div>

      {/* Offline Mode Switcher */}
      <div className="px-3 py-1">
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900/70 border border-white/5">
          <div className="flex items-center gap-2">
            <WifiOff className={`w-3.5 h-3.5 ${isOfflineMode ? 'text-amber-400' : 'text-zinc-400'}`} />
            <div>
              <div className="text-xs font-medium text-white">Offline Mode</div>
              <div className="text-[10px] text-zinc-400">{downloadedTracks.length} tracks cached</div>
            </div>
          </div>
          <button
            onClick={toggleOfflineMode}
            className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
              isOfflineMode ? 'bg-amber-500' : 'bg-zinc-700'
            }`}
            title="Toggle Offline Listening Mode"
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                isOfflineMode ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Playlists Section */}
      <div className="flex-1 flex flex-col min-h-0 px-3 pt-3">
        <div className="flex items-center justify-between px-3 pb-2 text-zinc-400">
          <span className="text-[11px] font-bold uppercase tracking-wider">Playlists</span>
          <button
            onClick={handleCreatePlaylist}
            className="hover:text-white transition-colors p-1"
            title="Create Custom Playlist"
          >
            <PlusCircle className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-0.5 pr-1 scrollbar-thin">
          {/* Liked Songs Special Item */}
          <button
            onClick={() => {
              setCurrentView('library');
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-900/60 transition-all text-left group"
          >
            <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-600 to-purple-400 flex items-center justify-center text-white shrink-0 shadow-sm">
              <Heart className="w-3.5 h-3.5 fill-white" />
            </div>
            <div className="truncate">
              <div className="text-white group-hover:text-[#1db954] transition-colors">Liked Songs</div>
              <div className="text-[10px] text-zinc-400">{likedTrackIds.length} songs</div>
            </div>
          </button>

          {/* User Playlists */}
          {playlists.map((playlist) => {
            const isSelected = selectedPlaylist?.id === playlist.id && currentView === 'playlist';
            return (
              <button
                key={playlist.id}
                onClick={() => {
                  setSelectedPlaylist(playlist);
                  setCurrentView('playlist');
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all text-left group ${
                  isSelected
                    ? 'bg-zinc-800 text-[#1db954]'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                }`}
              >
                <img
                  src={playlist.coverUrl}
                  alt={playlist.name}
                  className="w-6 h-6 rounded object-cover shrink-0"
                />
                <div className="truncate flex-1">
                  <div className={`truncate ${isSelected ? 'text-[#1db954] font-semibold' : 'text-zinc-200'}`}>
                    {playlist.name}
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate">
                    {playlist.tracks.length} songs {playlist.isAiGenerated && '• AI'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Utilities */}
      <div className="p-3 border-t border-white/5 space-y-1 bg-black/60">
        <button
          onClick={() => setIsShareModalOpen(true)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cross-Platform Sync</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
            SYNC
          </span>
        </button>

        {sleepTimer.isActive && (
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-zinc-900/90 text-amber-300 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              <span>Sleep Timer</span>
            </div>
            <span className="font-mono text-[11px] font-bold">
              {Math.max(0, Math.ceil(((sleepTimer.endsAt || 0) - Date.now()) / 60000))}m
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};
