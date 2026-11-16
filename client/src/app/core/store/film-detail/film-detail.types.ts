import { Film } from "@core/http";

export interface FilmDetailState {
  selectedFilm: Film | null;
  loading: boolean;
  error: boolean;
}

export const INITIAL_FILM_DETAIL_STATE: FilmDetailState = {
  selectedFilm: null,
  loading: false,
  error: false,
};
