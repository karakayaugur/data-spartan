import type { Specie } from "@core/http";

export interface CharacterDetailState {
  species: Specie[];
  homeworldName: string | null;
  loading: boolean;
  error: boolean;
}
