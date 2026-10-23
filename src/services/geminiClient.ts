import { Track, MashupConfig } from '../types';

export interface GeneratePlaylistResponse {
  playlistTitle: string;
  playlistDescription: string;
  tracks: Track[];
}

export interface MashupAnalysisResponse {
  mashupTitle: string;
  compatibilityScore: number;
  targetBpm: number;
  harmonicKeyMatch: string;
  eqSplitMode: string;
  transitionNotes: string;
  djHypeAnnouncement?: string;
}

export interface RecommendationResponse {
  reasoning: string;
  recommendations: Track[];
}

export async function requestAiPlaylist(options: {
  prompt: string;
  genre?: string;
  mood?: string;
  targetCount?: number;
}): Promise<GeneratePlaylistResponse> {
  const response = await fetch('/api/gemini/generate-playlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate playlist: ${response.statusText}`);
  }
  return response.json();
}

export async function requestRecommendations(data: {
  history: any[];
  likedGenres: string[];
  topTracks: Track[];
}): Promise<RecommendationResponse> {
  const response = await fetch('/api/gemini/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to get recommendations: ${response.statusText}`);
  }
  return response.json();
}

export async function requestMashupAnalysis(trackA: Track, trackB: Track): Promise<MashupAnalysisResponse> {
  const response = await fetch('/api/gemini/mashup-analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trackA, trackB }),
  });

  if (!response.ok) {
    throw new Error(`Failed to analyze mashup: ${response.statusText}`);
  }
  return response.json();
}

export async function createSyncCode(payload: any): Promise<{ code: string; expiresAt: number }> {
  const response = await fetch('/api/sync/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: payload }),
  });
  return response.json();
}

export async function fetchSyncData(code: string): Promise<any> {
  const response = await fetch(`/api/sync/${code}`);
  if (!response.ok) {
    throw new Error('Sync code expired or not found');
  }
  const result = await response.json();
  return result.data;
}
