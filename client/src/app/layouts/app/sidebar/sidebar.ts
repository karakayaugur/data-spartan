import { A11yModule } from "@angular/cdk/a11y";
import { BreakpointObserver } from "@angular/cdk/layout";
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  inject,
  input,
  output,
} from "@angular/core";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
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
import { type Viewing } from "@core/store";
import { ThemeToggleComponent } from "@shared/shared-features";
import { BadgeComponent, ButtonComponent } from "@shared/shared-ui";
import { ApiService, FilmSummary } from "@core/http";

@Component({
  selector: "app-sidebar",
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
  styleUrl: "./sidebar.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);
  readonly films = input.required<FilmSummary[]>();
  readonly viewings = input<Record<number, readonly Viewing[]>>({});
  readonly loading = input(false);
  readonly failed = input(false);
  readonly mobileOpen = input(false);
  readonly closeMenu = output<void>();
  readonly retry = output<void>();
  readonly viewingLog = output<FilmSummary>();
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

  testClientError(): void {
    throw new Error("This is a test client error.");
  }

  testHttpError(): void {
    this.api
      .get("error-test")
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        // ErrorInterceptor displays the failure; prevent a second unhandled error.
        error: () => {},
      });
  }

  viewingCount(filmId: number): number {
    return this.viewings()[filmId]?.length ?? 0;
  }

  openViewingLog(film: FilmSummary): void {
    this.closeMenu.emit();
    this.viewingLog.emit(film);
  }
}
