import { firstValueFrom } from "rxjs";
import { FilmService } from "@core/http/film/film.service";
import { computed, inject, Injectable, signal } from "@angular/core";
import type { Film, Films } from "@core/http";
import { FilmStore } from "./film.store";
import { FilmsState, Viewing, ViewingPayload } from "./film.types";

@Injectable({ providedIn: "root" })
export class FilmFacade {
  private readonly store = inject(FilmStore);
  private readonly api = inject(FilmService);
  private readonly loadingState = signal(false);
  private readonly failedState = signal(false);
  private pending: Promise<void> | null = null;

  readonly loading = this.loadingState.asReadonly();
  readonly failed = this.failedState.asReadonly();

  loadFilms(): Promise<void> {
    if (this.pending) return this.pending;
    this.loadingState.set(true);
    this.failedState.set(false);
    this.pending = firstValueFrom(this.api.getAll())
      .then((films) => this.setFilms(films))
      .catch(() => {
        this.failedState.set(true);
      })
      .finally(() => {
        this.loadingState.set(false);
        this.pending = null;
      });
    return this.pending;
  }

  public readonly state = this.store.state;
  public readonly films = computed(() => this.state().films);
  public readonly viewings = computed(() => this.state().viewings);

  public setState(value: FilmsState): void {
    this.store.setState(value);
  }
  public patchState(partial: Partial<FilmsState>): void {
    this.store.patchState(partial);
  }
  public clearState(): void {
    this.store.clearState();
  }

  public setFilms(films: Films): void {
    this.patchState({ films });
  }

  public getViewings(episodeId: number): readonly Viewing[] {
    return this.viewings()[episodeId] ?? [];
  }

  public addViewing(episodeId: number, payload: ViewingPayload): void {
    const viewing: Viewing = {
      ...payload,
      description: payload.description.trim(),
      id: crypto.randomUUID(),
    };
    this.patchState({
      viewings: {
        ...this.viewings(),
        [episodeId]: [...this.getViewings(episodeId), viewing],
      },
    });
  }

  public removeViewing(episodeId: number, viewingId: string): void {
    this.patchState({
      viewings: {
        ...this.viewings(),
        [episodeId]: this.getViewings(episodeId).filter((item) => item.id !== viewingId),
      },
    });
  }
}
