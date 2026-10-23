import { Track, Playlist, ListeningHistoryEntry } from '../types';

const DB_NAME = 'soundvibe_music_db';
const DB_VERSION = 1;

interface DBSchema {
  downloadedTracks: Track;
  playlists: Playlist;
  history: ListeningHistoryEntry;
  likedTrackIds: string;
}

class OfflineStorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    this.initDB();
  }

  private initDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('downloadedTracks')) {
          db.createObjectStore('downloadedTracks', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('playlists')) {
          db.createObjectStore('playlists', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('history')) {
          const historyStore = db.createObjectStore('history', { autoIncrement: true });
          historyStore.createIndex('timestamp', 'timestamp');
        }
        if (!db.objectStoreNames.contains('likedTrackIds')) {
          db.createObjectStore('likedTrackIds', { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  // --- Download & Offline Tracks ---
  async saveDownloadedTrack(track: Track): Promise<void> {
    try {
      const db = await this.initDB();
      const updatedTrack: Track = {
        ...track,
        isDownloaded: true,
        downloadedAt: Date.now(),
      };
      return new Promise((resolve, reject) => {
        const tx = db.transaction('downloadedTracks', 'readwrite');
        const store = tx.objectStore('downloadedTracks');
        store.put(updatedTrack);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      // LocalStorage fallback
      const list = this.getLocalStorageTracks();
      list[track.id] = { ...track, isDownloaded: true, downloadedAt: Date.now() };
      localStorage.setItem('soundvibe_downloads', JSON.stringify(list));
    }
  }

  async removeDownloadedTrack(trackId: string): Promise<void> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('downloadedTracks', 'readwrite');
        const store = tx.objectStore('downloadedTracks');
        store.delete(trackId);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      const list = this.getLocalStorageTracks();
      delete list[trackId];
      localStorage.setItem('soundvibe_downloads', JSON.stringify(list));
    }
  }

  async getAllDownloadedTracks(): Promise<Track[]> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('downloadedTracks', 'readonly');
        const store = tx.objectStore('downloadedTracks');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return Object.values(this.getLocalStorageTracks());
    }
  }

  private getLocalStorageTracks(): Record<string, Track> {
    try {
      const data = localStorage.getItem('soundvibe_downloads');
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  // --- Custom & Saved Playlists ---
  async savePlaylist(playlist: Playlist): Promise<void> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('playlists', 'readwrite');
        const store = tx.objectStore('playlists');
        store.put(playlist);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      const playlists = this.getLocalStoragePlaylists();
      playlists[playlist.id] = playlist;
      localStorage.setItem('soundvibe_playlists', JSON.stringify(playlists));
    }
  }

  async getAllPlaylists(): Promise<Playlist[]> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('playlists', 'readonly');
        const store = tx.objectStore('playlists');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return Object.values(this.getLocalStoragePlaylists());
    }
  }

  async deletePlaylist(playlistId: string): Promise<void> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('playlists', 'readwrite');
        const store = tx.objectStore('playlists');
        store.delete(playlistId);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      const playlists = this.getLocalStoragePlaylists();
      delete playlists[playlistId];
      localStorage.setItem('soundvibe_playlists', JSON.stringify(playlists));
    }
  }

  private getLocalStoragePlaylists(): Record<string, Playlist> {
    try {
      const data = localStorage.getItem('soundvibe_playlists');
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  // --- Listening History & Affinities ---
  async recordPlay(entry: ListeningHistoryEntry): Promise<void> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('history', 'readwrite');
        const store = tx.objectStore('history');
        store.add(entry);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      // LocalStorage fallback (max 100 entries)
      const history = this.getLocalStorageHistory();
      history.unshift(entry);
      localStorage.setItem('soundvibe_history', JSON.stringify(history.slice(0, 100)));
    }
  }

  async getHistory(): Promise<ListeningHistoryEntry[]> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('history', 'readonly');
        const store = tx.objectStore('history');
        const req = store.getAll();
        req.onsuccess = () => resolve((req.result || []).reverse().slice(0, 100));
        req.onerror = () => reject(req.error);
      });
    } catch {
      return this.getLocalStorageHistory();
    }
  }

  private getLocalStorageHistory(): ListeningHistoryEntry[] {
    try {
      const data = localStorage.getItem('soundvibe_history');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // --- Liked Songs ---
  async toggleLikedSong(trackId: string): Promise<boolean> {
    const liked = this.getLikedSongIds();
    const isLiked = liked.includes(trackId);
    let updated: string[];
    if (isLiked) {
      updated = liked.filter((id) => id !== trackId);
    } else {
      updated = [...liked, trackId];
    }
    localStorage.setItem('soundvibe_liked_songs', JSON.stringify(updated));
    return !isLiked;
  }

  getLikedSongIds(): string[] {
    try {
      const data = localStorage.getItem('soundvibe_liked_songs');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }
}

export const offlineStorage = new OfflineStorageService();
