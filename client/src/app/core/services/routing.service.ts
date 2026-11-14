import { Injectable, inject, signal, computed } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { Router, NavigationEnd, ActivatedRoute } from "@angular/router";
import { filter } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class AppRoutingService {
  private titleService = inject(Title);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  private readonly STORAGE_KEY = "return_urls";
  private readonly APP_PREFIX = "Data Spartan";

  private readonly _returnUrl = signal<string>(
    sessionStorage.getItem(this.STORAGE_KEY) ?? "/dashboard",
  );

  public readonly returnUrl = this._returnUrl.asReadonly();

  public setReturnUrl(url: string): void {
    sessionStorage.setItem(this.STORAGE_KEY, url);
    this._returnUrl.set(url);
  }

  public clearReturnUrl(): void {
    sessionStorage.removeItem(this.STORAGE_KEY);
    this._returnUrl.set("/dashboard");
  }

  public initTitleWatcher(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        let route = this.activatedRoute.root;

        while (route.firstChild) {
          route = route.firstChild;
        }

        const pageTitle =
          route.snapshot.data["title"] || route.snapshot.routeConfig?.title;

        if (pageTitle) {
          this.titleService.setTitle(`${this.APP_PREFIX} | ${pageTitle}`);
        } else {
          this.titleService.setTitle(this.APP_PREFIX);
        }
      });
  }

  public updateTitle(customTitle: string): void {
    this.titleService.setTitle(`${this.APP_PREFIX} | ${customTitle}`);
  }
}
