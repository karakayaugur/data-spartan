import { Component, ChangeDetectionStrategy, computed, inject } from "@angular/core";
import { Router, ActivatedRoute, RouterLink } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs";
import { LucideDynamicIcon } from "@lucide/angular";

interface Breadcrumb {
  label: string;
  url: string;
  icon?: string;
}

@Component({
  selector: "app-page-header",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideDynamicIcon],
  templateUrl: "./page-header.component.html",
  styleUrl: "./page-header.component.css",
})
export class PageHeaderComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly title = toSignal(this.route.data.pipe(map(() => this.getTitle())), {
    initialValue: "",
  });

  readonly description = toSignal(this.route.data.pipe(map((data) => data["description"] ?? "")), {
    initialValue: "",
  });

  readonly icon = toSignal(this.route.data.pipe(map(() => this.getIcon())), {
    initialValue: "",
  });

  readonly breadcrumbs = toSignal(this.route.data.pipe(map(() => this.buildBreadcrumbs())), {
    initialValue: [] as Breadcrumb[],
  });

  private getTitle(): string {
    let route = this.route;
    while (route.firstChild) {
      route = route.firstChild;
    }
    // route.snapshot'ın varlığını garantiye alıyoruz
    return (route.snapshot?.title as string) ?? "";
  }

  private getIcon(): string {
    let route = this.route;
    while (route.firstChild) {
      route = route.firstChild;
    }
    // route.snapshot?.data şeklinde güvenli okuma yapıyoruz
    return (route.snapshot?.data?.["icon"] as string) ?? "";
  }

  private buildBreadcrumbs(): Breadcrumb[] {
    const crumbs: Breadcrumb[] = [];
    let route: ActivatedRoute | null = this.route.root;
    let url = "";
    const currentTitle = this.getTitle();

    while (route) {
      // HATA BURADAYDI: route.snapshot?.url şeklinde güvenli hale getirdik
      if (route.snapshot?.url?.length) {
        url += "/" + route.snapshot.url.map((s) => s.path).join("/");
      }

      const title = route.snapshot?.title;
      if (title && typeof title === "string") {
        const icon = route.snapshot?.data?.["icon"] as string | undefined;
        crumbs.push({ label: title, url, icon });
      }
      route = route.firstChild;
    }

    // Aktif sayfanın title'ı ile aynı olan son crumb'ları kaldır
    while (crumbs.length > 0 && crumbs[crumbs.length - 1].label === currentTitle) {
      crumbs.pop();
    }

    return crumbs;
  }
}
