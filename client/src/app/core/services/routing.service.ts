import { Injectable, inject, signal } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { RouterStateSnapshot, TitleStrategy } from "@angular/router";

@Injectable({ providedIn: "root" })
export class AppRoutingService {
  private titleService = inject(Title);

  private readonly STORAGE_KEY = "return_urls";
  private readonly APP_PREFIX = "Data Spartan";

  private readonly _returnUrl = signal<string>(
    sessionStorage.getItem(this.STORAGE_KEY) ?? "/films",
  );

  public readonly returnUrl = this._returnUrl.asReadonly();

  public setReturnUrl(url: string): void {
    sessionStorage.setItem(this.STORAGE_KEY, url);
    this._returnUrl.set(url);
  }

  public clearReturnUrl(): void {
    sessionStorage.removeItem(this.STORAGE_KEY);
    this._returnUrl.set("/films");
  }

  public updateTitle(customTitle: string): void {
    this.titleService.setTitle(
      customTitle ? `${this.APP_PREFIX} | ${customTitle}` : this.APP_PREFIX,
    );
  }
}

@Injectable()
export class AppTitleStrategy extends TitleStrategy {
  private readonly routing = inject(AppRoutingService);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.routing.updateTitle(this.buildTitle(snapshot) ?? "");
  }
}
