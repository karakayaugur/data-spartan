import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "app-film-crawl",
  templateUrl: "./film-crawl.component.html",
  styleUrl: "./film-crawl.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilmCrawlComponent {
  readonly crawlText = input.required<string>();
}
