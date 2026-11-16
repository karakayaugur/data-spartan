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
import { ThemeToggle } from "@shared/shared-features";
import { Badge, Button } from "@shared/shared-ui";
import { Film } from "@core/http";

@Component({
  selector: "app-sidebar",
  host: { class: "sidebar" },
  imports: [
    RouterLink,
    RouterLinkActive,
    A11yModule,
    LucideDynamicIcon,
    ThemeToggle,
    Button,
    Badge,
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

  viewingCount(episodeId: number): number {
    return this.viewings()[episodeId]?.length ?? 0;
  }

  openViewingLog(film: Film): void {
    this.closeMenu.emit();
    this.modal.open(ViewingLog, {
      data: film,
      ariaLabel: film.title,
      restoreFocus: this.mobile().matches ? ".layout__menu-toggle button" : true,
    });
  }
}
