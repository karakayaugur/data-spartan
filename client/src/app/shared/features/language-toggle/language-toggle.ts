import { Component, computed, ElementRef, inject, signal } from "@angular/core";
import { LucideDynamicIcon } from "@lucide/angular";
import { LocaleService, type AppLocale } from "@core/store";

@Component({
  selector: "app-language-toggle",
  imports: [LucideDynamicIcon],
  templateUrl: "./language-toggle.html",
  styleUrl: "./language-toggle.css",
  host: {
    "(document:click)": "onDocumentClick($event)",
  },
})
export class LanguageToggleComponent {
  private readonly localeService = inject(LocaleService);
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly locale = this.localeService.locale;
  readonly open = signal(false);

  readonly options: { value: AppLocale; short: string; label: string }[] = [
    { value: "en", short: "EN", label: "English" },
    { value: "tr", short: "TR", label: "Türkçe" },
  ];

  readonly currentShort = computed(
    () =>
      this.options.find((option) => option.value === this.locale())?.short ??
      "EN",
  );

  toggle(event: Event): void {
    event.stopPropagation();
    this.open.update((value) => !value);
  }

  select(value: AppLocale, event: Event): void {
    event.stopPropagation();
    this.localeService.setState(value);
    this.open.set(false);
  }

  onDocumentClick(event: Event): void {
    if (!this.open()) return;
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }
}
