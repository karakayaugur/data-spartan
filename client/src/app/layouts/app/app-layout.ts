import { Component, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { BreakpointObserver } from "@angular/cdk/layout";
import { Button } from "@shared/shared-ui";
import { Sidebar } from "./sidebar/sidebar";
import { MobileNavService } from "./mobile-nav.service";

@Component({
  selector: "app-layout",
  host: { class: "layout" },
  imports: [RouterOutlet, Sidebar, Button],
  providers: [MobileNavService],
  templateUrl: "./app-layout.html",
  styleUrl: "./app-layout.scss",
})
export class AppLayout {
  readonly nav = inject(MobileNavService);
  private readonly router = inject(Router);
  private readonly breakpoint = inject(BreakpointObserver);

  constructor() {
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
}
