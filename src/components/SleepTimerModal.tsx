import React from 'react';
import { Clock, X, Moon, Volume2, CheckCircle2 } from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { djAudio } from '../services/djAudioEngine';

interface SleepTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SleepTimerModal: React.FC<SleepTimerModalProps> = ({ isOpen, onClose }) => {
  const { sleepTimer, setSleepTimer, cancelSleepTimer } = useMusic();

  if (!isOpen) return null;

  const TIMER_OPTIONS = [
    { label: '5 Minutes', value: 5 },
    { label: '15 Minutes', value: 15 },
    { label: '30 Minutes', value: 30 },
    { label: '45 Minutes', value: 45 },
    { label: '1 Hour', value: 60 },
    { label: 'End of Current Track', value: 'end_of_track' as const },
  ];

  const handleSelect = (val: number | 'end_of_track') => {
    setSleepTimer(val);
    djAudio.playVoiceDrop('Sleep timer active');
    onClose();
  };

  const minutesRemaining = sleepTimer.endsAt
    ? Math.max(0, Math.ceil((sleepTimer.endsAt - Date.now()) / 60000))
    : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#141418] border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Sleep Timer</h3>
              <p className="text-[11px] text-zinc-400">Stop playback with smooth audio fadeout</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Active Timer Status */}
        {sleepTimer.isActive && (
          <div className="mb-4 p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Timer Running
              </div>
              <div className="text-sm font-black text-white font-mono mt-0.5">
                {minutesRemaining} min remaining
              </div>
            </div>
            <button
              onClick={() => {
                cancelSleepTimer();
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Turn Off
            </button>
          </div>
        )}

        {/* Options */}
        <div className="space-y-1.5 mb-4">
          {TIMER_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => handleSelect(opt.value)}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/5 hover:border-amber-500/30 text-xs font-semibold text-zinc-200 transition-all text-left cursor-pointer"
            >
              <span>{opt.label}</span>
              <span className="text-[10px] text-amber-400/80 font-mono">Select</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-[10px] text-zinc-500">
          <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
          <span>Includes gradual 30-second volume fadeout</span>
        </div>
      </div>
    </div>
  );
};
