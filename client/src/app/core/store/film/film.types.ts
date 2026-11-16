import type { Film } from "@core/http/film/film.interface";

export interface Viewing {
  id: string;
  date: string;
  time: string;
  description: string;
}

export type ViewingPayload = Omit<Viewing, "id">;

export interface FilmsState {
  films: Film[];
  viewings: Record<number, readonly Viewing[]>;
}
