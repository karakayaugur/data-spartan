import {
  LucideDynamicIcon,
  LucideFilm,
  LucideChevronRight,
  provideLucideIcons,
} from "@lucide/angular";
import { DatePipe } from "@angular/common";
import { BadgeComponent } from "@shared/shared-ui";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { FilmFacade } from "@core/store";

@Component({
  selector: "app-film-list",
  host: { class: "film-list" },
  imports: [RouterLink, BadgeComponent, DatePipe, LucideDynamicIcon],
  providers: [provideLucideIcons(LucideFilm, LucideChevronRight)],
  templateUrl: "./film-list.html",
  styleUrl: "./film-list.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilmList {
  readonly films = inject(FilmFacade).films;
}
