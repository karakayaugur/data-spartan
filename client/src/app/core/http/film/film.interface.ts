import type { Character } from "../character/character.interface";

export interface ResponseModel<T> {
  results: T[];
}

export interface FilmSummary {
  url: string;
  title: string;
  episodeId: number;
  releaseDate: string;
}

export interface CastMember extends Character {
  id: number;
  isDroid: boolean;
}

export interface Film extends FilmSummary {
  openingCrawl: string;
  director: string;
  characters: string[];
}
