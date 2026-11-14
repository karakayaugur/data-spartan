import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { FilmFacade } from "@core/store";

@Component({
  selector: "app-film-list",
  imports: [RouterLink],
  templateUrl: "./film-list.html",
  styleUrl: "./film-list.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilmList {
  readonly films = inject(FilmFacade).films;
}
