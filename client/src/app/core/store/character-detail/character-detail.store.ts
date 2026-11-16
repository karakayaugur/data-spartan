import { computed, signal } from "@angular/core";
import type { CharacterDetailState } from "./character-detail.types";

export class CharacterDetailStore {
  private readonly state = signal<CharacterDetailState>({
    species: [],
    homeworldName: null,
    loading: false,
    error: false,
  });
  readonly species = computed(() => this.state().species);
  readonly homeworldName = computed(() => this.state().homeworldName);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  setState(state: CharacterDetailState): void {
    this.state.set(state);
  }
}
