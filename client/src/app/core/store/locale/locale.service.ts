import {
  Injectable,
  computed,
  effect,
  signal,
  WritableSignal,
} from "@angular/core";
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  type AppLocale,
} from "./locale.types";

@Injectable({ providedIn: "root" })
export class LocaleService {
  private storage: Storage = localStorage;

  private readonly _state: WritableSignal<AppLocale> = signal<AppLocale>(
    this.getStored(),
  );

  public readonly locale = computed(() => this._state());

  private readonly watcher = effect(() => {
    const current = this._state();
    this.storage.setItem(LOCALE_STORAGE_KEY, current);
    document.documentElement.setAttribute("lang", current);
  });

  private getStored(): AppLocale {
    const item = this.storage.getItem(LOCALE_STORAGE_KEY);
    return item === "tr" || item === "en" ? item : DEFAULT_LOCALE;
  }

  public setState(value: AppLocale) {
    this._state.set(value);
  }
}
