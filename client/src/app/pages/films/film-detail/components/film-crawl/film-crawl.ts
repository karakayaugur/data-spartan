import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "app-film-crawl",
  host: { class: "film-crawl" },
  templateUrl: "./film-crawl.html",
  styleUrl: "./film-crawl.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilmCrawl {
  readonly crawlText = input.required<string>();
}
