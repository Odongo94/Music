import React from 'react';
import { X, FileText, Disc3, Mic2, Sparkles } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export const LyricsModal: React.FC = () => {
  const { isLyricsModalOpen, setIsLyricsModalOpen, currentTrack } = useMusic();

  if (!isLyricsModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#141418] border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-6 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-indigo-500 flex items-center justify-center text-black">
              <Mic2 className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Lyrics & DJ Cue Sheet</h3>
              <p className="text-[11px] text-zinc-400">Harmonic key, BPM transitions & lyrics</p>
            </div>
          </div>
          <button
            onClick={() => setIsLyricsModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Track Snapshot */}
        {currentTrack && (
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-zinc-900/80 border border-white/5 mb-4 shrink-0">
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-12 h-12 rounded-xl object-cover shadow"
            />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-xs text-white truncate">{currentTrack.title}</div>
              <div className="text-[11px] text-zinc-400 truncate">{currentTrack.artist}</div>
              <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-mono mt-0.5">
                <span>{currentTrack.bpm} BPM</span>
                <span>•</span>
                <span>Key: {currentTrack.key || '8A'}</span>
                <span>•</span>
                <span>Energy: {currentTrack.energy || 80}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Lyrics Body */}
        <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-zinc-950/60 border border-white/5 font-sans leading-relaxed text-zinc-200 text-xs whitespace-pre-line scrollbar-thin">
          {currentTrack?.lyrics || (
            <div className="text-zinc-500 italic text-center py-8">
              No lyrics or DJ cue notes available for this track.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
