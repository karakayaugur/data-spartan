import { Film, CastMember } from "@core/http";

export interface FilmDetailState {
  selectedFilm: Film | null;
  cast: CastMember[];
  loading: boolean;
  castLoading: boolean;
  error: boolean;
}

export const INITIAL_FILM_DETAIL_STATE: FilmDetailState = {
  selectedFilm: null,
  cast: [],
  loading: false,
  castLoading: false,
  error: false,
};
