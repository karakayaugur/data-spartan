import { computed, signal } from "@angular/core";
import type { CastListState } from "./cast-list.types";

export class CastListStore {
  private readonly state = signal<CastListState>({
    cast: [],
    loading: false,
    error: false,
    failedCount: 0,
  });

  private readonly selection = signal<number | null>(null);
  readonly selectedCharacterId = this.selection.asReadonly();
  readonly selectedCharacter = computed(
    () => this.state().cast.find((person) => person.id === this.selection()) ?? null,
  );

  readonly cast = computed(() => this.state().cast);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);
  readonly failedCount = computed(() => this.state().failedCount);

  selectCharacter(id: number | null): void {
    this.selection.set(id);
  }

  setState(state: CastListState): void {
    if (state.loading || !state.cast.length) this.selection.set(null);
    this.state.set(state);
  }
}
