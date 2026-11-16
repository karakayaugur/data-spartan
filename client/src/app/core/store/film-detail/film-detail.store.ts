import { computed, Injectable, signal, WritableSignal } from "@angular/core";
import { FilmDetailState, INITIAL_FILM_DETAIL_STATE } from "./film-detail.types";

@Injectable({ providedIn: "root" })
export class FilmDetailStore {
  private readonly _state: WritableSignal<FilmDetailState> = signal(INITIAL_FILM_DETAIL_STATE);

  public readonly state = computed(() => this._state());
  public readonly selectedFilm = computed(() => this.state().selectedFilm);
  public readonly cast = computed(() => this.state().cast);
  public readonly loading = computed(() => this.state().loading);
  public readonly castLoading = computed(() => this.state().castLoading);
  public readonly error = computed(() => this.state().error);

  public setState(value: Partial<FilmDetailState>): void {
    this._state.update((current) => ({ ...current, ...value }));
  }

  public clearState(): void {
    this._state.set(INITIAL_FILM_DETAIL_STATE);
  }
}
