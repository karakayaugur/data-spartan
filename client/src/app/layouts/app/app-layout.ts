import { FocusMonitor } from "@angular/cdk/a11y";
import { Component, DestroyRef, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { Dialog } from "@angular/cdk/dialog";
import { BreakpointObserver } from "@angular/cdk/layout";
import { ButtonComponent } from "@shared/shared-ui";
import { Sidebar } from "./sidebar/sidebar";
import { MobileNavService } from "./mobile-nav.service";
import { ViewingLog } from "../../pages/films/viewing-log/viewing-log";
import { FilmService, FilmSummary } from "@core/http";
import { FilmsService } from "@core/store";

@Component({
  selector: "app-layout",
  imports: [RouterOutlet, Sidebar, ButtonComponent],
  providers: [Dialog, MobileNavService],
  templateUrl: "./app-layout.html",
  styleUrl: "./app-layout.css",
})
export class AppLayout {
  readonly nav = inject(MobileNavService);
  private readonly router = inject(Router);
  private readonly breakpoint = inject(BreakpointObserver);
  private readonly dialog = inject(Dialog);
  private readonly focusMonitor = inject(FocusMonitor);
  private readonly service = inject(FilmService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly filmsService = inject(FilmsService);
  readonly films = this.filmsService.films;
  readonly viewings = this.filmsService.viewings;
  readonly loading = signal(false);
  readonly failed = signal(false);

  constructor() {
    this.loadFilms();
    this.router.events.pipe(takeUntilDestroyed()).subscribe(event => {
      if (event instanceof NavigationEnd) this.nav.close();
    });
    this.breakpoint.observe("(max-width: 640px)").pipe(takeUntilDestroyed()).subscribe(state => {
      if (!state.matches) this.nav.close();
    });
  }

  openViewingLog(film: FilmSummary): void {
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const origin = trigger?.matches(':focus-visible') ? 'keyboard' : 'mouse';
    const mobile = this.breakpoint.isMatched("(max-width: 640px)");
    const ref = this.dialog.open(ViewingLog, { data: film, backdropClass: "modal-backdrop", ariaLabelledBy: "viewing-title", width: "600px", maxWidth: "calc(100vw - 32px)", restoreFocus: false });
    ref.closed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      const target = mobile ? document.querySelector<HTMLElement>('.menu-toggle button') : trigger;
      if (target?.isConnected) this.focusMonitor.focusVia(target, origin);
    });
  }

  loadFilms(): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.failed.set(false);
    this.service.getList().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: films => { this.filmsService.setFilms(films); this.loading.set(false); },
      error: () => { this.failed.set(true); this.loading.set(false); },
    });
  }
}
