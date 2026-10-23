export type Genre =
  | 'All'
  | 'Hip-Hop'
  | 'Pop'
  | 'Electronic'
  | 'R&B'
  | 'Lo-Fi'
  | 'Rock'
  | 'Afrobeats'
  | 'Synthwave'
  | 'Chill'
  | 'Latin';

export type Mood =
  | 'All'
  | 'Energize'
  | 'Focus'
  | 'Party'
  | 'Chill'
  | 'Late Night'
  | 'Workout'
  | 'Romance'
  | 'Nostalgia';

export interface Track {
  id: string;
  youtubeId: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  coverUrl: string;
  genre: Genre;
  mood: Mood;
  bpm: number;
  year?: number;
  lyrics?: string;
  isDownloaded?: boolean;
  downloadedAt?: number;
  energy?: number; // 0-100
  key?: string; // e.g. "8A / C Minor"
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  tracks: Track[];
  isAiGenerated?: boolean;
  aiPrompt?: string;
  isOfflineAvailable?: boolean;
  createdAt: number;
  author: string;
  genre?: Genre;
  mood?: Mood;
}

export interface DJDeckState {
  track: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  tempo: number; // 0.8 to 1.5 (1.0 = normal)
  pitch: number;
  isMuted: boolean;
  isCueReady: boolean;
  eqLow: number; // -12 to +12 dB (or 0 to 1)
  eqMid: number;
  eqHigh: number;
}

export interface MashupConfig {
  id: string;
  title: string;
  trackA: Track; // Vocals/Lead
  trackB: Track; // Beat/Rhythm
  targetBpm: number;
  blendBalance: number; // 0 (100% Track A) to 100 (100% Track B)
  eqSplitMode: 'vocal_over_beat' | 'beat_switch' | 'drop_blend';
  notes?: string;
}

export interface ListeningHistoryEntry {
  trackId: string;
  timestamp: number;
  completed: boolean;
  durationListened: number;
  genre: Genre;
  mood: Mood;
}

export type ThemeMode = 'dark' | 'midnight' | 'cyberpunk' | 'light';

export interface SleepTimerState {
  isActive: boolean;
  durationMinutes: number;
  endsAt: number | null;
  fadeout: boolean;
  fadeoutDurationSec: number;
}
