import { computed, inject, Injectable } from "@angular/core";
import type { FilmSummary } from "@core/http/film/film.interface";
import { FilmsStore } from "./films.store";
import { FilmsState, Viewing, ViewingPayload } from "./films.types";

@Injectable({ providedIn: "root" })
export class FilmsService {
  private readonly store = inject(FilmsStore);

  public readonly state = this.store.state;
  public readonly films = computed(() => this.state().films);
  public readonly viewings = computed(() => this.state().viewings);

  public setState(value: FilmsState): void { this.store.setState(value); }
  public patchState(partial: Partial<FilmsState>): void { this.store.patchState(partial); }
  public clearState(): void { this.store.clearState(); }

  public setFilms(films: FilmSummary[]): void { this.patchState({ films }); }

  public getViewings(filmId: number): readonly Viewing[] { return this.viewings()[filmId] ?? []; }

  public addViewing(filmId: number, payload: ViewingPayload): void {
    const viewing: Viewing = { ...payload, description: payload.description.trim(), id: crypto.randomUUID() };
    this.patchState({ viewings: { ...this.viewings(), [filmId]: [...this.getViewings(filmId), viewing] } });
  }

  public removeViewing(filmId: number, viewingId: string): void {
    this.patchState({ viewings: { ...this.viewings(), [filmId]: this.getViewings(filmId).filter(item => item.id !== viewingId) } });
  }
}
