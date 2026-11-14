import { Injectable, effect, inject } from "@angular/core";
import { ThemeStore } from "./theme.store";
import { Theme } from "./theme.types";

@Injectable({ providedIn: "root" })
export class ThemeFacade {
  private readonly store = inject(ThemeStore);
  readonly theme = this.store.theme;

  constructor() {
    effect(() => {
      const theme = this.theme();
      document.documentElement.setAttribute("color-scheme", theme);
      document.documentElement.classList.toggle("dark", theme === "dark");
    });
  }

  setTheme(value: Theme): void {
    this.store.setTheme(value);
  }
}
