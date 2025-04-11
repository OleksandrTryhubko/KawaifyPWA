import Dexie, { Table } from 'dexie';

export interface Track {
  trackId: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;
  source: 'jamendo' | 'local';
  liked: boolean;
}

export class KawaifyDB extends Dexie {
  tracks!: Table<Track, string>;

  constructor() {
    super('kawaify');
    this.version(1).stores({
      tracks: 'trackId, title, artist, source, liked'
    });
  }
}

export const db = new KawaifyDB();