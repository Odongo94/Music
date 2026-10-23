import React, { useState } from 'react';
import { MusicProvider, useMusic } from './context/MusicContext';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { PlayerBar } from './components/PlayerBar';
import { MainContent } from './components/MainContent';
import { PlaylistView } from './components/PlaylistView';
import { DJConsole } from './components/DJConsole';
import { MashupStudio } from './components/MashupStudio';
import { SearchView } from './components/SearchView';
import { LibraryView } from './components/LibraryView';
import { AIPlaylistGeneratorModal } from './components/AIPlaylistGeneratorModal';
import { ShareModal } from './components/ShareModal';
import { SleepTimerModal } from './components/SleepTimerModal';
import { LyricsModal } from './components/LyricsModal';
import { InstallAppModal } from './components/InstallAppModal';

const AppContent: React.FC = () => {
  const { currentView, theme, toastMessage, isInstallModalOpen, setIsInstallModalOpen } = useMusic();
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);

  // Background and theme container styling
  const themeBgClasses = {
    dark: 'bg-[#121212] text-white',
    midnight: 'bg-[#0a0e1a] text-zinc-100',
    cyberpunk: 'bg-[#0e071c] text-purple-100',
    light: 'bg-zinc-100 text-zinc-900',
  }[theme] || 'bg-[#121212] text-white';

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden ${themeBgClasses} font-sans`}>
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar />

        {/* Central App Workspace */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* Top Bar */}
          <TopNav onOpenSleepTimer={() => setIsSleepModalOpen(true)} />

          {/* View Switcher */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
            {currentView === 'home' && <MainContent />}
            {currentView === 'playlist' && <PlaylistView />}
            {currentView === 'dj-console' && <DJConsole />}
            {currentView === 'mashup-studio' && <MashupStudio />}
            {currentView === 'search' && <SearchView />}
            {currentView === 'library' && <LibraryView />}
          </div>
        </main>
      </div>

      {/* Spotify Bottom Sticky Player Bar */}
      <PlayerBar />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full bg-zinc-900/95 border border-[#1db954]/50 shadow-2xl text-xs font-semibold text-white flex items-center gap-2 backdrop-blur-md animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-[#1db954] animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <AIPlaylistGeneratorModal />
      <ShareModal />
      <InstallAppModal isOpen={isInstallModalOpen} onClose={() => setIsInstallModalOpen(false)} />
      <SleepTimerModal isOpen={isSleepModalOpen} onClose={() => setIsSleepModalOpen(false)} />
      <LyricsModal />
    </div>
  );
};

export default function App() {
  return (
    <MusicProvider>
      <AppContent />
    </MusicProvider>
  );
}
