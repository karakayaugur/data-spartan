import { computed, effect, Injectable, signal, WritableSignal } from "@angular/core";
import { FILMS_STORAGE_KEY, FilmsState, Viewing } from "./films.types";

@Injectable({ providedIn: "root" })
export class FilmsStore {
  private readonly storage: Storage = sessionStorage;
  private readonly _state: WritableSignal<FilmsState> = signal(this.getStored());

  public readonly state = computed(() => this._state());

  private readonly watcher = effect(() => {
    const current = this._state();
    try {
      this.storage.setItem(FILMS_STORAGE_KEY, JSON.stringify(current));
    } catch {
      // TODO:ALERT AND LOG ERROR
      // State remains usable if browser storage is unavailable or full.
    }
  });

  public setState(value: FilmsState): void { this._state.set(value); }

  public patchState(partial: Partial<FilmsState>): void {
    this._state.update(current => ({ ...current, ...partial }));
  }

  public clearState(): void { this._state.set({ films: [], viewings: {} }); }

  private getStored(): FilmsState {
    try {
      const saved = this.storage.getItem(FILMS_STORAGE_KEY);
      const data = saved ? JSON.parse(saved) : {
        films: [],
        // Preserve histories written before the unified store was introduced.
        viewings: JSON.parse(this.storage.getItem("data-spartan.viewing-log") ?? "{}"),
      };
      const films = Array.isArray(data?.films) ? data.films.filter((film: unknown) => {
        if (!film || typeof film !== "object") return false;
        const value = film as Record<string, unknown>;
        return Number.isSafeInteger(value["id"]) && typeof value["title"] === "string" &&
          typeof value["episodeId"] === "number" && typeof value["releaseDate"] === "string";
      }) : [];
      const viewings: FilmsState["viewings"] = {};
      if (data?.viewings && typeof data.viewings === "object" && !Array.isArray(data.viewings)) {
        for (const [filmId, entries] of Object.entries(data.viewings)) {
          if (!/^[1-9]\d*$/.test(filmId) || !Array.isArray(entries)) continue;
          viewings[Number(filmId)] = entries.filter((item): item is Viewing =>
            !!item && typeof item === "object" && typeof item.id === "string" &&
            typeof item.date === "string" && typeof item.time === "string" && typeof item.description === "string",
          );
        }
      }
      return { films, viewings };
    } catch {
      return { films: [], viewings: {} };
    }
  }
}
