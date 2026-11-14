import type { FilmSummary } from "@core/http/film/film.interface";

export const FILMS_STORAGE_KEY = "data-spartan.films";

export interface Viewing {
  id: string;
  date: string;
  time: string;
  description: string;
}

export type ViewingPayload = Omit<Viewing, "id">;

export interface FilmsState {
  films: FilmSummary[];
  viewings: Record<number, readonly Viewing[]>;
}
