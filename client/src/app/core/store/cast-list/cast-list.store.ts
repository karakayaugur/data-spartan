import { computed, signal } from "@angular/core";
import type { CastListState } from "./cast-list.types";

export class CastListStore {
  private readonly state = signal<CastListState>({
    cast: [],
    loading: false,
    error: false,
    failedCount: 0,
  });

  readonly cast = computed(() => this.state().cast);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);
  readonly failedCount = computed(() => this.state().failedCount);

  setState(state: CastListState): void {
    this.state.set(state);
  }
}
