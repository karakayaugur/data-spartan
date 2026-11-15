import { DatePipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { Film, FilmSummary } from "@core/http/film/film.interface";
import { ButtonComponent } from "@shared/shared-ui";

@Component({
  selector: "app-film-header",
  host: { class: "film-header" },
  imports: [DatePipe, ButtonComponent],
  templateUrl: "./film-header.component.html",
  styleUrl: "./film-header.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilmHeaderComponent {
  readonly film = input.required<FilmSummary & Pick<Film, "director">>();
  readonly viewingCount = input(0);
  readonly openModal = output<void>();
}
