import { Injectable, effect, signal } from "@angular/core";
import { DEFAULT_THEME, THEME_STORAGE_KEY, Theme } from "./theme.types";

@Injectable({ providedIn: "root" })
export class ThemeStore {
  private readonly storage: Storage = localStorage;
  private readonly state = signal<Theme>(this.getStored());
  readonly theme = this.state.asReadonly();

  constructor() {
    effect(() => this.storage.setItem(THEME_STORAGE_KEY, this.theme()));
  }

  setTheme(value: Theme): void {
    this.state.set(value);
  }

  private getStored(): Theme {
    const value = this.storage.getItem(THEME_STORAGE_KEY);
    return value === "light" || value === "dark" ? value : DEFAULT_THEME;
  }
}
