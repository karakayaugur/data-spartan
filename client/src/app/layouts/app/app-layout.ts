import { Component, effect, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { ViewportService } from "@core/services/viewport.service";
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
  private readonly viewport = inject(ViewportService);

  constructor() {
    this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof NavigationEnd) this.nav.close();
    });
    effect(() => {
      if (!this.viewport.isMobile()) this.nav.close();
    });
  }
}
