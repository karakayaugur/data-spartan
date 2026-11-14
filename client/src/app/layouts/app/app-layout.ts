import { Component, DestroyRef, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { ModalService, ViewingLog } from "@shared/modals";
import { BreakpointObserver } from "@angular/cdk/layout";
import { ButtonComponent } from "@shared/shared-ui";
import { Sidebar } from "./sidebar/sidebar";
import { MobileNavService } from "./mobile-nav.service";
import { FilmService, FilmSummary } from "@core/http";
import { FilmStoreService } from "@core/store";

@Component({
  selector: "app-layout",
  imports: [RouterOutlet, Sidebar, ButtonComponent],
  providers: [MobileNavService],
  templateUrl: "./app-layout.html",
  styleUrl: "./app-layout.css",
})
export class AppLayout {
  readonly nav = inject(MobileNavService);
  private readonly router = inject(Router);
  private readonly breakpoint = inject(BreakpointObserver);
  private readonly modal = inject(ModalService);
  private readonly service = inject(FilmService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly filmStoreService = inject(FilmStoreService);
  readonly films = this.filmStoreService.films;
  readonly viewings = this.filmStoreService.viewings;
  readonly loading = signal(false);
  readonly failed = signal(false);

  constructor() {
    this.loadFilms();
    this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof NavigationEnd) this.nav.close();
    });
    this.breakpoint
      .observe("(max-width: 640px)")
      .pipe(takeUntilDestroyed())
      .subscribe((state) => {
        if (!state.matches) this.nav.close();
      });
  }

  openViewingLog(film: FilmSummary): void {
    this.modal.open(ViewingLog, {
      data: film,
      ariaLabel: film.title,
      restoreFocus: this.breakpoint.isMatched("(max-width: 640px)") ? ".menu-toggle button" : true,
    });
  }

  loadFilms(): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.failed.set(false);
    this.service
      .getList()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (films) => {
          this.filmStoreService.setFilms(films);
          this.loading.set(false);
        },
        error: () => {
          this.failed.set(true);
          this.loading.set(false);
        },
      });
  }
}
