import { Injectable, signal, effect, computed, WritableSignal } from "@angular/core";
import { THEME_STORAGE_KEY, DEFAULT_THEME, Theme } from "./theme.types";

@Injectable({ providedIn: "root" })
export class ThemeService {
  private storage: Storage = localStorage;

  private readonly _state: WritableSignal<Theme> = signal<Theme>(this.getStored());

  public readonly theme = computed(() => this._state());

  private readonly watcher = effect(() => {
    const current = this._state();
    this.storage.setItem(THEME_STORAGE_KEY, current);
    document.documentElement.setAttribute("color-scheme", current);
    document.documentElement.classList.toggle("dark", current === "dark");
    localStorage.setItem("theme", current);
  });

  private getStored(): Theme {
    const item = this.storage.getItem(THEME_STORAGE_KEY);
    return item ?? DEFAULT_THEME;
  }

  public setState(value: Theme) {
    this._state.set(value);
  }
}
