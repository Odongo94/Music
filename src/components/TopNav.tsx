import React from 'react';
import {
  Search,
  X,
  Moon,
  Sun,
  Palette,
  Clock,
  Wifi,
  WifiOff,
  Share2,
  Sliders,
  Sparkles,
  Zap,
  Smartphone,
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { GENRES, MOODS } from '../data/mockTracks';
import { Genre, Mood } from '../types';

interface TopNavProps {
  onOpenSleepTimer: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onOpenSleepTimer }) => {
  const {
    searchQuery,
    setSearchQuery,
    selectedGenre,
    setSelectedGenre,
    selectedMood,
    setSelectedMood,
    theme,
    setTheme,
    isOfflineMode,
    toggleOfflineMode,
    setIsShareModalOpen,
    setIsAiModalOpen,
    setIsInstallModalOpen,
    executeLiveSearch,
    isSearchingLive,
    currentView,
    setCurrentView,
    sleepTimer,
  } = useMusic();

  const cycleTheme = () => {
    const modes: Array<'dark' | 'midnight' | 'cyberpunk' | 'light'> = ['dark', 'midnight', 'cyberpunk', 'light'];
    const nextIdx = (modes.indexOf(theme) + 1) % modes.length;
    setTheme(modes[nextIdx]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setCurrentView('search');
      executeLiveSearch(searchQuery);
    }
  };

  return (
    <header className="h-16 px-6 flex items-center justify-between border-b border-white/5 bg-[#121212]/95 backdrop-blur-md sticky top-0 z-30 select-none">
      {/* Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (currentView !== 'search' && e.target.value.trim().length > 0) {
                setCurrentView('search');
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search YouTube & Spotify songs, artists, or paste URL (Press Enter)..."
            className="w-full bg-zinc-800/80 hover:bg-zinc-800 focus:bg-zinc-900 text-white placeholder-zinc-400 text-xs font-medium pl-10 pr-9 py-2.5 rounded-full border border-white/5 focus:border-[#1db954] focus:outline-none transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Right Controls: Filter Pills, Theme, Sync, Sleep Timer */}
      <div className="flex items-center gap-2.5 ml-4">
        {/* Offline Badge */}
        <button
          onClick={toggleOfflineMode}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            isOfflineMode
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}
          title={isOfflineMode ? 'Playing from offline local cache' : 'High Quality YouTube Audio Stream (Ad-Free)'}
        >
          {isOfflineMode ? (
            <>
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ad-Free HQ</span>
            </>
          )}
        </button>

        {/* AI Generator Quick Trigger */}
        <button
          onClick={() => setIsAiModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden sm:inline">AI 50+ Mix</span>
        </button>

        {/* Install on Phone / Desktop Button */}
        <button
          onClick={() => setIsInstallModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#1db954] hover:bg-emerald-400 text-black shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="Install SoundVibe on Phone or Desktop"
        >
          <Smartphone className="w-3.5 h-3.5 text-black" />
          <span className="hidden md:inline">Install App</span>
        </button>

        {/* Cross-Platform Sync Button */}
        <button
          onClick={() => setIsShareModalOpen(true)}
          className="p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-white/5 transition-colors cursor-pointer"
          title="Cross-Platform Sync & Share"
        >
          <Share2 className="w-4 h-4" />
        </button>

        {/* Sleep Timer */}
        <button
          onClick={onOpenSleepTimer}
          className={`p-2 rounded-full border border-white/5 transition-all cursor-pointer ${
            sleepTimer.isActive
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white'
          }`}
          title={sleepTimer.isActive ? 'Sleep Timer Active' : 'Set Sleep Timer'}
        >
          <Clock className="w-4 h-4" />
        </button>

        {/* Theme Switcher */}
        <button
          onClick={cycleTheme}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-white/5 text-xs font-medium transition-colors cursor-pointer capitalize"
          title={`Switch Theme (Current: ${theme})`}
        >
          <Palette className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden md:inline">{theme}</span>
        </button>
      </div>
    </header>
  );
};
