import React, { useState } from 'react';
import {
  Library,
  Heart,
  Download,
  Plus,
  Play,
  CheckCircle2,
  Disc3,
  Sparkles,
  WifiOff,
  Trash2,
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { Playlist, Track } from '../types';

export const LibraryView: React.FC = () => {
  const {
    playlists,
    setSelectedPlaylist,
    setCurrentView,
    likedTrackIds,
    allTracks,
    playTrack,
    downloadedTracks,
    createCustomPlaylist,
    isOfflineMode,
    toggleOfflineMode,
  } = useMusic();

  const [activeTab, setActiveTab] = useState<'all' | 'playlists' | 'downloads' | 'liked'>('all');

  const likedTracks = allTracks.filter((t) => likedTrackIds.includes(t.id));

  return (
    <div className="flex-1 overflow-y-auto bg-[#121212] text-white p-6 md:p-8 space-y-6 select-none scrollbar-thin">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Your Music Library</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Playlists, liked tracks, and offline cached audio for seamless listening
          </p>
        </div>

        <button
          onClick={() => {
            const p = createCustomPlaylist(`My Playlist #${playlists.length + 1}`);
            setSelectedPlaylist(p);
            setCurrentView('playlist');
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1db954] hover:bg-emerald-400 text-black font-extrabold text-xs shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Playlist
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/5">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-white text-black'
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          All Items
        </button>
        <button
          onClick={() => setActiveTab('playlists')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'playlists'
              ? 'bg-white text-black'
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          Playlists ({playlists.length})
        </button>
        <button
          onClick={() => setActiveTab('downloads')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'downloads'
              ? 'bg-emerald-500 text-black'
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          Offline Downloaded ({downloadedTracks.length})
        </button>
        <button
          onClick={() => setActiveTab('liked')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'liked'
              ? 'bg-indigo-600 text-white'
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          <Heart className="w-3.5 h-3.5 fill-current" />
          Liked Songs ({likedTracks.length})
        </button>
      </div>

      {/* 1. Liked Songs Banner Tile */}
      {(activeTab === 'all' || activeTab === 'liked') && likedTracks.length > 0 && (
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
            Liked Tracks ({likedTracks.length})
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {likedTracks.map((track) => (
              <div
                key={track.id}
                onClick={() => playTrack(track, likedTracks)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800 border border-white/5 transition-all cursor-pointer group"
              >
                <img src={track.coverUrl} alt={track.title} className="w-12 h-12 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-white truncate group-hover:text-[#1db954]">
                    {track.title}
                  </div>
                  <div className="text-[11px] text-zinc-400 truncate">{track.artist}</div>
                </div>
                <button className="w-8 h-8 rounded-full bg-[#1db954] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-3.5 h-3.5 fill-black translate-x-0.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Download Instructions Guide */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 border border-emerald-500/20 shadow-md">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
          <Download className="w-4 h-4" />
          <span>How to Download for Offline Listening</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-zinc-300">
          <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-white/5">
            <span className="font-bold text-white block mb-0.5">1. Download Any Track</span>
            Click the <Download className="w-3.5 h-3.5 inline mx-1 text-emerald-400" /> icon next to any song title or in the bottom playback bar.
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-white/5">
            <span className="font-bold text-white block mb-0.5">2. Download Full Playlist</span>
            Open any playlist and click the <span className="font-semibold text-emerald-400">"Download for Offline"</span> button in the action bar.
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-white/5">
            <span className="font-bold text-white block mb-0.5">3. Switch to Offline Mode</span>
            Toggle the <span className="font-semibold text-amber-300">"Offline Mode"</span> switch in the sidebar or top bar to play without internet.
          </div>
        </div>
      </div>

      {/* 2. Downloaded Offline Tracks Section */}
      {(activeTab === 'all' || activeTab === 'downloads') && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Offline Downloaded Tracks ({downloadedTracks.length})
            </div>
            <button
              onClick={toggleOfflineMode}
              className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                isOfflineMode
                  ? 'bg-amber-500 text-black border-amber-500'
                  : 'bg-zinc-800 text-zinc-300 border-white/10'
              }`}
            >
              {isOfflineMode ? 'Offline Mode Active' : 'Enable Offline Mode'}
            </button>
          </div>

          {downloadedTracks.length === 0 ? (
            <div className="p-8 rounded-2xl bg-zinc-900/40 border border-white/5 text-center text-zinc-400 text-xs">
              No offline tracks downloaded yet. Click the download icon on any track or playlist to cache it for
              offline playback!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {downloadedTracks.map((track) => (
                <div
                  key={track.id}
                  onClick={() => playTrack(track, downloadedTracks)}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800 border border-emerald-500/20 transition-all cursor-pointer group"
                >
                  <img src={track.coverUrl} alt={track.title} className="w-12 h-12 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs text-white truncate group-hover:text-emerald-400">
                      {track.title}
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate">{track.artist}</div>
                    <div className="text-[10px] text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Cached locally
                    </div>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-[#1db954] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-3.5 h-3.5 fill-black translate-x-0.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Playlists Cards */}
      {(activeTab === 'all' || activeTab === 'playlists') && (
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
            Your Playlists ({playlists.length})
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                onClick={() => {
                  setSelectedPlaylist(playlist);
                  setCurrentView('playlist');
                }}
                className="p-3.5 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800/90 border border-white/5 hover:border-white/10 transition-all cursor-pointer group shadow-md"
              >
                <div className="relative mb-3 rounded-xl overflow-hidden aspect-square">
                  <img
                    src={playlist.coverUrl}
                    alt={playlist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {playlist.isAiGenerated && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-600/90 text-white font-bold text-[9px]">
                      <Sparkles className="w-2.5 h-2.5" /> AI Mix
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (playlist.tracks.length > 0) {
                        playTrack(playlist.tracks[0], playlist.tracks);
                      }
                    }}
                    className="w-10 h-10 rounded-full bg-[#1db954] text-black flex items-center justify-center absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 shadow-xl transition-all hover:scale-110"
                  >
                    <Play className="w-4 h-4 fill-black translate-x-0.5" />
                  </button>
                </div>
                <h4 className="font-bold text-xs text-white truncate group-hover:text-[#1db954] transition-colors">
                  {playlist.name}
                </h4>
                <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                  {playlist.tracks.length} songs • {playlist.author}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
