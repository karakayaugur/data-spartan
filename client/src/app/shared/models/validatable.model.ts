import { InjectionToken } from "@angular/core";

export interface Validatable {
  validate(): boolean;
  setError(message: string): void;
}

export const VALIDATABLE = new InjectionToken<Validatable>("VALIDATABLE");
