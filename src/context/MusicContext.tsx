import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Track, Playlist, Genre, Mood, ThemeMode, SleepTimerState, DJDeckState, MashupConfig } from '../types';
import { INITIAL_TRACKS, INITIAL_PLAYLISTS } from '../data/mockTracks';
import { offlineStorage } from '../services/offlineStorage';
import { djAudio } from '../services/djAudioEngine';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface MusicContextType {
  // Navigation & View
  currentView: 'home' | 'playlist' | 'dj-console' | 'mashup-studio' | 'library' | 'search';
  setCurrentView: (view: 'home' | 'playlist' | 'dj-console' | 'mashup-studio' | 'library' | 'search') => void;
  selectedPlaylist: Playlist | null;
  setSelectedPlaylist: (playlist: Playlist | null) => void;
  selectedGenre: Genre;
  setSelectedGenre: (genre: Genre) => void;
  selectedMood: Mood;
  setSelectedMood: (mood: Mood) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Track & Playback
  currentTrack: Track | null;
  nextTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  activeDeck: 'A' | 'B';
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  autoMixEnabled: boolean;
  crossfadeDuration: number; // in seconds (0 to 12)
  crossfaderPosition: number; // -100 (Deck A) to +100 (Deck B)

  // Actions
  playTrack: (track: Track, newQueue?: Track[]) => void;
  togglePlayPause: () => void;
  nextTrackAction: () => void;
  prevTrackAction: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (val: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleAutoMix: () => void;
  setCrossfadeDuration: (sec: number) => void;
  setCrossfaderPosition: (pos: number) => void;

  // Deck Controls (DJ mode)
  deckA: DJDeckState;
  deckB: DJDeckState;
  setDeckTempo: (deck: 'A' | 'B', tempo: number) => void;
  beatmatchDecks: () => void;
  triggerDJEffect: (effectName: 'airhorn' | 'scratch' | 'brake' | 'siren' | 'drop') => void;
  scratchJogwheel: (deck: 'A' | 'B', delta: number) => void;

  // Mashup Mode
  activeMashup: MashupConfig | null;
  playMashup: (mashup: MashupConfig) => void;
  stopMashup: () => void;
  isMashupPlaying: boolean;

  // Playlists & Library
  playlists: Playlist[];
  likedTrackIds: string[];
  downloadedTracks: Track[];
  isOfflineMode: boolean;
  toggleOfflineMode: () => void;
  toggleLikeTrack: (trackId: string) => void;
  downloadTrackForOffline: (track: Track) => Promise<void>;
  downloadPlaylistForOffline: (playlist: Playlist) => Promise<void>;
  createCustomPlaylist: (name: string, description?: string, tracks?: Track[]) => Playlist;
  addTrackToPlaylist: (playlistId: string, track: Track) => void;
  addTrackToQueue: (track: Track) => void;

  // Sleep Timer
  sleepTimer: SleepTimerState;
  setSleepTimer: (minutes: number | 'end_of_track') => void;
  cancelSleepTimer: () => void;

  // UI State & Theme
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isAiModalOpen: boolean;
  setIsAiModalOpen: (open: boolean) => void;
  isShareModalOpen: boolean;
  setIsShareModalOpen: (open: boolean) => void;
  isLyricsModalOpen: boolean;
  setIsLyricsModalOpen: (open: boolean) => void;
  showDJConsole: boolean;
  setShowDJConsole: (show: boolean) => void;

  // Full catalog
  allTracks: Track[];
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [currentView, setCurrentView] = useState<'home' | 'playlist' | 'dj-console' | 'mashup-studio' | 'library' | 'search'>('home');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(INITIAL_PLAYLISTS[0]);
  const [selectedGenre, setSelectedGenre] = useState<Genre>('All');
  const [selectedMood, setSelectedMood] = useState<Mood>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Track & Queue State
  const [allTracks, setAllTracks] = useState<Track[]>(INITIAL_TRACKS);
  const [queue, setQueue] = useState<Track[]>(INITIAL_PLAYLISTS[0].tracks);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(194);
  const [volume, setVolumeState] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');

  // DJ & Crossfade Engine
  const [activeDeck, setActiveDeck] = useState<'A' | 'B'>('A');
  const [autoMixEnabled, setAutoMixEnabled] = useState(true);
  const [crossfadeDuration, setCrossfadeDuration] = useState(4); // 4 seconds default
  const [crossfaderPosition, setCrossfaderPosition] = useState(-100); // -100 = 100% Deck A, 100 = 100% Deck B

  // Deck A & B state
  const [deckA, setDeckA] = useState<DJDeckState>({
    track: INITIAL_PLAYLISTS[0].tracks[0],
    isPlaying: false,
    currentTime: 0,
    duration: INITIAL_PLAYLISTS[0].tracks[0]?.duration || 194,
    volume: 1,
    tempo: 1.0,
    pitch: 0,
    isMuted: false,
    isCueReady: true,
    eqLow: 0,
    eqMid: 0,
    eqHigh: 0,
  });

  const [deckB, setDeckB] = useState<DJDeckState>({
    track: INITIAL_PLAYLISTS[0].tracks[1] || null,
    isPlaying: false,
    currentTime: 0,
    duration: INITIAL_PLAYLISTS[0].tracks[1]?.duration || 168,
    volume: 0,
    tempo: 1.0,
    pitch: 0,
    isMuted: false,
    isCueReady: true,
    eqLow: 0,
    eqMid: 0,
    eqHigh: 0,
  });

  // Mashup State
  const [activeMashup, setActiveMashup] = useState<MashupConfig | null>(null);
  const [isMashupPlaying, setIsMashupPlaying] = useState(false);

  // Offline & Playlists
  const [playlists, setPlaylists] = useState<Playlist[]>(INITIAL_PLAYLISTS);
  const [likedTrackIds, setLikedTrackIds] = useState<string[]>([]);
  const [downloadedTracks, setDownloadedTracks] = useState<Track[]>([]);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Sleep Timer
  const [sleepTimer, setSleepTimerState] = useState<SleepTimerState>({
    isActive: false,
    durationMinutes: 0,
    endsAt: null,
    fadeout: true,
    fadeoutDurationSec: 30,
  });

  // Modals & UI
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLyricsModalOpen, setIsLyricsModalOpen] = useState(false);
  const [showDJConsole, setShowDJConsole] = useState(false);

  // YouTube Iframe Players Refs
  const playerARef = useRef<any>(null);
  const playerBRef = useRef<any>(null);
  const isPlayerReadyRef = useRef<{ A: boolean; B: boolean }>({ A: false, B: false });
  const playbackTimerRef = useRef<number | null>(null);
  const sleepIntervalRef = useRef<number | null>(null);

  // Derived current track and next track
  const currentTrack = queue[currentTrackIndex] || null;
  const nextTrack = queue[(currentTrackIndex + 1) % queue.length] || null;

  // Initialize storage & likes
  useEffect(() => {
    async function loadStoredData() {
      const likes = offlineStorage.getLikedSongIds();
      setLikedTrackIds(likes);

      const downloaded = await offlineStorage.getAllDownloadedTracks();
      setDownloadedTracks(downloaded);

      const storedPlaylists = await offlineStorage.getAllPlaylists();
      if (storedPlaylists && storedPlaylists.length > 0) {
        setPlaylists((prev) => {
          const map = new Map(prev.map((p) => [p.id, p]));
          storedPlaylists.forEach((sp) => map.set(sp.id, sp));
          return Array.from(map.values());
        });
      }
    }
    loadStoredData();
  }, []);

  // Sync theme to document body class
  useEffect(() => {
    document.documentElement.classList.remove('theme-dark', 'theme-midnight', 'theme-cyberpunk', 'theme-light');
    document.documentElement.classList.add(`theme-${theme}`);
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayers = () => {
      if (window.YT && window.YT.Player) {
        if (!playerARef.current && document.getElementById('yt-deck-a')) {
          playerARef.current = new window.YT.Player('yt-deck-a', {
            height: '200',
            width: '200',
            videoId: currentTrack?.youtubeId || 'jfKfPfyJRdk',
            playerVars: {
              autoplay: 0,
              controls: 0,
              playsinline: 1,
              disablekb: 1,
              modestbranding: 1,
              rel: 0,
              fs: 0,
              origin: window.location.origin,
            },
            events: {
              onReady: () => {
                isPlayerReadyRef.current.A = true;
                playerARef.current.setVolume(volume * 100);
              },
              onStateChange: (event: any) => handlePlayerStateChange('A', event),
              onError: (e: any) => console.warn('Player A error:', e),
            },
          });
        }

        if (!playerBRef.current && document.getElementById('yt-deck-b')) {
          playerBRef.current = new window.YT.Player('yt-deck-b', {
            height: '200',
            width: '200',
            videoId: nextTrack?.youtubeId || '5qap5aO4i9A',
            playerVars: {
              autoplay: 0,
              controls: 0,
              playsinline: 1,
              disablekb: 1,
              modestbranding: 1,
              rel: 0,
              fs: 0,
              origin: window.location.origin,
            },
            events: {
              onReady: () => {
                isPlayerReadyRef.current.B = true;
                playerBRef.current.setVolume(0);
              },
              onStateChange: (event: any) => handlePlayerStateChange('B', event),
              onError: (e: any) => console.warn('Player B error:', e),
            },
          });
        }
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayers();
    } else {
      window.onYouTubeIframeAPIReady = initPlayers;
    }

    return () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, []);

  // Update Deck states and cue next track immediately
  useEffect(() => {
    if (activeDeck === 'A') {
      setDeckA((d) => ({ ...d, track: currentTrack, duration: currentTrack?.duration || 180 }));
      setDeckB((d) => ({ ...d, track: nextTrack, duration: nextTrack?.duration || 180 }));
      // Pre-cue Deck B on YouTube iframe
      if (isPlayerReadyRef.current.B && playerBRef.current && nextTrack) {
        try {
          playerBRef.current.cueVideoById(nextTrack.youtubeId);
          playerBRef.current.setVolume(0);
        } catch {
          // ignore cue error
        }
      }
    } else {
      setDeckB((d) => ({ ...d, track: currentTrack, duration: currentTrack?.duration || 180 }));
      setDeckA((d) => ({ ...d, track: nextTrack, duration: nextTrack?.duration || 180 }));
      // Pre-cue Deck A on YouTube iframe
      if (isPlayerReadyRef.current.A && playerARef.current && nextTrack) {
        try {
          playerARef.current.cueVideoById(nextTrack.youtubeId);
          playerARef.current.setVolume(0);
        } catch {
          // ignore cue error
        }
      }
    }
  }, [currentTrackIndex, activeDeck, queue]);

  // Main playback timer for position updates and seamless crossfading
  useEffect(() => {
    if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);

    if (isPlaying) {
      playbackTimerRef.current = window.setInterval(() => {
        const activePlayer = activeDeck === 'A' ? playerARef.current : playerBRef.current;
        const standbyPlayer = activeDeck === 'A' ? playerBRef.current : playerARef.current;

        if (activePlayer && typeof activePlayer.getCurrentTime === 'function') {
          const curr = activePlayer.getCurrentTime() || 0;
          const dur = activePlayer.getDuration() || currentTrack?.duration || 180;
          setCurrentTime(curr);
          setDuration(dur);

          // Update active deck state
          if (activeDeck === 'A') {
            setDeckA((d) => ({ ...d, currentTime: curr, duration: dur, isPlaying: true }));
          } else {
            setDeckB((d) => ({ ...d, currentTime: curr, duration: dur, isPlaying: true }));
          }

          // Check for Crossfade Trigger Zone!
          const timeLeft = dur - curr;
          if (crossfadeDuration > 0 && timeLeft <= crossfadeDuration && timeLeft > 0 && queue.length > 1) {
            // Start preloaded standby player if not yet playing
            if (standbyPlayer && typeof standbyPlayer.getPlayerState === 'function') {
              const standbyState = standbyPlayer.getPlayerState();
              if (standbyState !== 1) {
                try {
                  standbyPlayer.playVideo();
                } catch (e) {
                  console.warn('Standby player start error:', e);
                }
              }

              // Smoothly calculate crossfade volumes
              // progress from 0 (start of crossfade) to 1 (end of track)
              const crossfadeProgress = Math.max(0, Math.min(1, 1 - timeLeft / crossfadeDuration));
              const fadeOutVol = (1 - crossfadeProgress) * volume * 100;
              const fadeInVol = crossfadeProgress * volume * 100;

              activePlayer.setVolume(isMuted ? 0 : fadeOutVol);
              standbyPlayer.setVolume(isMuted ? 0 : fadeInVol);

              // Update visual crossfader position
              const pos = activeDeck === 'A' ? -100 + crossfadeProgress * 200 : 100 - crossfadeProgress * 200;
              setCrossfaderPosition(Math.round(pos));
            }
          }
        } else {
          // Synthetic progress for offline mode / audio synthesis fallback
          setCurrentTime((prev) => {
            const next = prev + 1;
            if (next >= (currentTrack?.duration || 180)) {
              nextTrackAction();
              return 0;
            }
            return next;
          });
        }
      }, 500);
    }

    return () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, [isPlaying, activeDeck, crossfadeDuration, volume, isMuted, queue, currentTrack]);

  // Handle YouTube player state changes
  const handlePlayerStateChange = (deck: 'A' | 'B', event: any) => {
    // 0 = ENDED, 1 = PLAYING, 2 = PAUSED, 3 = BUFFERING
    if (event.data === 0) {
      // Current track ended
      if (deck === activeDeck) {
        nextTrackAction();
      }
    } else if (event.data === 1) {
      if (deck === activeDeck) {
        setIsPlaying(true);
      }
    } else if (event.data === 2) {
      if (deck === activeDeck && !isMashupPlaying) {
        setIsPlaying(false);
      }
    }
  };

  // Play a specific track
  const playTrack = (track: Track, newQueue?: Track[]) => {
    let targetIndex = 0;
    if (newQueue) {
      setQueue(newQueue);
      targetIndex = newQueue.findIndex((t) => t.id === track.id);
      if (targetIndex === -1) targetIndex = 0;
      setCurrentTrackIndex(targetIndex);
    } else {
      const idx = queue.findIndex((t) => t.id === track.id);
      if (idx !== -1) {
        targetIndex = idx;
        setCurrentTrackIndex(idx);
      } else {
        const updated = [track, ...queue];
        setQueue(updated);
        setCurrentTrackIndex(0);
        targetIndex = 0;
      }
    }

    setIsPlaying(true);
    setCurrentTime(0);

    // Record listening play for personalized recommendations
    offlineStorage.recordPlay({
      trackId: track.id,
      timestamp: Date.now(),
      completed: false,
      durationListened: 0,
      genre: track.genre,
      mood: track.mood,
    });

    const activePlayer = activeDeck === 'A' ? playerARef.current : playerBRef.current;
    if (activePlayer && isPlayerReadyRef.current[activeDeck]) {
      try {
        activePlayer.loadVideoById(track.youtubeId);
        activePlayer.setVolume(isMuted ? 0 : volume * 100);
        activePlayer.playVideo();
      } catch (e) {
        console.warn('Error loading active player video:', e);
      }
    }

    // Set crossfader to active deck
    setCrossfaderPosition(activeDeck === 'A' ? -100 : 100);
  };

  // Toggle Play / Pause
  const togglePlayPause = () => {
    const activePlayer = activeDeck === 'A' ? playerARef.current : playerBRef.current;
    if (isPlaying) {
      setIsPlaying(false);
      if (activePlayer && typeof activePlayer.pauseVideo === 'function') {
        try {
          activePlayer.pauseVideo();
        } catch {
          // ignore
        }
      }
      if (isMashupPlaying && playerBRef.current) {
        playerBRef.current.pauseVideo();
      }
    } else {
      setIsPlaying(true);
      if (activePlayer && typeof activePlayer.playVideo === 'function') {
        try {
          activePlayer.playVideo();
        } catch {
          // ignore
        }
      }
      if (isMashupPlaying && playerBRef.current) {
        playerBRef.current.playVideo();
      }
    }
  };

  // Skip to Next Track (utilizing Dual Deck flip for gapless experience)
  const nextTrackAction = () => {
    if (repeatMode === 'one' && currentTrack) {
      seekTo(0);
      return;
    }

    let nextIdx = currentTrackIndex + 1;
    if (nextIdx >= queue.length) {
      if (repeatMode === 'all') {
        nextIdx = 0;
      } else {
        setIsPlaying(false);
        return;
      }
    }

    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    }

    const nextTrk = queue[nextIdx];
    setCurrentTrackIndex(nextIdx);
    setCurrentTime(0);

    // Flip active deck for true 0-gap transition!
    const newActiveDeck = activeDeck === 'A' ? 'B' : 'A';
    setActiveDeck(newActiveDeck);

    const newPlayer = newActiveDeck === 'A' ? playerARef.current : playerBRef.current;
    const oldPlayer = newActiveDeck === 'A' ? playerBRef.current : playerARef.current;

    // Reset old player volume and pause it
    if (oldPlayer && typeof oldPlayer.setVolume === 'function') {
      try {
        oldPlayer.setVolume(0);
        oldPlayer.pauseVideo();
      } catch {}
    }

    // Play new active player
    if (newPlayer && typeof newPlayer.playVideo === 'function' && nextTrk) {
      try {
        newPlayer.setVolume(isMuted ? 0 : volume * 100);
        newPlayer.playVideo();
      } catch (e) {
        console.warn('Flip deck play error:', e);
      }
    }

    setCrossfaderPosition(newActiveDeck === 'A' ? -100 : 100);

    // Record play
    if (nextTrk) {
      offlineStorage.recordPlay({
        trackId: nextTrk.id,
        timestamp: Date.now(),
        completed: true,
        durationListened: currentTrack?.duration || 180,
        genre: nextTrk.genre,
        mood: nextTrk.mood,
      });
    }
  };

  // Skip to Prev Track
  const prevTrackAction = () => {
    if (currentTime > 4) {
      seekTo(0);
      return;
    }
    const prevIdx = currentTrackIndex > 0 ? currentTrackIndex - 1 : queue.length - 1;
    setCurrentTrackIndex(prevIdx);
    const prevTrk = queue[prevIdx];
    if (prevTrk) {
      playTrack(prevTrk);
    }
  };

  // Seek
  const seekTo = (seconds: number) => {
    setCurrentTime(seconds);
    const activePlayer = activeDeck === 'A' ? playerARef.current : playerBRef.current;
    if (activePlayer && typeof activePlayer.seekTo === 'function') {
      try {
        activePlayer.seekTo(seconds, true);
      } catch {}
    }
  };

  // Volume
  const setVolume = (val: number) => {
    setVolumeState(val);
    const activePlayer = activeDeck === 'A' ? playerARef.current : playerBRef.current;
    if (activePlayer && typeof activePlayer.setVolume === 'function') {
      try {
        activePlayer.setVolume(val * 100);
      } catch {}
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    const activePlayer = activeDeck === 'A' ? playerARef.current : playerBRef.current;
    if (activePlayer && typeof activePlayer.setVolume === 'function') {
      try {
        activePlayer.setVolume(newMuted ? 0 : volume * 100);
      } catch {}
    }
  };

  const toggleShuffle = () => setIsShuffle((prev) => !prev);
  const toggleRepeat = () => {
    setRepeatMode((prev) => (prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'));
  };
  const toggleAutoMix = () => setAutoMixEnabled((prev) => !prev);

  // Manual Crossfader Position (-100 to +100)
  const handleSetCrossfaderPosition = (pos: number) => {
    setCrossfaderPosition(pos);
    // pos -100 = 100% Deck A, 0% Deck B
    // pos 0 = 100% Deck A, 100% Deck B
    // pos 100 = 0% Deck A, 100% Deck B
    const norm = (pos + 100) / 200; // 0 to 1
    const volA = Math.cos((norm * Math.PI) / 2) * volume * 100;
    const volB = Math.sin((norm * Math.PI) / 2) * volume * 100;

    if (playerARef.current && typeof playerARef.current.setVolume === 'function') {
      playerARef.current.setVolume(isMuted ? 0 : volA);
    }
    if (playerBRef.current && typeof playerBRef.current.setVolume === 'function') {
      playerBRef.current.setVolume(isMuted ? 0 : volB);
    }

    setDeckA((d) => ({ ...d, volume: volA / 100 }));
    setDeckB((d) => ({ ...d, volume: volB / 100 }));
  };

  // Tempo / Pitch adjustment
  const setDeckTempo = (deck: 'A' | 'B', tempo: number) => {
    const clamped = Math.max(0.75, Math.min(1.5, tempo));
    const player = deck === 'A' ? playerARef.current : playerBRef.current;
    if (player && typeof player.setPlaybackRate === 'function') {
      try {
        player.setPlaybackRate(clamped);
      } catch {}
    }
    if (deck === 'A') {
      setDeckA((d) => ({ ...d, tempo: clamped }));
    } else {
      setDeckB((d) => ({ ...d, tempo: clamped }));
    }
  };

  // Beatmatch: match Deck B tempo to Deck A tempo
  const beatmatchDecks = () => {
    const bpmA = deckA.track?.bpm || 120;
    const bpmB = deckB.track?.bpm || 120;
    const targetTempoB = (bpmA / bpmB) * deckA.tempo;
    setDeckTempo('B', targetTempoB);
    djAudio.playVoiceDrop('Beatmatched!');
  };

  // Sound Effects Trigger
  const triggerDJEffect = (effectName: 'airhorn' | 'scratch' | 'brake' | 'siren' | 'drop') => {
    switch (effectName) {
      case 'airhorn':
        djAudio.playAirhorn();
        break;
      case 'scratch':
        djAudio.playScratch();
        break;
      case 'brake':
        djAudio.playVinylBrake();
        break;
      case 'siren':
        djAudio.playSiren();
        break;
      case 'drop':
        djAudio.playVoiceDrop('DJ SoundVibe in the mix!');
        break;
    }
  };

  // Jogwheel scratch emulation
  const scratchJogwheel = (deck: 'A' | 'B', delta: number) => {
    djAudio.playScratch(0.4);
    const player = deck === 'A' ? playerARef.current : playerBRef.current;
    if (player && typeof player.getCurrentTime === 'function') {
      const cur = player.getCurrentTime();
      player.seekTo(Math.max(0, cur + delta * 0.4), true);
    }
  };

  // RaveDJ Mashup Playback
  const playMashup = (mashup: MashupConfig) => {
    setActiveMashup(mashup);
    setIsMashupPlaying(true);
    setIsPlaying(true);

    if (playerARef.current && playerBRef.current) {
      try {
        // Load Track A on Deck A
        playerARef.current.loadVideoById(mashup.trackA.youtubeId);
        playerARef.current.setVolume(volume * 100 * 0.9);
        playerARef.current.playVideo();

        // Load Track B on Deck B
        playerBRef.current.loadVideoById(mashup.trackB.youtubeId);
        playerBRef.current.setVolume(volume * 100 * 0.9);
        playerBRef.current.playVideo();

        // Sync BPM
        const targetTempoA = mashup.targetBpm / mashup.trackA.bpm;
        const targetTempoB = mashup.targetBpm / mashup.trackB.bpm;
        playerARef.current.setPlaybackRate(Math.max(0.75, Math.min(1.5, targetTempoA)));
        playerBRef.current.setPlaybackRate(Math.max(0.75, Math.min(1.5, targetTempoB)));

        // Center crossfader
        setCrossfaderPosition(0);
      } catch (e) {
        console.warn('Mashup playback error:', e);
      }
    }
  };

  const stopMashup = () => {
    setIsMashupPlaying(false);
    setActiveMashup(null);
    if (playerBRef.current) playerBRef.current.pauseVideo();
    setCrossfaderPosition(activeDeck === 'A' ? -100 : 100);
  };

  // Offline Mode & Downloads
  const toggleOfflineMode = () => {
    setIsOfflineMode((prev) => !prev);
    if (!isOfflineMode) {
      djAudio.playVoiceDrop('Offline Mode Enabled');
    }
  };

  const toggleLikeTrack = async (trackId: string) => {
    const isNowLiked = await offlineStorage.toggleLikedSong(trackId);
    if (isNowLiked) {
      setLikedTrackIds((prev) => [...prev, trackId]);
    } else {
      setLikedTrackIds((prev) => prev.filter((id) => id !== trackId));
    }
  };

  const downloadTrackForOffline = async (track: Track) => {
    await offlineStorage.saveDownloadedTrack(track);
    setDownloadedTracks((prev) => {
      const exists = prev.some((t) => t.id === track.id);
      return exists ? prev : [...prev, { ...track, isDownloaded: true }];
    });
  };

  const downloadPlaylistForOffline = async (playlist: Playlist) => {
    for (const track of playlist.tracks) {
      await offlineStorage.saveDownloadedTrack(track);
    }
    const updatedPlaylist = { ...playlist, isOfflineAvailable: true };
    await offlineStorage.savePlaylist(updatedPlaylist);
    setPlaylists((prev) => prev.map((p) => (p.id === playlist.id ? updatedPlaylist : p)));
    const allDownloaded = await offlineStorage.getAllDownloadedTracks();
    setDownloadedTracks(allDownloaded);
    djAudio.playVoiceDrop('Playlist Downloaded for Offline');
  };

  const createCustomPlaylist = (name: string, description = '', tracks: Track[] = []): Playlist => {
    const newPlaylist: Playlist = {
      id: `playlist-${Date.now()}`,
      name,
      description: description || 'Created on SoundVibe',
      coverUrl:
        tracks[0]?.coverUrl ||
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
      tracks,
      createdAt: Date.now(),
      author: 'You',
    };
    offlineStorage.savePlaylist(newPlaylist);
    setPlaylists((prev) => [newPlaylist, ...prev]);
    return newPlaylist;
  };

  const addTrackToPlaylist = (playlistId: string, track: Track) => {
    setPlaylists((prev) =>
      prev.map((p) => {
        if (p.id === playlistId) {
          const exists = p.tracks.some((t) => t.id === track.id);
          const updated = exists ? p.tracks : [...p.tracks, track];
          const newP = { ...p, tracks: updated };
          offlineStorage.savePlaylist(newP);
          return newP;
        }
        return p;
      })
    );
  };

  const addTrackToQueue = (track: Track) => {
    setQueue((prev) => [...prev, track]);
    setAllTracks((prev) => (prev.some((t) => t.id === track.id) ? prev : [...prev, track]));
  };

  // Sleep Timer Controller
  const setSleepTimer = (minutes: number | 'end_of_track') => {
    if (sleepIntervalRef.current) clearInterval(sleepIntervalRef.current);

    if (minutes === 'end_of_track') {
      const remainingSec = Math.max(5, duration - currentTime);
      setSleepTimerState({
        isActive: true,
        durationMinutes: Math.round(remainingSec / 60),
        endsAt: Date.now() + remainingSec * 1000,
        fadeout: true,
        fadeoutDurationSec: 15,
      });
    } else {
      const endsAt = Date.now() + minutes * 60 * 1000;
      setSleepTimerState({
        isActive: true,
        durationMinutes: minutes,
        endsAt,
        fadeout: true,
        fadeoutDurationSec: 30,
      });
    }

    sleepIntervalRef.current = window.setInterval(() => {
      setSleepTimerState((current) => {
        if (!current.isActive || !current.endsAt) return current;
        const msRemaining = current.endsAt - Date.now();
        if (msRemaining <= 0) {
          if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
          if (sleepIntervalRef.current) clearInterval(sleepIntervalRef.current);
          setIsPlaying(false);
          if (playerARef.current) playerARef.current.pauseVideo();
          if (playerBRef.current) playerBRef.current.pauseVideo();
          return { ...current, isActive: false, endsAt: null };
        }
        // Fade out volume in the last N seconds
        const fadeoutMs = current.fadeoutDurationSec * 1000;
        if (current.fadeout && msRemaining < fadeoutMs) {
          const fraction = msRemaining / fadeoutMs;
          const faded = Math.max(0.05, fraction * volume);
          const activePlayer = activeDeck === 'A' ? playerARef.current : playerBRef.current;
          if (activePlayer && typeof activePlayer.setVolume === 'function') {
            activePlayer.setVolume(faded * 100);
          }
        }
        return current;
      });
    }, 1000);
  };

  const cancelSleepTimer = () => {
    if (sleepIntervalRef.current) clearInterval(sleepIntervalRef.current);
    setSleepTimerState({
      isActive: false,
      durationMinutes: 0,
      endsAt: null,
      fadeout: true,
      fadeoutDurationSec: 30,
    });
  };

  return (
    <MusicContext.Provider
      value={{
        currentView,
        setCurrentView,
        selectedPlaylist,
        setSelectedPlaylist,
        selectedGenre,
        setSelectedGenre,
        selectedMood,
        setSelectedMood,
        searchQuery,
        setSearchQuery,
        currentTrack,
        nextTrack,
        queue,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        activeDeck,
        isShuffle,
        repeatMode,
        autoMixEnabled,
        crossfadeDuration,
        crossfaderPosition,
        playTrack,
        togglePlayPause,
        nextTrackAction,
        prevTrackAction,
        seekTo,
        setVolume,
        toggleMute,
        toggleShuffle,
        toggleRepeat,
        toggleAutoMix,
        setCrossfadeDuration,
        setCrossfaderPosition: handleSetCrossfaderPosition,
        deckA,
        deckB,
        setDeckTempo,
        beatmatchDecks,
        triggerDJEffect,
        scratchJogwheel,
        activeMashup,
        playMashup,
        stopMashup,
        isMashupPlaying,
        playlists,
        likedTrackIds,
        downloadedTracks,
        isOfflineMode,
        toggleOfflineMode,
        toggleLikeTrack,
        downloadTrackForOffline,
        downloadPlaylistForOffline,
        createCustomPlaylist,
        addTrackToPlaylist,
        addTrackToQueue,
        sleepTimer,
        setSleepTimer,
        cancelSleepTimer,
        theme,
        setTheme,
        isAiModalOpen,
        setIsAiModalOpen,
        isShareModalOpen,
        setIsShareModalOpen,
        isLyricsModalOpen,
        setIsLyricsModalOpen,
        showDJConsole,
        setShowDJConsole,
        allTracks,
      }}
    >
      {children}
      {/* Hidden YouTube IFrame containers for Deck A and Deck B */}
      <div className="fixed -bottom-[9999px] -left-[9999px] opacity-0 pointer-events-none" aria-hidden="true">
        <div id="yt-deck-a" />
        <div id="yt-deck-b" />
      </div>
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};
