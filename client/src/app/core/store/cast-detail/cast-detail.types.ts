import type { CastMember } from "@core/http";

export interface CastDetailState {
  selectedCharacter: CastMember | null;
  homeworldName: string | null;
  speciesName: string | null;
  speciesClassification: string | null;
  loading: boolean;
}

export const INITIAL_CAST_DETAIL_STATE: CastDetailState = {
  selectedCharacter: null,
  homeworldName: null,
  speciesName: null,
  speciesClassification: null,
  loading: false,
};
