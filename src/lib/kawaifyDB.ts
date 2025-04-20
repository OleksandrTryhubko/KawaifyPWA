import Dexie, { Table } from "dexie";

export interface FavoriteTrack {
  id: string;
  title: string;
  artist: string;
  duration: number;
  streamUrl: string;
  image: string;
}

class KawaisyDB extends Dexie {
  favoriteTracks!: Table<FavoriteTrack, string>;

  constructor() {
    super("KawaifyDB");
    this.version(1).stores({
      favoriteTracks: "id, title, artist", // індекси для швидкого пошуку
    });
  }
}

export const db = new KawaisyDB();
