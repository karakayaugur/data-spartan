import { Component, computed, inject } from "@angular/core";
import { LucideDynamicIcon } from "@lucide/angular";
import { ThemeFacade } from "@core/store";

@Component({
  selector: "app-theme-toggle",
  host: { class: "theme-toggle" },
  imports: [LucideDynamicIcon],
  templateUrl: "./theme-toggle.html",
  styleUrl: "./theme-toggle.scss",
})
export class ThemeToggleComponent {
  private readonly themeFacade = inject(ThemeFacade);

  readonly theme = this.themeFacade.theme;
  readonly isDark = computed(() => this.theme() === "dark");
  readonly isLight = computed(() => this.theme() !== "dark");

  setTheme(value: "light" | "dark", event?: Event): void {
    event?.stopPropagation();
    this.themeFacade.setTheme(value);
  }
}
