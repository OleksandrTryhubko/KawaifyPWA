import Dexie, { Table } from 'dexie';

export interface FavoriteTrack {
  id?: number;
  trackId: string;
  title: string;
  artist: string;
  url: string;
}

export interface Playlist {
  id?: number;
  name: string;
  tracks: string[]; // список ID треків
}

export interface LocalTrack {
  id?: number;
  name: string;
  blobUrl: string;
}

export interface UserProfile {
  id?: number;
  username: string;
  avatarUrl?: string;
}

class KawaifyDB extends Dexie {
  favorites!: Table<FavoriteTrack>;
  playlists!: Table<Playlist>;
  localTracks!: Table<LocalTrack>;
  user!: Table<UserProfile>;

  constructor() {
    super('KawaifyDB');
    this.version(1).stores({
      favorites: '++id, trackId, title, artist, url',
      playlists: '++id, name',
      localTracks: '++id, name',
      user: '++id, username'
    });
  }
}

export const db = new KawaifyDB();
