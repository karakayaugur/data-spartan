import { A11yModule } from "@angular/cdk/a11y";
import { BreakpointObserver } from "@angular/cdk/layout";
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  input,
  output,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { RouterLink, RouterLinkActive } from "@angular/router";
import {
  LucideDynamicIcon,
  LucideX,
  LucideEye,
  LucideSun,
  LucideMoon,
  LucideFilm,
  provideLucideIcons,
} from "@lucide/angular";
import { FilmFacade } from "@core/store";
import { ModalService, ViewingLog } from "@shared/modals";
import { ThemeToggleComponent } from "@shared/shared-features";
import { BadgeComponent, ButtonComponent } from "@shared/shared-ui";
import { FilmSummary } from "@core/http";

@Component({
  selector: "app-sidebar",
  host: { class: "sidebar" },
  imports: [
    RouterLink,
    RouterLinkActive,
    A11yModule,
    LucideDynamicIcon,
    ThemeToggleComponent,
    ButtonComponent,
    BadgeComponent,
  ],
  providers: [provideLucideIcons(LucideX, LucideEye, LucideSun, LucideMoon, LucideFilm)],
  templateUrl: "./sidebar.html",
  styleUrl: "./sidebar.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  readonly filmFacade = inject(FilmFacade);
  private readonly modal = inject(ModalService);
  readonly films = this.filmFacade.films;
  readonly viewings = this.filmFacade.viewings;
  readonly loading = this.filmFacade.loading;
  readonly failed = this.filmFacade.failed;
  readonly mobileOpen = input(false);
  readonly closeMenu = output<void>();
  readonly mobile = toSignal(inject(BreakpointObserver).observe("(max-width: 640px)"), {
    initialValue: { matches: window.matchMedia("(max-width: 640px)").matches, breakpoints: {} },
  });

  @HostListener("keydown.escape", ["$event"])
  onEscape(event: Event): void {
    if (this.mobileOpen()) {
      event.stopPropagation();
      this.closeMenu.emit();
    }
  }

  viewingCount(filmId: number): number {
    return this.viewings()[filmId]?.length ?? 0;
  }

  openViewingLog(film: FilmSummary): void {
    this.closeMenu.emit();
    this.modal.open(ViewingLog, {
      data: film,
      ariaLabel: film.title,
      restoreFocus: this.mobile().matches ? ".layout__menu-toggle button" : true,
    });
  }
}
