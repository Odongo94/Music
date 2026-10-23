import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Disc3,
  Flame,
  CheckCircle2,
  Play,
  Layers,
  ArrowRight,
  ListMusic,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useMusic } from '../context/MusicContext';
import { requestAiPlaylist } from '../services/geminiClient';
import { GENRES, MOODS } from '../data/mockTracks';
import { Genre, Mood, Track } from '../types';
import { djAudio } from '../services/djAudioEngine';

export const AIPlaylistGeneratorModal: React.FC = () => {
  const {
    isAiModalOpen,
    setIsAiModalOpen,
    createCustomPlaylist,
    setSelectedPlaylist,
    setCurrentView,
    playTrack,
  } = useMusic();

  const [prompt, setPrompt] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<Genre>('Electronic');
  const [selectedMood, setSelectedMood] = useState<Mood>('Energize');
  const [targetCount, setTargetCount] = useState<number>(50);
  const [isLoading, setIsLoading] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [generatedResult, setGeneratedResult] = useState<{
    playlistTitle: string;
    playlistDescription: string;
    tracks: Track[];
  } | null>(null);

  if (!isAiModalOpen) return null;

  const PRESETS = [
    {
      title: '50 Late Night Synthwave Anthems',
      prompt: '50 driving synthwave retro tracks for highway cruising with heavy gated snares and neon synth pads',
      genre: 'Synthwave' as Genre,
      mood: 'Late Night' as Mood,
    },
    {
      title: '50 High-Energy Beast Mode Gym Bangers',
      prompt: '50 relentless workout tracks combining heavy electronic drops and 140 BPM trap beats for maximum PR energy',
      genre: 'Electronic' as Genre,
      mood: 'Workout' as Mood,
    },
    {
      title: '50 Mellow Lo-Fi Study & Rain Beats',
      prompt: '50 smooth boom-bap lofi hip hop instrumentals with dusty vinyl warmth and soothing rhodes piano keys',
      genre: 'Lo-Fi' as Genre,
      mood: 'Focus' as Mood,
    },
    {
      title: '50 Afrobeats & Amapiano Sunsets',
      prompt: '50 rhythmic African sunset grooves with infectious log drums, saxophone hooks, and feel-good melodies',
      genre: 'Afrobeats' as Genre,
      mood: 'Party' as Mood,
    },
  ];

  const handleGenerate = async () => {
    setIsLoading(true);
    setProgressStep(1);
    setGeneratedResult(null);

    // Audio cue
    djAudio.playAirhorn(0.3);

    const stepInterval = setInterval(() => {
      setProgressStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 1200);

    try {
      const data = await requestAiPlaylist({
        prompt: prompt || `50 continuous tracks in ${selectedGenre} with ${selectedMood} mood`,
        genre: selectedGenre,
        mood: selectedMood,
        targetCount,
      });

      clearInterval(stepInterval);
      setGeneratedResult(data);
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
      djAudio.playVoiceDrop('50 track AI mix ready!');
    } catch (err) {
      console.error('Error generating AI playlist:', err);
    } finally {
      clearInterval(stepInterval);
      setIsLoading(false);
    }
  };

  const handleSaveAndPlay = (startPlayback = true) => {
    if (!generatedResult) return;

    const newPlaylist = createCustomPlaylist(
      generatedResult.playlistTitle,
      generatedResult.playlistDescription,
      generatedResult.tracks
    );
    setSelectedPlaylist(newPlaylist);
    setCurrentView('playlist');
    setIsAiModalOpen(false);

    if (startPlayback && newPlaylist.tracks.length > 0) {
      playTrack(newPlaylist.tracks[0], newPlaylist.tracks);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-[#121216] border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                AI 50+ Track Mix Curator
                <span className="text-[10px] font-extrabold bg-gradient-to-r from-purple-500 to-emerald-400 text-black px-2 py-0.5 rounded-full">
                  Gemini 3.8
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Generate 50+ seamless, harmonic tracks with 0 gaps for continuous DJ mix playback
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAiModalOpen(false)}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin">
          {!generatedResult ? (
            <>
              {/* Presets */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-300/80 mb-2.5">
                  Instant 50-Track Mix Presets
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PRESETS.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setPrompt(p.prompt);
                        setSelectedGenre(p.genre);
                        setSelectedMood(p.mood);
                      }}
                      className="p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/90 border border-white/5 hover:border-purple-500/40 text-left transition-all cursor-pointer group"
                    >
                      <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                        {p.title}
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate mt-0.5">{p.prompt}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Prompt Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                  Describe Your Desired 50+ Mix
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. 50 energetic gym workout bangers with 130 BPM drops and motivational vocals..."
                  rows={3}
                  className="w-full p-3.5 bg-zinc-900/90 border border-white/10 rounded-2xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-all resize-none"
                />
              </div>

              {/* Genre & Mood Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Primary Genre
                  </label>
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value as Genre)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    {GENRES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Vibe & Mood
                  </label>
                  <select
                    value={selectedMood}
                    onChange={(e) => setSelectedMood(e.target.value as Mood)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    {MOODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Track Count Indicator */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900/60 border border-white/5">
                <div>
                  <div className="text-xs font-bold text-white">Target Playlist Size</div>
                  <div className="text-[11px] text-zinc-400">Guaranteed 50+ seamless tracks for long sets</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-purple-500/20 text-purple-300 font-mono font-extrabold text-sm border border-purple-500/30">
                    50 Tracks
                  </span>
                </div>
              </div>
            </>
          ) : (
            /* Result Preview */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 to-emerald-950/40 border border-purple-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                    AI Generation Complete
                  </span>
                  <h3 className="text-lg font-extrabold text-white">{generatedResult.playlistTitle}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">{generatedResult.playlistDescription}</p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-emerald-400 font-mono">
                    {generatedResult.tracks.length}
                  </div>
                  <div className="text-[10px] text-zinc-400">Tracks Loaded</div>
                </div>
              </div>

              {/* Sample list of first few tracks */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Preview Curated Tracks (Top 8 of {generatedResult.tracks.length})
                </div>
                <div className="space-y-1.5 max-h-56 overflow-y-auto scrollbar-thin">
                  {generatedResult.tracks.slice(0, 8).map((t, idx) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/60 border border-white/5 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-zinc-500 w-5">{idx + 1}</span>
                        <img src={t.coverUrl} alt={t.title} className="w-8 h-8 rounded-lg object-cover" />
                        <div>
                          <div className="font-bold text-white truncate max-w-[200px] sm:max-w-xs">
                            {t.title}
                          </div>
                          <div className="text-[11px] text-zinc-400 truncate">{t.artist}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
                        <span className="text-purple-300 font-semibold">{t.bpm} BPM</span>
                        <span>•</span>
                        <span>{t.genre}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Loading Animation & Steps */}
          {isLoading && (
            <div className="p-6 rounded-2xl bg-zinc-900/90 border border-purple-500/40 text-center space-y-3">
              <Disc3 className="w-8 h-8 text-purple-400 animate-spin-slow mx-auto" />
              <div className="text-sm font-bold text-white">
                {progressStep === 1 && 'Consulting Gemini 3.8 Flash Musicologist...'}
                {progressStep === 2 && 'Harmonizing Camelot keys and BPM flow across 50 tracks...'}
                {progressStep === 3 && 'Attaching verified ad-free YouTube streams & DJ cues...'}
                {progressStep >= 4 && 'Finalizing 50+ zero-gap seamless tracklist...'}
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-emerald-400 h-full transition-all duration-500"
                  style={{ width: `${Math.min(100, progressStep * 25)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 pt-4 border-t border-white/10 flex items-center justify-between bg-zinc-950/60">
          <button
            onClick={() => setIsAiModalOpen(false)}
            className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          {!generatedResult ? (
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-emerald-500 text-white font-black text-xs shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isLoading ? 'Curating 50+ Tracks...' : 'Generate 50+ Track Playlist'}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSaveAndPlay(false)}
                className="px-4 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Save to Library
              </button>
              <button
                onClick={() => handleSaveAndPlay(true)}
                className="flex items-center gap-1.5 px-6 py-2 rounded-full bg-[#1db954] hover:bg-emerald-400 text-black font-black text-xs shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-black" />
                Play 50-Track Mix Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
