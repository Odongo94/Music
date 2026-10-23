import React, { useState } from 'react';
import {
  Play,
  Pause,
  Sliders,
  Volume2,
  RefreshCw,
  Zap,
  Radio,
  Disc3,
  Flame,
  ArrowRightLeft,
  FastForward,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { djAudio } from '../services/djAudioEngine';

export const DJConsole: React.FC = () => {
  const {
    deckA,
    deckB,
    activeDeck,
    setDeckTempo,
    beatmatchDecks,
    triggerDJEffect,
    scratchJogwheel,
    crossfaderPosition,
    setCrossfaderPosition,
    togglePlayPause,
    isPlaying,
    autoMixEnabled,
    toggleAutoMix,
    seekTo,
    currentTime,
    duration,
  } = useMusic();

  const [scratchAngleA, setScratchAngleA] = useState(0);
  const [scratchAngleB, setScratchAngleB] = useState(0);

  const formatBpm = (baseBpm = 120, tempo = 1.0) => {
    return Math.round(baseBpm * tempo);
  };

  const handleScratch = (deck: 'A' | 'B', delta: number) => {
    scratchJogwheel(deck, delta);
    if (deck === 'A') {
      setScratchAngleA((prev) => (prev + delta * 20) % 360);
    } else {
      setScratchAngleB((prev) => (prev + delta * 20) % 360);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0c] text-white p-6 overflow-y-auto select-none">
      {/* Top DJ Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sliders className="w-5 h-5 text-black" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
              SoundVibe DJ Mixer Console
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Dual Decks
              </span>
            </h1>
            <p className="text-xs text-zinc-400">
              Live beatmatching, pitch faders, vinyl scratch emulation, and human DJ sound FX
            </p>
          </div>
        </div>

        {/* Global DJ Sync & Mix Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={beatmatchDecks}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-extrabold text-xs shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Automatically match Deck B BPM to Deck A BPM"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            BEATMATCH SYNC
          </button>

          <button
            onClick={toggleAutoMix}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
              autoMixEnabled
                ? 'bg-purple-600/30 text-purple-300 border-purple-500/50 shadow-lg shadow-purple-500/20'
                : 'bg-zinc-800 text-zinc-400 border-white/5'
            }`}
          >
            <Disc3 className={`w-3.5 h-3.5 ${autoMixEnabled ? 'animate-spin-slow' : ''}`} />
            AutoMix Mode {autoMixEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Human DJ Sound Effects Soundboard */}
      <div className="mb-6 p-4 rounded-2xl bg-zinc-900/80 border border-white/5 backdrop-blur-sm shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <Flame className="w-4 h-4 text-amber-400" />
            Human DJ Performance Soundboard
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">Web Audio Synthesized FX</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {/* Airhorn */}
          <button
            onClick={() => triggerDJEffect('airhorn')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-br from-amber-600/20 to-amber-950/40 hover:from-amber-500/30 hover:to-amber-900/60 border border-amber-500/30 text-amber-300 font-extrabold text-xs shadow-md active:scale-95 transition-all cursor-pointer group"
          >
            <span className="text-xl mb-1 group-hover:scale-125 transition-transform">📢</span>
            AIRHORN
            <span className="text-[9px] font-normal text-amber-400/70">Dancehall Triad</span>
          </button>

          {/* Scratch */}
          <button
            onClick={() => triggerDJEffect('scratch')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-br from-emerald-600/20 to-emerald-950/40 hover:from-emerald-500/30 hover:to-emerald-900/60 border border-emerald-500/30 text-emerald-300 font-extrabold text-xs shadow-md active:scale-95 transition-all cursor-pointer group"
          >
            <span className="text-xl mb-1 group-hover:scale-125 transition-transform">🎛️</span>
            SCRATCH
            <span className="text-[9px] font-normal text-emerald-400/70">Wicka-Wicka</span>
          </button>

          {/* Vinyl Brake */}
          <button
            onClick={() => triggerDJEffect('brake')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-br from-red-600/20 to-red-950/40 hover:from-red-500/30 hover:to-red-900/60 border border-red-500/30 text-red-300 font-extrabold text-xs shadow-md active:scale-95 transition-all cursor-pointer group"
          >
            <span className="text-xl mb-1 group-hover:scale-125 transition-transform">⏸️</span>
            VINYL BRAKE
            <span className="text-[9px] font-normal text-red-400/70">Turntable Stop</span>
          </button>

          {/* Siren */}
          <button
            onClick={() => triggerDJEffect('siren')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-br from-blue-600/20 to-blue-950/40 hover:from-blue-500/30 hover:to-blue-900/60 border border-blue-500/30 text-blue-300 font-extrabold text-xs shadow-md active:scale-95 transition-all cursor-pointer group"
          >
            <span className="text-xl mb-1 group-hover:scale-125 transition-transform">🚨</span>
            DUB SIREN
            <span className="text-[9px] font-normal text-blue-400/70">Laser Alarm</span>
          </button>

          {/* DJ Drop */}
          <button
            onClick={() => triggerDJEffect('drop')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-br from-purple-600/20 to-purple-950/40 hover:from-purple-500/30 hover:to-purple-900/60 border border-purple-500/30 text-purple-300 font-extrabold text-xs shadow-md active:scale-95 transition-all cursor-pointer group col-span-2 sm:col-span-1"
          >
            <span className="text-xl mb-1 group-hover:scale-125 transition-transform">🎙️</span>
            DJ DROP
            <span className="text-[9px] font-normal text-purple-400/70">Voice Announcement</span>
          </button>
        </div>
      </div>

      {/* Dual Decks + Center Mixer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ================= DECK A ================= */}
        <div className={`lg:col-span-5 p-5 rounded-3xl bg-zinc-900/90 border transition-all shadow-2xl ${
          activeDeck === 'A' ? 'border-[#1db954]/50 shadow-emerald-500/10' : 'border-white/5 opacity-80'
        }`}>
          {/* Deck Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-[#1db954] text-black font-black text-xs">
                DECK A
              </span>
              {activeDeck === 'A' && (
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  ON AIR
                </span>
              )}
            </div>
            <div className="text-right">
              <div className="text-xs font-mono font-bold text-emerald-400">
                {formatBpm(deckA.track?.bpm, deckA.tempo)} BPM
              </div>
              <div className="text-[10px] text-zinc-500">
                {deckA.track?.key || '8A / C Minor'}
              </div>
            </div>
          </div>

          {/* Track Details */}
          <div className="mb-4">
            <h3 className="font-bold text-sm text-white truncate">
              {deckA.track?.title || 'No Track Selected'}
            </h3>
            <p className="text-xs text-zinc-400 truncate">{deckA.track?.artist || '—'}</p>
          </div>

          {/* Interactive Turntable Jogwheel */}
          <div className="flex flex-col items-center justify-center my-4">
            <div
              className="relative w-48 h-48 rounded-full bg-zinc-950 border-4 border-zinc-800 shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing hover:border-[#1db954]/50 transition-colors group"
              onWheel={(e) => handleScratch('A', e.deltaY > 0 ? 1 : -1)}
              onClick={() => handleScratch('A', 1)}
              title="Click or scroll to scratch vinyl"
            >
              {/* Vinyl grooves */}
              <div className="absolute inset-2 rounded-full border border-zinc-800/80 pointer-events-none" />
              <div className="absolute inset-6 rounded-full border border-zinc-800/60 pointer-events-none" />
              <div className="absolute inset-10 rounded-full border border-zinc-800/40 pointer-events-none" />

              {/* Rotating Center Label with Album Art */}
              <div
                className="w-20 h-20 rounded-full overflow-hidden border-2 border-zinc-700 shadow-inner transition-transform duration-100 flex items-center justify-center"
                style={{
                  transform: `rotate(${isPlaying && activeDeck === 'A' ? (currentTime * 60 + scratchAngleA) : scratchAngleA}deg)`,
                }}
              >
                {deckA.track?.coverUrl ? (
                  <img
                    src={deckA.track.coverUrl}
                    alt="Album Cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Disc3 className="w-8 h-8 text-zinc-600" />
                )}
                <div className="absolute w-3 h-3 rounded-full bg-black border border-white/20" />
              </div>

              {/* Needle Scratch Indicator */}
              <div
                className="absolute top-2 w-1.5 h-6 bg-emerald-400 rounded-full shadow-lg"
                style={{
                  transformOrigin: 'bottom center',
                  transform: `rotate(${scratchAngleA}deg)`,
                }}
              />
            </div>
            <span className="text-[10px] text-zinc-500 font-mono mt-2">
              Scroll or click to Scratch
            </span>
          </div>

          {/* Tempo / Pitch Control Slider */}
          <div className="p-3 rounded-xl bg-zinc-950/60 border border-white/5 mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-zinc-400">Pitch / Tempo</span>
              <span className="font-mono text-emerald-400 font-bold">
                {((deckA.tempo - 1) * 100).toFixed(1)}% ({deckA.tempo.toFixed(2)}x)
              </span>
            </div>
            <input
              type="range"
              min="0.85"
              max="1.15"
              step="0.005"
              value={deckA.tempo}
              onChange={(e) => setDeckTempo('A', Number(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
              <span onClick={() => setDeckTempo('A', 0.85)} className="cursor-pointer hover:text-white">-15%</span>
              <span onClick={() => setDeckTempo('A', 1.0)} className="cursor-pointer hover:text-white">0% RESET</span>
              <span onClick={() => setDeckTempo('A', 1.15)} className="cursor-pointer hover:text-white">+15%</span>
            </div>
          </div>

          {/* 3-Band Equalizer */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <button
              onClick={() => djAudio.playScratch(0.3)}
              className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 font-bold border border-white/5 active:scale-95 transition-all cursor-pointer"
            >
              LOW KILL
            </button>
            <button
              onClick={() => djAudio.playScratch(0.3)}
              className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 font-bold border border-white/5 active:scale-95 transition-all cursor-pointer"
            >
              MID KILL
            </button>
            <button
              onClick={() => djAudio.playScratch(0.3)}
              className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 font-bold border border-white/5 active:scale-95 transition-all cursor-pointer"
            >
              HIGH KILL
            </button>
          </div>
        </div>

        {/* ================= CENTER MIXER ================= */}
        <div className="lg:col-span-2 flex flex-col items-center justify-between p-4 rounded-3xl bg-zinc-950 border border-white/10 shadow-2xl h-full min-h-[460px]">
          <div className="text-center w-full">
            <span className="text-[11px] font-black tracking-widest text-zinc-400 uppercase">
              CENTER MIXER
            </span>

            {/* VU Meter Bars Simulation */}
            <div className="flex items-center justify-center gap-1.5 my-4 h-24">
              <div className="flex flex-col-reverse gap-0.5 h-full">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={`vua-${i}`}
                    className={`w-3 h-1.5 rounded-xs transition-colors ${
                      isPlaying && activeDeck === 'A' && (i < 8 || Math.random() > 0.3)
                        ? i > 9
                          ? 'bg-red-500'
                          : i > 6
                          ? 'bg-amber-400'
                          : 'bg-[#1db954]'
                        : 'bg-zinc-800'
                    }`}
                  />
                ))}
              </div>
              <div className="flex flex-col-reverse gap-0.5 h-full">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={`vub-${i}`}
                    className={`w-3 h-1.5 rounded-xs transition-colors ${
                      isPlaying && activeDeck === 'B' && (i < 8 || Math.random() > 0.3)
                        ? i > 9
                          ? 'bg-red-500'
                          : i > 6
                          ? 'bg-amber-400'
                          : 'bg-purple-500'
                        : 'bg-zinc-800'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Master Transport & Crossfader Controls */}
          <div className="w-full flex flex-col items-center gap-4">
            <button
              onClick={togglePlayPause}
              className="w-14 h-14 rounded-full bg-white hover:scale-105 active:scale-95 text-black flex items-center justify-center shadow-xl shadow-white/20 transition-all cursor-pointer"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-black" /> : <Play className="w-6 h-6 fill-black translate-x-0.5" />}
            </button>

            {/* Crossfader Section */}
            <div className="w-full p-3 rounded-2xl bg-zinc-900/90 border border-white/5">
              <div className="flex items-center justify-between text-[11px] font-bold font-mono text-zinc-400 mb-2">
                <span className="text-emerald-400">DECK A</span>
                <span>CROSSFADER</span>
                <span className="text-purple-400">DECK B</span>
              </div>

              <input
                type="range"
                min="-100"
                max="100"
                step="1"
                value={crossfaderPosition}
                onChange={(e) => setCrossfaderPosition(Number(e.target.value))}
                className="w-full accent-white h-2.5 bg-zinc-800 rounded-lg cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-zinc-500 mt-2 font-mono">
                <button
                  onClick={() => setCrossfaderPosition(-100)}
                  className="hover:text-emerald-400 cursor-pointer"
                >
                  FULL A
                </button>
                <button
                  onClick={() => setCrossfaderPosition(0)}
                  className="hover:text-white cursor-pointer"
                >
                  50 / 50
                </button>
                <button
                  onClick={() => setCrossfaderPosition(100)}
                  className="hover:text-purple-400 cursor-pointer"
                >
                  FULL B
                </button>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-zinc-500 font-mono text-center">
            Equal-Power Fade
          </div>
        </div>

        {/* ================= DECK B ================= */}
        <div className={`lg:col-span-5 p-5 rounded-3xl bg-zinc-900/90 border transition-all shadow-2xl ${
          activeDeck === 'B' ? 'border-purple-500/50 shadow-purple-500/10' : 'border-white/5 opacity-80'
        }`}>
          {/* Deck Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-purple-500 text-white font-black text-xs">
                DECK B
              </span>
              {activeDeck === 'B' ? (
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                  ON AIR
                </span>
              ) : (
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                  STANDBY / CUE ⚡
                </span>
              )}
            </div>
            <div className="text-right">
              <div className="text-xs font-mono font-bold text-purple-400">
                {formatBpm(deckB.track?.bpm, deckB.tempo)} BPM
              </div>
              <div className="text-[10px] text-zinc-500">
                {deckB.track?.key || '6B / B-Flat Major'}
              </div>
            </div>
          </div>

          {/* Track Details */}
          <div className="mb-4">
            <h3 className="font-bold text-sm text-white truncate">
              {deckB.track?.title || 'Pre-cueing next track...'}
            </h3>
            <p className="text-xs text-zinc-400 truncate">{deckB.track?.artist || 'Ready on Cue'}</p>
          </div>

          {/* Interactive Turntable Jogwheel */}
          <div className="flex flex-col items-center justify-center my-4">
            <div
              className="relative w-48 h-48 rounded-full bg-zinc-950 border-4 border-zinc-800 shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing hover:border-purple-500/50 transition-colors group"
              onWheel={(e) => handleScratch('B', e.deltaY > 0 ? 1 : -1)}
              onClick={() => handleScratch('B', 1)}
              title="Click or scroll to scratch vinyl"
            >
              {/* Vinyl grooves */}
              <div className="absolute inset-2 rounded-full border border-zinc-800/80 pointer-events-none" />
              <div className="absolute inset-6 rounded-full border border-zinc-800/60 pointer-events-none" />
              <div className="absolute inset-10 rounded-full border border-zinc-800/40 pointer-events-none" />

              {/* Rotating Center Label with Album Art */}
              <div
                className="w-20 h-20 rounded-full overflow-hidden border-2 border-zinc-700 shadow-inner transition-transform duration-100 flex items-center justify-center"
                style={{
                  transform: `rotate(${isPlaying && activeDeck === 'B' ? (currentTime * 60 + scratchAngleB) : scratchAngleB}deg)`,
                }}
              >
                {deckB.track?.coverUrl ? (
                  <img
                    src={deckB.track.coverUrl}
                    alt="Album Cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Disc3 className="w-8 h-8 text-zinc-600" />
                )}
                <div className="absolute w-3 h-3 rounded-full bg-black border border-white/20" />
              </div>

              {/* Needle Scratch Indicator */}
              <div
                className="absolute top-2 w-1.5 h-6 bg-purple-400 rounded-full shadow-lg"
                style={{
                  transformOrigin: 'bottom center',
                  transform: `rotate(${scratchAngleB}deg)`,
                }}
              />
            </div>
            <span className="text-[10px] text-zinc-500 font-mono mt-2">
              Scroll or click to Scratch
            </span>
          </div>

          {/* Tempo / Pitch Control Slider */}
          <div className="p-3 rounded-xl bg-zinc-950/60 border border-white/5 mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-zinc-400">Pitch / Tempo</span>
              <span className="font-mono text-purple-400 font-bold">
                {((deckB.tempo - 1) * 100).toFixed(1)}% ({deckB.tempo.toFixed(2)}x)
              </span>
            </div>
            <input
              type="range"
              min="0.85"
              max="1.15"
              step="0.005"
              value={deckB.tempo}
              onChange={(e) => setDeckTempo('B', Number(e.target.value))}
              className="w-full accent-purple-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
              <span onClick={() => setDeckTempo('B', 0.85)} className="cursor-pointer hover:text-white">-15%</span>
              <span onClick={() => setDeckTempo('B', 1.0)} className="cursor-pointer hover:text-white">0% RESET</span>
              <span onClick={() => setDeckTempo('B', 1.15)} className="cursor-pointer hover:text-white">+15%</span>
            </div>
          </div>

          {/* 3-Band Equalizer */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <button
              onClick={() => djAudio.playScratch(0.3)}
              className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 font-bold border border-white/5 active:scale-95 transition-all cursor-pointer"
            >
              LOW KILL
            </button>
            <button
              onClick={() => djAudio.playScratch(0.3)}
              className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 font-bold border border-white/5 active:scale-95 transition-all cursor-pointer"
            >
              MID KILL
            </button>
            <button
              onClick={() => djAudio.playScratch(0.3)}
              className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 font-bold border border-white/5 active:scale-95 transition-all cursor-pointer"
            >
              HIGH KILL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
