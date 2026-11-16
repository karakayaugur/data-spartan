import type { People } from "@core/http";

export interface CastListState {
  cast: People;
  loading: boolean;
  error: boolean;
  failedCount: number;
}
