import { Injectable, signal, computed } from "@angular/core";
import { CastDetailState, INITIAL_CAST_DETAIL_STATE } from "./cast-detail.types";

@Injectable({ providedIn: "root" })
export class CastDetailStore {
  private readonly _state = signal<CastDetailState>(INITIAL_CAST_DETAIL_STATE);

  readonly selectedCharacter = computed(() => this._state().selectedCharacter);
  readonly homeworldName = computed(() => this._state().homeworldName);
  readonly speciesName = computed(() => this._state().speciesName);
  readonly speciesClassification = computed(() => this._state().speciesClassification);
  readonly loading = computed(() => this._state().loading);

  setState(partial: Partial<CastDetailState>): void {
    this._state.update((current) => ({ ...current, ...partial }));
  }

  clear(): void {
    this._state.set(INITIAL_CAST_DETAIL_STATE);
  }
}
