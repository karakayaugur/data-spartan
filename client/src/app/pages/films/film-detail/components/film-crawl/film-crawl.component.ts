import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "app-film-crawl",
  host: { class: "film-crawl" },
  templateUrl: "./film-crawl.component.html",
  styleUrl: "./film-crawl.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilmCrawlComponent {
  readonly crawlText = input.required<string>();
}
