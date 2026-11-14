import { Component, computed, inject } from "@angular/core";
import { LucideDynamicIcon } from "@lucide/angular";
import { ThemeService } from "@core/store";

@Component({
  selector: "app-theme-toggle",
  imports: [LucideDynamicIcon],
  templateUrl: "./theme-toggle.html",
  styleUrl: "./theme-toggle.css",
})
export class ThemeToggleComponent {
  private readonly themeService = inject(ThemeService);

  readonly theme = this.themeService.theme;
  readonly isDark = computed(() => this.theme() === "dark");
  readonly isLight = computed(() => this.theme() !== "dark");

  setTheme(value: "light" | "dark", event?: Event): void {
    event?.stopPropagation();
    this.themeService.setState(value);
  }
}
