import { Injectable, inject, signal } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { FilmService } from "@core/http";
import { FilmStoreService } from "@core/store";

@Injectable({ providedIn: "root" })
export class FilmLoaderService {
  private readonly api = inject(FilmService);
  private readonly store = inject(FilmStoreService);
  private readonly loadingState = signal(false);
  private readonly failedState = signal(false);
  private pending: Promise<void> | null = null;

  readonly loading = this.loadingState.asReadonly();
  readonly failed = this.failedState.asReadonly();

  load(): Promise<void> {
    if (this.pending) return this.pending;
    this.loadingState.set(true);
    this.failedState.set(false);
    this.pending = firstValueFrom(this.api.getList())
      .then((films) => this.store.setFilms(films))
      .catch(() => {
        this.failedState.set(true);
      })
      .finally(() => {
        this.loadingState.set(false);
        this.pending = null;
      });
    return this.pending;
  }
}
