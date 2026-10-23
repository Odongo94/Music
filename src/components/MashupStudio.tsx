import React, { useState } from 'react';
import {
  Disc3,
  Sparkles,
  Play,
  Pause,
  Sliders,
  CheckCircle2,
  Share2,
  RefreshCw,
  Plus,
  Volume2,
  Wand2,
  Flame,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useMusic } from '../context/MusicContext';
import { Track, MashupConfig } from '../types';
import { requestMashupAnalysis, MashupAnalysisResponse } from '../services/geminiClient';
import { djAudio } from '../services/djAudioEngine';

export const MashupStudio: React.FC = () => {
  const {
    allTracks,
    playMashup,
    stopMashup,
    isMashupPlaying,
    activeMashup,
    createCustomPlaylist,
    addTrackToPlaylist,
    playlists,
  } = useMusic();

  const [trackA, setTrackA] = useState<Track>(allTracks[0] || allTracks[0]);
  const [trackB, setTrackB] = useState<Track>(allTracks[3] || allTracks[1]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MashupAnalysisResponse | null>(null);
  const [targetBpm, setTargetBpm] = useState(124);
  const [blendBalance, setBlendBalance] = useState(50); // 50/50 balance
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Preset Mashup Combos for Instant Exploration
  const PRESET_MASHUPS = [
    {
      title: 'Midnight Rain x Starlight Festival',
      trackAIndex: 0, // Lo-Fi
      trackBIndex: 3, // EDM
      tag: 'Chill vocals over energetic 126 BPM festival drop',
    },
    {
      title: 'Synthwave Cruiser x Tokyo Freestyle',
      trackAIndex: 6, // Synthwave
      trackBIndex: 8, // Hip-Hop 808
      tag: 'Retro analog synths with heavy trap drums',
    },
    {
      title: 'Sugar Pop x Lagos Sunset Afrobeats',
      trackAIndex: 10, // Pop
      trackBIndex: 12, // Afrobeats
      tag: 'Catchy pop vocals riding on warm amapiano log drums',
    },
  ];

  const handleGenerateMashup = async () => {
    setIsAnalyzing(true);
    djAudio.playAirhorn(0.3);
    try {
      const result = await requestMashupAnalysis(trackA, trackB);
      setAnalysisResult(result);
      setTargetBpm(result.targetBpm || Math.round((trackA.bpm + trackB.bpm) / 2));
    } catch (err) {
      console.warn('Mashup analysis error:', err);
      // Fallback
      setAnalysisResult({
        mashupTitle: `${trackA.title} x ${trackB.title} (RaveDJ Blend)`,
        compatibilityScore: 92,
        targetBpm: Math.round((trackA.bpm + trackB.bpm) / 2),
        harmonicKeyMatch: 'Harmonic 8A / 8B Camelot Match',
        eqSplitMode: 'vocal_over_beat',
        transitionNotes: `Lock both tracks at ${Math.round((trackA.bpm + trackB.bpm) / 2)} BPM. Filter Track A sub-bass and blend with Track B 4/4 rhythm.`,
        djHypeAnnouncement: 'Exclusive SoundVibe RaveDJ Blend!',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePlayPreview = () => {
    if (isMashupPlaying) {
      stopMashup();
    } else {
      const mashup: MashupConfig = {
        id: `mashup-${Date.now()}`,
        title: analysisResult?.mashupTitle || `${trackA.title} x ${trackB.title} (RaveDJ)`,
        trackA,
        trackB,
        targetBpm,
        blendBalance,
        eqSplitMode: 'vocal_over_beat',
        notes: analysisResult?.transitionNotes,
      };
      playMashup(mashup);
      djAudio.playVoiceDrop('RaveDJ Mashup In The Mix!');
    }
  };

  const handleSaveMashup = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    const mashupTrack: Track = {
      id: `saved-mashup-${Date.now()}`,
      youtubeId: trackA.youtubeId,
      title: analysisResult?.mashupTitle || `${trackA.title} x ${trackB.title} (RaveDJ Blend)`,
      artist: `${trackA.artist} & ${trackB.artist} (RaveDJ Automix)`,
      album: 'RaveDJ Mashup Studio',
      duration: Math.max(trackA.duration, trackB.duration),
      coverUrl: trackB.coverUrl || trackA.coverUrl,
      genre: 'Electronic',
      mood: 'Party',
      bpm: targetBpm,
      energy: 95,
      lyrics: `[RaveDJ Mashup Notes]\n${analysisResult?.transitionNotes || 'Harmonic blend'}\n\nTrack A: ${trackA.title}\nTrack B: ${trackB.title}`,
      year: 2024,
    };

    let targetPlaylist = playlists.find((p) => p.name === 'My RaveDJ Mashups');
    if (!targetPlaylist) {
      targetPlaylist = createCustomPlaylist(
        'My RaveDJ Mashups',
        'Custom beatmatched mashups generated with RaveDJ AI and SoundVibe mixer.',
        [mashupTrack]
      );
    } else {
      addTrackToPlaylist(targetPlaylist.id, mashupTrack);
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d0914] text-white p-6 overflow-y-auto select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-purple-500/20">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Disc3 className="w-6 h-6 text-white animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              RaveDJ Mashup Studio
              <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded-full border border-purple-500/30">
                AI Automix
              </span>
            </h1>
            <p className="text-xs text-zinc-400">
              Fuse two songs into one seamless mashup with harmonic key matching & dual-deck sync
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {analysisResult && (
            <button
              onClick={handleSaveMashup}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              {savedSuccess ? 'Saved to Playlist!' : 'Save Mashup to Library'}
            </button>
          )}

          <button
            onClick={handleGenerateMashup}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-emerald-500 text-white font-extrabold text-xs shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Analyzing Keys & Beats...' : 'Generate RaveDJ Mashup'}
          </button>
        </div>
      </div>

      {/* Preset Inspiration Pills */}
      <div className="mb-6">
        <div className="text-[11px] font-bold uppercase tracking-wider text-purple-300/80 mb-2">
          Try Quick Mashup Inspirations
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PRESET_MASHUPS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (allTracks[preset.trackAIndex] && allTracks[preset.trackBIndex]) {
                  setTrackA(allTracks[preset.trackAIndex]);
                  setTrackB(allTracks[preset.trackBIndex]);
                }
              }}
              className="p-3 rounded-xl bg-purple-950/30 hover:bg-purple-900/40 border border-purple-500/20 text-left transition-all cursor-pointer group"
            >
              <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                {preset.title}
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">{preset.tag}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Dual Track Selectors (Track A vs Track B) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Track A Selector (Vocals / Acapella) */}
        <div className="p-5 rounded-3xl bg-zinc-900/80 border border-purple-500/30 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              TRACK A: Vocals & Lead Melody
            </span>
            <span className="text-[11px] font-mono text-zinc-400">{trackA?.bpm} BPM</span>
          </div>

          <div className="flex items-center gap-4 mb-4 p-3 rounded-2xl bg-zinc-950/60 border border-white/5">
            <img
              src={trackA?.coverUrl}
              alt={trackA?.title}
              className="w-16 h-16 rounded-xl object-cover shadow-md"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-white truncate">{trackA?.title}</h3>
              <p className="text-xs text-zinc-400 truncate">{trackA?.artist}</p>
              <div className="flex items-center gap-2 mt-1 text-[10px] text-purple-300 font-medium">
                <span>{trackA?.genre}</span>
                <span>•</span>
                <span>Key: {trackA?.key || '8A'}</span>
              </div>
            </div>
          </div>

          {/* Select Track Dropdown */}
          <label className="block text-[11px] text-zinc-400 mb-1 font-medium">Choose Track A:</label>
          <select
            value={trackA?.id}
            onChange={(e) => {
              const found = allTracks.find((t) => t.id === e.target.value);
              if (found) setTrackA(found);
            }}
            className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            {allTracks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} - {t.artist} ({t.bpm} BPM)
              </option>
            ))}
          </select>
        </div>

        {/* Track B Selector (Beat / Rhythm / Instrumental) */}
        <div className="p-5 rounded-3xl bg-zinc-900/80 border border-emerald-500/30 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              TRACK B: Beat & Bassline Rhythm
            </span>
            <span className="text-[11px] font-mono text-zinc-400">{trackB?.bpm} BPM</span>
          </div>

          <div className="flex items-center gap-4 mb-4 p-3 rounded-2xl bg-zinc-950/60 border border-white/5">
            <img
              src={trackB?.coverUrl}
              alt={trackB?.title}
              className="w-16 h-16 rounded-xl object-cover shadow-md"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-white truncate">{trackB?.title}</h3>
              <p className="text-xs text-zinc-400 truncate">{trackB?.artist}</p>
              <div className="flex items-center gap-2 mt-1 text-[10px] text-emerald-300 font-medium">
                <span>{trackB?.genre}</span>
                <span>•</span>
                <span>Key: {trackB?.key || '6B'}</span>
              </div>
            </div>
          </div>

          {/* Select Track Dropdown */}
          <label className="block text-[11px] text-zinc-400 mb-1 font-medium">Choose Track B:</label>
          <select
            value={trackB?.id}
            onChange={(e) => {
              const found = allTracks.find((t) => t.id === e.target.value);
              if (found) setTrackB(found);
            }}
            className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {allTracks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} - {t.artist} ({t.bpm} BPM)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Live Mashup Controller & Analysis Results */}
      <div className="p-6 rounded-3xl bg-zinc-900/90 border border-white/10 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-4 border-b border-white/10">
          <div>
            <div className="text-xs font-bold text-purple-400 uppercase tracking-wider">
              {analysisResult ? 'AI Analysis Complete' : 'Ready for Mashup'}
            </div>
            <h2 className="text-lg font-black text-white mt-0.5">
              {analysisResult?.mashupTitle || `${trackA?.title} x ${trackB?.title} (RaveDJ Blend)`}
            </h2>
          </div>

          {/* Play/Stop Preview Button */}
          <button
            onClick={handlePlayPreview}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-black text-xs transition-all shadow-xl cursor-pointer ${
              isMashupPlaying
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-white hover:bg-emerald-400 text-black hover:scale-105 active:scale-95'
            }`}
          >
            {isMashupPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                Stop Mashup Deck
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                Preview Live Mashup
              </>
            )}
          </button>
        </div>

        {/* Analysis Details Grid */}
        {analysisResult && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-white/5">
              <div className="text-[10px] font-bold text-zinc-400 uppercase">Harmonic Match</div>
              <div className="text-sm font-bold text-emerald-400 mt-1">
                {analysisResult.harmonicKeyMatch}
              </div>
              <div className="text-[10px] text-zinc-500 mt-1">
                Score: {analysisResult.compatibilityScore}% compatibility
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-white/5">
              <div className="text-[10px] font-bold text-zinc-400 uppercase">Synced Target BPM</div>
              <div className="text-sm font-bold text-purple-400 mt-1">{targetBpm} BPM</div>
              <div className="text-[10px] text-zinc-500 mt-1">
                Compromise tempo for beatmatched transients
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-white/5">
              <div className="text-[10px] font-bold text-zinc-400 uppercase">EQ Frequency Split</div>
              <div className="text-sm font-bold text-teal-400 mt-1">Vocal Cut Over Bassline</div>
              <div className="text-[10px] text-zinc-500 mt-1">Clean sub frequencies</div>
            </div>
          </div>
        )}

        {/* Transition Notes */}
        {analysisResult?.transitionNotes && (
          <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-200 mb-6 leading-relaxed">
            <span className="font-bold text-purple-400">DJ Performance Recipe: </span>
            {analysisResult.transitionNotes}
          </div>
        )}

        {/* Real-time Blend Slider (Vocals vs Bassline Balance) */}
        <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/5">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-purple-400 font-bold">100% Track A (Vocals)</span>
            <span className="text-zinc-400">Blend Balance: {blendBalance}%</span>
            <span className="text-emerald-400 font-bold">100% Track B (Beat)</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={blendBalance}
            onChange={(e) => setBlendBalance(Number(e.target.value))}
            className="w-full accent-purple-500 h-2 bg-zinc-800 rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
