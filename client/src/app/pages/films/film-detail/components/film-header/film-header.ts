import { DatePipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { Film } from "@core/http/film/film.interface";
import { Button } from "@shared/shared-ui";

@Component({
  selector: "app-film-header",
  host: { class: "film-header" },
  imports: [DatePipe, Button],
  templateUrl: "./film-header.html",
  styleUrl: "./film-header.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilmHeader {
  readonly film = input.required<Film>();
  readonly viewingCount = input(0);
  readonly openModal = output<void>();
}
